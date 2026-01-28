package com.gym.management.dto.progress;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressSummaryDTO {
    private Long userId;
    
    private BigDecimal currentWeight;
    private BigDecimal startWeight;
    private BigDecimal goalWeight;
    private BigDecimal weightChange;
    private BigDecimal weightChangePercent;
    
    private BigDecimal currentBodyFat;
    private BigDecimal startBodyFat;
    private BigDecimal bodyFatChange;
    
    private BigDecimal currentMuscleMass;
    private BigDecimal startMuscleMass;
    private BigDecimal muscleMassChange;
    
    private BigDecimal currentBmi;
    private String bmiCategory;
    
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalWorkouts;
    private Integer workoutsThisWeek;
    private Integer workoutsThisMonth;
    private Integer totalCaloriesBurned;
    private Integer avgWorkoutDuration;
    private Double consistencyRate;
    
    private Integer totalProgressEntries;
    private Integer totalPersonalBests;
    private Integer activeGoals;
    private Integer completedGoals;
    
    private LocalDate firstEntryDate;
    private LocalDate lastEntryDate;
    
    private List<ProgressMetricDTO> recentMetrics;
    private List<BodyMeasurementDTO> recentMeasurements;
    private List<PersonalBestDTO> topPersonalBests;
    private List<MemberGoalDTO> activeGoalsList;
    private List<WorkoutLogDTO> recentWorkouts;
}
