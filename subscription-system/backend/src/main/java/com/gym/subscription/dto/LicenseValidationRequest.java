package com.gym.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicenseValidationRequest {

    @NotBlank(message = "License key is required")
    private String licenseKey;

    @NotBlank(message = "Device fingerprint is required")
    private String deviceFingerprint;

    private String deviceName;
    private String deviceId;
    private String ipAddress;
}
