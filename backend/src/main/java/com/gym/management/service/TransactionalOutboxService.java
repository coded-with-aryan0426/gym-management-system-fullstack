package com.gym.management.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.management.dto.DeltaEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Transactional Outbox Pattern Implementation
 * 
 * CRITICAL: Ensures NO event loss, even on server crash
 * 
 * Flow:
 * 1. Entity change → Save to outbox IN SAME TRANSACTION
 * 2. Background worker publishes from outbox
 * 3. Mark as published
 * 
 * Benefits:
 * - Zero message loss (transactional guarantee)
 * - Automatic retry on failure
 * - At-least-once delivery
 * - Survives crashes
 */
@Service
public class TransactionalOutboxService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionalOutboxService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Store event in outbox (call this in @Transactional method)
     * 
     * CRITICAL: This MUST be called within the same transaction as the entity change
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void saveToOutbox(DeltaEventDTO event) {
        try {
            // Get next sequence number for this tenant
            Long sequenceNumber = getNextSequence(event.getTenantId());
            event.setSequenceNumber(sequenceNumber);

            // Serialize payload
            String payloadJson = event.getPayload() != null 
                ? objectMapper.writeValueAsString(event.getPayload())
                : null;

            // Insert into outbox
            String sql = """
                INSERT INTO event_outbox (
                    event_id, event_type, entity_type, entity_id, operation,
                    payload, tenant_id, actor_id, sequence_number, version, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
                """;

            jdbcTemplate.update(sql,
                event.getEventId(),
                "DELTA_EVENT",
                event.getEntityType(),
                event.getEntityId(),
                event.getOperation().name(),
                payloadJson,
                event.getTenantId(),
                event.getActorId(),
                event.getSequenceNumber(),
                event.getVersion()
            );

            logger.debug("Saved event {} to outbox: {}", event.getEventId(), event);

        } catch (Exception e) {
            logger.error("Failed to save event to outbox: {}", event, e);
            throw new RuntimeException("Outbox save failed", e);
        }
    }

    /**
     * Get next sequence number (atomic increment)
     */
    @Transactional(propagation = Propagation.MANDATORY)
    private Long getNextSequence(Long tenantId) {
        // Insert or update sequence
        jdbcTemplate.update(
            "INSERT INTO event_sequences (tenant_id, current_sequence) VALUES (?, 1) " +
            "ON DUPLICATE KEY UPDATE current_sequence = current_sequence + 1",
            tenantId
        );

        // Get current value
        return jdbcTemplate.queryForObject(
            "SELECT current_sequence FROM event_sequences WHERE tenant_id = ?",
            Long.class,
            tenantId
        );
    }

    /**
     * Background worker - publishes pending events
     * Runs every 1 second
     */
    @Scheduled(fixedRate = 1000)
    @Transactional
    public void publishPendingEvents() {
        try {
            // Get pending events (limit 100 per batch)
            String sql = """
                SELECT id, event_id, event_type, entity_type, entity_id, operation,
                       payload, tenant_id, actor_id, sequence_number, version, retry_count
                FROM event_outbox
                WHERE status = 'PENDING' AND retry_count < 5
                ORDER BY created_at
                LIMIT 100
                """;

            List<Map<String, Object>> events = jdbcTemplate.queryForList(sql);

            for (Map<String, Object> row : events) {
                try {
                    publishEvent(row);
                } catch (Exception e) {
                    handlePublishFailure(row, e);
                }
            }

        } catch (Exception e) {
            logger.error("Outbox worker failed", e);
        }
    }

    /**
     * Publish single event from outbox
     */
    private void publishEvent(Map<String, Object> row) throws Exception {
        Long id = ((Number) row.get("id")).longValue();
        String eventId = (String) row.get("event_id");
        String entityType = (String) row.get("entity_type");
        Long tenantId = ((Number) row.get("tenant_id")).longValue();
        String payloadJson = (String) row.get("payload");

        // Reconstruct DeltaEventDTO
        DeltaEventDTO event = new DeltaEventDTO();
        event.setEventId(eventId);
        event.setEntityType(entityType);
        event.setEntityId(((Number) row.get("entity_id")).longValue());
        event.setOperation(DeltaEventDTO.OperationType.valueOf((String) row.get("operation")));
        event.setTenantId(tenantId);
        event.setActorId(row.get("actor_id") != null ? ((Number) row.get("actor_id")).longValue() : null);
        event.setSequenceNumber(((Number) row.get("sequence_number")).longValue());
        event.setVersion(row.get("version") != null ? ((Number) row.get("version")).longValue() : null);
        event.setTimestamp(Instant.now());

        // Deserialize payload
        if (payloadJson != null) {
            Object payload = objectMapper.readValue(payloadJson, Object.class);
            event.setPayload(payload);
        }

        // Publish to WebSocket
        String destination = String.format("/topic/delta/%d/%s", tenantId, entityType);
        messagingTemplate.convertAndSend(destination, event);

        // Mark as published
        jdbcTemplate.update(
            "UPDATE event_outbox SET status = 'PUBLISHED', published_at = ? WHERE id = ?",
            Timestamp.from(Instant.now()),
            id
        );

        logger.debug("Published event {} from outbox", eventId);
    }

    /**
     * Handle publish failure - increment retry count
     */
    private void handlePublishFailure(Map<String, Object> row, Exception e) {
        Long id = ((Number) row.get("id")).longValue();
        int retryCount = ((Number) row.get("retry_count")).intValue();

        String status = retryCount >= 4 ? "FAILED" : "PENDING";

        jdbcTemplate.update(
            "UPDATE event_outbox SET retry_count = retry_count + 1, last_error = ?, status = ? WHERE id = ?",
            e.getMessage(),
            status,
            id
        );

        logger.warn("Failed to publish event {}, retry count: {}", row.get("event_id"), retryCount + 1, e);
    }

    /**
     * Cleanup old published events (runs daily)
     * Keeps events for 7 days for debugging
     */
    @Scheduled(cron = "0 0 2 * * *") // 2 AM daily
    @Transactional
    public void cleanupOldEvents() {
        int deleted = jdbcTemplate.update(
            "DELETE FROM event_outbox WHERE status = 'PUBLISHED' AND published_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
        );

        if (deleted > 0) {
            logger.info("Cleaned up {} old outbox events", deleted);
        }
    }

    /**
     * Get failed events for monitoring
     */
    public List<Map<String, Object>> getFailedEvents() {
        return jdbcTemplate.queryForList(
            "SELECT * FROM event_outbox WHERE status = 'FAILED' ORDER BY created_at DESC LIMIT 100"
        );
    }

    /**
     * Retry failed event manually
     */
    @Transactional
    public void retryEvent(Long eventId) {
        jdbcTemplate.update(
            "UPDATE event_outbox SET status = 'PENDING', retry_count = 0 WHERE id = ?",
            eventId
        );
        logger.info("Manually retrying event {}", eventId);
    }
}
