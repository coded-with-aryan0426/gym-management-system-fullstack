package com.gym.management.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String email;
    private String newPassword;
    private String confirmPassword;
}
