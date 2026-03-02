package com.gym.management.service;

import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberProfileService {

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    
    @Autowired
    private AuditLogService auditLogService;

    public MemberProfileDTO getMemberProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        MemberProfileDTO.MemberStatsDTO stats = calculateMemberStatsSafe(userId, user);
        MemberProfileDTO.MembershipInfoDTO membershipInfo = getMembershipInfoSafe(userId);
        List<MemberProfileDTO.AchievementDTO> achievements = getAchievementsSafe(userId);

        return MemberProfileDTO.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarId(user.getAvatarId())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .bloodType(user.getBloodType())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .zipCode(user.getZipCode())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .healthNotes(user.getHealthNotes())
                .fitnessGoals(parseFitnessGoals(user.getFitnessGoals()))
                .height(user.getHeight())
                .weight(user.getWeight())
                .bodyFat(user.getBodyFat())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .stats(stats)
                .membership(membershipInfo)
                .achievements(achievements)
                .build();
    }

    @Transactional
    public MemberProfileDTO updateMemberProfile(Long userId, MemberProfileUpdateDTO updateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Capture old values for audit logging
        StringBuilder changes = new StringBuilder();
        changes.append("{\"before\": {");
        boolean firstBefore = true;
        StringBuilder afterChanges = new StringBuilder();
        afterChanges.append("\"after\": {");
        boolean firstAfter = true;

        if (updateDTO.getFullName() != null && !updateDTO.getFullName().equals(user.getFullName())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"fullName\": \"").append(user.getFullName()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"fullName\": \"").append(updateDTO.getFullName()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setFullName(updateDTO.getFullName());
        }
        if (updateDTO.getPhone() != null && !updateDTO.getPhone().equals(user.getPhone())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"phone\": \"").append(user.getPhone()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"phone\": \"").append(updateDTO.getPhone()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setPhone(updateDTO.getPhone());
        }
        if (updateDTO.getAvatarId() != null && !updateDTO.getAvatarId().equals(user.getAvatarId())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"avatarId\": ").append(user.getAvatarId());
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"avatarId\": ").append(updateDTO.getAvatarId());
            firstBefore = false;
            firstAfter = false;
            user.setAvatarId(updateDTO.getAvatarId());
        }
        if (updateDTO.getDateOfBirth() != null && !updateDTO.getDateOfBirth().equals(user.getDateOfBirth())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"dateOfBirth\": \"").append(user.getDateOfBirth()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"dateOfBirth\": \"").append(updateDTO.getDateOfBirth()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setDateOfBirth(updateDTO.getDateOfBirth());
        }
        if (updateDTO.getGender() != null && !updateDTO.getGender().equals(user.getGender())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"gender\": \"").append(user.getGender()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"gender\": \"").append(updateDTO.getGender()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setGender(updateDTO.getGender());
        }
        if (updateDTO.getBloodType() != null && !updateDTO.getBloodType().equals(user.getBloodType())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"bloodType\": \"").append(user.getBloodType()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"bloodType\": \"").append(updateDTO.getBloodType()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setBloodType(updateDTO.getBloodType());
        }
        if (updateDTO.getAddress() != null && !updateDTO.getAddress().equals(user.getAddress())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"address\": \"").append(user.getAddress()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"address\": \"").append(updateDTO.getAddress()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setAddress(updateDTO.getAddress());
        }
        if (updateDTO.getCity() != null && !updateDTO.getCity().equals(user.getCity())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"city\": \"").append(user.getCity()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"city\": \"").append(updateDTO.getCity()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setCity(updateDTO.getCity());
        }
        if (updateDTO.getState() != null && !updateDTO.getState().equals(user.getState())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"state\": \"").append(user.getState()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"state\": \"").append(updateDTO.getState()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setState(updateDTO.getState());
        }
        if (updateDTO.getZipCode() != null && !updateDTO.getZipCode().equals(user.getZipCode())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"zipCode\": \"").append(user.getZipCode()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"zipCode\": \"").append(updateDTO.getZipCode()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setZipCode(updateDTO.getZipCode());
        }
        if (updateDTO.getEmergencyContactName() != null && !updateDTO.getEmergencyContactName().equals(user.getEmergencyContactName())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"emergencyContactName\": \"").append(user.getEmergencyContactName()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"emergencyContactName\": \"").append(updateDTO.getEmergencyContactName()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setEmergencyContactName(updateDTO.getEmergencyContactName());
        }
        if (updateDTO.getEmergencyContactPhone() != null && !updateDTO.getEmergencyContactPhone().equals(user.getEmergencyContactPhone())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"emergencyContactPhone\": \"").append(user.getEmergencyContactPhone()).append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"emergencyContactPhone\": \"").append(updateDTO.getEmergencyContactPhone()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setEmergencyContactPhone(updateDTO.getEmergencyContactPhone());
        }
        if (updateDTO.getHealthNotes() != null && !updateDTO.getHealthNotes().equals(user.getHealthNotes())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"healthNotes\": \"").append(user.getHealthNotes() != null ? user.getHealthNotes() : "").append("\"");
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"healthNotes\": \"").append(updateDTO.getHealthNotes()).append("\"");
            firstBefore = false;
            firstAfter = false;
            user.setHealthNotes(updateDTO.getHealthNotes());
        }
        if (updateDTO.getFitnessGoals() != null) {
            String newGoals = String.join(",", updateDTO.getFitnessGoals());
            if (!newGoals.equals(user.getFitnessGoals())) {
                if (!firstBefore) changes.append(", ");
                changes.append("\"fitnessGoals\": \"").append(user.getFitnessGoals() != null ? user.getFitnessGoals() : "").append("\"");
                if (!firstAfter) afterChanges.append(", ");
                afterChanges.append("\"fitnessGoals\": \"").append(newGoals).append("\"");
                firstBefore = false;
                firstAfter = false;
            }
            user.setFitnessGoals(newGoals);
        }
        if (updateDTO.getHeight() != null && !updateDTO.getHeight().equals(user.getHeight())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"height\": ").append(user.getHeight());
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"height\": ").append(updateDTO.getHeight());
            firstBefore = false;
            firstAfter = false;
            user.setHeight(updateDTO.getHeight());
        }
        if (updateDTO.getWeight() != null && !updateDTO.getWeight().equals(user.getWeight())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"weight\": ").append(user.getWeight());
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"weight\": ").append(updateDTO.getWeight());
            firstBefore = false;
            firstAfter = false;
            user.setWeight(updateDTO.getWeight());
        }
        if (updateDTO.getBodyFat() != null && !updateDTO.getBodyFat().equals(user.getBodyFat())) {
            if (!firstBefore) changes.append(", ");
            changes.append("\"bodyFat\": ").append(user.getBodyFat());
            if (!firstAfter) afterChanges.append(", ");
            afterChanges.append("\"bodyFat\": ").append(updateDTO.getBodyFat());
            firstBefore = false;
            firstAfter = false;
            user.setBodyFat(updateDTO.getBodyFat());
        }

        changes.append("}, ").append(afterChanges).append("}}");

        userRepository.save(user);
        
        // Log the profile update
        if (!firstBefore) { // Only log if there were actual changes
            try {
                auditLogService.logUpdate(
                    "MEMBER",                           // entity
                    user.getUserId().toString(),        // entityId
                    user.getFullName(),                 // entityName
                    user.getUserId(),                   // userId
                    null,                               // gymId - member profile updates are not gym specific
                    "Member profile updated",           // details
                    changes.toString(),                 // changes
                    null                                // ipAddress
                );
            } catch (Exception e) {
                System.err.println("Failed to log member profile update: " + e.getMessage());
            }
        }
        
        return getMemberProfile(userId);
    }

    private MemberProfileDTO.MemberStatsDTO calculateMemberStatsSafe(Long userId, User user) {
        String memberLevel = "Beginner";
        LocalDate joinedDate = user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : null;

        return MemberProfileDTO.MemberStatsDTO.builder()
                .totalWorkouts(0)
                .currentStreak(0)
                .memberLevel(memberLevel)
                .joinedDate(joinedDate)
                .build();
    }

    private MemberProfileDTO.MembershipInfoDTO getMembershipInfoSafe(Long userId) {
        try {
            return membershipRepository.findTopByUserUserIdAndStatusOrderByEndDateDesc(userId, MembershipStatus.ACTIVE)
                    .map(membership -> {
                        int daysRemaining = (int) ChronoUnit.DAYS.between(LocalDate.now(), membership.getEndDate());
                        return MemberProfileDTO.MembershipInfoDTO.builder()
                                .membershipId(membership.getId())
                                .planName(membership.getMembershipPackage() != null
                                        ? membership.getMembershipPackage().getPackageName()
                                        : "Unknown")
                                .planType(null)
                                .startDate(membership.getStartDate())
                                .endDate(membership.getEndDate())
                                .daysRemaining(Math.max(0, daysRemaining))
                                .status(membership.getStatus().name())
                                .build();
                    })
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private List<MemberProfileDTO.AchievementDTO> getAchievementsSafe(Long userId) {
        return Collections.emptyList();
    }

    private List<String> parseFitnessGoals(String fitnessGoals) {
        if (fitnessGoals == null || fitnessGoals.trim().isEmpty() || fitnessGoals.equals("[]")) {
            return Collections.emptyList();
        }
        
        String cleaned = fitnessGoals.trim();
        // Handle stringified JSON format if present
        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }
        
        if (cleaned.isEmpty()) {
            return Collections.emptyList();
        }

        return Arrays.stream(cleaned.split(","))
                .map(String::trim)
                .map(s -> s.replaceAll("^[\"']|[\"']$", "")) // Remove surrounding quotes
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
    }
}
