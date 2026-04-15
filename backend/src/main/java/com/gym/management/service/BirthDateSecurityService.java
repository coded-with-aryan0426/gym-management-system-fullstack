package com.gym.management.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gym.management.repository.UserRepository;
import com.gym.management.model.User;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BirthDateSecurityService {

    private final UserRepository userRepository;

    /**
     * Check if current user can access another user's birth date information
     * Rules:
     * - Users can access their own data
     * - ADMIN/OWNER can access all
     * - Others: denied
     */
    @Transactional(readOnly = true)
    public boolean canAccessUserBirthData(Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return false;
        }

        // ✅ Self-access allowed
        if (currentUserId.equals(userId)) {
            return true;
        }

        // ✅ ADMIN/OWNER can access all
        return hasAdminRole(auth);
    }

    /**
     * Check if current user can update their own birth date or has admin privilege
     */
    @Transactional(readOnly = true)
    public boolean canUpdateUserBirthDate(Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return false;
        }

        // ✅ Users can update their own DOB
        if (currentUserId.equals(userId)) {
            return true;
        }

        // ✅ ADMIN/OWNER can update others (for correction/override purposes)
        return hasAdminRole(auth);
    }

    /**
     * Check if current user can submit parental consent (self or admin)
     */
    @Transactional(readOnly = true)
    public boolean canSubmitParentalConsent(Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return false;
        }

        // ✅ Users can submit consent for themselves
        if (currentUserId.equals(userId)) {
            return true;
        }

        // ✅ ADMIN/OWNER can submit on behalf
        return hasAdminRole(auth);
    }

    /**
     * Check if current user can view parental consent status
     */
    @Transactional(readOnly = true)
    public boolean canViewParentalConsentStatus(Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return false;
        }

        // ✅ Users can view their own consent status
        if (currentUserId.equals(userId)) {
            return true;
        }

        // ✅ ADMIN/OWNER can view all
        return hasAdminRole(auth);
    }

    /**
     * Check if current user can view membership eligibility
     */
    @Transactional(readOnly = true)
    public boolean canCheckMembershipEligibility(Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return false;
        }

        // ✅ Users can check their own eligibility
        if (currentUserId.equals(userId)) {
            return true;
        }

        // ✅ ADMIN/OWNER can check all
        return hasAdminRole(auth);
    }

    /**
     * Extract current user ID from authentication context (secure way, no header spoofing)
     */
    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }

        try {
            // Principal is username/email in Spring Security by default
            String username = auth.getName();
            if (username == null) {
                return null;
            }

            var userOptional = userRepository.findByUsername(username);
            if (userOptional.isPresent()) {
                return userOptional.get().getUserId();
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Check if user has admin or owner role
     */
    private boolean hasAdminRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                             a.getAuthority().equals("ROLE_OWNER"));
    }
}
