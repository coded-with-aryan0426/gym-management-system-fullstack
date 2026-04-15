package com.gym.management.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.gym.management.service.UserBirthDateService;
import com.gym.management.model.ParentalConsent;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users/{userId}/birth-date")
@Slf4j
public class UserBirthDateController {

    private final UserBirthDateService userBirthDateService;

    public UserBirthDateController(UserBirthDateService userBirthDateService) {
        this.userBirthDateService = userBirthDateService;
    }

    @GetMapping("/age-info")
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
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "DOB_NOT_SET"
            ));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateDateOfBirth(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "X-User-Id", required = false) Long performedBy,
            HttpServletRequest httpRequest) {

        if (!userBirthDateService.isBirthDateFeatureEnabled()) {
            return ResponseEntity.status(503).body(Map.of(
                "success", false,
                "error", "Feature not enabled",
                "code", "FEATURE_DISABLED"
            ));
        }

        try {
            LocalDate dateOfBirth = LocalDate.parse((String) request.get("dateOfBirth"));
            String changeReason = (String) request.getOrDefault("changeReason", "Profile update");

            UserBirthDateService.BirthDateUpdateResult result = userBirthDateService.updateDateOfBirth(
                    userId, dateOfBirth, changeReason,
                    httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"), performedBy);

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
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "USER_NOT_FOUND"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "VALIDATION_ERROR"
            ));
        }
    }

    @PostMapping("/admin-override")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<?> adminOverride(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "X-User-Id") Long adminUserId,
            HttpServletRequest httpRequest) {

        try {
            LocalDate dateOfBirth = LocalDate.parse((String) request.get("dateOfBirth"));
            String reason = (String) request.get("reason");

            UserBirthDateService.BirthDateUpdateResult result = userBirthDateService.adminOverrideDateOfBirth(
                    userId, dateOfBirth, reason, adminUserId, httpRequest.getRemoteAddr());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "dateOfBirth", result.getDateOfBirth(),
                "message", result.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "INVALID_REQUEST"
            ));
        }
    }

    @PostMapping("/parental-consent")
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

            return ResponseEntity.ok(Map.of(
                "success", true,
                "consentId", consent.getConsentId(),
                "status", consent.getConsentStatus(),
                "message", "Parental consent request submitted. Please check guardian email for verification."
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "CONSENT_NOT_REQUIRED"
            ));
        }
    }

    @GetMapping("/parental-consent/status")
    public ResponseEntity<?> getParentalConsentStatus(@PathVariable Long userId) {
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

    @GetMapping("/membership-eligibility/{membershipPackageId}")
    public ResponseEntity<?> checkMembershipEligibility(
            @PathVariable Long userId,
            @PathVariable Long membershipPackageId) {

        try {
            var eligibility = userBirthDateService.checkMembershipEligibility(userId, membershipPackageId);
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
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "code", "NOT_FOUND"
            ));
        }
    }
}
