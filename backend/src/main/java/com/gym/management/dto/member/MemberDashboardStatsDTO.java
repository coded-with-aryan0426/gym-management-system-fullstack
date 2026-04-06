package com.gym.management.dto.member;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class MemberDashboardStatsDTO {
    private Long memberId;
    private String memberName;
    private String email;
    private String avatarId;
    private MembershipInfoDTO membership;
    private TrainerInfoDTO assignedTrainer;
    private Integer workoutsThisMonth;
    private Integer streakDays;
    private Long bookedClassesCount;
    private Long unreadNotificationsCount;
    private Integer caloriesBurned;
    private Integer minutesActive;
    private Integer totalPoints;
    private List<UpcomingClassDTO> upcomingClasses;
    private List<WeeklyActivityDTO> weeklyActivity;
    private List<ActivityItemDTO> recentActivity;
    private List<FitnessMetricDTO> fitnessMetrics;
    private List<WeightProgressDTO> weightProgress;
    private List<AchievementDTO> achievements;

    @Data
    @Builder
    public static class MembershipInfoDTO {
        private String packageName;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private String planDuration;
        private Double planPrice;
        private Long daysRemaining;
        private Boolean isExpired;
        private Boolean autoRenew;
        private Integer freezeDaysUsed;
        private Integer freezeDaysTotal;
        private Boolean isFrozen;
        private LocalDate frozenUntil;
    }

    @Data
    @Builder
    public static class TrainerInfoDTO {
        private Long userId;
        private String fullName;
        private String email;
        private String avatarId;
        private String specialization;
        private Double rating;
        private String nextSession;
        private Integer sessionsCount;
    }

    @Data
    @Builder
    public static class UpcomingClassDTO {
        private Long id;
        private String title;
        private String date;
        private String time;
        private String location;
        private String trainer;
        private String type;
        private Integer capacity;
        private Integer enrolled;
    }

    @Data
    @Builder
    public static class WeeklyActivityDTO {
        private String day;
        private Integer workouts;
        private Integer calories;
    }

    @Data
    @Builder
    public static class ActivityItemDTO {
        private Long id;
        private String name;
        private String type;
        private String date;
        private String reason;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class FitnessMetricDTO {
        private String metricName;
        private String currentValue;
        private String change;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class WeightProgressDTO {
        private String week;
        private Double weight;
        private Double change;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class AchievementDTO {
        private String icon;
        private String title;
        private String color;
    }
}