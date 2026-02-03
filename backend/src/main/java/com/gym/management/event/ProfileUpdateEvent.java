package com.gym.management.event;

import org.springframework.context.ApplicationEvent;

/**
 * Event fired when a user profile is updated
 * Used for cache invalidation and real-time synchronization
 */
public class ProfileUpdateEvent extends ApplicationEvent {
    
    private final Long userId;
    private final String updatedBy;
    private final long timestamp;
    
    public ProfileUpdateEvent(Object source, Long userId, String updatedBy) {
        super(source);
        this.userId = userId;
        this.updatedBy = updatedBy;
        this.timestamp = System.currentTimeMillis();
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    @Override
    public String toString() {
        return "ProfileUpdateEvent{" +
                "userId=" + userId +
                ", updatedBy='" + updatedBy + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}