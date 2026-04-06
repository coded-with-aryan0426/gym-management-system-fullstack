package com.gym.subscription.controller;

import com.gym.subscription.config.PlansConfigLoader;
import com.gym.subscription.dto.PlanDTO;
import com.gym.subscription.service.ConfigurableSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final ConfigurableSubscriptionService subscriptionService;
    private final PlansConfigLoader configLoader;

    @GetMapping
    public ResponseEntity<List<PlanDTO>> getAllPlans() {
        return ResponseEntity.ok(subscriptionService.getAllActivePlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanDTO> getPlanById(@PathVariable String id) {
        return ResponseEntity.ok(subscriptionService.getPlanById(id));
    }

    @GetMapping("/features")
    public ResponseEntity<List<PlanDTO>> getPlansWithFeatures() {
        List<PlanDTO> plans = subscriptionService.getAllActivePlans();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/config")
    public ResponseEntity<PlansConfigLoader.PlansConfiguration> getConfig() {
        return ResponseEntity.ok(configLoader.getConfig());
    }

    @GetMapping("/gym-types")
    public ResponseEntity<List<String>> getGymTypes() {
        return ResponseEntity.ok(List.of("solo", "small", "medium", "large", "enterprise"));
    }
}
