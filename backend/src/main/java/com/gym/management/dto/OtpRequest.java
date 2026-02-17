package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Request DTO for sending OTP.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpRequest {
    private String email;
    private String purpose; // SIGNUP, LOGIN, PASSWORD_RESET

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}
