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
