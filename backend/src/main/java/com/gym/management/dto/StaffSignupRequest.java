package com.gym.management.dto;

import lombok.Data;

/**
 * Request DTO for gym staff signup flow
 * V1: Simplified - no gym required
 */
@Data
public class StaffSignupRequest {
    // Account details
    private String email;
    private String password;
    private String fullName;
    private String phone;

    // V2 Future: Gym setup - either create new gym or join via invite code
    private boolean createNewGym;

    // For new gym creation (V2)
    private String gymName;
    private String gymAddress;
    private String gymCity;
    private String gymPhone;
    private String subscriptionPlan; // STARTER, PROFESSIONAL, ENTERPRISE

    // For joining existing gym (V2)
    private String inviteCode;
}
