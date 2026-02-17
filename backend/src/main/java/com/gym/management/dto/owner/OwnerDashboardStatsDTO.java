package com.gym.management.dto.owner;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardStatsDTO {
    // KPI Cards
    private Double todayRevenue;
    private Double revenueChange;
    private Integer liveMembers;
    private Integer checkIns;
    private Integer pendingPaymentsCount;
    private Double pendingPaymentsAmount;

    // Overview Section
    private Integer totalMembers;
    private Integer newSignups;
    private Integer totalTrainers;
    private Integer totalSessionsToday;
    private Double monthlyRevenue;

    // Widgets
    private List<TrainerScheduleDTO> trainerSchedule;
    private List<ExpiringMemberDTO> expiringMembers;
    private List<OverduePaymentDTO> overduePayments;
    private List<TopTrainerDTO> topTrainers;
    private List<MembershipPlanDTO> bestPlans;
    private List<StockAlertDTO> stockAlerts;
    private List<ActivityItemDTO> recentActivity;
    private List<BirthdayDTO> birthdays;

    // Inner DTOs
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainerScheduleDTO {
        private String name;
        private String initials;
        private Integer sessionsToday;
        private Double totalRevenue;
        private Integer availableSlots;
        private List<TrainerSlotDTO> slots;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainerSlotDTO {
        private String time;
        private String status; // available, limited, booked
        private String memberName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpiringMemberDTO {
        private Long id;
        private String name;
        private String plan;
        private Integer daysLeft;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverduePaymentDTO {
        private Long id;
        private String name;
        private Double amount;
        private Integer daysPast;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopTrainerDTO {
        private String name;
        private String role;
        private Double revenue;
        private Integer sessions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MembershipPlanDTO {
        private String name;
        private Integer sold;
        private Double revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockAlertDTO {
        private String name;
        private Integer level;
        private String icon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItemDTO {
        private Long id;
        private String name;
        private String type; // signup, checkin, cancel, freeze
        private String date; // "10m ago" or "Dec 22"
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BirthdayDTO {
        private String name;
        private String initials;
    }
}
