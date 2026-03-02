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
import java.time.temporal.ChronoUnit;
import java.util.*;

import com.gym.management.model.CheckIn;
import com.gym.management.model.SessionStatus;
import com.gym.management.model.WorkoutLog;
import com.gym.management.model.MemberPoints;
import com.gym.management.model.Transaction;

import com.gym.management.repository.CheckInRepository;
import com.gym.management.repository.PTSessionRepository;
import com.gym.management.repository.WorkoutLogRepository;
import com.gym.management.repository.MemberPointsRepository;
import com.gym.management.repository.TransactionRepository;

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

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private MemberPointsRepository memberPointsRepository;

    @Autowired
    private TransactionRepository transactionRepository;

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

                // Include tiered plan info (new system takes priority)
                if (membership.getTieredPlan() != null) {
                    membershipInfo.put("planName", membership.getTieredPlan().getPlanName());
                    membershipInfo.put("packageName", membership.getTieredPlan().getPlanName()); // Override legacy
                    if (membership.getPlanVariant() != null) {
                        membershipInfo.put("planDuration", membership.getPlanVariant().getFormattedDuration());
                        membershipInfo.put("planPrice", membership.getPlanVariant().getPrice());
                    }
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
            // +1 to include the expiry day itself (matches owner member detail view)
            long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), m.getEndDate()) + 1;
            result.put("daysRemaining", Math.max(0, daysRemaining));
            result.put("isExpired", daysRemaining <= 0);
        }

        result.put("autoRenew", m.getAutoRenew() != null ? m.getAutoRenew() : false);
        result.put("freezeDaysUsed", m.getFreezeDaysUsed() != null ? m.getFreezeDaysUsed() : 0);
        result.put("freezeDaysTotal", m.getFreezeDaysTotal() != null ? m.getFreezeDaysTotal() : 30);
        result.put("isFrozen", m.getIsFrozen() != null ? m.getIsFrozen() : false);
        result.put("frozenUntil", m.getFrozenUntil());

        if (m.getMembershipPackage() != null) {
            result.put("packageName", m.getMembershipPackage().getPackageName());
            result.put("packagePrice", m.getMembershipPackage().getPrice());
        }

        // Tiered plan takes priority
        if (m.getTieredPlan() != null) {
            result.put("planName", m.getTieredPlan().getPlanName());
            result.put("packageName", m.getTieredPlan().getPlanName()); // Override legacy
            if (m.getPlanVariant() != null) {
                result.put("planDuration", m.getPlanVariant().getFormattedDuration());
                result.put("packagePrice", m.getPlanVariant().getPrice());
            }
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/membership/{id}/freeze")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> freezeMembership(@PathVariable("id") Long id, @RequestParam int days) {
        Optional<Membership> mOpt = membershipRepository.findById(id);
        if (mOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Membership m = mOpt.get();

        int used = m.getFreezeDaysUsed() != null ? m.getFreezeDaysUsed() : 0;
        int total = m.getFreezeDaysTotal() != null ? m.getFreezeDaysTotal() : 30;

        if (used + days > total) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Cannot freeze for " + days + " days. Only " + Math.max(0, total - used) + " days remaining."));
        }

        m.setIsFrozen(true);
        m.setFrozenUntil(LocalDate.now().plusDays(days));
        m.setFreezeDaysUsed(used + days);
        if (m.getEndDate() != null) {
            m.setEndDate(m.getEndDate().plusDays(days));
        }

        membershipRepository.save(m);
        return ResponseEntity.ok(Map.of("success", true, "message", "Membership frozen for " + days + " days."));
    }

    @PutMapping("/membership/{id}/auto-renew")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> toggleAutoRenew(@PathVariable("id") Long id, @RequestParam boolean enabled) {
        Optional<Membership> mOpt = membershipRepository.findById(id);
        if (mOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Membership m = mOpt.get();

        if (enabled) {
            boolean hasValidPaymentMethod = false; // Simulating strict check for payment method
            if (!hasValidPaymentMethod) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Please add a payment method before enabling auto-renewal."));
            }
        }

        m.setAutoRenew(enabled);
        membershipRepository.save(m);
        return ResponseEntity
                .ok(Map.of("success", true, "message", "Auto-renewal " + (enabled ? "enabled" : "disabled") + "."));
    }

    @PostMapping("/membership/{id}/cancel-request")
    public ResponseEntity<?> cancelMembershipRequest(@PathVariable("id") Long id) {
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Cancellation request received. Support will contact you shortly.")); // Simple
                                                                                                                         // mock
                                                                                                                         // ticket
                                                                                                                         // request
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

    @GetMapping("/membership/usage-stats")
    public ResponseEntity<?> getUsageStats(@RequestParam Long memberId) {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Gym Visits
            List<CheckIn> checkIns = checkInRepository.findByUserUserIdOrderByCheckInTimeDesc(memberId);
            stats.put("gymVisits", checkIns.size());

            // Classes Attended
            Long classesCount = classBookingRepository.countMemberBookings(memberId);
            stats.put("classesAttended", classesCount);

            // PT Sessions
            long ptUsed = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.COMPLETED);
            long ptScheduled = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.SCHEDULED);
            stats.put("ptSessionsUsed", ptUsed);
            stats.put("ptSessionsTotal", ptUsed + ptScheduled > 0 ? ptUsed + ptScheduled : 4); // default fallback

            // Workout Logs (Calories & Minutes)
            List<WorkoutLog> logs = workoutLogRepository.findByUserUserIdOrderByWorkoutDateDesc(memberId);
            int calories = logs.stream().mapToInt(l -> l.getCaloriesBurned() != null ? l.getCaloriesBurned() : 0).sum();
            int minutes = logs.stream().mapToInt(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 0)
                    .sum();
            stats.put("calories", calories);
            stats.put("minutesActive", minutes);
            stats.put("streak", logs.isEmpty() ? 0 : 1); // Simplified streak

            // Points
            List<MemberPoints> pointsList = memberPointsRepository.findByMemberUserId(memberId);
            int points = pointsList.stream().mapToInt(p -> p.getPoints()).sum();
            stats.put("points", points);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/payments/history")
    public ResponseEntity<?> getPaymentHistory(@RequestParam Long memberId) {
        try {
            List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateTimeDesc(memberId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
