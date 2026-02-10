package com.gym.management.service;

import com.gym.management.dto.GymHoursDTO;
import com.gym.management.dto.PTConfigDTO;
import com.gym.management.dto.BlackoutDayDTO;
import com.gym.management.model.GymSettings;
import com.gym.management.model.BlackoutDay;
import com.gym.management.model.User;
import com.gym.management.repository.GymSettingsRepository;
import com.gym.management.repository.BlackoutDayRepository;
import com.gym.management.repository.UserRepository;
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
        StringBuilder changes = new StringBuilder();
        changes.append("{");
        boolean first = true;
        
        for (Map.Entry<String, Object> entry : settings.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            // Skip null or empty values to avoid database constraint violations
            if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
                // If setting already exists, we might want to delete it or just skip
                // For now, let's skip to avoid the constraint violation
                continue;
            }
            
            if (!first) changes.append(", ");
            changes.append("\"").append(key).append("\": \"").append(value.toString()).append("\"");
            first = false;
            
            saveSetting(key, value.toString(), "GENERAL");
        }
        changes.append("}");
        
        // Log the settings update
        if (!first) {
            try {
                User currentUser = getCurrentUser();
                if (currentUser != null) {
                    auditLogService.logUpdate(
                        "SETTINGS",                         // entity
                        "general",                          // entityId
                        "General Settings",                 // entityName
                        currentUser.getUserId(),            // userId
                        null,                               // gymId
                        "Gym settings updated",             // details
                        changes.toString(),                 // changes
                        null                                // ipAddress
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to log settings update: " + e.getMessage());
            }
        }
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
