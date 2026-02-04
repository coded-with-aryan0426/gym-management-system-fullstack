package com.gym.management.controller;

import com.gym.management.dto.TieredMembershipPlanDTO;
import com.gym.management.model.TieredMembershipPlan.PlanCategory;
import com.gym.management.model.TieredMembershipPlan.PlanStatus;
import com.gym.management.service.TieredMembershipPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * TIERED MEMBERSHIP PLAN CONTROLLER
 * API endpoints for the new hierarchical plan management system.
 * Exclusive access for Owner/Admin roles.
 */
@RestController
@RequestMapping("/api/admin/tiered-plans")
@RequiredArgsConstructor
public class TieredMembershipPlanController {

    private final TieredMembershipPlanService planService;

    // =============================================
    // READ OPERATIONS
    // =============================================

    /**
     * GET ALL PLANS
     * Returns all plans with variants and features
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<TieredMembershipPlanDTO>> getAllPlans() {
        List<TieredMembershipPlanDTO> plans = planService.getAllPlans();
        return ResponseEntity.ok(plans);
    }

    /**
     * GET ACTIVE PLANS
     * Returns only active plans (for member assignment)
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<TieredMembershipPlanDTO>> getActivePlans() {
        List<TieredMembershipPlanDTO> plans = planService.getActivePlans();
        return ResponseEntity.ok(plans);
    }

    /**
     * GET PLAN BY ID
     * Returns a single plan with all details
     */
    @GetMapping("/{planId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> getPlanById(@PathVariable Long planId) {
        try {
            TieredMembershipPlanDTO plan = planService.getPlanById(planId);
            return ResponseEntity.ok(plan);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET PLANS BY CATEGORY
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> getPlansByCategory(@PathVariable String category) {
        try {
            PlanCategory planCategory = PlanCategory.valueOf(category.toUpperCase());
            List<TieredMembershipPlanDTO> plans = planService.getPlansByCategory(planCategory);
            return ResponseEntity.ok(plans);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid category: " + category));
        }
    }

    /**
     * GET PLAN STATISTICS
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = planService.getPlanStatistics();
        return ResponseEntity.ok(stats);
    }

    // =============================================
    // CREATE OPERATIONS
    // =============================================

    /**
     * CREATE NEW PLAN
     * Creates a new tiered membership plan with variants and features
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> createPlan(@Valid @RequestBody TieredMembershipPlanDTO dto) {
        try {
            TieredMembershipPlanDTO created = planService.createPlan(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * DUPLICATE PLAN
     * Creates a copy of an existing plan
     */
    @PostMapping("/{planId}/duplicate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> duplicatePlan(@PathVariable Long planId) {
        try {
            TieredMembershipPlanDTO duplicate = planService.duplicatePlan(planId);
            return ResponseEntity.status(HttpStatus.CREATED).body(duplicate);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // =============================================
    // UPDATE OPERATIONS
    // =============================================

    /**
     * UPDATE PLAN
     * Updates an existing plan with new data
     */
    @PutMapping("/{planId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> updatePlan(
            @PathVariable Long planId,
            @Valid @RequestBody TieredMembershipPlanDTO dto) {
        try {
            TieredMembershipPlanDTO updated = planService.updatePlan(planId, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * UPDATE PLAN STATUS
     */
    @PatchMapping("/{planId}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long planId,
            @RequestParam String status) {
        try {
            PlanStatus planStatus = PlanStatus.valueOf(status.toUpperCase());
            TieredMembershipPlanDTO updated = planService.updatePlanStatus(planId, planStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid status: " + status));
        }
    }

    /**
     * ACTIVATE PLAN
     */
    @PatchMapping("/{planId}/activate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> activatePlan(@PathVariable Long planId) {
        try {
            TieredMembershipPlanDTO updated = planService.updatePlanStatus(planId, PlanStatus.ACTIVE);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * DEACTIVATE PLAN
     */
    @PatchMapping("/{planId}/deactivate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> deactivatePlan(@PathVariable Long planId) {
        try {
            TieredMembershipPlanDTO updated = planService.updatePlanStatus(planId, PlanStatus.INACTIVE);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * ARCHIVE PLAN
     */
    @PatchMapping("/{planId}/archive")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> archivePlan(@PathVariable Long planId) {
        try {
            TieredMembershipPlanDTO updated = planService.updatePlanStatus(planId, PlanStatus.ARCHIVED);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * TOGGLE RECOMMENDED
     */
    @PatchMapping("/{planId}/toggle-recommended")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> toggleRecommended(@PathVariable Long planId) {
        try {
            TieredMembershipPlanDTO updated = planService.toggleRecommended(planId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * REORDER PLANS
     */
    @PatchMapping("/reorder")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> reorderPlans(@RequestBody List<Long> planIds) {
        try {
            planService.reorderPlans(planIds);
            return ResponseEntity.ok(Map.of("message", "Plans reordered successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // =============================================
    // DELETE OPERATIONS
    // =============================================

    /**
     * DELETE PLAN
     * Permanently removes a plan (only if no active members)
     */
    @DeleteMapping("/{planId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> deletePlan(@PathVariable Long planId) {
        try {
            planService.deletePlan(planId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
