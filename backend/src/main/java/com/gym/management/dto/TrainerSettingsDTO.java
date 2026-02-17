package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerSettingsDTO {

    private ProfileDAO profile;
    private NotificationsDAO notifications;
    private PrivacyDAO privacy;
    private AppearanceDAO appearance;
    private RegionalDAO regional;

    // We can ignore 'Active Sessions' and 'Data & Storage' for now as they are
    // logic-heavy
    // or handled by other endpoints, but let's include placeholders if needed.

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileDAO {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String bio;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationsDAO {
        private boolean email;
        private boolean push;
        private boolean bookings;
        private boolean reminders;
        private boolean marketing;
        private boolean sound;
        private boolean vibration;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrivacyDAO {
        private boolean profileVisible;
        private boolean activityStatus;
        private boolean analytics;
        private boolean locationServices;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppearanceDAO {
        private String theme; // "light" or "dark"
        private String accentColor;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionalDAO {
        private String language;
        private String timezone;
        private String dateFormat;
        private String timeFormat;
    }
}
