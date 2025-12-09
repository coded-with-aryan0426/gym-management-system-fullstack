package com.gym.management.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Request DTO for marking a PT session as complete
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteSessionRequest {

    @Size(max = 5000, message = "Progress notes cannot exceed 5000 characters")
    private String progressNotes;

    @Size(max = 5000, message = "Workout plan cannot exceed 5000 characters")
    private String workoutPlan;

    @Size(max = 5000, message = "Diet plan cannot exceed 5000 characters")
    private String dietPlan;

    private Boolean memberAttended;
}
