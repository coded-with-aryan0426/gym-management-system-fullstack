package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Entity representing audit log entries for tracking user actions
 * Maps to audit_logs table in the database
 * Enterprise-grade audit logging with comprehensive tracking
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity", columnList = "entity"),
    @Index(name = "idx_audit_severity", columnList = "severity"),
    @Index(name = "idx_audit_user_id", columnList = "user_id"),
    @Index(name = "idx_audit_gym_id", columnList = "gym_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "audit_log_seq")
    @SequenceGenerator(name = "audit_log_seq", sequenceName = "AUDIT_LOG_SEQ", allocationSize = 1)
    @Column(name = "audit_id")
    private Long auditId;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "entity", length = 100)
    private String entity;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "entity_name", length = 255)
    private String entityName;

    @Column(name = "target", length = 255)
    private String target;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "user_role", length = 50)
    private String userRole;

    @Column(name = "user_avatar", length = 500)
    private String userAvatar;

    @Column(name = "details", columnDefinition = "CLOB")
    private String details;

    @Column(name = "changes", columnDefinition = "CLOB")
    private String changes;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "os", length = 100)
    private String os;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "severity", length = 20)
    @Builder.Default
    private String severity = "info";

    @Column(name = "metadata", columnDefinition = "CLOB")
    private String metadata;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (severity == null) {
            severity = "info";
        }
    }
}
