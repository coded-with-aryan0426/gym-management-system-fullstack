package com.gym.management.controller;

import com.gym.management.dto.RenewMembershipRequest;
import com.gym.management.model.Membership;
import com.gym.management.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    @PostMapping("/renew")
    public ResponseEntity<?> renewMembership(@RequestBody RenewMembershipRequest request) {
        Membership membership = membershipService.renewMembership(request.getUserId(), request.getPackageId(),
                request.getCustomDurationMonths());
        return ResponseEntity.ok(membership);
    }
}
