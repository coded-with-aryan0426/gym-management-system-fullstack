package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PTRevenueAnalytics {
        private BigDecimal totalPTRevenue;
        private BigDecimal averageRevenuePerMember;
        private int totalPTMembers;
        private int activePTMembers;
        private BigDecimal renewalRate;
        private List<MemberRevenueInsight> topSpenders;
        private List<ProductRevenue> productBreakdown;
        private List<MonthlyTrend> monthlyTrends;
        private List<AgeGroupSpending> ageGroupAnalysis;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberRevenueInsight {
        private Long memberId;
        private String memberName;
        private String email;
        private BigDecimal totalSpent;
        private int sessionsCompleted;
        private String membershipPlan;
        private double supplementProbability;
        private String renewalLikelihood;
        private LocalDate memberSince;
        private LocalDate lastVisit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductRevenue {
        private String productName;
        private String category;
        private BigDecimal revenue;
        private int unitsSold;
        private double percentageShare;
        private double growthRate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private String month;
        private BigDecimal revenue;
        private BigDecimal ptRevenue;
        private BigDecimal supplementRevenue;
        private int newMembers;
        private int churned;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AgeGroupSpending {
        private String ageGroup;
        private int memberCount;
        private BigDecimal averageSpend;
        private BigDecimal totalSpend;
        private String topProduct;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffAttendanceAnalytics {
        private List<StaffAttendanceRecord> staffRecords;
        private double averageArrivalTime;
        private int totalLateArrivals;
        private int totalAbsences;
        private double overtimeHours;
        private List<AttendanceDay> monthlyCalendar;
        private List<TopLateEmployee> topLateEmployees;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StaffAttendanceRecord {
        private Long staffId;
        private String staffName;
        private String role;
        private String avatarUrl;
        private List<DailyAttendance> dailyRecords;
        private double punctualityScore;
        private int presentDays;
        private int lateDays;
        private int absentDays;
        private double avgArrivalMinutes;
        private double overtimeHours;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyAttendance {
        private LocalDate date;
        private String status;
        private LocalDateTime checkIn;
        private LocalDateTime checkOut;
        private int lateMinutes;
        private double hoursWorked;
        private boolean isWeekend;
        private boolean isToday;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttendanceDay {
        private LocalDate date;
        private int presentCount;
        private int lateCount;
        private int absentCount;
        private boolean isWeekend;
        private boolean isToday;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopLateEmployee {
        private Long staffId;
        private String staffName;
        private int lateCount;
        private int totalLateMinutes;
        private double avgLateMinutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActionableInsight {
        private String id;
        private String category;
        private String icon;
        private String title;
        private String description;
        private String impact;
        private String action;
        private String priority;
        private Map<String, Object> data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InsightsPanel {
        private List<ActionableInsight> criticalInsights;
        private List<ActionableInsight> warningInsights;
        private List<ActionableInsight> opportunityInsights;
        private PerformanceSummary performanceSummary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceSummary {
        private double retentionRate;
        private double retentionChange;
        private double classUtilization;
        private double utilizationChange;
        private int trainerNPS;
        private String topTrainer;
        private BigDecimal revenueGrowth;
        private int newMembersThisMonth;
        private int churnedThisMonth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrainerPerformanceInsight {
        private Long trainerId;
        private String trainerName;
        private int sessionsCompleted;
        private BigDecimal revenueGenerated;
        private double retentionRate;
        private int activeClients;
        private double avgSessionRating;
        private String impactLevel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HourlyTraffic {
        private int hour;
        private String label;
        private int memberTraffic;
        private int trainerActivity;
        private double utilizationPercent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyPattern {
        private String dayOfWeek;
        private List<HourlyTraffic> hourlyData;
        private int peakHour;
        private int totalVisits;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrafficHeatmapData {
        private List<DailyPattern> weeklyPattern;
        private String peakTime;
        private String lowUtilizationTime;
        private String weekendPattern;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MembershipMovement {
        private int newJoins;
        private int newJoinsChange;
        private int renewals;
        private int renewalsChange;
        private int reactivations;
        private int reactivationsChange;
        private int churned;
        private int churnedChange;
        private int netGrowth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FullAnalyticsDashboard {
        private PTRevenueAnalytics ptRevenue;
        private StaffAttendanceAnalytics staffAttendance;
        private InsightsPanel insights;
        private TrafficHeatmapData trafficHeatmap;
        private MembershipMovement membershipMovement;
        private List<TrainerPerformanceInsight> trainerPerformance;
    }
}
