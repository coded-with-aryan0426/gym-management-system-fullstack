package com.gym.management.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.messaging.simp.SimpMessagingTemplate;

/**
 * Listener for profile update events
 * Handles cache invalidation and real-time notifications
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProfileUpdateEventListener {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle profile update events
     */
    @EventListener
    @CacheEvict(value = {"userProfiles", "memberProfiles", "userCache"}, key = "#event.userId")
    public void handleProfileUpdateEvent(ProfileUpdateEvent event) {
        log.info("Handling profile update event for user {} by {}", event.getUserId(), event.getUpdatedBy());
        
        // Invalidate caches
        invalidateUserCaches(event.getUserId());
        
        // Send real-time notification to WebSocket subscribers
        notifyProfileUpdate(event);
    }
    
    /**
     * Invalidate all user-related caches
     */
    private void invalidateUserCaches(Long userId) {
        // Additional cache invalidation logic if needed
        log.debug("Invalidated caches for user {}", userId);
    }
    
    /**
     * Send WebSocket notification for real-time updates
     */
    private void notifyProfileUpdate(ProfileUpdateEvent event) {
        try {
            String destination = "/topic/profile-updates/" + event.getUserId();
            messagingTemplate.convertAndSend(destination, event);
            log.debug("Sent WebSocket notification to {}", destination);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification", e);
        }
    }
}