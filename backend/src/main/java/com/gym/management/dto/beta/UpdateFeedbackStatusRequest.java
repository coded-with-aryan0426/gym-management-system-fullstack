package com.gym.management.dto.beta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFeedbackStatusRequest {

    @NotBlank(message = "Status is required")
    private String status; // NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, WONT_FIX

    private String adminNotes;

    @Min(value = 0, message = "Priority score must be at least 0")
    @Max(value = 10, message = "Priority score cannot exceed 10")
    private Integer priorityScore;
}
