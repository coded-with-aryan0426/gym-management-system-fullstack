package com.gym.management.controller;

import com.gym.management.dto.MembershipPackageDTO;
import com.gym.management.service.MembershipPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * MEMBERSHIP PLAN MANAGEMENT CONTROLLER
 * Exclusive access for Owner/Admin roles to create and manage membership plans
 * Ensures single source of truth for membership packages across the gym
 */
@RestController
@RequestMapping("/api/admin/membership-plans")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class MembershipPlanManagementController {
    
    private final MembershipPackageService membershipPackageService;
    
    /**
     * GET ALL MEMBERSHIP PLANS
     * Owner/Admin can view all membership plans (active and inactive)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Get all membership plans", description = "Retrieve all membership plans for management")
    public ResponseEntity<List<MembershipPackageDTO>> getAllMembershipPlans() {
        List<MembershipPackageDTO> plans = membershipPackageService.getAllPackages();
        return ResponseEntity.ok(plans);
    }
    
    /**
     * GET ACTIVE MEMBERSHIP PLANS
     * Owner/Admin can view only active plans for assignment to members
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Get active membership plans", description = "Retrieve only active membership plans")
    public ResponseEntity<List<MembershipPackageDTO>> getActiveMembershipPlans() {
        List<MembershipPackageDTO> plans = membershipPackageService.getActivePackages();
        return ResponseEntity.ok(plans);
    }
    
    /**
     * CREATE NEW MEMBERSHIP PLAN
     * Owner/Admin exclusive - creates new membership package
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Create membership plan", description = "Create a new membership plan")
    public ResponseEntity<MembershipPackageDTO> createMembershipPlan(
            @Valid @RequestBody MembershipPackageDTO planDTO) {
        
        // Validate business rules
        validateMembershipPlan(planDTO);
        
        MembershipPackageDTO createdPlan = membershipPackageService.createPackage(planDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
    }
    
    /**
     * UPDATE MEMBERSHIP PLAN
     * Owner/Admin exclusive - updates existing membership package
     */
    @PutMapping("/{planId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Update membership plan", description = "Update an existing membership plan")
    public ResponseEntity<MembershipPackageDTO> updateMembershipPlan(
            @PathVariable Long planId,
            @Valid @RequestBody MembershipPackageDTO planDTO) {
        
        // Validate business rules
        validateMembershipPlan(planDTO);
        
        MembershipPackageDTO updatedPlan = membershipPackageService.updatePackage(planId, planDTO);
        return ResponseEntity.ok(updatedPlan);
    }
    
    /**
     * DEACTIVATE MEMBERSHIP PLAN
     * Owner/Admin exclusive - soft delete by setting inactive
     */
    @PatchMapping("/{planId}/deactivate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Deactivate membership plan", description = "Deactivate a membership plan (soft delete)")
    public ResponseEntity<Void> deactivateMembershipPlan(@PathVariable Long planId) {
        membershipPackageService.deactivatePackage(planId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * ACTIVATE MEMBERSHIP PLAN
     * Owner/Admin exclusive - reactivate inactive plan
     */
    @PatchMapping("/{planId}/activate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Activate membership plan", description = "Activate a deactivated membership plan")
    public ResponseEntity<Void> activateMembershipPlan(@PathVariable Long planId) {
        membershipPackageService.activatePackage(planId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * GET MEMBERSHIP PLAN ANALYTICS
     * Owner/Admin exclusive - view plan usage statistics
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Get membership plan analytics", description = "Get analytics data for membership plans")
    public ResponseEntity<MembershipPlanAnalyticsDTO> getMembershipPlanAnalytics() {
        MembershipPlanAnalyticsDTO analytics = membershipPackageService.getPlanAnalytics();
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * VALIDATE MEMBERSHIP PLAN BUSINESS RULES
     */
    private void validateMembershipPlan(MembershipPackageDTO planDTO) {
        // Price validation
        if (planDTO.getPrice() <= 0) {
            throw new IllegalArgumentException("Membership plan price must be greater than 0");
        }
        
        // Duration validation
        if (planDTO.getDurationDays() <= 0) {
            throw new IllegalArgumentException("Membership plan duration must be greater than 0 days");
        }
        
        // Name validation
        if (planDTO.getPackageName() == null || planDTO.getPackageName().trim().isEmpty()) {
            throw new IllegalArgumentException("Membership plan name is required");
        }
        
        // PT Sessions validation
        if (planDTO.getIncludedPTSessions() < 0) {
            throw new IllegalArgumentException("Included PT sessions cannot be negative");
        }
        
        // Maximum duration check (e.g., 5 years)
        if (planDTO.getDurationDays() > 1825) {
            throw new IllegalArgumentException("Membership plan duration cannot exceed 5 years");
        }
        
        // Price range check (e.g., $10 - $10,000)
        if (planDTO.getPrice() < 10 || planDTO.getPrice() > 10000) {
            throw new IllegalArgumentException("Membership plan price must be between $10 and $10,000");
        }
    }
}