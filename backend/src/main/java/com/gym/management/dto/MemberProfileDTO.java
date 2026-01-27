package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberProfileDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarId;
    private String status;
    private LocalDateTime createdAt;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
    
    private String address;
    private String city;
    private String state;
    private String zipCode;
    
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String healthNotes;
    
    private List<String> fitnessGoals;
    
    private BigDecimal height;
    private BigDecimal weight;
    private BigDecimal bodyFat;
    
    private Boolean twoFactorEnabled;
    
    private MemberStatsDTO stats;
    private MembershipInfoDTO membership;
    private List<AchievementDTO> achievements;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberStatsDTO {
        private int totalWorkouts;
        private int currentStreak;
        private String memberLevel;
        private LocalDate joinedDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MembershipInfoDTO {
        private Long membershipId;
        private String planName;
        private String planType;
        private LocalDate startDate;
        private LocalDate endDate;
        private int daysRemaining;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementDTO {
        private Long id;
        private String type;
        private String name;
        private String description;
        private LocalDateTime earnedAt;
    }
}
