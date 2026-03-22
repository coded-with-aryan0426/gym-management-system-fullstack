package com.gym.management.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SuperAdminFeaturesService {

    // In-memory feature flags (in production, this would be a database table)
    private final Map<String, Map<String, Object>> featureFlags = new HashMap<>();

    public SuperAdminFeaturesService() {
        initializeDefaultFlags();
    }

    private void initializeDefaultFlags() {
        addFlag("online_booking", true, 100, "Online class booking system", false);
        addFlag("payment_gateway", true, 100, "Integrated payment processing", false);
        addFlag("qr_checkin", true, 85, "QR code-based gym check-in", false);
        addFlag("progress_tracking", true, 100, "Member progress tracking and analytics", false);
        addFlag("mobile_app", false, 30, "Native mobile application", false);
        addFlag("ai_workout_plans", false, 10, "AI-generated workout recommendations", true);
        addFlag("live_classes", true, 100, "Live streaming fitness classes", false);
        addFlag("nutrition_tracking", false, 50, "Meal planning and nutrition tracking", false);
    }

    private void addFlag(String key, boolean enabled, int rollout, String description, boolean critical) {
        Map<String, Object> flag = new HashMap<>();
        flag.put("key", key);
        flag.put("name", formatName(key));
        flag.put("enabled", enabled);
        flag.put("rolloutPercentage", rollout);
        flag.put("description", description);
        flag.put("critical", critical);
        flag.put("updatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        featureFlags.put(key, flag);
    }

    private String formatName(String key) {
        return Arrays.stream(key.split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1))
                .reduce((a, b) -> a + " " + b)
                .orElse(key);
    }

    public List<Map<String, Object>> getAllFlags() {
        return new ArrayList<>(featureFlags.values());
    }

    public Map<String, Object> updateFlag(String key, Boolean enabled, Integer rollout) {
        Map<String, Object> flag = featureFlags.get(key);
        if (flag == null) {
            throw new IllegalArgumentException("Feature flag not found: " + key);
        }

        if (enabled != null) {
            flag.put("enabled", enabled);
        }
        if (rollout != null) {
            flag.put("rolloutPercentage", rollout);
        }
        flag.put("updatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return flag;
    }
}
