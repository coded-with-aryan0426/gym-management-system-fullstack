package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberSettingsDTO {
    private MemberProfileDTO profile;
    private MemberPreferenceDTO preferences;
    private NotificationSettingDTO notifications;
    private PrivacySettingDTO privacy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberPreferenceDTO {
        private String workoutPreferences;
        private String skillLevel;
        private String theme;
        private String language;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationSettingDTO {
        private Boolean workoutReminders;
        private Boolean classSchedule;
        private Boolean trainerMessages;
        private Boolean marketingEmails;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrivacySettingDTO {
        private String profileVisibility;
        private Boolean showProgressPhotos;
        private Boolean allowTrainerAccess;
    }
}
