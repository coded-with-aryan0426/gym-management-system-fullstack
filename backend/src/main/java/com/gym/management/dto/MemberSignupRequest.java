package com.gym.management.dto;

import lombok.Data;

/**
 * Request DTO for customer/member signup flow
 */
@Data
public class MemberSignupRequest {
    // Account details
    private String email;
    private String password;
    private String fullName;
    private String phone;
    
    // Optional: Join a gym immediately
    private Long gymId;        // If joining a public gym directly
    private String inviteCode; // If using an invite code
}
