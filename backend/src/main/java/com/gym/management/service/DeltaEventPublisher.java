package com.gym.management.service;

import com.gym.management.dto.DeltaEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Delta Event Publisher Service - Stage 3: Real-Time Sync Layer
 *
 * Publishes entity change events over WebSocket for real-time frontend updates.
 * Supports multi-tenant isolation and sequence numbering for ordering.
 */
@Service
public class DeltaEventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(DeltaEventPublisher.class);

    private final SimpMessagingTemplate messagingTemplate;

    // Per-tenant sequence number generators (for event ordering)
    private final ConcurrentHashMap<Long, AtomicLong> tenantSequences = new ConcurrentHashMap<>();

    @Autowired
    public DeltaEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Publish a delta event to all subscribers of the tenant's sync channel.
     *
     * @param event The delta event to publish
     */
    public void publish(DeltaEventDTO event) {
        if (event == null) {
            logger.warn("Attempted to publish null delta event");
            return;
        }

        // Assign sequence number for ordering
        Long tenantId = event.getTenantId();
        if (tenantId != null) {
            AtomicLong sequence = tenantSequences.computeIfAbsent(tenantId, k -> new AtomicLong(0));
            event.setSequenceNumber(sequence.incrementAndGet());
        }

        // Publish to tenant-specific topic
        String destination = getDestination(event);
        
        try {
            messagingTemplate.convertAndSend(destination, event);
            logger.debug("Published delta event: {} to {}", event.getEventId(), destination);
        } catch (Exception e) {
            logger.error("Failed to publish delta event: {}", event, e);
        }
    }

    /**
     * Publish a CREATE event for a new entity.
     */
    public void publishCreate(String entityType, Long entityId, Object payload, Long tenantId, Long actorId) {
        DeltaEventDTO event = DeltaEventDTO.create(entityType, entityId, payload, tenantId, actorId);
        publish(event);
    }

    /**
     * Publish an UPDATE event for an existing entity.
     */
    public void publishUpdate(String entityType, Long entityId, Object payload, Long tenantId, Long actorId, Long version) {
        DeltaEventDTO event = DeltaEventDTO.update(entityType, entityId, payload, tenantId, actorId, version);
        publish(event);
    }

    /**
     * Publish a DELETE event for a removed entity.
     */
    public void publishDelete(String entityType, Long entityId, Long tenantId, Long actorId) {
        DeltaEventDTO event = DeltaEventDTO.delete(entityType, entityId, tenantId, actorId);
        publish(event);
    }

    /**
     * Determine the WebSocket destination for the event.
     * Uses tenant-specific channels for multi-tenant isolation.
     */
    private String getDestination(DeltaEventDTO event) {
        Long tenantId = event.getTenantId();
        String entityType = event.getEntityType();

        // Tenant-scoped topic for entity type
        if (tenantId != null) {
            return String.format("/topic/delta/%d/%s", tenantId, entityType);
        }

        // Global topic for system-wide events (rare)
        return String.format("/topic/delta/global/%s", entityType);
    }

    /**
     * Get current sequence number for a tenant (for checkpoint queries).
     */
    public long getCurrentSequence(Long tenantId) {
        if (tenantId == null) {
            return 0;
        }
        AtomicLong sequence = tenantSequences.get(tenantId);
        return sequence != null ? sequence.get() : 0;
    }

    /**
     * Reset sequence number for a tenant (for testing only).
     */
    public void resetSequence(Long tenantId) {
        if (tenantId != null) {
            tenantSequences.remove(tenantId);
        }
    }
}
