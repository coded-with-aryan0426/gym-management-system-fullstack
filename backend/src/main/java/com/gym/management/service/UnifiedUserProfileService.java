package com.gym.management.service;

import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.event.ProfileUpdateEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

/**
 * UNIFIED USER PROFILE SERVICE
 * Single source of truth for all user profile updates
 * Ensures data consistency across all roles and interfaces
 */
@Service
@RequiredArgsConstructor
public class UnifiedUserProfileService {

    private final UserRepository userRepository;
    private final MemberProfileService memberProfileService;
    private final ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private MembershipRepository membershipRepository;

    /**
     * SINGLE POINT OF ENTRY for all user profile updates
     * Replaces both MemberProfileService.updateMemberProfile() and
     * UserService.updateUser()
     */
    @Transactional
    @CacheEvict(value = { "userProfiles", "memberProfiles", "userCache" }, key = "#userId")
    public MemberProfileDTO updateUserProfile(Long userId, MemberProfileUpdateDTO updateDTO, String updatedBy) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Capture old values for audit log
        List<String> changes = new ArrayList<>();
        if (updateDTO.getFullName() != null && !updateDTO.getFullName().equals(user.getFullName())) {
            changes.add(String.format("Name: '%s' → '%s'", user.getFullName(), updateDTO.getFullName()));
        }
        if (updateDTO.getPhone() != null && !updateDTO.getPhone().equals(user.getPhone())) {
            changes.add(String.format("Phone: '%s' → '%s'", user.getPhone(), updateDTO.getPhone()));
        }
        if (updateDTO.getAvatarId() != null && !updateDTO.getAvatarId().equals(user.getAvatarId())) {
            changes.add("Avatar updated");
        }
        if (updateDTO.getDateOfBirth() != null && !updateDTO.getDateOfBirth().equals(user.getDateOfBirth())) {
            changes.add(String.format("Date of Birth: '%s' → '%s'", user.getDateOfBirth(), updateDTO.getDateOfBirth()));
        }
        if (updateDTO.getGender() != null && !updateDTO.getGender().equals(user.getGender())) {
            changes.add(String.format("Gender: '%s' → '%s'", user.getGender(), updateDTO.getGender()));
        }
        if (updateDTO.getAddress() != null && !updateDTO.getAddress().equals(user.getAddress())) {
            changes.add("Address updated");
        }
        if (updateDTO.getEmergencyContactName() != null && !updateDTO.getEmergencyContactName().equals(user.getEmergencyContactName())) {
            changes.add(String.format("Emergency Contact: '%s' → '%s'", user.getEmergencyContactName(), updateDTO.getEmergencyContactName()));
        }
        if (updateDTO.getFitnessGoals() != null) {
            changes.add("Fitness goals updated");
        }
        if (updateDTO.getHeight() != null && !updateDTO.getHeight().equals(user.getHeight())) {
            changes.add(String.format("Height: %s → %s", user.getHeight(), updateDTO.getHeight()));
        }
        if (updateDTO.getWeight() != null && !updateDTO.getWeight().equals(user.getWeight())) {
            changes.add(String.format("Weight: %s → %s", user.getWeight(), updateDTO.getWeight()));
        }

        // Apply all updates in single transaction
        applyProfileUpdates(user, updateDTO);

        // Save with optimistic locking
        userRepository.save(user);

        // Log the profile update to audit log
        if (!changes.isEmpty()) {
            // Determine gym ID from context or default
            Long gymId = null;
            try {
                // Get gym ID from the first membership if available
                var memberships = membershipRepository.findByUserUserId(userId);
                if (memberships != null && !memberships.isEmpty()) {
                    gymId = memberships.get(0).getGym() != null ? memberships.get(0).getGym().getGymId() : null;
                }
            } catch (Exception e) {
                // Use null, audit service will handle it
            }
            
            String changesJson = String.join("; ", changes);
            auditLogService.logUpdate(
                "Profile",
                userId.toString(),
                user.getFullName(),
                userId,
                gymId,
                "Profile updated by " + (updatedBy != null ? updatedBy : "user"),
                changesJson,
                null
            );
        }

        // Publish update event for cache invalidation
        publishProfileUpdateEvent(userId, updatedBy);

        // Return unified response
        return memberProfileService.getMemberProfile(userId);
    }

    /**
     * Get user profile with caching
     */
    @Cacheable(value = "userProfiles", key = "#userId")
    public MemberProfileDTO getUserProfile(Long userId) {
        return memberProfileService.getMemberProfile(userId);
    }

    /**
     * Apply updates to user entity
     */
    private void applyProfileUpdates(User user, MemberProfileUpdateDTO updateDTO) {
        if (updateDTO.getFullName() != null) {
            user.setFullName(updateDTO.getFullName());
        }
        if (updateDTO.getPhone() != null) {
            user.setPhone(updateDTO.getPhone());
        }
        if (updateDTO.getAvatarId() != null) {
            user.setAvatarId(updateDTO.getAvatarId());
        }
        if (updateDTO.getDateOfBirth() != null) {
            user.setDateOfBirth(updateDTO.getDateOfBirth());
        }
        if (updateDTO.getGender() != null) {
            user.setGender(updateDTO.getGender());
        }
        if (updateDTO.getBloodType() != null) {
            user.setBloodType(updateDTO.getBloodType());
        }
        if (updateDTO.getAddress() != null) {
            user.setAddress(updateDTO.getAddress());
        }
        if (updateDTO.getCity() != null) {
            user.setCity(updateDTO.getCity());
        }
        if (updateDTO.getState() != null) {
            user.setState(updateDTO.getState());
        }
        if (updateDTO.getZipCode() != null) {
            user.setZipCode(updateDTO.getZipCode());
        }
        if (updateDTO.getEmergencyContactName() != null) {
            user.setEmergencyContactName(updateDTO.getEmergencyContactName());
        }
        if (updateDTO.getEmergencyContactPhone() != null) {
            user.setEmergencyContactPhone(updateDTO.getEmergencyContactPhone());
        }
        if (updateDTO.getHealthNotes() != null) {
            user.setHealthNotes(updateDTO.getHealthNotes());
        }
        if (updateDTO.getFitnessGoals() != null) {
            user.setFitnessGoals(String.join(",", updateDTO.getFitnessGoals()));
        }
        if (updateDTO.getHeight() != null) {
            user.setHeight(updateDTO.getHeight());
        }
        if (updateDTO.getWeight() != null) {
            user.setWeight(updateDTO.getWeight());
        }
        if (updateDTO.getBodyFat() != null) {
            user.setBodyFat(updateDTO.getBodyFat());
        }
    }

    /**
     * Publish profile update event for cache invalidation
     */
    private void publishProfileUpdateEvent(Long userId, String updatedBy) {
        ProfileUpdateEvent event = new ProfileUpdateEvent(this, userId, updatedBy);
        eventPublisher.publishEvent(event);
    }
}