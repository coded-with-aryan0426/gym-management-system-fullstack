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

        public static PTRevenueAnalyticsBuilder builder() { return new PTRevenueAnalyticsBuilder(); }
        public static class PTRevenueAnalyticsBuilder {
            private PTRevenueAnalytics instance = new PTRevenueAnalytics();
            public PTRevenueAnalyticsBuilder totalPTRevenue(BigDecimal v) { instance.totalPTRevenue = v; return this; }
            public PTRevenueAnalyticsBuilder averageRevenuePerMember(BigDecimal v) { instance.averageRevenuePerMember = v; return this; }
            public PTRevenueAnalyticsBuilder totalPTMembers(int v) { instance.totalPTMembers = v; return this; }
            public PTRevenueAnalyticsBuilder activePTMembers(int v) { instance.activePTMembers = v; return this; }
            public PTRevenueAnalyticsBuilder renewalRate(BigDecimal v) { instance.renewalRate = v; return this; }
            public PTRevenueAnalyticsBuilder topSpenders(List<MemberRevenueInsight> v) { instance.topSpenders = v; return this; }
            public PTRevenueAnalyticsBuilder productBreakdown(List<ProductRevenue> v) { instance.productBreakdown = v; return this; }
            public PTRevenueAnalyticsBuilder monthlyTrends(List<MonthlyTrend> v) { instance.monthlyTrends = v; return this; }
            public PTRevenueAnalyticsBuilder ageGroupAnalysis(List<AgeGroupSpending> v) { instance.ageGroupAnalysis = v; return this; }
            public PTRevenueAnalytics build() { return instance; }
        }

        public BigDecimal getTotalPTRevenue() { return totalPTRevenue; }
        public BigDecimal getAverageRevenuePerMember() { return averageRevenuePerMember; }
        public int getTotalPTMembers() { return totalPTMembers; }
        public int getActivePTMembers() { return activePTMembers; }
        public BigDecimal getRenewalRate() { return renewalRate; }
        public List<MemberRevenueInsight> getTopSpenders() { return topSpenders; }
        public List<ProductRevenue> getProductBreakdown() { return productBreakdown; }
        public List<MonthlyTrend> getMonthlyTrends() { return monthlyTrends; }
        public List<AgeGroupSpending> getAgeGroupAnalysis() { return ageGroupAnalysis; }
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
    public static class StaffAttendanceAnalytics {
        private List<StaffAttendanceRecord> staffRecords;
        private double averageArrivalTime;
        private int totalLateArrivals;
        private int totalAbsences;
        private double overtimeHours;
        private List<AttendanceDay> monthlyCalendar;
        private List<TopLateEmployee> topLateEmployees;

        public static StaffAttendanceAnalyticsBuilder builder() { return new StaffAttendanceAnalyticsBuilder(); }
        public static class StaffAttendanceAnalyticsBuilder {
            private StaffAttendanceAnalytics instance = new StaffAttendanceAnalytics();
            public StaffAttendanceAnalyticsBuilder staffRecords(List<StaffAttendanceRecord> v) { instance.staffRecords = v; return this; }
            public StaffAttendanceAnalyticsBuilder averageArrivalTime(double v) { instance.averageArrivalTime = v; return this; }
            public StaffAttendanceAnalyticsBuilder totalLateArrivals(int v) { instance.totalLateArrivals = v; return this; }
            public StaffAttendanceAnalyticsBuilder totalAbsences(int v) { instance.totalAbsences = v; return this; }
            public StaffAttendanceAnalyticsBuilder overtimeHours(double v) { instance.overtimeHours = v; return this; }
            public StaffAttendanceAnalyticsBuilder monthlyCalendar(List<AttendanceDay> v) { instance.monthlyCalendar = v; return this; }
            public StaffAttendanceAnalyticsBuilder topLateEmployees(List<TopLateEmployee> v) { instance.topLateEmployees = v; return this; }
            public StaffAttendanceAnalytics build() { return instance; }
        }
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

        public Long getStaffId() { return staffId; }
        public String getStaffName() { return staffName; }
        public int getLateDays() { return lateDays; }
        public int getAbsentDays() { return absentDays; }
        public double getAvgArrivalMinutes() { return avgArrivalMinutes; }
        public double getOvertimeHours() { return overtimeHours; }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopLateEmployee {
        private Long staffId;
        private String staffName;
        private int lateCount;
        private int totalLateMinutes;
        private double avgLateMinutes;

        public static TopLateEmployeeBuilder builder() { return new TopLateEmployeeBuilder(); }
        public static class TopLateEmployeeBuilder {
            private TopLateEmployee instance = new TopLateEmployee();
            public TopLateEmployeeBuilder staffId(Long v) { instance.staffId = v; return this; }
            public TopLateEmployeeBuilder staffName(String v) { instance.staffName = v; return this; }
            public TopLateEmployeeBuilder lateCount(int v) { instance.lateCount = v; return this; }
            public TopLateEmployeeBuilder totalLateMinutes(int v) { instance.totalLateMinutes = v; return this; }
            public TopLateEmployeeBuilder avgLateMinutes(double v) { instance.avgLateMinutes = v; return this; }
            public TopLateEmployee build() { return instance; }
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
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

        public static ActionableInsightBuilder builder() { return new ActionableInsightBuilder(); }
        public static class ActionableInsightBuilder {
            private ActionableInsight instance = new ActionableInsight();
            public ActionableInsightBuilder id(String v) { instance.id = v; return this; }
            public ActionableInsightBuilder category(String v) { instance.category = v; return this; }
            public ActionableInsightBuilder icon(String v) { instance.icon = v; return this; }
            public ActionableInsightBuilder title(String v) { instance.title = v; return this; }
            public ActionableInsightBuilder description(String v) { instance.description = v; return this; }
            public ActionableInsightBuilder impact(String v) { instance.impact = v; return this; }
            public ActionableInsightBuilder action(String v) { instance.action = v; return this; }
            public ActionableInsightBuilder priority(String v) { instance.priority = v; return this; }
            public ActionableInsightBuilder data(Map<String, Object> v) { instance.data = v; return this; }
            public ActionableInsight build() { return instance; }
        }
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
