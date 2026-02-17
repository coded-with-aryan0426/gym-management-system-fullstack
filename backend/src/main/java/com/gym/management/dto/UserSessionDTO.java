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
    private LocalDateTime lastActivityTime;
    private String duration; // formatted string like "2h 30m"
    private String ipAddress;
    private String location;
    private String deviceType;
    private String browser;
    private String os;
    private String sessionToken;
    private Long gymId;
}
