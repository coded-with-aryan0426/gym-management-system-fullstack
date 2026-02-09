package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for audit log entries
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {

    private Long id;
    private String action;
    private String target;
    private String userName;
    private String userRole;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
    private Long userId;
}
