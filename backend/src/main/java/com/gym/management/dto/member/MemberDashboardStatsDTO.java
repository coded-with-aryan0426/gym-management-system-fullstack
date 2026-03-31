package com.gym.management.dto.member;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberDashboardStatsDTO {
    // Basic Info
    private Long memberId;
    private String memberName;
    private String email;
    private String avatarId;

    // KPI Cards
    private Integer workoutsThisMonth;
    private Integer streakDays;
    private Long bookedClassesCount;
    private Long unreadNotificationsCount;
    private Integer caloriesBurned;
    private Integer minutesActive;
    private Integer totalPoints;

    // Membership Info
    private MembershipInfoDTO membership;

    // Assigned Trainer
    private TrainerInfoDTO assignedTrainer;

    // Widgets & Charts
    private List<UpcomingClassDTO> upcomingClasses;
    private List<WeeklyActivityDTO> weeklyActivity;
    private List<ActivityItemDTO> recentActivity;
    private List<FitnessMetricDTO> fitnessMetrics;
    private List<WeightProgressDTO> weightProgress;
    private List<AchievementDTO> achievements;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MembershipInfoDTO {
        private String status;
        private String packageName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long daysRemaining;
        private Boolean isExpired;
        private Double planPrice;
        private String planDuration;
        private Boolean autoRenew;
        private Integer freezeDaysUsed;
        private Integer freezeDaysTotal;
        private Boolean isFrozen;
        private LocalDate frozenUntil;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainerInfoDTO {
        private Long userId;
        private String fullName;
        private String email;
        private String avatarId;
        private String specialization;
        private String nextSession;
        private Integer sessionsCount;
        private Double rating;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingClassDTO {
        private Long id;
        private String title;
        private String time;
        private String date;
        private String location;
        private String trainer;
        private String type;
        private Integer capacity;
        private Integer enrolled;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyActivityDTO {
        private String day;
        private Integer workouts;
        private Integer calories;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItemDTO {
        private Long id;
        private String name;
        private String type; // checkin, workout, booking, payment
        private String date; // "10m ago" or "Dec 22"
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FitnessMetricDTO {
        private String metric;
        private Integer value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeightProgressDTO {
        private String week;
        private Double weight;
        private Double goal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementDTO {
        private String icon;
        private String label;
        private String color;
    }
}
