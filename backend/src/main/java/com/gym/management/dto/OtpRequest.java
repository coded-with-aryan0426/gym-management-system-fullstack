package com.gym.management.dto;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String purpose; // SIGNUP, LOGIN, PASSWORD_RESET
}
