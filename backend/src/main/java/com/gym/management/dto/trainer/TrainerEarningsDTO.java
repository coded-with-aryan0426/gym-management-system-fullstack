package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Earnings breakdown and analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerEarningsDTO {

    private double totalEarnings;
    private String period; // "This Month"
    private String changePercent; // "+18%"
    private String changeType; // positive, negative, neutral

    private List<EarningsCategory> breakdown;

    private double avgPerSession;
    private double avgDailyEarnings;
    private int paidSessions;
    private double projectedMonthly;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EarningsCategory {
        private String category; // "PT Sessions", "Group Classes", etc.
        private double amount;
        private int sessions;
        private String color; // Hex color
    }
}
