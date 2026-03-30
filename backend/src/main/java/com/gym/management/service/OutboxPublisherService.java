package com.gym.management.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.management.dto.DeltaEventDTO;
import com.gym.management.entity.OutboxEvent;
import com.gym.management.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Transactional Outbox Service
 * Writes events to database instead of direct WebSocket publish
 * Guarantees event delivery even if server crashes
 */
@Service
public class OutboxPublisherService {

    private static final Logger logger = LoggerFactory.getLogger(OutboxPublisherService.class);

    @Autowired
    private OutboxEventRepository outboxRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Publish event transactionally to outbox
     * Called by controllers within same transaction as business logic
     */
    @Transactional
    public void publishToOutbox(DeltaEventDTO deltaEvent) {
        try {
            OutboxEvent outboxEvent = new OutboxEvent();
            outboxEvent.setEventId(deltaEvent.getEventId() != null ? deltaEvent.getEventId() : UUID.randomUUID().toString());
            outboxEvent.setEntityType(deltaEvent.getEntityType());
            outboxEvent.setEntityId(deltaEvent.getEntityId());
            outboxEvent.setOperation(deltaEvent.getOperation().name());
            outboxEvent.setPayload(objectMapper.writeValueAsString(deltaEvent.getPayload()));
            outboxEvent.setTenantId(deltaEvent.getTenantId());
            outboxEvent.setActorId(deltaEvent.getActorId());
            outboxEvent.setVersion(deltaEvent.getVersion());

            outboxRepository.save(outboxEvent);

            logger.debug("Event {} written to outbox for {}/{}", 
                outboxEvent.getEventId(), deltaEvent.getEntityType(), deltaEvent.getEntityId());

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize payload for outbox", e);
            throw new RuntimeException("Outbox serialization failed", e);
        }
    }

    /**
     * Convenience methods for common operations
     */
    @Transactional
    public void publishCreate(String entityType, Long entityId, Object payload, Long tenantId, Long actorId) {
        DeltaEventDTO event = DeltaEventDTO.create(entityType, entityId, payload, tenantId, actorId);
        publishToOutbox(event);
    }

    @Transactional
    public void publishUpdate(String entityType, Long entityId, Object payload, Long tenantId, Long actorId, Long version) {
        DeltaEventDTO event = DeltaEventDTO.update(entityType, entityId, payload, tenantId, actorId, version);
        publishToOutbox(event);
    }

    @Transactional
    public void publishDelete(String entityType, Long entityId, Long tenantId, Long actorId) {
        DeltaEventDTO event = DeltaEventDTO.delete(entityType, entityId, tenantId, actorId);
        publishToOutbox(event);
    }
}
