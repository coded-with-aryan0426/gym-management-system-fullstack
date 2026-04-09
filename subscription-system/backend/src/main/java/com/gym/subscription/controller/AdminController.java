package com.gym.subscription.controller;

import com.gym.subscription.dto.LicenseDTO;
import com.gym.subscription.dto.SubscriptionDTO;
import com.gym.subscription.dto.SubscriptionMetricsDTO;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.repository.UserSubscriptionRepository;
import com.gym.subscription.service.LicenseService;
import com.gym.subscription.service.MetricsService;
import com.gym.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;
    private final LicenseService licenseService;
    private final MetricsService metricsService;

    @GetMapping("/subscribers")
    public ResponseEntity<List<SubscriptionDTO>> getAllSubscribers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<UserSubscription> subscriptions = subscriptionRepository.findAll();
        List<SubscriptionDTO> dtos = subscriptions.stream()
                .map(s -> subscriptionService.getSubscription(s.getUser().getId()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/subscribers/{id}")
    public ResponseEntity<Map<String, Object>> getSubscriberDetails(@PathVariable String id) {
        UserSubscription subscription = subscriptionRepository.findById(id).orElse(null);
        if (subscription == null) {
            return ResponseEntity.notFound().build();
        }

        LicenseDTO license = licenseService.getLicenseInfo(subscription.getUser().getId());

        return ResponseEntity.ok(Map.of(
                "subscription", subscriptionService.getSubscription(subscription.getUser().getId()),
                "license", license != null ? license : Map.of(),
                "status", subscription.getStatus().getValue()
        ));
    }

    @PostMapping("/license/revoke/{licenseKey}")
    public ResponseEntity<Map<String, String>> revokeLicense(
            @PathVariable String licenseKey,
            @RequestParam String reason) {
        licenseService.revokeLicense(licenseKey, reason);
        return ResponseEntity.ok(Map.of(
                "message", "License revoked successfully",
                "licenseKey", licenseKey
        ));
    }

    @PostMapping("/license/grant")
    public ResponseEntity<LicenseDTO> grantLicense(
            @RequestParam String userId,
            @RequestParam String planId) {
        SubscriptionDTO subscription = subscriptionService.getActiveSubscription(userId);
        if (subscription == null) {
            return ResponseEntity.badRequest().build();
        }
        LicenseDTO license = licenseService.getLicenseInfo(userId);
        return ResponseEntity.ok(license);
    }

    @PostMapping("/subscription/override")
    public ResponseEntity<SubscriptionDTO> overrideSubscription(
            @RequestParam String userId,
            @RequestParam String status,
            @RequestParam(required = false) String expiryDate) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        if (subscription == null) {
            return ResponseEntity.notFound().build();
        }

        subscription.setStatus(SubscriptionStatus.valueOf(status.toUpperCase()));
        if (expiryDate != null) {
            subscription.setCurrentPeriodEnd(java.time.LocalDateTime.parse(expiryDate));
        }
        subscriptionRepository.save(subscription);

        return ResponseEntity.ok(subscriptionService.getSubscription(userId));
    }

    @GetMapping("/metrics")
    public ResponseEntity<SubscriptionMetricsDTO> getMetrics() {
        return ResponseEntity.ok(metricsService.getMetrics());
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(metricsService.getRevenueHistory(months));
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<Map<String, Object>>> getAuditLog(
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(List.of());
    }
}
