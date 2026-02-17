package com.gym.management.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.management.dto.TrainerSettingsDTO;
import com.gym.management.model.TrainerDetails;
import com.gym.management.model.TrainerSettings;
import com.gym.management.model.User;
import com.gym.management.repository.TrainerDetailsRepository;
import com.gym.management.repository.TrainerSettingsRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrainerSettingsService {

    @Autowired
    private TrainerSettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainerDetailsRepository detailsRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public TrainerSettingsDTO getSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TrainerDetails details = detailsRepository.findByUser(user)
                .orElse(new TrainerDetails()); // Handle missing details gracefully

        TrainerSettings settings = settingsRepository.findByUserUserId(userId)
                .orElse(new TrainerSettings());

        TrainerSettingsDTO dto = new TrainerSettingsDTO();

        // 1. Profile Data (from User/Details)
        TrainerSettingsDTO.ProfileDAO profile = new TrainerSettingsDTO.ProfileDAO();
        profile.setFirstName(user.getFullName().split(" ")[0]); // Simplistic first name extraction
        profile.setLastName(
                user.getFullName().contains(" ") ? user.getFullName().substring(user.getFullName().indexOf(" ") + 1)
                        : "");
        profile.setEmail(user.getEmail());
        profile.setPhone(user.getPhone());
        profile.setBio(details.getBio());
        dto.setProfile(profile);

        // 2. JSON Preferences (from TrainerSettings)
        dto.setNotifications(parseJson(settings.getNotificationPrefs(), TrainerSettingsDTO.NotificationsDAO.class,
                new TrainerSettingsDTO.NotificationsDAO()));
        dto.setPrivacy(parseJson(settings.getPrivacyPrefs(), TrainerSettingsDTO.PrivacyDAO.class,
                new TrainerSettingsDTO.PrivacyDAO()));
        dto.setAppearance(parseJson(settings.getAppearancePrefs(), TrainerSettingsDTO.AppearanceDAO.class,
                new TrainerSettingsDTO.AppearanceDAO()));
        dto.setRegional(parseJson(settings.getRegionalPrefs(), TrainerSettingsDTO.RegionalDAO.class,
                new TrainerSettingsDTO.RegionalDAO()));

        return dto;
    }

    @Transactional
    public TrainerSettingsDTO updateSettings(Long userId, TrainerSettingsDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Update Profile (User/Details)
        if (dto.getProfile() != null) {
            user.setFullName(dto.getProfile().getFirstName() + " " + dto.getProfile().getLastName());
            user.setPhone(dto.getProfile().getPhone());
            // Email updates might require more validation in a real app, but we'll allow it
            // for now logic-wise
            // user.setEmail(dto.getProfile().getEmail());

            userRepository.save(user);

            TrainerDetails details = detailsRepository.findByUser(user)
                    .orElseGet(() -> {
                        TrainerDetails d = new TrainerDetails();
                        d.setUser(user);
                        return d;
                    });
            details.setBio(dto.getProfile().getBio());
            detailsRepository.save(details);
        }

        // 2. Update Preferences (TrainerSettings)
        TrainerSettings settings = settingsRepository.findByUserUserId(userId)
                .orElseGet(() -> {
                    TrainerSettings s = new TrainerSettings();
                    s.setUser(user);
                    return s;
                });

        if (dto.getNotifications() != null)
            settings.setNotificationPrefs(toJson(dto.getNotifications()));
        if (dto.getPrivacy() != null)
            settings.setPrivacyPrefs(toJson(dto.getPrivacy()));
        if (dto.getAppearance() != null)
            settings.setAppearancePrefs(toJson(dto.getAppearance()));
        if (dto.getRegional() != null)
            settings.setRegionalPrefs(toJson(dto.getRegional()));

        settingsRepository.save(settings);

        return getSettings(userId);
    }

    private <T> T parseJson(String json, Class<T> clazz, T defaultValue) {
        if (json == null || json.isEmpty())
            return defaultValue;
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            return defaultValue;
        }
    }

    private String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
