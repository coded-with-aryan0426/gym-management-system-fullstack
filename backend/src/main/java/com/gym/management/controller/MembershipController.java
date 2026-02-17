package com.gym.management.controller;

import com.gym.management.dto.RenewMembershipRequest;
import com.gym.management.model.Membership;
import com.gym.management.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/memberships")
@CrossOrigin(origins = "*")
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    @PostMapping("/renew")
    public ResponseEntity<?> renewMembership(@RequestBody RenewMembershipRequest request) {
        try {
            Membership membership = membershipService.renewMembership(
                    request.getUserId(),
                    request.getPackageId(),
                    request.getPlanId(),
                    request.getVariantId(),
                    request.getCustomDurationMonths(),
                    request.getGymId(),
                    request.getIsUpgrade());

            return ResponseEntity.ok(Map.of(
                "membershipId", membership.getId(),
                "status", membership.getStatus().name(),
                "startDate", membership.getStartDate().toString(),
                "endDate", membership.getEndDate().toString(),
                "planName", membership.getTieredPlan() != null 
                    ? membership.getTieredPlan().getPlanName() 
                    : (membership.getMembershipPackage() != null 
                        ? membership.getMembershipPackage().getPackageName() 
                        : "Unknown")
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error renewing membership: " + e.getMessage()));
        }
    }
}
