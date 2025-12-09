package com.gym.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for PT session configuration settings
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PTConfigDTO {

    @NotNull(message = "Default duration is required")
    @Min(value = 15, message = "Default duration must be at least 15 minutes")
    @Max(value = 180, message = "Default duration cannot exceed 180 minutes")
    private Integer defaultDurationMinutes;

    @NotNull(message = "Max sessions per day is required")
    @Min(value = 1, message = "Max sessions per day must be at least 1")
    @Max(value = 20, message = "Max sessions per day cannot exceed 20")
    private Integer maxSessionsPerDay;

    @NotNull(message = "Slot interval is required")
    @Min(value = 15, message = "Slot interval must be at least 15 minutes")
    @Max(value = 60, message = "Slot interval cannot exceed 60 minutes")
    private Integer slotIntervalMinutes;
}
