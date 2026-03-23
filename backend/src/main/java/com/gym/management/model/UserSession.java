package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.time.Duration;

/**
 * Entity representing active user sessions
 * Enhanced with online status tracking and session duration
 */
@Entity
@Table(name = "user_sessions", indexes = {
    @Index(name = "idx_session_user_id", columnList = "user_id"),
    @Index(name = "idx_session_gym_id", columnList = "gym_id"),
    @Index(name = "idx_session_status", columnList = "status"),
    @Index(name = "idx_session_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_session_seq")
    @SequenceGenerator(name = "user_session_seq", sequenceName = "USER_SESSION_SEQ", allocationSize = 1)
    @Column(name = "session_id")
    private Long sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "token_hash", nullable = false, length = 256)
    private String tokenHash;

    @Column(name = "status", length = 20)
    private String status = "online"; // online, offline, idle, away

    @Column(name = "device", length = 255)
    private String device;

    @Column(name = "device_type", length = 50)
    private String deviceType; // desktop, mobile, tablet

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "os", length = 100)
    private String os;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "user_agent", columnDefinition = "CLOB")
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "logout_at")
    private LocalDateTime logoutAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "duration")
    private Long duration; // in seconds

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (lastActiveAt == null) {
            lastActiveAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "online";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        // Calculate duration when session ends
        if (!isActive && logoutAt != null && createdAt != null) {
            duration = Duration.between(createdAt, logoutAt).getSeconds();
        }
    }

    // Utility method to get current duration
    public Long getCurrentDuration() {
        if (duration != null) {
            return duration;
        }
        if (createdAt != null) {
            LocalDateTime endTime = logoutAt != null ? logoutAt : LocalDateTime.now();
            return Duration.between(createdAt, endTime).getSeconds();
        }
        return 0L;
    }

    // Manual getters/setters for compatibility
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Gym getGym() { return gym; }
    public void setGym(Gym gym) { this.gym = gym; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }
    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
    public String getBrowser() { return browser; }
    public void setBrowser(String browser) { this.browser = browser; }
    public String getOs() { return os; }
    public void setOs(String os) { this.os = os; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }
    public LocalDateTime getLogoutAt() { return logoutAt; }
    public void setLogoutAt(LocalDateTime logoutAt) { this.logoutAt = logoutAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
