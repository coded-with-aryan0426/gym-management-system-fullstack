package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for users available in chat.
 * Contains basic profile info suitable for chat user lists.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserDTO {
    private Long userId;
    private String fullName;
    private String username;
    private String avatarId;
    private String role; // TRAINER, MEMBER, GYM_OWNER, etc.
    private Long gymId;
    private boolean online;
    private String lastSeen; // ISO timestamp

    // Explicit getters and setters for Lombok compatibility
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getAvatarId() { return avatarId; }
    public void setAvatarId(String avatarId) { this.avatarId = avatarId; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Long getGymId() { return gymId; }
    public void setGymId(Long gymId) { this.gymId = gymId; }
    
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
    
    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }

    // For quick identification in UI
    public String getInitials() {
        if (fullName == null || fullName.isEmpty()) {
            return "?";
        }
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, 1).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }

    // Role badge color for frontend
    public String getRoleBadgeColor() {
        if (role == null)
            return "#6b7280"; // gray
        switch (role) {
            case "TRAINER":
                return "#10b981"; // green
            case "GYM_OWNER":
                return "#f59e0b"; // amber
            case "ADMIN":
                return "#ef4444"; // red
            case "NUTRITIONIST":
                return "#8b5cf6"; // purple
            case "SUPPORT":
                return "#3b82f6"; // blue
            default:
                return "#6b7280"; // gray for MEMBER
        }
    }
}
