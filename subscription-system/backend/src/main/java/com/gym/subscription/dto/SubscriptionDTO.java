package com.gym.subscription.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDTO {
    private String id;
    private String userId;
    private String planId;
    private String planName;
    private Integer planTier;
    private String status;
    private String billingCycle;
    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;
    private LocalDateTime trialStart;
    private LocalDateTime trialEnd;
    private LocalDateTime gracePeriodEnd;
    private Boolean cancelAtPeriodEnd;
    private Boolean autoRenew;
    private String gateway;
    private Boolean isInGracePeriod;
    private Long daysUntilExpiry;
    private Long daysInGracePeriod;
    private Map<String, Object> features;
    private LocalDateTime createdAt;
}
