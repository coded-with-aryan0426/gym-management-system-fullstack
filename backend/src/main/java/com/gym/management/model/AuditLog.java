package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "changes", columnDefinition = "TEXT")
    private String changes; // JSON string for field changes

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "device_type", length = 50)
    private String deviceType; // desktop, mobile, tablet

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "os", length = 100)
    private String os;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "severity", length = 20)
    private String severity = "info"; // info, low, medium, high, critical

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON for additional data

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

    // Builder pattern for easy creation
    public static AuditLogBuilder builder() {
        return new AuditLogBuilder();
    }

    public static class AuditLogBuilder {
        private final AuditLog log = new AuditLog();

        public AuditLogBuilder action(String action) {
            log.setAction(action);
            return this;
        }

        public AuditLogBuilder entity(String entity) {
            log.setEntity(entity);
            return this;
        }

        public AuditLogBuilder entityId(String entityId) {
            log.setEntityId(entityId);
            return this;
        }

        public AuditLogBuilder entityName(String entityName) {
            log.setEntityName(entityName);
            return this;
        }

        public AuditLogBuilder target(String target) {
            log.setTarget(target);
            return this;
        }

        public AuditLogBuilder userName(String userName) {
            log.setUserName(userName);
            return this;
        }

        public AuditLogBuilder userRole(String userRole) {
            log.setUserRole(userRole);
            return this;
        }

        public AuditLogBuilder userAvatar(String userAvatar) {
            log.setUserAvatar(userAvatar);
            return this;
        }

        public AuditLogBuilder details(String details) {
            log.setDetails(details);
            return this;
        }

        public AuditLogBuilder changes(String changes) {
            log.setChanges(changes);
            return this;
        }

        public AuditLogBuilder ipAddress(String ipAddress) {
            log.setIpAddress(ipAddress);
            return this;
        }

        public AuditLogBuilder location(String location) {
            log.setLocation(location);
            return this;
        }

        public AuditLogBuilder deviceType(String deviceType) {
            log.setDeviceType(deviceType);
            return this;
        }

        public AuditLogBuilder browser(String browser) {
            log.setBrowser(browser);
            return this;
        }

        public AuditLogBuilder os(String os) {
            log.setOs(os);
            return this;
        }

        public AuditLogBuilder sessionId(String sessionId) {
            log.setSessionId(sessionId);
            return this;
        }

        public AuditLogBuilder severity(String severity) {
            log.setSeverity(severity);
            return this;
        }

        public AuditLogBuilder metadata(String metadata) {
            log.setMetadata(metadata);
            return this;
        }

        public AuditLogBuilder timestamp(LocalDateTime timestamp) {
            log.setTimestamp(timestamp);
            return this;
        }

        public AuditLogBuilder user(User user) {
            log.setUser(user);
            return this;
        }

        public AuditLogBuilder gym(Gym gym) {
            log.setGym(gym);
            return this;
        }

        public AuditLog build() {
            return log;
        }
    }
}
