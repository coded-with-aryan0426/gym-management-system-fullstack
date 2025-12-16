package com.gym.management.dto;

import lombok.Data;

@Data
public class RenewMembershipRequest {
    private Long userId;
    private Long packageId;
    private Integer customDurationMonths;
}
