package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for audit log entries
 * Enterprise-grade audit logging with comprehensive tracking
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {

    private Long id;
    private String action;
    private String entity;
    private String entityId;
    private String entityName;
    private String target;
    private String userName;
    private String userRole;
    private String userAvatar;
    private String details;
    private String changes; // JSON string for field changes
    private String ipAddress;
    private String location;
    private String deviceType; // desktop, mobile, tablet
    private String browser;
    private String os;
    private String sessionId;
    private String severity; // info, low, medium, high, critical
    private String metadata; // JSON for additional data
    private LocalDateTime timestamp;
    private Long userId;
    private Long gymId;
}
