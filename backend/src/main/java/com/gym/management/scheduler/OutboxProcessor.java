package com.gym.management.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.management.dto.DeltaEventDTO;
import com.gym.management.entity.OutboxEvent;
import com.gym.management.repository.OutboxEventRepository;
import com.gym.management.service.DeltaEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Outbox Processor - Background job that publishes events from outbox
 * Runs every 5 seconds to process unpublished events
 * Implements exponential backoff for failed events
 */
@Component
public class OutboxProcessor {

    private static final Logger logger = LoggerFactory.getLogger(OutboxProcessor.class);
    private static final int MAX_RETRIES = 10;

    @Autowired
    private OutboxEventRepository outboxRepository;

    @Autowired
    private DeltaEventPublisher deltaEventPublisher;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Process unpublished events every 5 seconds
     */
    @Scheduled(fixedDelay = 5000, initialDelay = 10000)
    @Transactional
    public void processOutboxEvents() {
        List<OutboxEvent> unpublishedEvents = outboxRepository.findRetryableEvents();

        if (unpublishedEvents.isEmpty()) {
            return;
        }

        logger.info("Processing {} unpublished outbox events", unpublishedEvents.size());

        int successCount = 0;
        int failCount = 0;

        for (OutboxEvent event : unpublishedEvents) {
            if (shouldSkipDueToBackoff(event)) {
                continue;
            }

            try {
                // Reconstruct DeltaEventDTO
                DeltaEventDTO deltaEvent = reconstructDeltaEvent(event);

                // Publish via WebSocket
                deltaEventPublisher.publish(deltaEvent);

                // Mark as published
                event.markPublished();
                outboxRepository.save(event);

                successCount++;

                logger.debug("Published outbox event {} for {}/{}",
                    event.getEventId(), event.getEntityType(), event.getEntityId());

            } catch (Exception e) {
                failCount++;
                logger.error("Failed to publish outbox event {}: {}",
                    event.getEventId(), e.getMessage());

                // Increment retry count with exponential backoff
                event.incrementRetryCount(e.getMessage());
                outboxRepository.save(event);

                if (event.getRetryCount() >= MAX_RETRIES) {
                    logger.error("Event {} exceeded max retries, will not retry again", event.getEventId());
                }
            }
        }

        if (successCount > 0 || failCount > 0) {
            logger.info("Outbox processing complete: {} succeeded, {} failed", successCount, failCount);
        }
    }

    /**
     * Exponential backoff: wait longer between retries
     * Retry 1: 5s, Retry 2: 10s, Retry 3: 20s, Retry 4: 40s, etc.
     */
    private boolean shouldSkipDueToBackoff(OutboxEvent event) {
        if (event.getRetryCount() == 0 || event.getLastRetryAt() == null) {
            return false;
        }

        long backoffSeconds = (long) Math.pow(2, event.getRetryCount()) * 5;
        Instant nextRetryTime = event.getLastRetryAt().plus(backoffSeconds, ChronoUnit.SECONDS);

        return Instant.now().isBefore(nextRetryTime);
    }

    /**
     * Reconstruct DeltaEventDTO from OutboxEvent
     */
    private DeltaEventDTO reconstructDeltaEvent(OutboxEvent event) throws Exception {
        Object payload = objectMapper.readValue(event.getPayload(), Object.class);

        DeltaEventDTO deltaEvent = new DeltaEventDTO();
        deltaEvent.setEventId(event.getEventId());
        deltaEvent.setEntityType(event.getEntityType());
        deltaEvent.setEntityId(event.getEntityId());
        deltaEvent.setOperation(DeltaEventDTO.OperationType.valueOf(event.getOperation()));
        deltaEvent.setPayload(payload);
        deltaEvent.setTenantId(event.getTenantId());
        deltaEvent.setActorId(event.getActorId());
        deltaEvent.setVersion(event.getVersion());
        deltaEvent.setTimestamp(event.getCreatedAt());

        return deltaEvent;
    }

    /**
     * Cleanup old published events (retention: 7 days)
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupOldEvents() {
        Instant cutoffDate = Instant.now().minus(7, ChronoUnit.DAYS);
        outboxRepository.deletePublishedBefore(cutoffDate);
        logger.info("Cleaned up outbox events published before {}", cutoffDate);
    }
}
