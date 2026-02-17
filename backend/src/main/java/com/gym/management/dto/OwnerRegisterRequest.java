package com.gym.management.dto;

import lombok.Data;

@Data
public class OwnerRegisterRequest {
    private String gymName;
    private String ownerName;
    private String email;
    private String phone;
    private String password;
    private String otp;
}
