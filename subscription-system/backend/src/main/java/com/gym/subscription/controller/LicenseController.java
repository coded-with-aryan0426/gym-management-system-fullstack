package com.gym.subscription.controller;

import com.gym.subscription.dto.LicenseDTO;
import com.gym.subscription.dto.LicenseValidationRequest;
import com.gym.subscription.dto.LicenseValidationResponse;
import com.gym.subscription.service.LicenseService;
import com.gym.subscription.service.RateLimitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/license")
@RequiredArgsConstructor
public class LicenseController {

    private final LicenseService licenseService;
    private final RateLimitService rateLimitService;

    @PostMapping("/validate")
    public ResponseEntity<LicenseValidationResponse> validateLicense(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody LicenseValidationRequest request) {

        if (userId != null) {
            if (rateLimitService.isRateLimited(userId, "/api/license/validate")) {
                return ResponseEntity.status(429)
                        .body(LicenseValidationResponse.builder()
                                .valid(false)
                                .message("Rate limit exceeded. Please try again later.")
                                .build());
            }
        }

        LicenseValidationResponse response = licenseService.validateLicense(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/activate")
    public ResponseEntity<LicenseValidationResponse> activateDevice(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody LicenseValidationRequest request) {

        if (userId != null) {
            if (rateLimitService.isRateLimited(userId, "/api/license/activate")) {
                return ResponseEntity.status(429)
                        .body(LicenseValidationResponse.builder()
                                .valid(false)
                                .message("Rate limit exceeded. Please try again later.")
                                .build());
            }
        }

        LicenseValidationResponse response = licenseService.activateDevice(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/deactivate")
    public ResponseEntity<LicenseValidationResponse> deactivateDevice(
            @RequestParam String licenseKey,
            @RequestParam String deviceFingerprint) {
        LicenseValidationResponse response = licenseService.deactivateDevice(licenseKey, deviceFingerprint);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<LicenseDTO> getMyLicense(@RequestParam String userId) {
        LicenseDTO license = licenseService.getLicenseInfo(userId);
        if (license == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(license);
    }

    @GetMapping("/devices")
    public ResponseEntity<List<LicenseDTO.DeviceInfo>> getDevices(@RequestParam String userId) {
        List<LicenseDTO.DeviceInfo> devices = licenseService.getActivatedDevices(userId);
        return ResponseEntity.ok(devices);
    }

    @PostMapping("/transfer")
    public ResponseEntity<LicenseDTO> transferLicense(
            @RequestParam String licenseKey,
            @RequestParam String targetUserId) {
        licenseService.transferLicense(licenseKey, targetUserId);
        LicenseDTO license = licenseService.getLicenseInfo(targetUserId);
        return ResponseEntity.ok(license);
    }
}
