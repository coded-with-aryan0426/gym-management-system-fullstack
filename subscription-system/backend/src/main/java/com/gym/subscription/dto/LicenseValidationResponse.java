package com.gym.subscription.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicenseValidationResponse {
    private Boolean valid;
    private String licenseKey;
    private String planName;
    private Integer planTier;
    private String status;
    private String message;
    private java.time.LocalDateTime expiresAt;
    private Integer remainingActivations;
    private java.util.Map<String, Object> features;
}
