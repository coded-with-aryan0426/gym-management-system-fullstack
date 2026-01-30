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

    @GetMapping("/dashboard")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getDashboard(@RequestParam Long memberId) {
        try {
            Optional<User> memberOpt = userRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User member = memberOpt.get();
            Map<String, Object> dashboard = new HashMap<>();

            dashboard.put("memberId", member.getUserId());
            dashboard.put("memberName", member.getFullName());
            dashboard.put("email", member.getEmail());

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

            Long bookingsCount = classBookingRepository.countMemberBookings(memberId);
            dashboard.put("bookedClassesCount", bookingsCount);

            Long unreadNotifications = notificationRepository.countUnreadByUserId(memberId);
            dashboard.put("unreadNotificationsCount", unreadNotifications);

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam Long memberId) {
        try {
            MemberProfileDTO profile = memberProfileService.getMemberProfile(memberId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

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

    @GetMapping("/membership")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
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

    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(@RequestParam Long memberId) {
        List<ClassBooking> bookings = classBookingRepository.findByMemberUserIdOrderByBookedAtDesc(memberId);
        return ResponseEntity.ok(bookings);
    }

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

    @GetMapping("/progress-notes")
    public ResponseEntity<?> getProgressNotes(@RequestParam Long memberId) {
        var notes = progressNoteRepository.findByMemberUserIdOrderByCreatedAtDesc(memberId);
        return ResponseEntity.ok(notes);
    }
}
