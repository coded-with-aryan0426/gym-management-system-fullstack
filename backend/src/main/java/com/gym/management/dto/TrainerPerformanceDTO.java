package com.gym.management.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for trainer performance metrics
 * Contains calculated values for clients and revenue
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerPerformanceDTO {

    private Long trainerId;

    /**
     * Number of active clients assigned to this trainer
     */
    private Integer clientCount;

    /**
     * Monthly revenue (sessions completed × rate)
     */
    private BigDecimal monthlyRevenue;

    /**
     * Number of completed sessions this month
     */
    private Integer completedSessions;

    /**
     * Total session hours this month
     */
    private Double totalHours;
}
