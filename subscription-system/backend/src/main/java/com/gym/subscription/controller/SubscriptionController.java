package com.gym.subscription.controller;

import com.gym.subscription.config.PlansConfigLoader;
import com.gym.subscription.dto.*;
import com.gym.subscription.service.ConfigurableSubscriptionService;
import com.gym.subscription.service.LicenseService;
import com.gym.subscription.service.PaymentGatewayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscribe")
@RequiredArgsConstructor
public class SubscriptionController {

    private final ConfigurableSubscriptionService subscriptionService;
    private final PaymentGatewayService paymentGatewayService;
    private final LicenseService licenseService;
    private final PlansConfigLoader configLoader;

    @GetMapping("/plans")
    public ResponseEntity<List<PlanDTO>> getAllPlans() {
        return ResponseEntity.ok(subscriptionService.getAllActivePlans());
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<PlanDTO> getPlanById(@PathVariable String id) {
        return ResponseEntity.ok(subscriptionService.getPlanById(id));
    }

    @GetMapping("/config")
    public ResponseEntity<PlansConfigLoader.PlansConfiguration> getConfig() {
        return ResponseEntity.ok(configLoader.getConfig());
    }

    @PostMapping("/config/reload")
    public ResponseEntity<Map<String, String>> reloadConfig() {
        configLoader.reloadConfiguration();
        return ResponseEntity.ok(Map.of("message", "Configuration reloaded successfully"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> createCheckout(
            @RequestParam String userId,
            @Valid @RequestBody CheckoutRequest request) {
        CheckoutResponse response = paymentGatewayService.createCheckoutSession(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<SubscriptionDTO> getSubscriptionStatus(@RequestParam String userId) {
        SubscriptionDTO subscription = subscriptionService.getActiveSubscription(userId);
        if (subscription == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/trial")
    public ResponseEntity<SubscriptionDTO> startTrial(
            @RequestParam String userId,
            @RequestParam String planId) {
        SubscriptionDTO subscription = subscriptionService.createTrialSubscription(userId, planId);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/activate")
    public ResponseEntity<SubscriptionDTO> activateSubscription(
            @RequestParam String userId,
            @RequestParam String gateway,
            @RequestParam String gatewaySubscriptionId,
            @RequestParam(required = false) String billingCycle) {
        SubscriptionDTO subscription = subscriptionService.activateSubscription(
                userId, gateway, gatewaySubscriptionId, billingCycle);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/upgrade")
    public ResponseEntity<SubscriptionDTO> upgradeSubscription(
            @RequestParam String userId,
            @RequestParam String newPlanId) {
        SubscriptionDTO subscription = subscriptionService.upgradeSubscription(userId, newPlanId);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/downgrade")
    public ResponseEntity<SubscriptionDTO> downgradeSubscription(
            @RequestParam String userId,
            @RequestParam String newPlanId) {
        SubscriptionDTO subscription = subscriptionService.downgradeSubscription(userId, newPlanId);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/cancel")
    public ResponseEntity<SubscriptionDTO> cancelSubscription(
            @RequestParam String userId,
            @RequestParam(defaultValue = "false") boolean immediate) {
        SubscriptionDTO subscription = subscriptionService.cancelSubscription(userId, immediate);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/reactivate")
    public ResponseEntity<SubscriptionDTO> reactivateSubscription(@RequestParam String userId) {
        SubscriptionDTO subscription = subscriptionService.reactivateSubscription(userId);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/renew")
    public ResponseEntity<SubscriptionDTO> renewSubscription(
            @RequestParam String userId,
            @RequestParam(required = false) String billingCycle) {
        SubscriptionDTO subscription = subscriptionService.renewSubscription(userId, billingCycle);
        return ResponseEntity.ok(subscription);
    }
}
