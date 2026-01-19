package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Weekly Session Activity breakdown
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerWeeklyActivityDTO {

    private List<DayData> days;
    private int totalSessions;
    private double dailyAverage;
    private String vsLastWeek; // e.g., "+20%"
    private String vsLastWeekType; // positive, negative, neutral

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayData {
        private String day; // "Mon", "Tue", etc.
        private int sessions;
        private int target;
    }
}
