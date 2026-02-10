package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for user session tracking
 * Tracks login/logout, online status, and session duration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSessionDTO {

    private Long id;
    private Long userId;
    private String userName;
    private String userRole;
    private String userAvatar;
    private String status; // online, offline, idle, away
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private LocalDateTime lastActivity;
    private Long duration; // in seconds
    private String ipAddress;
    private String location;
    private String deviceType;
    private String browser;
    private String os;
    private String sessionId;
    private Long gymId;
}
