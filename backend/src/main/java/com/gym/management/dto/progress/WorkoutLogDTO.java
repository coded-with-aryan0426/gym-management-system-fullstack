package com.gym.management.dto.progress;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutLogDTO {
    private Long id;
    private Long userId;
    private LocalDate workoutDate;
    private Integer durationMinutes;
    private String workoutType;
    private Integer caloriesBurned;
    private Integer exercisesCount;
    private Integer intensityLevel;
    private String notes;
    private LocalDateTime createdAt;
}
