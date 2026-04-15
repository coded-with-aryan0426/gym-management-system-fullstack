package com.gym.management.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gym.management.model.User;
import com.gym.management.model.MembershipPackage;
import com.gym.management.model.ParentalConsent;
import com.gym.management.model.BirthDateAuditLog;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.MembershipPackageRepository;
import com.gym.management.repository.ParentalConsentRepository;
import com.gym.management.repository.BirthDateAuditLogRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class UserBirthDateService {

    private final UserRepository userRepository;
    private final MembershipPackageRepository membershipPackageRepository;
    private final ParentalConsentRepository parentalConsentRepository;
    private final BirthDateAuditLogRepository birthDateAuditLogRepository;
    private final AgeCalculationService ageCalculationService;
    private final FeatureFlagService featureFlagService;
    private final EmailService emailService;

    public UserBirthDateService(
            UserRepository userRepository,
            MembershipPackageRepository membershipPackageRepository,
            ParentalConsentRepository parentalConsentRepository,
            BirthDateAuditLogRepository birthDateAuditLogRepository,
            AgeCalculationService ageCalculationService,
            FeatureFlagService featureFlagService,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.membershipPackageRepository = membershipPackageRepository;
        this.parentalConsentRepository = parentalConsentRepository;
        this.birthDateAuditLogRepository = birthDateAuditLogRepository;
        this.ageCalculationService = ageCalculationService;
        this.featureFlagService = featureFlagService;
        this.emailService = emailService;
    }

    public boolean isBirthDateFeatureEnabled() {
        return featureFlagService.isEnabled("BIRTH_DATE_ENABLED");
    }

    public Optional<LocalDate> getUserDateOfBirth(Long userId) {
        return userRepository.findById(userId).map(User::getDateOfBirth);
    }

    public AgeInfo getAgeInfo(Long userId) {
        LocalDate dob = getUserDateOfBirth(userId)
                .orElseThrow(() -> new RuntimeException("Birth date not available for this user"));
        AgeCalculationService.AgeResult result = ageCalculationService.calculateAge(dob);
        return new AgeInfo(userId, result.getYears(), result.getAgeGroup(),
                result.isBirthdayToday(), result.getNextBirthday(), result.isLeapYearBirthday());
    }

    @Transactional
    public BirthDateUpdateResult updateDateOfBirth(Long userId, LocalDate newDateOfBirth,
            String changeReason, String ipAddress, String userAgent, Long performedBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate oldDateOfBirth = user.getDateOfBirth();
        user.setDateOfBirth(newDateOfBirth);
        user.setBirthDateVerified(false);
        userRepository.save(user);

        BirthDateAuditLog auditLog = new BirthDateAuditLog();
        auditLog.setUserId(userId);
        auditLog.setOldDateOfBirth(oldDateOfBirth);
        auditLog.setNewDateOfBirth(newDateOfBirth);
        auditLog.setChangedBy(performedBy);
        auditLog.setChangeReason(changeReason);
        auditLog.setVerificationStatus("PENDING");
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        birthDateAuditLogRepository.save(auditLog);

        boolean requiresConsent = ageCalculationService.requiresParentalConsent(newDateOfBirth, 18);
        AgeCalculationService.AgeResult ageResult = ageCalculationService.calculateAge(newDateOfBirth);

        List<String> warnings = new ArrayList<>();
        if (ageResult.getYears() < 18) {
            warnings.add("Parental consent required");
        }

        return BirthDateUpdateResult.builder()
                .success(true)
                .dateOfBirth(newDateOfBirth)
                .age(ageResult.getYears())
                .ageGroup(ageResult.getAgeGroup())
                .requiresConsent(requiresConsent)
                .warnings(warnings)
                .build();
    }

    @Transactional
    public BirthDateUpdateResult adminOverrideDateOfBirth(Long userId, LocalDate newDateOfBirth,
            String reason, Long adminUserId, String ipAddress) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Admin override requires a reason");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate oldDateOfBirth = user.getDateOfBirth();
        user.setDateOfBirth(newDateOfBirth);
        user.setBirthDateVerified(true);
        user.setBirthDateVerifiedAt(LocalDateTime.now());
        user.setBirthDateVerifiedBy(adminUserId);
        userRepository.save(user);

        BirthDateAuditLog auditLog = new BirthDateAuditLog();
        auditLog.setUserId(userId);
        auditLog.setOldDateOfBirth(oldDateOfBirth);
        auditLog.setNewDateOfBirth(newDateOfBirth);
        auditLog.setChangedBy(adminUserId);
        auditLog.setChangeReason("ADMIN_OVERRIDE: " + reason);
        auditLog.setVerificationStatus("ADMIN_VERIFIED");
        auditLog.setIpAddress(ipAddress);
        birthDateAuditLogRepository.save(auditLog);
        log.info("Admin {} overrode DOB for user {} from {} to {}", adminUserId, userId, oldDateOfBirth, newDateOfBirth);

        return BirthDateUpdateResult.builder()
                .success(true)
                .dateOfBirth(newDateOfBirth)
                .message("Date of birth updated and verified by admin")
                .build();
    }

    @Transactional
    public ParentalConsent submitParentalConsent(Long userId, ParentalConsentRequest request, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate dob = user.getDateOfBirth();
        if (dob == null || !ageCalculationService.requiresParentalConsent(dob, 18)) {
            throw new IllegalStateException("Parental consent is not required for this user");
        }
        ParentalConsent consent = new ParentalConsent();
        consent.setUserId(userId);
        consent.setGuardianName(request.getGuardianName());
        consent.setGuardianEmail(request.getGuardianEmail());
        consent.setGuardianPhone(request.getGuardianPhone());
        consent.setGuardianRelation(request.getGuardianRelation());
        consent.setGuardianIdDocumentId(request.getGuardianIdDocumentId());
        consent.setConsentStatus("PENDING");
        consent.setIpAddress(ipAddress);
        consent.setExpiresAt(LocalDateTime.now().plusYears(1));
        consent = parentalConsentRepository.save(consent);
        try {
            emailService.sendParentalConsentVerification(consent);
        } catch (Exception e) {
            log.warn("Failed to send parental consent verification email: {}", e.getMessage());
        }
        return consent;
    }

    @Transactional
    public void verifyParentalConsent(String token) {
        ParentalConsent consent = parentalConsentRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
        if (consent.isExpired()) {
            throw new IllegalStateException("Consent request has expired");
        }
        consent.setConsentStatus("APPROVED");
        consent.setConsentGivenAt(LocalDateTime.now());
        parentalConsentRepository.save(consent);
        log.info("Parental consent verified for user {}", consent.getUserId());
    }

    public Optional<ParentalConsent> getValidParentalConsent(Long userId) {
        return parentalConsentRepository.findValidConsentByUserId(userId);
    }

    public AgeCalculationService.EligibilityResult checkMembershipEligibility(Long userId, Long membershipPackageId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MembershipPackage membershipPackage = membershipPackageRepository.findById(membershipPackageId)
                .orElseThrow(() -> new RuntimeException("Membership package not found"));
        if (user.getDateOfBirth() == null) {
            return AgeCalculationService.EligibilityResult.builder()
                    .eligible(false).age(null).errors(List.of("Date of birth is required"))
                    .warnings(List.of()).requiresConsent(false).build();
        }
        return ageCalculationService.getMembershipEligibility(user.getDateOfBirth(), membershipPackage);
    }

    public static class AgeInfo {
        private Long userId;
        private int age;
        private String ageGroup;
        private boolean isBirthdayToday;
        private LocalDate nextBirthday;
        private boolean isLeapYearBirthday;

        public AgeInfo(Long userId, int age, String ageGroup, boolean isBirthdayToday,
                LocalDate nextBirthday, boolean isLeapYearBirthday) {
            this.userId = userId;
            this.age = age;
            this.ageGroup = ageGroup;
            this.isBirthdayToday = isBirthdayToday;
            this.nextBirthday = nextBirthday;
            this.isLeapYearBirthday = isLeapYearBirthday;
        }

        public Long getUserId() { return userId; }
        public int getAge() { return age; }
        public String getAgeGroup() { return ageGroup; }
        public boolean isBirthdayToday() { return isBirthdayToday; }
        public LocalDate getNextBirthday() { return nextBirthday; }
        public boolean isLeapYearBirthday() { return isLeapYearBirthday; }
    }

    @lombok.Data @lombok.Builder
    public static class BirthDateUpdateResult {
        private boolean success;
        private LocalDate dateOfBirth;
        private Integer age;
        private String ageGroup;
        private boolean requiresConsent;
        private List<String> warnings;
        private String message;
    }

    @lombok.Data
    public static class ParentalConsentRequest {
        private String guardianName;
        private String guardianEmail;
        private String guardianPhone;
        private String guardianRelation;
        private Long guardianIdDocumentId;
    }
}
