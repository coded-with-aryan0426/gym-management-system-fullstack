package com.gym.management.dto;

import lombok.Data;

/**
 * Request DTO for login with role context selection
 */
@Data
public class AuthRequest {
    private String username;
    private String password;
    private String loginContext; // "STAFF" or "MEMBER"
}
