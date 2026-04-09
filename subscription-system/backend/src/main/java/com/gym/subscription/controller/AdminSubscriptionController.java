package com.gym.subscription.controller;

import com.gym.subscription.config.PlansConfigLoader;
import com.gym.subscription.dto.SubscriptionMetricsDTO;
import com.gym.subscription.dto.LicenseDTO;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.repository.UserSubscriptionRepository;
import com.gym.subscription.service.LicenseService;
import com.gym.subscription.service.MetricsService;
import com.gym.subscription.service.PlanManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final UserSubscriptionRepository subscriptionRepository;
    private final PlanManagementService planManagementService;
    private final LicenseService licenseService;
    private final MetricsService metricsService;

    @GetMapping("/subscribers")
    public ResponseEntity<List<Map<String, Object>>> getAllSubscribers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<UserSubscription> subscriptions = subscriptionRepository.findAll();
        List<Map<String, Object>> dtos = subscriptions.stream()
                .map(this::toSubscriberMap)
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
                "subscription", toSubscriberMap(subscription),
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
        licenseService.getLicenseInfo(userId);
        LicenseDTO license = licenseService.getLicenseInfo(userId);
        return ResponseEntity.ok(license);
    }

    @PostMapping("/subscription/override")
    public ResponseEntity<Map<String, Object>> overrideSubscription(
            @RequestParam String userId,
            @RequestParam String status,
            @RequestParam(required = false) String expiryDate) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        if (subscription == null) {
            return ResponseEntity.notFound().build();
        }

        subscription.setStatus(com.gym.subscription.enums.SubscriptionStatus.valueOf(status.toUpperCase()));
        if (expiryDate != null) {
            subscription.setCurrentPeriodEnd(java.time.LocalDateTime.parse(expiryDate));
        }
        subscriptionRepository.save(subscription);

        return ResponseEntity.ok(toSubscriberMap(subscription));
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

    @GetMapping("/plans")
    public ResponseEntity<PlansConfigLoader.PlansConfiguration> getPlanConfiguration() {
        return ResponseEntity.ok(planManagementService.getConfiguration());
    }

    @GetMapping("/plans/{planId}")
    public ResponseEntity<PlansConfigLoader.PlanConfig> getPlan(@PathVariable String planId) {
        PlansConfigLoader.PlanConfig plan = planManagementService.getPlan(planId);
        if (plan == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/plans/{planId}")
    public ResponseEntity<PlansConfigLoader.PlanConfig> updatePlan(
            @PathVariable String planId,
            @RequestBody PlanManagementService.PlanUpdateRequest request) {
        try {
            PlansConfigLoader.PlanConfig plan = planManagementService.updatePlan(planId, request);
            return ResponseEntity.ok(plan);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<PlansConfigLoader.PlanConfig> createPlan(
            @RequestBody PlanManagementService.CreatePlanRequest request) {
        try {
            PlansConfigLoader.PlanConfig plan = planManagementService.createPlan(request);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/plans/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable String planId) {
        try {
            planManagementService.deletePlan(planId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/plans/{planId}/price/{cycle}")
    public ResponseEntity<PlansConfigLoader.PlanConfig> updatePlanPrice(
            @PathVariable String planId,
            @PathVariable String cycle,
            @RequestParam BigDecimal price) {
        try {
            PlansConfigLoader.PlanConfig plan = planManagementService.updatePrice(planId, cycle, price);
            return ResponseEntity.ok(plan);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/plans/pricing-summary")
    public ResponseEntity<Map<String, Object>> getPricingSummary() {
        return ResponseEntity.ok(planManagementService.getPricingSummary());
    }

    @PostMapping("/plans/reload")
    public ResponseEntity<Map<String, String>> reloadPlans() {
        planManagementService.getConfiguration();
        return ResponseEntity.ok(Map.of("message", "Plans configuration reloaded"));
    }

    private Map<String, Object> toSubscriberMap(UserSubscription subscription) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", subscription.getId() != null ? subscription.getId() : "");
        map.put("userId", subscription.getUser() != null ? subscription.getUser().getId() : "");
        map.put("email", subscription.getUser() != null ? subscription.getUser().getEmail() : "");
        map.put("planName", subscription.getPlan() != null ? subscription.getPlan().getDisplayName() : "");
        map.put("tierLevel", subscription.getPlan() != null ? subscription.getPlan().getTierLevel() : 0);
        map.put("status", subscription.getStatus().getValue());
        map.put("billingCycle", subscription.getBillingCycle() != null ? subscription.getBillingCycle() : "");
        map.put("currentPeriodStart", subscription.getCurrentPeriodStart() != null ? subscription.getCurrentPeriodStart().toString() : "");
        map.put("currentPeriodEnd", subscription.getCurrentPeriodEnd() != null ? subscription.getCurrentPeriodEnd().toString() : "");
        map.put("autoRenew", subscription.getAutoRenew() != null && subscription.getAutoRenew());
        map.put("cancelAtPeriodEnd", subscription.getCancelAtPeriodEnd() != null && subscription.getCancelAtPeriodEnd());
        map.put("createdAt", subscription.getCreatedAt() != null ? subscription.getCreatedAt().toString() : "");
        return map;
    }
}
