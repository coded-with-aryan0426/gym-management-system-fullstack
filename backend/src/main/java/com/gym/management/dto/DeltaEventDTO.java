package com.gym.management.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Delta Event DTO for real-time data synchronization.
 * Stage 3: Real-Time Sync Layer
 *
 * Represents a change notification for CRUD operations on entities.
 * Allows frontend to apply incremental updates without full refetch.
 */
public class DeltaEventDTO {

    /**
     * Unique identifier for this event (for idempotency)
     */
    private String eventId;

    /**
     * Type of entity affected (e.g., "member", "trainer", "class")
     */
    private String entityType;

    /**
     * ID of the entity affected
     */
    private Long entityId;

    /**
     * Type of operation: CREATE, UPDATE, DELETE
     */
    private OperationType operation;

    /**
     * The entity data (for CREATE/UPDATE) - can be null for DELETE
     */
    private Object payload;

    /**
     * Tenant/gym ID for multi-tenant filtering
     */
    private Long tenantId;

    /**
     * User who triggered the change
     */
    private Long actorId;

    /**
     * Timestamp when the change occurred
     */
    private Instant timestamp;

    /**
     * Sequence number for ordering (monotonically increasing per tenant)
     */
    private Long sequenceNumber;

    /**
     * Version for optimistic locking / conflict detection
     */
    private Long version;

    public enum OperationType {
        CREATE, UPDATE, DELETE
    }

    // Default constructor
    public DeltaEventDTO() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
    }

    // Builder-style static factory methods
    public static DeltaEventDTO create(String entityType, Long entityId, Object payload, Long tenantId, Long actorId) {
        DeltaEventDTO event = new DeltaEventDTO();
        event.entityType = entityType;
        event.entityId = entityId;
        event.operation = OperationType.CREATE;
        event.payload = payload;
        event.tenantId = tenantId;
        event.actorId = actorId;
        return event;
    }

    public static DeltaEventDTO update(String entityType, Long entityId, Object payload, Long tenantId, Long actorId, Long version) {
        DeltaEventDTO event = new DeltaEventDTO();
        event.entityType = entityType;
        event.entityId = entityId;
        event.operation = OperationType.UPDATE;
        event.payload = payload;
        event.tenantId = tenantId;
        event.actorId = actorId;
        event.version = version;
        return event;
    }

    public static DeltaEventDTO delete(String entityType, Long entityId, Long tenantId, Long actorId) {
        DeltaEventDTO event = new DeltaEventDTO();
        event.entityType = entityType;
        event.entityId = entityId;
        event.operation = OperationType.DELETE;
        event.tenantId = tenantId;
        event.actorId = actorId;
        return event;
    }

    // Getters and setters
    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public OperationType getOperation() {
        return operation;
    }

    public void setOperation(OperationType operation) {
        this.operation = operation;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getActorId() {
        return actorId;
    }

    public void setActorId(Long actorId) {
        this.actorId = actorId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Long getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Long sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return "DeltaEventDTO{" +
                "eventId='" + eventId + '\'' +
                ", entityType='" + entityType + '\'' +
                ", entityId=" + entityId +
                ", operation=" + operation +
                ", tenantId=" + tenantId +
                ", actorId=" + actorId +
                ", timestamp=" + timestamp +
                ", sequenceNumber=" + sequenceNumber +
                '}';
    }
}
