package com.gym.subscription.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicenseDTO {
    private String id;
    private String userId;
    private String subscriptionId;
    private String licenseKey;
    private String planName;
    private Integer planTier;
    private Integer maxDevices;
    private Integer activatedDeviceCount;
    private List<DeviceInfo> activatedDevices;
    private LocalDateTime expiresAt;
    private Boolean isValid;
    private Boolean isRevoked;
    private Boolean isTransferable;
    private LocalDateTime lastValidatedAt;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceInfo {
        private String deviceId;
        private String deviceName;
        private String fingerprint;
        private LocalDateTime activatedAt;
        private LocalDateTime lastSeenAt;
        private String ipAddress;
    }
}
