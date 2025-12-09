package com.gym.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for Blackout Day
 * Used for API requests and responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlackoutDayDTO {

    private Long blackoutId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @Size(max = 255, message = "Reason cannot exceed 255 characters")
    private String reason;
}
