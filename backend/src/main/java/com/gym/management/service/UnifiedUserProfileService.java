package com.gym.management.service;

import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;

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
    
    /**
     * SINGLE POINT OF ENTRY for all user profile updates
     * Replaces both MemberProfileService.updateMemberProfile() and UserService.updateUser()
     */
    @Transactional
    @CacheEvict(value = {"userProfiles", "memberProfiles", "userCache"}, key = "#userId")
    public MemberProfileDTO updateUserProfile(Long userId, MemberProfileUpdateDTO updateDTO, String updatedBy) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Apply all updates in single transaction
        applyProfileUpdates(user, updateDTO);
        
        // Save with optimistic locking
        User updatedUser = userRepository.save(user);
        
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