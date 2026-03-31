package com.gym.management.controller;

import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.dto.member.MemberDashboardStatsDTO;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import com.gym.management.service.MemberProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/member")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('MEMBER', 'CUSTOMER', 'TRAINER', 'OWNER', 'ADMIN')")
public class MemberDashboardController {

    private static final Logger log = LoggerFactory.getLogger(MemberDashboardController.class);

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
            LocalDate today = LocalDate.now();
            LocalDate startOfMonth = today.withDayOfMonth(1);

            // 1. Basic Info
            MemberDashboardStatsDTO.MemberDashboardStatsDTOBuilder builder = MemberDashboardStatsDTO.builder()
                    .memberId(member.getUserId())
                    .memberName(member.getFullName())
                    .email(member.getEmail())
                    .avatarId(member.getAvatarId());

            // 2. Membership Info
            List<Membership> memberships = membershipRepository.findByUserUserId(memberId);
            if (!memberships.isEmpty()) {
                Membership m = memberships.get(0);
                MemberDashboardStatsDTO.MembershipInfoDTO.MembershipInfoDTOBuilder mBuilder = MemberDashboardStatsDTO.MembershipInfoDTO.builder()
                        .status(m.getStatus().toString())
                        .startDate(m.getStartDate())
                        .endDate(m.getEndDate())
                        .autoRenew(m.getAutoRenew() != null ? m.getAutoRenew() : false)
                        .freezeDaysUsed(m.getFreezeDaysUsed() != null ? m.getFreezeDaysUsed() : 0)
                        .freezeDaysTotal(m.getFreezeDaysTotal() != null ? m.getFreezeDaysTotal() : 30)
                        .isFrozen(m.getIsFrozen() != null ? m.getIsFrozen() : false)
                        .frozenUntil(m.getFrozenUntil());

                if (m.getEndDate() != null) {
                    long daysRemaining = ChronoUnit.DAYS.between(today, m.getEndDate());
                    mBuilder.daysRemaining(Math.max(0, daysRemaining));
                    mBuilder.isExpired(daysRemaining < 0);
                }

                if (m.getTieredPlan() != null) {
                    mBuilder.packageName(m.getTieredPlan().getPlanName());
                    if (m.getPlanVariant() != null) {
                        mBuilder.planDuration(m.getPlanVariant().getFormattedDuration());
                        mBuilder.planPrice(m.getPlanVariant().getPrice().doubleValue());
                    }
                } else if (m.getMembershipPackage() != null) {
                    mBuilder.packageName(m.getMembershipPackage().getPackageName());
                    mBuilder.planPrice(m.getMembershipPackage().getPrice().doubleValue());
                }

                builder.membership(mBuilder.build());
            }

            // 3. Assigned Trainer
            Set<User> trainers = member.getTrainers();
            if (trainers != null && !trainers.isEmpty()) {
                User trainer = trainers.iterator().next();
                MemberDashboardStatsDTO.TrainerInfoDTO.TrainerInfoDTOBuilder tBuilder = MemberDashboardStatsDTO.TrainerInfoDTO.builder()
                        .userId(trainer.getUserId())
                        .fullName(trainer.getFullName())
                        .email(trainer.getEmail())
                        .avatarId(trainer.getAvatarId())
                        .specialization("Fitness Specialist") // Placeholder
                        .rating(4.9); // Placeholder

                // Try to find next session
                List<PTSession> nextSessions = ptSessionRepository.findUpcomingSessionsByMember(memberId, LocalDateTime.now());
                if (!nextSessions.isEmpty()) {
                    PTSession next = nextSessions.get(0);
                    tBuilder.nextSession(next.getSessionDate().format(java.time.format.DateTimeFormatter.ofPattern("EEE, MMM d 'at' h:mm a")));
                }

                long completedSessions = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.COMPLETED);
                tBuilder.sessionsCount((int) completedSessions);

                builder.assignedTrainer(tBuilder.build());
            }

            // 4. KPI Cards
            List<WorkoutLog> logs = workoutLogRepository.findByUserUserIdOrderByWorkoutDateDesc(memberId);
            int workoutsThisMonth = (int) logs.stream().filter(l -> !l.getWorkoutDate().isBefore(startOfMonth)).count();
            int totalCalories = logs.stream().mapToInt(l -> l.getCaloriesBurned() != null ? l.getCaloriesBurned() : 0).sum();
            int totalMinutes = logs.stream().mapToInt(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 0).sum();
            
            int currentStreak = calculateStreak(logs);
            
            Long bookingsCount = classBookingRepository.countMemberBookings(memberId);
            Long unreadNotifications = notificationRepository.countUnreadByUserId(memberId);
            
            List<MemberPoints> pointsList = memberPointsRepository.findByMemberUserId(memberId);
            int totalPoints = pointsList.stream().mapToInt(MemberPoints::getPoints).sum();

            builder.workoutsThisMonth(workoutsThisMonth)
                    .streakDays(currentStreak)
                    .bookedClassesCount(bookingsCount)
                    .unreadNotificationsCount(unreadNotifications)
                    .caloriesBurned(totalCalories)
                    .minutesActive(totalMinutes)
                    .totalPoints(totalPoints);

            // 5. Upcoming Classes
            List<ClassBooking> upcomingBookings = classBookingRepository.findUpcomingBookings(memberId);
            List<MemberDashboardStatsDTO.UpcomingClassDTO> upcomingClasses = upcomingBookings.stream()
                    .limit(5)
                    .map(b -> MemberDashboardStatsDTO.UpcomingClassDTO.builder()
                            .id(b.getId())
                            .title(b.getGymClass().getClassName())
                            .time(b.getGymClass().getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("h:mm a")))
                            .date(formatFriendlyDate(b.getGymClass().getStartTime().toLocalDate()))
                            .location(b.getGymClass().getLocation() != null ? b.getGymClass().getLocation() : "Studio A")
                            .trainer(b.getGymClass().getTrainer() != null ? b.getGymClass().getTrainer().getFullName() : "Staff")
                            .type(b.getGymClass().getClassType())
                            .capacity(b.getGymClass().getMaxCapacity())
                            .enrolled(b.getGymClass().getCurrentBookings())
                            .build())
                    .collect(Collectors.toList());
            builder.upcomingClasses(upcomingClasses);

            // 6. Weekly Activity
            List<MemberDashboardStatsDTO.WeeklyActivityDTO> weeklyActivity = new ArrayList<>();
            LocalDate startOfWeek = today.minusDays(6);
            for (int i = 0; i < 7; i++) {
                LocalDate date = startOfWeek.plusDays(i);
                int dailyWorkouts = (int) logs.stream().filter(l -> l.getWorkoutDate().equals(date)).count();
                int dailyCalories = logs.stream().filter(l -> l.getWorkoutDate().equals(date))
                        .mapToInt(l -> l.getCaloriesBurned() != null ? l.getCaloriesBurned() : 0).sum();
                
                weeklyActivity.add(MemberDashboardStatsDTO.WeeklyActivityDTO.builder()
                        .day(date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .workouts(dailyWorkouts)
                        .calories(dailyCalories)
                        .build());
            }
            builder.weeklyActivity(weeklyActivity);

            // 7. Recent Activity (Combined and Sorted)
            List<Map<String, Object>> rawActivity = new ArrayList<>();
            
            // Check-ins
            checkInRepository.findByUserUserIdOrderByCheckInTimeDesc(memberId).stream().limit(10).forEach(c -> {
                Map<String, Object> act = new HashMap<>();
                act.put("id", c.getCheckInId());
                act.put("name", "Gym Visit");
                act.put("type", "checkin");
                act.put("timestamp", c.getCheckInTime());
                act.put("reason", "Checked in at the gym");
                rawActivity.add(act);
            });

            // Workout Logs
            logs.stream().limit(10).forEach(l -> {
                Map<String, Object> act = new HashMap<>();
                act.put("id", l.getLogId());
                act.put("name", "Workout Logged");
                act.put("type", "workout");
                act.put("timestamp", l.getCreatedAt() != null ? l.getCreatedAt() : l.getWorkoutDate().atStartOfDay());
                act.put("reason", String.format("Logged %d mins workout", l.getDurationMinutes()));
                rawActivity.add(act);
            });

            // Transactions
            transactionRepository.findByUserIdOrderByDateTimeDesc(memberId).stream().limit(5).forEach(t -> {
                Map<String, Object> act = new HashMap<>();
                act.put("id", t.getTransactionId());
                act.put("name", "Payment Made");
                act.put("type", "payment");
                act.put("timestamp", t.getDateTime());
                act.put("reason", String.format("Paid ₹%.2f", t.getAmount()));
                rawActivity.add(act);
            });

            // Sort by timestamp descending
            List<MemberDashboardStatsDTO.ActivityItemDTO> sortedActivity = rawActivity.stream()
                    .sorted((a, b) -> ((LocalDateTime) b.get("timestamp")).compareTo((LocalDateTime) a.get("timestamp")))
                    .limit(8)
                    .map(act -> MemberDashboardStatsDTO.ActivityItemDTO.builder()
                            .id((Long) act.get("id"))
                            .name((String) act.get("name"))
                            .type((String) act.get("type"))
                            .date(formatTimeAgo((LocalDateTime) act.get("timestamp")))
                            .reason((String) act.get("reason"))
                            .build())
                    .collect(Collectors.toList());
            builder.recentActivity(sortedActivity);

            // 8. Mocks for Radar and Weight (unless data exists)
            builder.fitnessMetrics(Arrays.asList(
                    new MemberDashboardStatsDTO.FitnessMetricDTO("Strength", 85),
                    new MemberDashboardStatsDTO.FitnessMetricDTO("Endurance", 72),
                    new MemberDashboardStatsDTO.FitnessMetricDTO("Flexibility", 68),
                    new MemberDashboardStatsDTO.FitnessMetricDTO("Balance", 75),
                    new MemberDashboardStatsDTO.FitnessMetricDTO("Speed", 70)
            ));

            if (member.getWeight() != null) {
                builder.weightProgress(Arrays.asList(
                        new MemberDashboardStatsDTO.WeightProgressDTO("Week 1", member.getWeight().doubleValue() + 2, member.getWeight().doubleValue()),
                        new MemberDashboardStatsDTO.WeightProgressDTO("Week 2", member.getWeight().doubleValue() + 1.5, member.getWeight().doubleValue()),
                        new MemberDashboardStatsDTO.WeightProgressDTO("Week 3", member.getWeight().doubleValue() + 0.8, member.getWeight().doubleValue()),
                        new MemberDashboardStatsDTO.WeightProgressDTO("Week 4", member.getWeight().doubleValue(), member.getWeight().doubleValue())
                ));
            } else {
                builder.weightProgress(Collections.emptyList());
            }

            builder.achievements(Arrays.asList(
                    new MemberDashboardStatsDTO.AchievementDTO("Trophy", "7-Day Streak", "#F59E0B"),
                    new MemberDashboardStatsDTO.AchievementDTO("Target", "50 Workouts", "#10B981"),
                    new MemberDashboardStatsDTO.AchievementDTO("Award", "Perfect Week", "#8B5CF6"),
                    new MemberDashboardStatsDTO.AchievementDTO("Star", "Early Bird", "#06B6D4")
            ));

            return ResponseEntity.ok(builder.build());
        } catch (Exception e) {
            log.error("Failed to fetch member dashboard", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private int calculateStreak(List<WorkoutLog> logs) {
        if (logs == null || logs.isEmpty()) return 0;
        
        Set<LocalDate> dates = logs.stream().map(WorkoutLog::getWorkoutDate).collect(Collectors.toSet());
        int streak = 0;
        LocalDate current = LocalDate.now();
        
        // If no workout today, check yesterday
        if (!dates.contains(current)) {
            current = current.minusDays(1);
        }
        
        while (dates.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }
        
        return streak;
    }

    private String formatFriendlyDate(LocalDate date) {
        LocalDate today = LocalDate.now();
        if (date.equals(today)) return "Today";
        if (date.equals(today.plusDays(1))) return "Tomorrow";
        return date.format(java.time.format.DateTimeFormatter.ofPattern("EEE, MMM d"));
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";
        long minutes = java.time.temporal.ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        if (days < 7) return days + "d ago";
        return dateTime.format(java.time.format.DateTimeFormatter.ofPattern("MMM d"));
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

        if (m.getTieredPlan() != null) {
            result.put("planName", m.getTieredPlan().getPlanName());
            result.put("packageName", m.getTieredPlan().getPlanName());
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

        m.setAutoRenew(enabled);
        membershipRepository.save(m);
        return ResponseEntity
                .ok(Map.of("success", true, "message", "Auto-renewal " + (enabled ? "enabled" : "disabled") + "."));
    }

    @PostMapping("/membership/{id}/cancel-request")
    public ResponseEntity<?> cancelMembershipRequest(@PathVariable("id") Long id) {
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Cancellation request received. Support will contact you shortly."));
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

            List<CheckIn> checkIns = checkInRepository.findByUserUserIdOrderByCheckInTimeDesc(memberId);
            stats.put("gymVisits", checkIns.size());

            Long classesCount = classBookingRepository.countMemberBookings(memberId);
            stats.put("classesAttended", classesCount);

            long ptUsed = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.COMPLETED);
            long ptScheduled = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.SCHEDULED);
            stats.put("ptSessionsUsed", ptUsed);
            stats.put("ptSessionsTotal", ptUsed + ptScheduled > 0 ? ptUsed + ptScheduled : 4);

            List<WorkoutLog> logs = workoutLogRepository.findByUserUserIdOrderByWorkoutDateDesc(memberId);
            int calories = logs.stream().mapToInt(l -> l.getCaloriesBurned() != null ? l.getCaloriesBurned() : 0).sum();
            int minutes = logs.stream().mapToInt(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 0).sum();
            stats.put("calories", calories);
            stats.put("minutesActive", minutes);
            stats.put("streak", calculateStreak(logs));

            List<MemberPoints> pointsList = memberPointsRepository.findByMemberUserId(memberId);
            int points = pointsList.stream().mapToInt(MemberPoints::getPoints).sum();
            stats.put("points", points);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to fetch usage stats for member {}", memberId, e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch usage statistics"));
        }
    }

    @GetMapping("/payments/history")
    public ResponseEntity<?> getPaymentHistory(@RequestParam Long memberId) {
        try {
            List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateTimeDesc(memberId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Failed to fetch payment history for member {}", memberId, e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch payment history"));
        }
    }
}
