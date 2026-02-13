package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dashboard Summary Data Transfer Object
 * Comprehensive dashboard data in a single response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    // KPI Cards
    private Double todayRevenue;
    private Double revenueChange;
    private Integer liveMembers;
    private Integer checkIns;
    private Integer pendingPaymentsCount;
    private Double pendingPaymentsAmount;
    private Integer totalMembers;
    private Integer newSignups;
    private Integer totalTrainers;
    private Integer totalSessionsToday;
    private Double monthlyRevenue;
    
    // Charts & Widgets
    private List<DailyRevenueDTO> revenueTrend;
    private List<DailyAttendanceDTO> attendanceTrend;
    private MembershipBreakdownDTO membershipBreakdown;
    private List<RevenueBySourceDTO> revenueBySource;
    private List<OverduePaymentDTO> overduePayments;
    private List<TodaysClassDTO> todaysClasses;
    private OccupancyDTO occupancy;
    private MonthlyProgressDTO monthlyProgress;
    
    // Lists
    private List<Object> trainerSchedule;
    private List<Object> expiringMembers;
    private List<Object> recentActivity;
    private List<Object> birthdays;
}