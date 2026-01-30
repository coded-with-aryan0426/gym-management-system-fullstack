package com.gym.management.service;

import com.gym.management.dto.MemberSettingsDTO;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberSettingsService {

    private final MemberProfileService memberProfileService;
    private final MemberPreferenceRepository memberPreferenceRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final PrivacySettingRepository privacySettingRepository;
    private final UserRepository userRepository;

    public MemberSettingsDTO getMemberSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return MemberSettingsDTO.builder()
                .profile(memberProfileService.getMemberProfile(userId))
                .preferences(getPreferences(user))
                .notifications(getNotifications(user))
                .privacy(getPrivacy(user))
                .build();
    }

    private MemberSettingsDTO.MemberPreferenceDTO getPreferences(User user) {
        MemberPreference prefs = memberPreferenceRepository.findById(user.getUserId())
                .orElseGet(() -> createDefaultPreferences(user));
        
        return MemberSettingsDTO.MemberPreferenceDTO.builder()
                .workoutPreferences(prefs.getWorkoutPreferences())
                .skillLevel(prefs.getSkillLevel())
                .theme(prefs.getTheme())
                .language(prefs.getLanguage())
                .build();
    }

    private MemberSettingsDTO.NotificationSettingDTO getNotifications(User user) {
        NotificationSetting settings = notificationSettingRepository.findById(user.getUserId())
                .orElseGet(() -> createDefaultNotifications(user));

        return MemberSettingsDTO.NotificationSettingDTO.builder()
                .workoutReminders(settings.getWorkoutReminders())
                .classSchedule(settings.getClassSchedule())
                .trainerMessages(settings.getTrainerMessages())
                .marketingEmails(settings.getMarketingEmails())
                .build();
    }

    private MemberSettingsDTO.PrivacySettingDTO getPrivacy(User user) {
        PrivacySetting privacy = privacySettingRepository.findById(user.getUserId())
                .orElseGet(() -> createDefaultPrivacy(user));

        return MemberSettingsDTO.PrivacySettingDTO.builder()
                .profileVisibility(privacy.getProfileVisibility())
                .showProgressPhotos(privacy.getShowProgressPhotos())
                .allowTrainerAccess(privacy.getAllowTrainerAccess())
                .build();
    }

    @Transactional
    public MemberPreference createDefaultPreferences(User user) {
        MemberPreference prefs = MemberPreference.builder()
                .user(user)
                .theme("LIGHT")
                .language("en")
                .skillLevel("BEGINNER")
                .build();
        return memberPreferenceRepository.save(prefs);
    }

    @Transactional
    public NotificationSetting createDefaultNotifications(User user) {
        NotificationSetting settings = NotificationSetting.builder()
                .user(user)
                .workoutReminders(true)
                .classSchedule(true)
                .trainerMessages(true)
                .marketingEmails(false)
                .build();
        return notificationSettingRepository.save(settings);
    }

    @Transactional
    public PrivacySetting createDefaultPrivacy(User user) {
        PrivacySetting privacy = PrivacySetting.builder()
                .user(user)
                .profileVisibility("PUBLIC")
                .showProgressPhotos(true)
                .allowTrainerAccess(true)
                .build();
        return privacySettingRepository.save(privacy);
    }

    @Transactional
    public void updatePreferences(Long userId, MemberSettingsDTO.MemberPreferenceDTO dto) {
        MemberPreference prefs = memberPreferenceRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Preferences not found"));

        if (dto.getWorkoutPreferences() != null) prefs.setWorkoutPreferences(dto.getWorkoutPreferences());
        if (dto.getSkillLevel() != null) prefs.setSkillLevel(dto.getSkillLevel());
        if (dto.getTheme() != null) prefs.setTheme(dto.getTheme());
        if (dto.getLanguage() != null) prefs.setLanguage(dto.getLanguage());

        memberPreferenceRepository.save(prefs);
    }

    @Transactional
    public void updateNotifications(Long userId, MemberSettingsDTO.NotificationSettingDTO dto) {
        NotificationSetting settings = notificationSettingRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Notification settings not found"));

        if (dto.getWorkoutReminders() != null) settings.setWorkoutReminders(dto.getWorkoutReminders());
        if (dto.getClassSchedule() != null) settings.setClassSchedule(dto.getClassSchedule());
        if (dto.getTrainerMessages() != null) settings.setTrainerMessages(dto.getTrainerMessages());
        if (dto.getMarketingEmails() != null) settings.setMarketingEmails(dto.getMarketingEmails());

        notificationSettingRepository.save(settings);
    }

    @Transactional
    public void updatePrivacy(Long userId, MemberSettingsDTO.PrivacySettingDTO dto) {
        PrivacySetting privacy = privacySettingRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Privacy settings not found"));

        if (dto.getProfileVisibility() != null) privacy.setProfileVisibility(dto.getProfileVisibility());
        if (dto.getShowProgressPhotos() != null) privacy.setShowProgressPhotos(dto.getShowProgressPhotos());
        if (dto.getAllowTrainerAccess() != null) privacy.setAllowTrainerAccess(dto.getAllowTrainerAccess());

        privacySettingRepository.save(privacy);
    }
}
