package com.gym.management.service;

import com.gym.management.dto.GymHoursDTO;
import com.gym.management.dto.PTConfigDTO;
import com.gym.management.dto.BlackoutDayDTO;
import com.gym.management.model.GymSettings;
import com.gym.management.model.BlackoutDay;
import com.gym.management.model.User;
import com.gym.management.model.Gym;
import com.gym.management.repository.GymSettingsRepository;
import com.gym.management.repository.BlackoutDayRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.GymRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class GymSettingsService {

    @Autowired
    private GymSettingsRepository gymSettingsRepository;

    @Autowired
    private BlackoutDayRepository blackoutDayRepository;
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GymRepository gymRepository;

    public List<GymHoursDTO> getGymHours() {
        List<GymSettings> settings = gymSettingsRepository.findBySettingType("GYM_HOURS");
        return settings.stream()
                .map(this::convertToGymHoursDTO)
                .collect(Collectors.toList());
    }

    public GymHoursDTO updateGymHours(GymHoursDTO dto) {
        String key = "gym_hours_" + dto.getDayOfWeek().toLowerCase();

        GymSettings setting = gymSettingsRepository.findBySettingKey(key)
                .orElse(new GymSettings());

        setting.setSettingKey(key);
        setting.setSettingValue(String.format("{\"open\": \"%s\", \"close\": \"%s\", \"isClosed\": %s}",
                dto.getOpenTime(), dto.getCloseTime(), dto.getIsClosed()));
        setting.setSettingType("GYM_HOURS");

        GymSettings saved = gymSettingsRepository.save(setting);
        return convertToGymHoursDTO(saved);
    }

    public PTConfigDTO getPTConfiguration() {
        PTConfigDTO config = new PTConfigDTO();

        config.setDefaultDurationMinutes(
                gymSettingsRepository.findBySettingKey("pt_default_duration")
                        .map(s -> Integer.parseInt(s.getSettingValue()))
                        .orElse(60));

        config.setMaxSessionsPerDay(
                gymSettingsRepository.findBySettingKey("pt_max_sessions_per_day")
                        .map(s -> Integer.parseInt(s.getSettingValue()))
                        .orElse(8));

        config.setSlotIntervalMinutes(
                gymSettingsRepository.findBySettingKey("pt_slot_interval")
                        .map(s -> Integer.parseInt(s.getSettingValue()))
                        .orElse(30));

        return config;
    }

    public PTConfigDTO updatePTConfiguration(PTConfigDTO dto) {
        saveSetting("pt_default_duration", dto.getDefaultDurationMinutes().toString(), "PT_CONFIG");
        saveSetting("pt_max_sessions_per_day", dto.getMaxSessionsPerDay().toString(), "PT_CONFIG");
        saveSetting("pt_slot_interval", dto.getSlotIntervalMinutes().toString(), "PT_CONFIG");

        return dto;
    }

    public List<BlackoutDayDTO> getBlackoutDays() {
        return blackoutDayRepository.findAll()
                .stream()
                .map(this::convertToBlackoutDayDTO)
                .collect(Collectors.toList());
    }

    public BlackoutDayDTO addBlackoutDay(LocalDate date, String reason) {
        if (blackoutDayRepository.existsByDate(date)) {
            throw new IllegalArgumentException("Blackout day already exists for this date");
        }

        BlackoutDay blackoutDay = new BlackoutDay();
        blackoutDay.setDate(date);
        blackoutDay.setReason(reason);

        BlackoutDay saved = blackoutDayRepository.save(blackoutDay);
        return convertToBlackoutDayDTO(saved);
    }

    public void deleteBlackoutDay(LocalDate date) {
        blackoutDayRepository.deleteByDate(date);
    }

    public Map<String, String> getAllSettings() {
        try {
            // Use a more specific query to avoid massive joins
            List<GymSettings> allSettings = gymSettingsRepository.findBySettingTypeOrderByKey("GENERAL");
            if (allSettings.isEmpty()) {
                // If no GENERAL settings, try to get all settings using a simpler approach
                allSettings = gymSettingsRepository.findBySettingTypeOrderByKey("OWNER_PROFILE");
            }
            
            Map<String, String> settingsMap = new HashMap<>();
            for (GymSettings setting : allSettings) {
                settingsMap.put(setting.getSettingKey(), setting.getSettingValue());
            }
            return settingsMap;
        } catch (Exception e) {
            // Fallback: return empty map if there's any issue
            System.err.println("Error loading settings: " + e.getMessage());
            return new HashMap<>();
        }
    }

    public void updateAllSettings(Map<String, Object> settings) {
        User currentUser = getCurrentUser();
        Long gymId = getCurrentUserGymId(currentUser);
        
        // Group changes by category for better logging
        Map<String, Map<String, Object>> categorizedChanges = new HashMap<>();
        categorizedChanges.put("security", new HashMap<>());
        categorizedChanges.put("appearance", new HashMap<>());
        categorizedChanges.put("notifications", new HashMap<>());
        categorizedChanges.put("userRules", new HashMap<>());
        categorizedChanges.put("general", new HashMap<>());
        
        for (Map.Entry<String, Object> entry : settings.entrySet()) {
            String key = entry.getKey();
            Object newValue = entry.getValue();
            
            // Skip null or empty values
            if (newValue == null || (newValue instanceof String && ((String) newValue).trim().isEmpty())) {
                continue;
            }
            
            // Get the old value before updating
            String oldValue = gymSettingsRepository.findBySettingKey(key)
                    .map(GymSettings::getSettingValue)
                    .orElse(null);
            
            String newValueStr = newValue.toString();
            
            // Only log if value actually changed
            if (oldValue == null || !oldValue.equals(newValueStr)) {
                // Categorize the change
                String category = categorizeSettingKey(key);
                Map<String, Object> changeDetail = new HashMap<>();
                changeDetail.put("old", oldValue);
                changeDetail.put("new", newValueStr);
                categorizedChanges.get(category).put(key, changeDetail);
            }
            
            // Save the setting
            saveSetting(key, newValueStr, "GENERAL");
        }
        
        // Log each category of changes separately for micro-level tracking
        for (Map.Entry<String, Map<String, Object>> categoryEntry : categorizedChanges.entrySet()) {
            String category = categoryEntry.getKey();
            Map<String, Object> changes = categoryEntry.getValue();
            
            if (!changes.isEmpty() && currentUser != null) {
                try {
                    String entityName = getCategoryDisplayName(category);
                    String changesJson = buildChangesJson(changes);
                    String details = buildChangeDetails(category, changes);
                    
                    auditLogService.logUpdate(
                        "SETTINGS",                         // entity
                        category,                           // entityId (category name)
                        entityName,                         // entityName
                        currentUser.getUserId(),            // userId
                        gymId,                              // gymId
                        details,                            // details (human readable)
                        changesJson,                        // changes (JSON with old/new)
                        null                                // ipAddress
                    );
                } catch (Exception e) {
                    System.err.println("Failed to log " + category + " settings update: " + e.getMessage());
                }
            }
        }
    }
    
    private Long getCurrentUserGymId(User user) {
        if (user == null) return null;
        try {
            // First try to find gym where user is owner
            return gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(user.getUserId())
                    .map(Gym::getGymId)
                    .orElse(null);
        } catch (Exception e) {
            System.err.println("Failed to get user's gym ID: " + e.getMessage());
            return null;
        }
    }
    
    private String categorizeSettingKey(String key) {
        // Security settings
        if (key.contains("password") || key.contains("Password") || 
            key.contains("2fa") || key.contains("twoFactor") ||
            key.contains("session") || key.contains("Session") ||
            key.contains("login") || key.contains("Login") ||
            key.contains("security") || key.contains("Security") ||
            key.contains("lockout") || key.contains("Lockout")) {
            return "security";
        }
        // Appearance settings
        if (key.contains("theme") || key.contains("Theme") ||
            key.contains("color") || key.contains("Color") ||
            key.contains("dark") || key.contains("Dark") ||
            key.contains("light") || key.contains("Light") ||
            key.contains("appearance") || key.contains("Appearance") ||
            key.contains("font") || key.contains("Font") ||
            key.contains("accent") || key.contains("Accent")) {
            return "appearance";
        }
        // Notification settings
        if (key.contains("notification") || key.contains("Notification") ||
            key.contains("email") || key.contains("Email") ||
            key.contains("sms") || key.contains("Sms") ||
            key.contains("push") || key.contains("Push") ||
            key.contains("alert") || key.contains("Alert")) {
            return "notifications";
        }
        // User rules settings
        if (key.contains("rule") || key.contains("Rule") ||
            key.contains("permission") || key.contains("Permission") ||
            key.contains("access") || key.contains("Access") ||
            key.contains("member") || key.contains("Member") ||
            key.contains("staff") || key.contains("Staff") ||
            key.contains("freeze") || key.contains("Freeze") ||
            key.contains("cancel") || key.contains("Cancel") ||
            key.contains("gracePeriod") || key.contains("GracePeriod")) {
            return "userRules";
        }
        return "general";
    }
    
    private String getCategoryDisplayName(String category) {
        switch (category) {
            case "security": return "Security Settings";
            case "appearance": return "Appearance Settings";
            case "notifications": return "Notification Settings";
            case "userRules": return "User Rules & Permissions";
            default: return "General Settings";
        }
    }
    
    private String buildChangesJson(Map<String, Object> changes) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : changes.entrySet()) {
            if (!first) json.append(", ");
            first = false;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> changeDetail = (Map<String, Object>) entry.getValue();
            String oldVal = changeDetail.get("old") != null ? changeDetail.get("old").toString() : null;
            String newVal = changeDetail.get("new") != null ? changeDetail.get("new").toString() : null;
            
            // Escape quotes in values
            if (oldVal != null) oldVal = oldVal.replace("\"", "\\\"");
            if (newVal != null) newVal = newVal.replace("\"", "\\\"");
            
            json.append("\"").append(entry.getKey()).append("\": {")
                .append("\"field\": \"").append(entry.getKey()).append("\", ")
                .append("\"type\": \"String\", ")
                .append("\"oldValue\": ").append(oldVal != null ? "\"" + oldVal + "\"" : "null").append(", ")
                .append("\"newValue\": ").append(newVal != null ? "\"" + newVal + "\"" : "null").append(", ")
                .append("\"changed\": true}");
        }
        json.append("}");
        return json.toString();
    }
    
    private String buildChangeDetails(String category, Map<String, Object> changes) {
        StringBuilder details = new StringBuilder();
        details.append(getCategoryDisplayName(category)).append(": ");
        
        int count = changes.size();
        if (count == 1) {
            String key = changes.keySet().iterator().next();
            @SuppressWarnings("unchecked")
            Map<String, Object> changeDetail = (Map<String, Object>) changes.get(key);
            String oldVal = changeDetail.get("old") != null ? changeDetail.get("old").toString() : "none";
            String newVal = changeDetail.get("new") != null ? changeDetail.get("new").toString() : "none";
            details.append(formatSettingName(key))
                   .append(" changed from '").append(truncateValue(oldVal))
                   .append("' to '").append(truncateValue(newVal)).append("'");
        } else {
            details.append(count).append(" settings changed (");
            boolean first = true;
            for (String key : changes.keySet()) {
                if (!first) details.append(", ");
                first = false;
                details.append(formatSettingName(key));
            }
            details.append(")");
        }
        
        return details.toString();
    }
    
    private String formatSettingName(String key) {
        // Convert camelCase or snake_case to readable format
        String formatted = key.replaceAll("([a-z])([A-Z])", "$1 $2")
                             .replaceAll("_", " ");
        // Capitalize first letter of each word
        String[] words = formatted.split(" ");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                if (result.length() > 0) result.append(" ");
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1).toLowerCase());
            }
        }
        return result.toString();
    }
    
    private String truncateValue(String value) {
        if (value == null) return "none";
        if (value.length() > 50) {
            return value.substring(0, 47) + "...";
        }
        return value;
    }
    
    private User getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                String username = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
                return userRepository.findByEmail(username).orElse(null);
            }
        } catch (Exception e) {
            System.err.println("Failed to get current user: " + e.getMessage());
        }
        return null;
    }

    private void saveSetting(String key, String value, String type) {
        // Skip if value is null or empty to avoid database constraint violations
        if (value == null || value.trim().isEmpty()) {
            System.out.println("Skipping setting save for key '" + key + "': value is null or empty");
            return;
        }
        
        System.out.println("Saving setting: key='" + key + "', value='" + value + "', type='" + type + "'");
        
        GymSettings setting = gymSettingsRepository.findBySettingKey(key)
                .orElse(new GymSettings());

        setting.setSettingKey(key);
        setting.setSettingValue(value);
        setting.setSettingType(type);

        gymSettingsRepository.save(setting);
        System.out.println("Setting saved successfully for key: " + key);
    }

    private GymHoursDTO convertToGymHoursDTO(GymSettings setting) {
        GymHoursDTO dto = new GymHoursDTO();
        String dayOfWeek = setting.getSettingKey().replace("gym_hours_", "");
        dto.setDayOfWeek(dayOfWeek);

        // Parse JSON value (simplified)
        String settingValue = setting.getSettingValue();
        if (settingValue != null && !settingValue.isEmpty()) {
            // Basic JSON parsing - in production use a proper JSON library
            if (settingValue.contains("open")) {
                int openStart = settingValue.indexOf("open") + 8;
                int openEnd = settingValue.indexOf("\"", openStart);
                if (openStart > 7 && openEnd > openStart) {
                    dto.setOpenTime(settingValue.substring(openStart, openEnd));
                } else {
                    dto.setOpenTime("06:00");
                }
            } else {
                dto.setOpenTime("06:00");
            }
            if (settingValue.contains("close")) {
                int closeStart = settingValue.indexOf("close") + 9;
                int closeEnd = settingValue.indexOf("\"", closeStart);
                if (closeStart > 8 && closeEnd > closeStart) {
                    dto.setCloseTime(settingValue.substring(closeStart, closeEnd));
                } else {
                    dto.setCloseTime("22:00");
                }
            } else {
                dto.setCloseTime("22:00");
            }
            dto.setIsClosed(settingValue.contains("\"isClosed\": true") || settingValue.contains("\"isClosed\":true"));
        } else {
            dto.setOpenTime("06:00");
            dto.setCloseTime("22:00");
            dto.setIsClosed(false);
        }

        return dto;
    }

    private BlackoutDayDTO convertToBlackoutDayDTO(BlackoutDay blackoutDay) {
        BlackoutDayDTO dto = new BlackoutDayDTO();
        dto.setBlackoutId(blackoutDay.getBlackoutId());
        dto.setDate(blackoutDay.getDate());
        dto.setReason(blackoutDay.getReason());
        return dto;
    }
}
