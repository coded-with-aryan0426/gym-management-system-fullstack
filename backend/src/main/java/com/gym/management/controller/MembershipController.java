package com.gym.management.controller;

import com.gym.management.dto.RenewMembershipRequest;
import com.gym.management.model.Membership;
import com.gym.management.service.MembershipService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/memberships")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class MembershipController {
    private static final Logger log = LoggerFactory.getLogger(MembershipController.class);

    @Autowired
    private MembershipService membershipService;

    @PostMapping("/renew")
    public ResponseEntity<?> renewMembership(@RequestBody RenewMembershipRequest request) {
        try {
            log.info("[MembershipController] Renewing membership for user {} with plan {} variant {} gym {} upgrade {}",
                    request.getUserId(), request.getPlanId(), request.getVariantId(), request.getGymId(), request.getIsUpgrade());

            // Validate request
            if (request.getUserId() == null) {
                log.error("[MembershipController] User ID is required");
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            if (request.getPlanId() == null && request.getPackageId() == null) {
                log.error("[MembershipController] Either planId or packageId is required");
                return ResponseEntity.badRequest().body(Map.of("error", "Either plan or package must be selected"));
            }

            if (request.getPlanId() != null && request.getVariantId() == null) {
                log.error("[MembershipController] Variant ID is required when plan ID is provided");
                return ResponseEntity.badRequest().body(Map.of("error", "Duration variant must be selected"));
            }

            Membership membership = membershipService.renewMembership(
                    request.getUserId(),
                    request.getPackageId(),
                    request.getPlanId(),
                    request.getVariantId(),
                    request.getCustomDurationMonths(),
                    request.getGymId(),
                    request.getIsUpgrade());

            log.info("[MembershipController] Membership renewed successfully: ID {} for user {}", 
                    membership.getId(), request.getUserId());

            java.util.Map<String, Object> response = new java.util.LinkedHashMap<>();
            response.put("membershipId", membership.getId());
            response.put("status", membership.getStatus().name());
            response.put("startDate", membership.getStartDate() != null ? membership.getStartDate().toString() : null);
            response.put("endDate", membership.getEndDate() != null ? membership.getEndDate().toString() : null);
            response.put("startDateTime",
                    membership.getStartDateTime() != null ? membership.getStartDateTime().toString() : null);
            response.put("endDateTime",
                    membership.getEndDateTime() != null ? membership.getEndDateTime().toString() : null);
            response.put("planName", membership.getTieredPlan() != null
                    ? membership.getTieredPlan().getPlanName()
                    : (membership.getMembershipPackage() != null
                            ? membership.getMembershipPackage().getPackageName()
                            : "Unknown"));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("[MembershipController] Invalid request for user {}: {}", request.getUserId(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("[MembershipController] Runtime error renewing membership for user {}: {}", 
                    request.getUserId(), e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("[MembershipController] Unexpected error renewing membership for user {}", 
                    request.getUserId(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", 
                    "An unexpected error occurred. Please contact support if this persists."));
        }
    }
}
