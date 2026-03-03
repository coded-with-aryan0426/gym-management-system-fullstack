package com.gym.management.controller;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * Controller for gym management operations
 */
@RestController
@RequestMapping("/api/gyms")
@CrossOrigin(origins = "*")
public class GymController {

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private GymStaffRepository gymStaffRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all public gyms (for gym directory)
     */
    @GetMapping("/public")
    public ResponseEntity<?> getPublicGyms() {
        List<Gym> gyms = gymRepository.findByIsPublicTrue();
        return ResponseEntity.ok(gyms.stream().map(this::gymToMap).toList());
    }

    /**
     * Search gyms by name
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchGyms(@RequestParam String q) {
        List<Gym> gyms = gymRepository.findByNameContainingIgnoreCase(q);
        return ResponseEntity.ok(gyms.stream().map(this::gymToMap).toList());
    }

    /**
     * Get gym by invite code
     */
    @GetMapping("/invite/{code}")
    public ResponseEntity<?> getGymByInviteCode(@PathVariable String code) {
        Optional<Gym> gymOpt = gymRepository.findByInviteCode(code.toUpperCase());
        if (gymOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Invalid invite code"));
        }
        return ResponseEntity.ok(gymToMap(gymOpt.get()));
    }

    /**
     * Get gym details
     */
    @GetMapping("/{gymId}")
    public ResponseEntity<?> getGym(@PathVariable Long gymId) {
        Optional<Gym> gymOpt = gymRepository.findById(gymId);
        if (gymOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Gym not found"));
        }
        return ResponseEntity.ok(gymToMap(gymOpt.get()));
    }

    /**
     * Request to join a gym (for members)
     */
    @PostMapping("/{gymId}/join")
    public ResponseEntity<?> joinGym(
            @PathVariable Long gymId,
            @RequestBody Map<String, Object> request) {

        Long userId = Long.valueOf(request.get("userId").toString());

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Optional<Gym> gymOpt = gymRepository.findById(gymId);
        if (gymOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Gym not found"));
        }

        // Check if already a member
        if (membershipRepository.existsByGymGymIdAndUserUserId(gymId, userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already a member of this gym"));
        }

        Gym gym = gymOpt.get();
        User user = userOpt.get();

        Membership membership = new Membership();
        membership.setGym(gym);
        membership.setUser(user);

        // Public gyms allow instant join
        if (gym.getIsPublic()) {
            membership.setStatus(MembershipStatus.ACTIVE);
            membership.setStartDate(LocalDate.now());
        } else {
            membership.setStatus(MembershipStatus.PENDING);
        }

        membershipRepository.save(membership);

        return ResponseEntity.ok(Map.of(
                "message", gym.getIsPublic() ? "Joined gym successfully" : "Membership request submitted",
                "status", membership.getStatus().name(),
                "gymId", gym.getGymId(),
                "gymName", gym.getName()));
    }

    /**
     * Get gym staff list
     */
    @GetMapping("/{gymId}/staff")
    public ResponseEntity<?> getGymStaff(@PathVariable Long gymId) {
        List<GymStaff> staff = gymStaffRepository.findByGymGymIdAndStatus(gymId, StaffStatus.ACTIVE);
        return ResponseEntity.ok(staff.stream().map(s -> Map.of(
                "id", s.getId(),
                "userId", s.getUser().getUserId(),
                "fullName", s.getUser().getFullName(),
                "email", s.getUser().getEmail(),
                "role", "STAFF",
                "joinedAt", s.getJoinedAt() != null ? s.getJoinedAt().toString() : null)).toList());
    }

    /**
     * Get pending membership requests (for gym staff)
     */
    @GetMapping("/{gymId}/pending-members")
    public ResponseEntity<?> getPendingMembers(@PathVariable Long gymId) {
        List<Membership> pending = membershipRepository.findByGymGymIdAndStatus(gymId, MembershipStatus.PENDING);
        return ResponseEntity.ok(pending.stream().map(m -> Map.of(
                "id", m.getId(),
                "userId", m.getUser().getUserId(),
                "fullName", m.getUser().getFullName(),
                "email", m.getUser().getEmail(),
                "requestedAt", m.getCreatedAt().toString())).toList());
    }

    /**
     * Approve or reject membership request
     */
    @PostMapping("/{gymId}/membership/{membershipId}/approve")
    public ResponseEntity<?> approveMembership(
            @PathVariable Long gymId,
            @PathVariable Long membershipId,
            @RequestBody Map<String, Object> request) {

        boolean approved = (boolean) request.getOrDefault("approved", true);
        Long approvedById = request.get("approvedBy") != null ? Long.valueOf(request.get("approvedBy").toString())
                : null;

        Optional<Membership> membershipOpt = membershipRepository.findById(membershipId);
        if (membershipOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Membership not found"));
        }

        Membership membership = membershipOpt.get();

        if (approved) {
            membership.setStatus(MembershipStatus.ACTIVE);
            membership.setStartDate(LocalDate.now());
            if (approvedById != null) {
                userRepository.findById(approvedById).ifPresent(membership::setApprovedBy);
            }
        } else {
            membership.setStatus(MembershipStatus.CANCELLED);
        }

        membershipRepository.save(membership);

        return ResponseEntity.ok(Map.of(
                "message", approved ? "Membership approved" : "Membership rejected",
                "status", membership.getStatus().name()));
    }

    /**
     * Update gym settings
     */
    @PutMapping("/{gymId}")
    public ResponseEntity<?> updateGym(@PathVariable Long gymId, @RequestBody Map<String, Object> updates) {
        Optional<Gym> gymOpt = gymRepository.findById(gymId);
        if (gymOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Gym not found"));
        }

        Gym gym = gymOpt.get();

        if (updates.containsKey("name"))
            gym.setName((String) updates.get("name"));
        if (updates.containsKey("address"))
            gym.setAddress((String) updates.get("address"));
        if (updates.containsKey("city"))
            gym.setCity((String) updates.get("city"));
        if (updates.containsKey("phone"))
            gym.setPhone((String) updates.get("phone"));
        if (updates.containsKey("email"))
            gym.setEmail((String) updates.get("email"));
        if (updates.containsKey("isPublic"))
            gym.setIsPublic((Boolean) updates.get("isPublic"));

        gymRepository.save(gym);
        return ResponseEntity.ok(gymToMap(gym));
    }

    /**
     * Get gyms where user is staff
     */
    @GetMapping("/user/{userId}/staff-gyms")
    public ResponseEntity<?> getUserStaffGyms(@PathVariable Long userId) {
        List<GymStaff> staffAssociations = gymStaffRepository.findByUserUserIdAndStatus(userId, StaffStatus.ACTIVE);
        return ResponseEntity.ok(staffAssociations.stream().map(s -> Map.of(
                "gymId", s.getGym().getGymId(),
                "gymName", s.getGym().getName(),
                "role", "STAFF",
                "inviteCode", s.getGym().getInviteCode())).toList());
    }

    /**
     * Get gyms where user is member
     */
    @GetMapping("/user/{userId}/memberships")
    public ResponseEntity<?> getUserMemberships(@PathVariable Long userId) {
        List<Membership> memberships = membershipRepository.findByUserUserId(userId);
        return ResponseEntity.ok(memberships.stream().map(m -> Map.of(
                "gymId", m.getGym().getGymId(),
                "gymName", m.getGym().getName(),
                "status", m.getStatus().name(),
                "startDate", m.getStartDate() != null ? m.getStartDate().toString() : null,
                "endDate", m.getEndDate() != null ? m.getEndDate().toString() : null)).toList());
    }

    private Map<String, Object> gymToMap(Gym gym) {
        Map<String, Object> map = new HashMap<>();
        map.put("gymId", gym.getGymId());
        map.put("name", gym.getName());
        map.put("address", gym.getAddress());
        map.put("city", gym.getCity());
        map.put("phone", gym.getPhone());
        map.put("email", gym.getEmail());
        map.put("isPublic", gym.getIsPublic());
        map.put("subscriptionPlan", gym.getSubscriptionPlan().name());
        return map;
    }
}
