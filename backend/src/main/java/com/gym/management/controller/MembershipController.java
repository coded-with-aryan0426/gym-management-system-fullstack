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
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error renewing membership: " + e.getMessage()));
        }
    }
}
