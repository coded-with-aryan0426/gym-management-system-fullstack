package com.gym.management.controller;

import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.model.ClassBooking;
import com.gym.management.model.Membership;
import com.gym.management.model.User;
import com.gym.management.repository.ClassBookingRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.NotificationRepository;
import com.gym.management.repository.ProgressNoteRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.service.MemberProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Member Dashboard Controller - MEMBER, TRAINER, OWNER, ADMIN
 * Members access their own data, staff can access for management.
 */
@RestController
@RequestMapping("/api/member")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('MEMBER', 'CUSTOMER', 'TRAINER', 'OWNER', 'ADMIN')")
public class MemberDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private ClassBookingRepository classBookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ProgressNoteRepository progressNoteRepository;

    @Autowired
    private MemberProfileService memberProfileService;

    /**
     * Member Dashboard - aggregated stats
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@RequestParam Long memberId) {
        try {
            Optional<User> memberOpt = userRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User member = memberOpt.get();
            Map<String, Object> dashboard = new HashMap<>();

            // Member info
            dashboard.put("memberId", member.getUserId());
            dashboard.put("memberName", member.getFullName());
            dashboard.put("email", member.getEmail());

            // Membership status - get first active membership
            List<Membership> memberships = membershipRepository.findByUserUserId(memberId);
            if (!memberships.isEmpty()) {
                Membership membership = memberships.get(0);
                Map<String, Object> membershipInfo = new HashMap<>();
                membershipInfo.put("status", membership.getStatus().toString());
                membershipInfo.put("startDate", membership.getStartDate());
                membershipInfo.put("endDate", membership.getEndDate());

                if (membership.getEndDate() != null) {
                    long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), membership.getEndDate());
                    membershipInfo.put("daysRemaining", Math.max(0, daysRemaining));
                    membershipInfo.put("isExpired", daysRemaining < 0);
                }

                if (membership.getMembershipPackage() != null) {
                    membershipInfo.put("packageName", membership.getMembershipPackage().getPackageName());
                }

                dashboard.put("membership", membershipInfo);
            } else {
                dashboard.put("membership", null);
            }

            // Assigned trainer
            Set<User> trainers = member.getTrainers();
            if (trainers != null && !trainers.isEmpty()) {
                User trainer = trainers.iterator().next();
                Map<String, Object> trainerInfo = new HashMap<>();
                trainerInfo.put("userId", trainer.getUserId());
                trainerInfo.put("fullName", trainer.getFullName());
                trainerInfo.put("email", trainer.getEmail());
                trainerInfo.put("avatarId", trainer.getAvatarId());
                dashboard.put("assignedTrainer", trainerInfo);
            } else {
                dashboard.put("assignedTrainer", null);
            }

            // Booked classes count
            List<ClassBooking> bookings = classBookingRepository.findActiveBookingsByMember(memberId);
            dashboard.put("bookedClassesCount", bookings.size());

            // Unread notifications count
            Long unreadNotifications = notificationRepository.countUnreadByUserId(memberId);
            dashboard.put("unreadNotificationsCount", unreadNotifications);

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get member's own profile (full profile with all details)
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam Long memberId) {
        try {
            MemberProfileDTO profile = memberProfileService.getMemberProfile(memberId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update member's own profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam Long memberId, @RequestBody MemberProfileUpdateDTO updateDTO) {
        try {
            MemberProfileDTO updated = memberProfileService.updateMemberProfile(memberId, updateDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get member's membership details
     */
    @GetMapping("/membership")
    public ResponseEntity<?> getMembership(@RequestParam Long memberId) {
        List<Membership> memberships = membershipRepository.findByUserUserId(memberId);
        if (memberships.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasMembership", false));
        }

        Membership m = memberships.get(0);
        Map<String, Object> result = new HashMap<>();
        result.put("hasMembership", true);
        result.put("membershipId", m.getId());
        result.put("status", m.getStatus().toString());
        result.put("startDate", m.getStartDate());
        result.put("endDate", m.getEndDate());

        if (m.getEndDate() != null) {
            long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), m.getEndDate());
            result.put("daysRemaining", Math.max(0, daysRemaining));
            result.put("isExpired", daysRemaining < 0);
        }

        if (m.getMembershipPackage() != null) {
            result.put("packageName", m.getMembershipPackage().getPackageName());
            result.put("packagePrice", m.getMembershipPackage().getPrice());
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Get member's bookings
     */
    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(@RequestParam Long memberId) {
        List<ClassBooking> bookings = classBookingRepository.findByMemberUserId(memberId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Book a class
     */
    @PostMapping("/classes/book")
    public ResponseEntity<?> bookClass(@RequestParam Long memberId, @RequestBody Map<String, Long> request) {
        try {
            Long classId = request.get("classId");

            // Check if already booked
            if (classBookingRepository.existsByClassIdAndMemberUserIdAndStatus(classId, memberId, "BOOKED")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already booked for this class"));
            }

            Optional<User> memberOpt = userRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ClassBooking booking = new ClassBooking(classId, memberOpt.get());
            ClassBooking saved = classBookingRepository.save(booking);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel a booking
     */
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> cancelBooking(@RequestParam Long memberId, @PathVariable Long bookingId) {
        try {
            Optional<ClassBooking> bookingOpt = classBookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ClassBooking booking = bookingOpt.get();

            // Verify ownership
            if (!booking.getMember().getUserId().equals(memberId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
            }

            booking.setStatus("CANCELLED");
            booking.setCancelledAt(LocalDateTime.now());
            classBookingRepository.save(booking);

            return ResponseEntity.ok(Map.of("message", "Booking cancelled"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get assigned trainer info
     */
    @GetMapping("/my-trainer")
    public ResponseEntity<?> getMyTrainer(@RequestParam Long memberId) {
        Optional<User> memberOpt = userRepository.findById(memberId);
        if (memberOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Set<User> trainers = memberOpt.get().getTrainers();
        if (trainers == null || trainers.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasTrainer", false));
        }

        User trainer = trainers.iterator().next();
        Map<String, Object> result = new HashMap<>();
        result.put("hasTrainer", true);
        result.put("userId", trainer.getUserId());
        result.put("fullName", trainer.getFullName());
        result.put("email", trainer.getEmail());
        result.put("phoneNumber", trainer.getPhoneNumber());
        result.put("avatarId", trainer.getAvatarId());

        return ResponseEntity.ok(result);
    }

    /**
     * Get progress notes for member (from their trainer)
     */
    @GetMapping("/progress-notes")
    public ResponseEntity<?> getProgressNotes(@RequestParam Long memberId) {
        var notes = progressNoteRepository.findByMemberUserIdOrderByCreatedAtDesc(memberId);
        return ResponseEntity.ok(notes);
    }
}
