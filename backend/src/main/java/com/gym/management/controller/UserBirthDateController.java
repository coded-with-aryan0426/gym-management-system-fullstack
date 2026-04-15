package com.gym.management.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.gym.management.service.UserBirthDateService;
import com.gym.management.service.BirthDateSecurityService;
import com.gym.management.model.ParentalConsent;
import com.gym.management.dto.BirthDateUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users/{userId}/birth-date")
@Slf4j
public class UserBirthDateController {

    private final UserBirthDateService userBirthDateService;
    private final BirthDateSecurityService birthDateSecurityService;

    public UserBirthDateController(UserBirthDateService userBirthDateService,
                                   BirthDateSecurityService birthDateSecurityService) {
        this.userBirthDateService = userBirthDateService;
        this.birthDateSecurityService = birthDateSecurityService;
    }

    /**
     * Get age information for a user
     * ✅ SECURED: User can only access own data or admin can access any
     */
    @GetMapping("/age-info")
    @PreAuthorize("@birthDateSecurityService.canAccessUserBirthData(#userId)")
    public ResponseEntity<?> getAgeInfo(@PathVariable Long userId) {
        if (!userBirthDateService.isBirthDateFeatureEnabled()) {
            return ResponseEntity.status(503).body(Map.of(
                "success", false,
                "error", "Feature not enabled",
                "code", "FEATURE_DISABLED"
            ));
        }
        try {
            UserBirthDateService.AgeInfo ageInfo = userBirthDateService.getAgeInfo(userId);
            log.info("User {} accessed age info for user {}", getCurrentUserId(), userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "userId", ageInfo.getUserId(),
                    "age", ageInfo.getAge(),
                    "ageGroup", ageInfo.getAgeGroup(),
                    "isBirthdayToday", ageInfo.isBirthdayToday(),
                    "nextBirthday", ageInfo.getNextBirthday(),
                    "isLeapYearBirthday", ageInfo.isLeapYearBirthday()
                )
            ));
        } catch (RuntimeException e) {
            log.error("Error getting age info for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "DOB_NOT_SET"
            ));
        }
    }

    /**
     * Update user's date of birth
     * ✅ SECURED: User can only update own data or admin can update any
     * ✅ VALIDATED: Input validation on date range
     */
    @PutMapping
    @PreAuthorize("@birthDateSecurityService.canUpdateUserBirthDate(#userId)")
    public ResponseEntity<?> updateDateOfBirth(
            @PathVariable Long userId,
            @Valid @RequestBody BirthDateUpdateRequest request,
            HttpServletRequest httpRequest) {

        if (!userBirthDateService.isBirthDateFeatureEnabled()) {
            return ResponseEntity.status(503).body(Map.of(
                "success", false,
                "error", "Feature not enabled",
                "code", "FEATURE_DISABLED"
            ));
        }

        // ✅ Validate date range
        if (!request.isValidDateRange()) {
            log.warn("Invalid date range attempted for user {}", userId);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Birth date must be between 1900 and today",
                "code", "VALIDATION_ERROR"
            ));
        }

        try {
            Long currentUserId = getCurrentUserId();
            String changeReason = request.getChangeReason() != null ? 
                request.getChangeReason() : "Profile update";

            UserBirthDateService.BirthDateUpdateResult result = 
                userBirthDateService.updateDateOfBirth(
                    userId, 
                    request.getDateOfBirth(), 
                    changeReason,
                    httpRequest.getRemoteAddr(), 
                    httpRequest.getHeader("User-Agent"), 
                    currentUserId);

            log.info("User {} updated birth date for user {}", currentUserId, userId);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("dateOfBirth", result.getDateOfBirth());
            responseData.put("age", result.getAge());
            responseData.put("ageGroup", result.getAgeGroup());
            responseData.put("requiresConsent", result.isRequiresConsent());
            if (result.getWarnings() != null && !result.getWarnings().isEmpty()) {
                responseData.put("warnings", result.getWarnings());
            }

            return ResponseEntity.ok(responseData);
        } catch (RuntimeException e) {
            log.error("Error updating birth date for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "USER_NOT_FOUND"
            ));
        }
    }

    /**
     * Admin override for date of birth
     * ✅ SECURED: Only ADMIN/OWNER role allowed
     */
    @PostMapping("/admin-override")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<?> adminOverride(
            @PathVariable Long userId,
            @Valid @RequestBody BirthDateUpdateRequest request,
            HttpServletRequest httpRequest) {

        try {
            Long adminUserId = getCurrentUserId();
            if (adminUserId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Not authenticated",
                    "code", "UNAUTHORIZED"
                ));
            }

            // ✅ Validate date range
            if (!request.isValidDateRange()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Birth date must be between 1900 and today",
                    "code", "VALIDATION_ERROR"
                ));
            }

            UserBirthDateService.BirthDateUpdateResult result = 
                userBirthDateService.adminOverrideDateOfBirth(
                    userId, 
                    request.getDateOfBirth(), 
                    request.getChangeReason() != null ? request.getChangeReason() : "Admin override",
                    adminUserId, 
                    httpRequest.getRemoteAddr());

            log.info("Admin {} overrode birth date for user {}", adminUserId, userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "dateOfBirth", result.getDateOfBirth(),
                "message", result.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            log.error("Invalid admin override request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "INVALID_REQUEST"
            ));
        }
    }

    /**
     * Submit parental consent for minor
     * ✅ SECURED: User can submit for self or admin can submit for others
     */
    @PostMapping("/parental-consent")
    @PreAuthorize("@birthDateSecurityService.canSubmitParentalConsent(#userId)")
    public ResponseEntity<?> submitParentalConsent(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {

        try {
            UserBirthDateService.ParentalConsentRequest consentRequest =
                    new UserBirthDateService.ParentalConsentRequest();
            consentRequest.setGuardianName((String) request.get("guardianName"));
            consentRequest.setGuardianEmail((String) request.get("guardianEmail"));
            consentRequest.setGuardianPhone((String) request.get("guardianPhone"));
            consentRequest.setGuardianRelation((String) request.get("guardianRelation"));

            ParentalConsent consent = userBirthDateService.submitParentalConsent(
                    userId, consentRequest, httpRequest.getRemoteAddr());

            log.info("Parental consent submitted for user {}", userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "consentId", consent.getConsentId(),
                "status", consent.getConsentStatus(),
                "message", "Parental consent request submitted. Please check guardian email for verification."
            ));
        } catch (IllegalStateException e) {
            log.error("Parental consent error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "CONSENT_NOT_REQUIRED"
            ));
        }
    }

    /**
     * Get parental consent status
     * ✅ SECURED: User can view own status or admin can view any
     */
    @GetMapping("/parental-consent/status")
    @PreAuthorize("@birthDateSecurityService.canViewParentalConsentStatus(#userId)")
    public ResponseEntity<?> getParentalConsentStatus(@PathVariable Long userId) {
        log.info("User {} checking parental consent status for user {}", getCurrentUserId(), userId);
        return userBirthDateService.getValidParentalConsent(userId)
                .map(consent -> ResponseEntity.ok(Map.of(
                    "hasValidConsent", consent.isValid(),
                    "status", consent.getConsentStatus(),
                    "expiresAt", consent.getExpiresAt()
                )))
                .orElse(ResponseEntity.ok(Map.of(
                    "hasValidConsent", false,
                    "status", "NONE",
                    "expiresAt", null
                )));
    }

    /**
     * Check membership eligibility based on age
     * ✅ SECURED: User can check own eligibility or admin can check any
     */
    @GetMapping("/membership-eligibility/{membershipPackageId}")
    @PreAuthorize("@birthDateSecurityService.canCheckMembershipEligibility(#userId)")
    public ResponseEntity<?> checkMembershipEligibility(
            @PathVariable Long userId,
            @PathVariable Long membershipPackageId) {

        try {
            var eligibility = userBirthDateService.checkMembershipEligibility(userId, membershipPackageId);
            log.info("User {} checked membership eligibility for user {}", getCurrentUserId(), userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "eligible", eligibility.isEligible(),
                    "age", eligibility.getAge(),
                    "errors", eligibility.getErrors(),
                    "warnings", eligibility.getWarnings(),
                    "requiresConsent", eligibility.isRequiresConsent()
                )
            ));
        } catch (RuntimeException e) {
            log.error("Error checking membership eligibility: {}", e.getMessage());
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "NOT_FOUND"
            ));
        }
    }

    /**
     * Safely get current user ID from authentication context
     * ✅ SECURE: Extracts from SecurityContext, not from header
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        
        try {
            String username = auth.getName();
            return username != null ? Long.parseLong(username) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
