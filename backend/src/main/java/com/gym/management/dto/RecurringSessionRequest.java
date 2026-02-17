package com.gym.management.dto;

import com.gym.management.model.RecurringFrequency;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for creating recurring PT sessions
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecurringSessionRequest {

    @NotNull(message = "Trainer ID is required")
    private Long trainerId;

    @NotNull(message = "Member ID is required")
    private Long memberId;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Session duration must be at least 15 minutes")
    @Max(value = 180, message = "Session duration cannot exceed 180 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Recurring frequency is required")
    private RecurringFrequency frequency;

    @NotNull(message = "Number of occurrences is required")
    @Min(value = 1, message = "Must create at least 1 session")
    @Max(value = 52, message = "Cannot create more than 52 recurring sessions at once")
    private Integer occurrences;
}
