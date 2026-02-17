package com.gym.management.dto;

import lombok.Data;

@Data
public class RenewMembershipRequest {
    private Long userId;
    
    // Legacy field - kept for backward compatibility
    private Long packageId;
    
    // New tiered plan fields
    private Long planId;
    private Long variantId;
    
    private Integer customDurationMonths;
    
    private Long gymId;
    
    private Boolean isUpgrade;
}
