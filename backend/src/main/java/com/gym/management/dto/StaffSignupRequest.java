package com.gym.management.dto;

import lombok.Data;

/**
 * Request DTO for gym staff signup flow
 */
@Data
public class StaffSignupRequest {
    // Account details
    private String email;
    private String password;
    private String fullName;
    private String phone;
    
    // Gym setup - either create new gym or join via invite code
    private boolean createNewGym;
    
    // For new gym creation
    private String gymName;
    private String gymAddress;
    private String gymCity;
    private String gymPhone;
    private String subscriptionPlan; // STARTER, PROFESSIONAL, ENTERPRISE
    
    // For joining existing gym
    private String inviteCode;
}
