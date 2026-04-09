package com.gym.subscription.service;

import com.gym.subscription.dto.LicenseDTO;
import com.gym.subscription.dto.LicenseValidationRequest;
import com.gym.subscription.dto.LicenseValidationResponse;
import com.gym.subscription.entity.*;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.exception.LicenseException;
import com.gym.subscription.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LicenseService {

    private final LicenseKeyRepository licenseKeyRepository;
    private final LicenseActivationRepository activationRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserRepository userRepository;

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String LICENSE_SECRET_KEY = System.getenv("LICENSE_SECRET_KEY") != null
            ? System.getenv("LICENSE_SECRET_KEY")
            : "default-dev-secret-key-change-in-production-123456";

    @Transactional
    public LicenseKey generateLicenseKey(User user, UserSubscription subscription, SubscriptionPlan plan) {
        String rawKey = generateRawLicenseKey(user.getId(), plan.getId());
        String signature = generateSignature(rawKey);
        String licenseKey = formatLicenseKey(rawKey, signature);

        LicenseKey license = LicenseKey.builder()
                .user(user)
                .subscription(subscription)
                .licenseKey(licenseKey)
                .planName(plan.getName())
                .planTier(plan.getTierLevel())
                .maxDevices(plan.getMaxDevices())
                .activatedDevices(new ArrayList<>())
                .expiresAt(subscription.getCurrentPeriodEnd())
                .isRevoked(false)
                .isTransferable(true)
                .build();

        return licenseKeyRepository.save(license);
    }

    private String generateRawLicenseKey(String userId, String planId) {
        long timestamp = System.currentTimeMillis();
        SecureRandom random = new SecureRandom();
        byte[] randomBytes = new byte[8];
        random.nextBytes(randomBytes);

        StringBuilder sb = new StringBuilder();
        sb.append(userId.substring(0, Math.min(8, userId.length())));
        sb.append("-");
        sb.append(planId.substring(0, Math.min(4, planId.length())));
        sb.append("-");
        sb.append(String.format("%d", timestamp));
        sb.append("-");
        sb.append(bytesToHex(randomBytes).substring(0, 8).toUpperCase());

        return sb.toString();
    }

    private String generateSignature(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(LICENSE_SECRET_KEY.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hmacBytes).substring(0, 16).toUpperCase();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error generating signature: {}", e.getMessage());
            throw new LicenseException("Failed to generate license signature");
        }
    }

    private String formatLicenseKey(String rawKey, String signature) {
        String combined = rawKey + "-" + signature;
        return combined.toUpperCase();
    }

    public boolean validateSignature(String licenseKey) {
        try {
            String[] parts = licenseKey.split("-");
            if (parts.length != 5) return false;

            String rawKey = String.join("-",
                parts[0], parts[1], parts[2], parts[3]);
            String providedSignature = parts[4];

            String expectedSignature = generateSignature(rawKey);
            return providedSignature.equalsIgnoreCase(expectedSignature);
        } catch (Exception e) {
            log.error("Error validating signature: {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    public LicenseValidationResponse validateLicense(LicenseValidationRequest request) {
        LicenseKey license = licenseKeyRepository.findByLicenseKey(request.getLicenseKey())
                .orElse(null);

        if (license == null) {
            return LicenseValidationResponse.builder()
                    .valid(false)
                    .message("License key not found")
                    .build();
        }

        if (!validateSignature(request.getLicenseKey())) {
            return LicenseValidationResponse.builder()
                    .valid(false)
                    .message("Invalid license key signature")
                    .build();
        }

        if (license.getIsRevoked()) {
            return LicenseValidationResponse.builder()
                    .valid(false)
                    .message("License has been revoked")
                    .build();
        }

        if (license.getExpiresAt() != null && LocalDateTime.now().isAfter(license.getExpiresAt())) {
            return LicenseValidationResponse.builder()
                    .valid(false)
                    .message("License has expired")
                    .expiresAt(license.getExpiresAt())
                    .build();
        }

        if (license.getSubscription() != null) {
            UserSubscription sub = license.getSubscription();
            if (sub.getStatus() == SubscriptionStatus.EXPIRED ||
                sub.getStatus() == SubscriptionStatus.CANCELLED) {
                return LicenseValidationResponse.builder()
                        .valid(false)
                        .message("Subscription is no longer active")
                        .build();
            }

            if (sub.isInGracePeriod()) {
                license.setLastValidatedAt(LocalDateTime.now());
                licenseKeyRepository.save(license);
                return buildValidationResponse(license, true, "License valid (grace period)");
            }
        }

        license.setLastValidatedAt(LocalDateTime.now());
        licenseKeyRepository.save(license);

        return buildValidationResponse(license, true, "License is valid");
    }

    @Transactional
    public LicenseValidationResponse activateDevice(LicenseValidationRequest request) {
        LicenseValidationResponse validation = validateLicense(request);

        if (!validation.getValid()) {
            return validation;
        }

        LicenseKey license = licenseKeyRepository.findByLicenseKey(request.getLicenseKey())
                .orElseThrow(() -> new LicenseException("License not found"));

        if (!license.canActivateDevice()) {
            return LicenseValidationResponse.builder()
                    .valid(false)
                    .message("Maximum device activations reached for this license")
                    .remainingActivations(0)
                    .build();
        }

        Optional<LicenseActivation> existingActivation =
                activationRepository.findByLicenseIdAndDeviceFingerprint(
                        license.getId(), request.getDeviceFingerprint());

        if (existingActivation.isPresent()) {
            LicenseActivation activation = existingActivation.get();
            activation.setIsActive(true);
            activation.setLastSeenAt(LocalDateTime.now());
            activation.setIpAddress(request.getIpAddress());
            activationRepository.save(activation);
        } else {
            LicenseActivation activation = LicenseActivation.builder()
                    .license(license)
                    .deviceId(request.getDeviceId())
                    .deviceName(request.getDeviceName())
                    .deviceFingerprint(request.getDeviceFingerprint())
                    .ipAddress(request.getIpAddress())
                    .activatedAt(LocalDateTime.now())
                    .lastSeenAt(LocalDateTime.now())
                    .isActive(true)
                    .build();
            activationRepository.save(activation);

            List<LicenseKey.ActivatedDevice> devices = new ArrayList<>(license.getActivatedDevices());
            devices.add(LicenseKey.ActivatedDevice.builder()
                    .deviceId(request.getDeviceId())
                    .deviceName(request.getDeviceName())
                    .fingerprint(request.getDeviceFingerprint())
                    .activatedAt(LocalDateTime.now())
                    .lastSeenAt(LocalDateTime.now())
                    .ipAddress(request.getIpAddress())
                    .build());
            license.setActivatedDevices(devices);
            licenseKeyRepository.save(license);
        }

        return buildValidationResponse(license, true, "Device activated successfully");
    }

    @Transactional
    public LicenseValidationResponse deactivateDevice(String licenseKey, String deviceFingerprint) {
        LicenseKey license = licenseKeyRepository.findByLicenseKey(licenseKey)
                .orElseThrow(() -> new LicenseException("License not found"));

        Optional<LicenseActivation> activation =
                activationRepository.findByLicenseIdAndDeviceFingerprint(
                        license.getId(), deviceFingerprint);

        if (activation.isEmpty()) {
            return LicenseValidationResponse.builder()
                    .valid(false)
                    .message("Device not found on this license")
                    .build();
        }

        activation.get().setIsActive(false);
        activationRepository.save(activation.get());

        List<LicenseKey.ActivatedDevice> devices = license.getActivatedDevices().stream()
                .filter(d -> !d.getFingerprint().equals(deviceFingerprint))
                .toList();
        license.setActivatedDevices(devices);
        licenseKeyRepository.save(license);

        return LicenseValidationResponse.builder()
                .valid(true)
                .message("Device deactivated successfully")
                .remainingActivations(license.getRemainingActivations())
                .build();
    }

    @Transactional
    public LicenseKey revokeLicense(String licenseKey, String reason) {
        LicenseKey license = licenseKeyRepository.findByLicenseKey(licenseKey)
                .orElseThrow(() -> new LicenseException("License not found"));

        license.setIsRevoked(true);
        license.setRevokedAt(LocalDateTime.now());
        license.setRevokeReason(reason);

        List<LicenseActivation> activations = activationRepository.findByLicenseIdAndIsActiveTrue(license.getId());
        activations.forEach(a -> a.setIsActive(false));
        activationRepository.saveAll(activations);

        return licenseKeyRepository.save(license);
    }

    public LicenseDTO getLicenseInfo(String userId) {
        List<LicenseKey> licenses = licenseKeyRepository.findActiveByUserId(userId);
        if (licenses.isEmpty()) {
            return null;
        }

        LicenseKey license = licenses.get(0);
        List<LicenseActivation> activations = activationRepository.findActiveByUserId(userId);

        List<LicenseDTO.DeviceInfo> deviceInfos = activations.stream()
                .map(a -> LicenseDTO.DeviceInfo.builder()
                        .deviceId(a.getDeviceId())
                        .deviceName(a.getDeviceName())
                        .fingerprint(a.getDeviceFingerprint())
                        .activatedAt(a.getActivatedAt())
                        .lastSeenAt(a.getLastSeenAt())
                        .ipAddress(a.getIpAddress())
                        .build())
                .toList();

        return LicenseDTO.builder()
                .id(license.getId())
                .userId(license.getUser().getId())
                .subscriptionId(license.getSubscription() != null ? license.getSubscription().getId() : null)
                .licenseKey(license.getLicenseKey())
                .planName(license.getPlanName())
                .planTier(license.getPlanTier())
                .maxDevices(license.getMaxDevices())
                .activatedDeviceCount(activations.size())
                .activatedDevices(deviceInfos)
                .expiresAt(license.getExpiresAt())
                .isValid(license.isValid())
                .isRevoked(license.getIsRevoked())
                .isTransferable(license.getIsTransferable())
                .lastValidatedAt(license.getLastValidatedAt())
                .createdAt(license.getCreatedAt())
                .build();
    }

    public List<LicenseDTO.DeviceInfo> getActivatedDevices(String userId) {
        List<LicenseActivation> activations = activationRepository.findActiveByUserId(userId);
        return activations.stream()
                .map(a -> LicenseDTO.DeviceInfo.builder()
                        .deviceId(a.getDeviceId())
                        .deviceName(a.getDeviceName())
                        .fingerprint(a.getDeviceFingerprint())
                        .activatedAt(a.getActivatedAt())
                        .lastSeenAt(a.getLastSeenAt())
                        .ipAddress(a.getIpAddress())
                        .build())
                .toList();
    }

    @Transactional
    public LicenseKey transferLicense(String licenseKey, String targetUserId) {
        LicenseKey license = licenseKeyRepository.findByLicenseKey(licenseKey)
                .orElseThrow(() -> new LicenseException("License not found"));

        if (!license.getIsTransferable()) {
            throw new LicenseException("License is not transferable");
        }

        if (license.getIsRevoked()) {
            throw new LicenseException("Cannot transfer a revoked license");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new LicenseException("Target user not found"));

        license.setUser(targetUser);
        List<LicenseActivation> activations = activationRepository.findByLicenseIdAndIsActiveTrue(license.getId());
        activations.forEach(a -> a.setIsActive(false));
        activationRepository.saveAll(activations);

        return licenseKeyRepository.save(license);
    }

    private LicenseValidationResponse buildValidationResponse(LicenseKey license, boolean valid, String message) {
        SubscriptionPlan plan = planRepository.findByName(license.getPlanName()).orElse(null);

        return LicenseValidationResponse.builder()
                .valid(valid)
                .licenseKey(license.getLicenseKey())
                .planName(license.getPlanName())
                .planTier(license.getPlanTier())
                .status(license.getIsRevoked() ? "revoked" :
                       (license.getExpiresAt() != null && LocalDateTime.now().isAfter(license.getExpiresAt()) ? "expired" : "active"))
                .message(message)
                .expiresAt(license.getExpiresAt())
                .remainingActivations(license.getRemainingActivations())
                .features(plan != null ? plan.getFeatures() : Map.of())
                .build();
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
