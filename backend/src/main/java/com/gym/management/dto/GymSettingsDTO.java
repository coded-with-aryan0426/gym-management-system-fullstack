package com.gym.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for Gym Settings
 * Used for API requests and responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GymSettingsDTO {

    private Long settingId;

    @NotBlank(message = "Setting key is required")
    @Size(max = 100, message = "Setting key cannot exceed 100 characters")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    private String settingValue;

    @NotBlank(message = "Setting type is required")
    @Size(max = 50, message = "Setting type cannot exceed 50 characters")
    private String settingType;
}
