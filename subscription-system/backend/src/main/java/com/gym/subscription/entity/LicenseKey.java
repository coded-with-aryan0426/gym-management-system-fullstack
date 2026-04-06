package com.gym.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "license_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LicenseKey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private UserSubscription subscription;

    @Column(name = "license_key", nullable = false, unique = true, length = 255)
    private String licenseKey;

    @Column(name = "plan_name", nullable = false, length = 50)
    private String planName;

    @Column(name = "plan_tier", nullable = false)
    @Builder.Default
    private Integer planTier = 0;

    @Column(name = "max_devices")
    @Builder.Default
    private Integer maxDevices = 1;

    @Column(name = "activated_devices", columnDefinition = "CLOB")
    @Convert(converter = JsonConverter.class)
    @Builder.Default
    private List<ActivatedDevice> activatedDevices = List.of();

    @Column(name = "hardware_fingerprint", length = 255)
    private String hardwareFingerprint;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "last_validated_at")
    private LocalDateTime lastValidatedAt;

    @Column(name = "is_revoked")
    @Builder.Default
    private Boolean isRevoked = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revoke_reason", length = 255)
    private String revokeReason;

    @Column(name = "is_transferable")
    @Builder.Default
    private Boolean isTransferable = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isValid() {
        if (isRevoked) return false;
        if (expiresAt == null) return false;
        if (LocalDateTime.now().isAfter(expiresAt)) return false;
        return true;
    }

    public boolean canActivateDevice() {
        if (maxDevices == -1) return true;
        return activatedDevices.size() < maxDevices;
    }

    public int getRemainingActivations() {
        if (maxDevices == -1) return Integer.MAX_VALUE;
        return Math.max(0, maxDevices - activatedDevices.size());
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivatedDevice {
        private String deviceId;
        private String deviceName;
        private String fingerprint;
        private LocalDateTime activatedAt;
        private LocalDateTime lastSeenAt;
        private String ipAddress;
    }
}
