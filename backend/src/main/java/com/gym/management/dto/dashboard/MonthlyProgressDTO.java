package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Monthly Progress Data Transfer Object
 * Shows current month revenue vs target with projection
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyProgressDTO {
    private Double target;
    private Double current;
    private Double projectedEnd;
    private Integer daysElapsed;
    private Integer daysInMonth;
    private String status; // ON_TRACK, BEHIND, AHEAD
    private Integer daysRemaining;
}