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

    private String memberEmail;

    // Additional fields for response
    private String trainerName;
    private String memberName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PTSessionDTO fromEntity(com.gym.management.model.PTSession session) {
        PTSessionDTO dto = new PTSessionDTO();
        dto.setSessionId(session.getSessionId());
        dto.setSessionDate(session.getSessionDate());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setStatus(session.getStatus());
        dto.setProgressNotes(session.getProgressNotes());
        dto.setWorkoutPlan(session.getWorkoutPlan());
        dto.setDietPlan(session.getDietPlan());
        dto.setIsRecurring(session.getIsRecurring());
        dto.setRecurringFrequency(session.getRecurringFrequency());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setUpdatedAt(session.getUpdatedAt());

        if (session.getTrainer() != null) {
            dto.setTrainerId(session.getTrainer().getUserId());
            dto.setTrainerName(session.getTrainer().getFullName());
        }

        if (session.getMember() != null) {
            dto.setMemberId(session.getMember().getUserId());
            dto.setMemberName(session.getMember().getFullName());
            dto.setMemberEmail(session.getMember().getEmail());
        }

        return dto;
    }
}
