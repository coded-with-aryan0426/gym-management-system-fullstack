package com.gym.management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageReactionDTO {
    private Long reactionId;
    private Long userId;
    private String userFullName; // For tooltip
    private String emoji;
    private LocalDateTime createdAt;

    // Explicit getters and setters for Lombok compatibility
    public Long getReactionId() { return reactionId; }
    public void setReactionId(Long reactionId) { this.reactionId = reactionId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
    
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
