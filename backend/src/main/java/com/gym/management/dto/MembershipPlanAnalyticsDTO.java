package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Membership Plan Analytics DTO
 * Provides analytics data for membership plans
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MembershipPlanAnalyticsDTO {
    
    private Long totalPlans;
    private Long activePlans;
    private Long inactivePlans;
    private Double averagePrice;
    private Double totalRevenue;
    private Map<String, Long> plansByStatus;
    private Map<String, Double> revenueByPlan;
    private Map<String, Long> memberCountByPlan;
    private Map<String, Double> averageDurationByPlan;
    
    // Popular plans ranking
    private String mostPopularPlan;
    private String highestRevenuePlan;
    private String longestDurationPlan;
    
    // Growth metrics
    private Long plansCreatedThisMonth;
    private Long plansCreatedLastMonth;
    private Double monthOverMonthGrowth;
}