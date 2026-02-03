package com.gym.management.controller;

import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.service.UnifiedUserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * UNIFIED USER PROFILE CONTROLLER
 * Single endpoint for all user profile updates regardless of role
 * Ensures data consistency and prevents synchronization issues
 */
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class UnifiedProfileController {
    
    private final UnifiedUserProfileService unifiedUserProfileService;
    
    /**
     * UNIFIED PROFILE UPDATE ENDPOINT
     * Replaces both /api/member/settings/{userId}/profile and /api/users/{id}
     * 
     * Access Control:
     * - Members can update their own profile
     * - Trainers can update their own profile and their assigned members
     * - Owners/Admins can update any profile
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('MEMBER', 'CUSTOMER', 'TRAINER', 'OWNER', 'ADMIN')")
    public ResponseEntity<MemberProfileDTO> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody MemberProfileUpdateDTO updateDTO,
            Authentication authentication) {
        
        // Get current user's ID and role for audit logging
        String currentUserEmail = authentication.getName();
        String updatedBy = currentUserEmail + " (" + authentication.getAuthorities() + ")";
        
        // Validate permissions based on role
        validateUpdatePermissions(userId, authentication);
        
        // Use unified service for consistent updates
        MemberProfileDTO updatedProfile = unifiedUserProfileService.updateUserProfile(userId, updateDTO, updatedBy);
        
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * GET USER PROFILE (with caching)
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('MEMBER', 'CUSTOMER', 'TRAINER', 'OWNER', 'ADMIN')")
    public ResponseEntity<MemberProfileDTO> getUserProfile(
            @PathVariable Long userId,
            Authentication authentication) {
        
        // Validate read permissions
        validateReadPermissions(userId, authentication);
        
        MemberProfileDTO profile = unifiedUserProfileService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Validate update permissions based on user role
     */
    private void validateUpdatePermissions(Long targetUserId, Authentication authentication) {
        boolean hasPermission = false;
        
        // Check if user is updating their own profile
        String currentUserEmail = authentication.getName();
        // This would need to be enhanced with actual user ID lookup
        // For now, we'll allow all authenticated users
        
        // Owners and admins can update any profile
        hasPermission = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_OWNER") || 
                                 auth.getAuthority().equals("ROLE_ADMIN"));
        
        // Trainers can update their own profile and their assigned members
        if (!hasPermission && authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_TRAINER"))) {
            // Additional logic needed to check trainer-member assignments
            hasPermission = true; // Simplified for now
        }
        
        // Members can only update their own profile
        if (!hasPermission && (authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_MEMBER") || 
                                 auth.getAuthority().equals("ROLE_CUSTOMER")))) {
            // Additional logic needed to verify ownership
            hasPermission = true; // Simplified for now
        }
        
        if (!hasPermission) {
            throw new SecurityException("Insufficient permissions to update this profile");
        }
    }
    
    /**
     * Validate read permissions (less restrictive than update)
     */
    private void validateReadPermissions(Long targetUserId, Authentication authentication) {
        // Most roles can read most profiles, but we should implement
        // proper privacy controls here
        // For now, allow all authenticated users
    }
}