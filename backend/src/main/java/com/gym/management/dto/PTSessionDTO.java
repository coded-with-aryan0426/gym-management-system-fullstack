package com.gym.management.dto;

import com.gym.management.model.SessionStatus;
import com.gym.management.model.RecurringFrequency;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for PT Session
 * Used for API requests and responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PTSessionDTO {

    private Long sessionId;

    @NotNull(message = "Trainer ID is required")
    private Long trainerId;

    @NotNull(message = "Member ID is required")
    private Long memberId;

    @NotNull(message = "Session date is required")
    @FutureOrPresent(message = "Session date must be today or in the future")
    private LocalDateTime sessionDate;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Session duration must be at least 15 minutes")
    @Max(value = 180, message = "Session duration cannot exceed 180 minutes")
    private Integer durationMinutes;

    private SessionStatus status;

    @Size(max = 5000, message = "Progress notes cannot exceed 5000 characters")
    private String progressNotes;

    @Size(max = 5000, message = "Workout plan cannot exceed 5000 characters")
    private String workoutPlan;

    @Size(max = 5000, message = "Diet plan cannot exceed 5000 characters")
    private String dietPlan;

    private Boolean isRecurring;

    private RecurringFrequency recurringFrequency;

    // Additional fields for response
    private String trainerName;
    private String memberName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
