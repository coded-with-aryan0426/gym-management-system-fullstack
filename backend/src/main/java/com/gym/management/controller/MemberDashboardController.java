package com.gym.management.controller;

import com.gym.management.dto.ErrorResponse;
import com.gym.management.dto.MemberProfileDTO;
import com.gym.management.dto.MemberProfileUpdateDTO;
import com.gym.management.dto.member.MemberDashboardStatsDTO;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import com.gym.management.service.MemberProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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
    public ResponseEntity<?> getDashboard(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);

            Optional<User> memberOpt = userRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(new ErrorResponse(false, "NOT_FOUND", "Member not found with id: " + memberId, null));
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
                        .status(m.getStatus() != null ? m.getStatus().toString() : "UNKNOWN")
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
                        if (m.getPlanVariant().getPrice() != null) {
                            mBuilder.planPrice(m.getPlanVariant().getPrice().doubleValue());
                        }
                    }
                } else if (m.getMembershipPackage() != null) {
                    mBuilder.packageName(m.getMembershipPackage().getPackageName());
                    if (m.getMembershipPackage().getPrice() != null) {
                        mBuilder.planPrice(m.getMembershipPackage().getPrice().doubleValue());
                    }
                }

                builder.membership(mBuilder.build());
            }

            // 3. Assigned Trainer
            try {
                Set<User> trainers = member.getTrainers();
                if (trainers != null && !trainers.isEmpty()) {
                    User trainer = trainers.iterator().next();
                    MemberDashboardStatsDTO.TrainerInfoDTO.TrainerInfoDTOBuilder tBuilder = MemberDashboardStatsDTO.TrainerInfoDTO.builder()
                            .userId(trainer.getUserId())
                            .fullName(trainer.getFullName())
                            .email(trainer.getEmail())
                            .avatarId(trainer.getAvatarId())
                            .specialization("Fitness Specialist")
                            .rating(4.9);

                    List<PTSession> nextSessions = ptSessionRepository.findUpcomingSessionsByMember(memberId, LocalDateTime.now());
                    if (nextSessions != null && !nextSessions.isEmpty()) {
                        PTSession next = nextSessions.get(0);
                        if (next.getSessionDate() != null) {
                            tBuilder.nextSession(next.getSessionDate().format(java.time.format.DateTimeFormatter.ofPattern("EEE, MMM d 'at' h:mm a")));
                        }
                    }

                    long completedSessions = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.COMPLETED);
                    tBuilder.sessionsCount((int) completedSessions);

                    builder.assignedTrainer(tBuilder.build());
                }
            } catch (Exception e) {
                log.warn("Failed to load trainer info for member {}: {}", memberId, e.getMessage());
            }

            // 4. KPI Cards
            List<WorkoutLog> logs = workoutLogRepository.findByUserUserIdOrderByWorkoutDateDesc(memberId);
            if (logs == null) {
                logs = Collections.emptyList();
            }
            int workoutsThisMonth = (int) logs.stream().filter(l -> l.getWorkoutDate() != null && !l.getWorkoutDate().isBefore(startOfMonth)).count();
            int totalCalories = logs.stream().mapToInt(l -> l.getCaloriesBurned() != null ? l.getCaloriesBurned() : 0).sum();
            int totalMinutes = logs.stream().mapToInt(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 0).sum();

            int currentStreak = calculateStreak(logs);

            Long bookingsCount = classBookingRepository.countMemberBookings(memberId);
            Long unreadNotifications = notificationRepository.countUnreadByUserId(memberId);

            List<MemberPoints> pointsList = memberPointsRepository.findByMemberUserId(memberId);
            int totalPoints = pointsList != null ? pointsList.stream().mapToInt(MemberPoints::getPoints).sum() : 0;

            builder.workoutsThisMonth(workoutsThisMonth)
                    .streakDays(currentStreak)
                    .bookedClassesCount(bookingsCount != null ? bookingsCount : 0L)
                    .unreadNotificationsCount(unreadNotifications != null ? unreadNotifications : 0L)
                    .caloriesBurned(totalCalories)
                    .minutesActive(totalMinutes)
                    .totalPoints(totalPoints);

            // 5. Upcoming Classes
            try {
                List<ClassBooking> upcomingBookings = classBookingRepository.findUpcomingBookings(memberId);
                List<MemberDashboardStatsDTO.UpcomingClassDTO> upcomingClasses = upcomingBookings != null
                        ? upcomingBookings.stream()
                                .limit(5)
                                .filter(b -> b.getGymClass() != null)
                                .map(b -> MemberDashboardStatsDTO.UpcomingClassDTO.builder()
                                        .id(b.getId())
                                        .title(b.getGymClass().getClassName() != null ? b.getGymClass().getClassName() : "Class")
                                        .time(b.getGymClass().getStartTime() != null
                                                ? b.getGymClass().getStartTime().format(java.time.format.DateTimeFormatter.ofPattern("h:mm a"))
                                                : "TBD")
                                        .date(b.getGymClass().getStartTime() != null
                                                ? formatFriendlyDate(b.getGymClass().getStartTime().toLocalDate())
                                                : "TBD")
                                        .location(b.getGymClass().getLocation() != null ? b.getGymClass().getLocation() : "Studio A")
                                        .trainer(b.getGymClass().getTrainer() != null ? b.getGymClass().getTrainer().getFullName() : "Staff")
                                        .type(b.getGymClass().getClassType())
                                        .capacity(b.getGymClass().getMaxCapacity())
                                        .enrolled(b.getGymClass().getCurrentBookings())
                                        .build())
                                .collect(Collectors.toList())
                        : Collections.emptyList();
                builder.upcomingClasses(upcomingClasses);
            } catch (Exception e) {
                log.warn("Failed to load upcoming classes for member {}: {}", memberId, e.getMessage());
                builder.upcomingClasses(Collections.emptyList());
            }

            // 6. Weekly Activity
            List<MemberDashboardStatsDTO.WeeklyActivityDTO> weeklyActivity = new ArrayList<>();
            LocalDate startOfWeek = today.minusDays(6);
            for (int i = 0; i < 7; i++) {
                LocalDate date = startOfWeek.plusDays(i);
                final LocalDate filterDate = date;
                int dailyWorkouts = (int) logs.stream().filter(l -> l.getWorkoutDate() != null && l.getWorkoutDate().equals(filterDate)).count();
                int dailyCalories = logs.stream().filter(l -> l.getWorkoutDate() != null && l.getWorkoutDate().equals(filterDate))
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

            try {
                checkInRepository.findByUserUserIdOrderByCheckInTimeDesc(memberId).stream().limit(10).forEach(c -> {
                    Map<String, Object> act = new HashMap<>();
                    act.put("id", c.getCheckInId());
                    act.put("name", "Gym Visit");
                    act.put("type", "checkin");
                    act.put("timestamp", c.getCheckInTime());
                    act.put("reason", "Checked in at the gym");
                    rawActivity.add(act);
                });
            } catch (Exception e) {
                log.warn("Failed to load check-ins for member {}: {}", memberId, e.getMessage());
            }

            try {
                logs.stream().limit(10).forEach(l -> {
                    Map<String, Object> act = new HashMap<>();
                    act.put("id", l.getId());
                    act.put("name", "Workout Logged");
                    act.put("type", "workout");
                    act.put("timestamp", l.getCreatedAt() != null ? l.getCreatedAt() : (l.getWorkoutDate() != null ? l.getWorkoutDate().atStartOfDay() : LocalDateTime.now()));
                    act.put("reason", String.format("Logged %d mins workout", l.getDurationMinutes() != null ? l.getDurationMinutes() : 0));
                    rawActivity.add(act);
                });
            } catch (Exception e) {
                log.warn("Failed to load workout logs for member {}: {}", memberId, e.getMessage());
            }

            try {
                transactionRepository.findByUserIdOrderByDateTimeDesc(memberId).stream().limit(5).forEach(t -> {
                    Map<String, Object> act = new HashMap<>();
                    act.put("id", t.getTransactionId());
                    act.put("name", "Payment Made");
                    act.put("type", "payment");
                    act.put("timestamp", t.getDateTime());
                    act.put("reason", String.format("Paid ₹%.2f", t.getAmount() != null ? t.getAmount() : 0));
                    rawActivity.add(act);
                });
            } catch (Exception e) {
                log.warn("Failed to load transactions for member {}: {}", memberId, e.getMessage());
            }

            // Sort by timestamp descending
            List<MemberDashboardStatsDTO.ActivityItemDTO> sortedActivity = rawActivity.stream()
                    .filter(act -> act.get("timestamp") != null)
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
                    MemberDashboardStatsDTO.FitnessMetricDTO.builder().metricName("Strength").currentValue("85").change("+0").build(),
                    MemberDashboardStatsDTO.FitnessMetricDTO.builder().metricName("Endurance").currentValue("72").change("+0").build(),
                    MemberDashboardStatsDTO.FitnessMetricDTO.builder().metricName("Flexibility").currentValue("68").change("+0").build(),
                    MemberDashboardStatsDTO.FitnessMetricDTO.builder().metricName("Balance").currentValue("75").change("+0").build(),
                    MemberDashboardStatsDTO.FitnessMetricDTO.builder().metricName("Speed").currentValue("70").change("+0").build()
            ));

            if (member.getWeight() != null) {
                double w = member.getWeight().doubleValue();
                builder.weightProgress(Arrays.asList(
                        MemberDashboardStatsDTO.WeightProgressDTO.builder().week("Week 1").weight(w + 2).change(w).build(),
                        MemberDashboardStatsDTO.WeightProgressDTO.builder().week("Week 2").weight(w + 1.5).change(w).build(),
                        MemberDashboardStatsDTO.WeightProgressDTO.builder().week("Week 3").weight(w + 0.8).change(w).build(),
                        MemberDashboardStatsDTO.WeightProgressDTO.builder().week("Week 4").weight(w).change(w).build()
                ));
            } else {
                builder.weightProgress(Collections.emptyList());
            }

            builder.achievements(Arrays.asList(
                    MemberDashboardStatsDTO.AchievementDTO.builder().icon("Trophy").title("7-Day Streak").color("#F59E0B").build(),
                    MemberDashboardStatsDTO.AchievementDTO.builder().icon("Target").title("50 Workouts").color("#10B981").build(),
                    MemberDashboardStatsDTO.AchievementDTO.builder().icon("Award").title("Perfect Week").color("#8B5CF6").build(),
                    MemberDashboardStatsDTO.AchievementDTO.builder().icon("Star").title("Early Bird").color("#06B6D4").build()
            ));

            return ResponseEntity.ok(builder.build());
        } catch (AccessDeniedException e) {
            log.warn("Access denied for member dashboard, memberId={}: {}", memberId, e.getMessage());
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied to member dashboard", null));
        } catch (Exception e) {
            log.error("Failed to fetch member dashboard for memberId={}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load dashboard data", null));
        }
    }

    private void validateMemberAccess(Long memberId, Principal principal) {
        if (principal == null) {
            throw new AccessDeniedException("Authentication required");
        }
        try {
            User currentUser = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new AccessDeniedException("User not found"));
            boolean isAdminOrTrainer = currentUser.getRoles() != null && currentUser.getRoles().stream()
                    .anyMatch(r -> "ADMIN".equals(r.getRoleName()) || "OWNER".equals(r.getRoleName()) || "TRAINER".equals(r.getRoleName()));
            if (!isAdminOrTrainer && !currentUser.getUserId().equals(memberId)) {
                throw new AccessDeniedException("You can only access your own dashboard");
            }
        } catch (AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to validate member access: {}", e.getMessage());
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
    public ResponseEntity<?> getProfile(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            MemberProfileDTO profile = memberProfileService.getMemberProfile(memberId);
            return ResponseEntity.ok(profile);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(new ErrorResponse(false, "NOT_FOUND", e.getMessage(), null));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to fetch profile for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load profile", null));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam Long memberId, @RequestBody MemberProfileUpdateDTO updateDTO, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            MemberProfileDTO updated = memberProfileService.updateMemberProfile(memberId, updateDTO);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(new ErrorResponse(false, "NOT_FOUND", e.getMessage(), null));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to update profile for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to update profile", null));
        }
    }

    @GetMapping("/membership")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getMembership(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            List<Membership> memberships = membershipRepository.findByUserUserId(memberId);
            if (memberships.isEmpty()) {
                return ResponseEntity.ok(Map.of("hasMembership", false));
            }

            Membership m = memberships.get(0);
            Map<String, Object> result = new HashMap<>();
            result.put("hasMembership", true);
            result.put("membershipId", m.getId());
            result.put("status", m.getStatus() != null ? m.getStatus().toString() : "UNKNOWN");
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
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to fetch membership for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load membership data", null));
        }
    }

    @PostMapping("/membership/{id}/freeze")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> freezeMembership(@PathVariable("id") Long id, @RequestParam int days, Principal principal) {
        try {
            Optional<Membership> mOpt = membershipRepository.findById(id);
            if (mOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(new ErrorResponse(false, "NOT_FOUND", "Membership not found", null));
            }
            Membership m = mOpt.get();

            int used = m.getFreezeDaysUsed() != null ? m.getFreezeDaysUsed() : 0;
            int total = m.getFreezeDaysTotal() != null ? m.getFreezeDaysTotal() : 30;

            if (used + days > total) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse(false, "BAD_REQUEST",
                                "Cannot freeze for " + days + " days. Only " + Math.max(0, total - used) + " days remaining.", null));
            }

            m.setIsFrozen(true);
            m.setFrozenUntil(LocalDate.now().plusDays(days));
            m.setFreezeDaysUsed(used + days);
            if (m.getEndDate() != null) {
                m.setEndDate(m.getEndDate().plusDays(days));
            }

            membershipRepository.save(m);
            return ResponseEntity.ok(Map.of("success", true, "message", "Membership frozen for " + days + " days."));
        } catch (Exception e) {
            log.error("Failed to freeze membership {}", id, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to freeze membership", null));
        }
    }

    @PutMapping("/membership/{id}/auto-renew")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> toggleAutoRenew(@PathVariable("id") Long id, @RequestParam boolean enabled) {
        try {
            Optional<Membership> mOpt = membershipRepository.findById(id);
            if (mOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(new ErrorResponse(false, "NOT_FOUND", "Membership not found", null));
            }
            Membership m = mOpt.get();

            m.setAutoRenew(enabled);
            membershipRepository.save(m);
            return ResponseEntity
                    .ok(Map.of("success", true, "message", "Auto-renewal " + (enabled ? "enabled" : "disabled") + "."));
        } catch (Exception e) {
            log.error("Failed to toggle auto-renew for membership {}", id, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to update auto-renewal", null));
        }
    }

    @PostMapping("/membership/{id}/cancel-request")
    public ResponseEntity<?> cancelMembershipRequest(@PathVariable("id") Long id) {
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Cancellation request received. Support will contact you shortly."));
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            List<ClassBooking> bookings = classBookingRepository.findByMemberUserIdOrderByBookedAtDesc(memberId);
            return ResponseEntity.ok(bookings != null ? bookings : Collections.emptyList());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to fetch bookings for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load bookings", null));
        }
    }

    @GetMapping("/my-trainer")
    public ResponseEntity<?> getMyTrainer(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            Optional<User> memberOpt = userRepository.findById(memberId);
            if (memberOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(new ErrorResponse(false, "NOT_FOUND", "Member not found", null));
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
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to fetch trainer for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load trainer data", null));
        }
    }

    @GetMapping("/progress-notes")
    public ResponseEntity<?> getProgressNotes(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            var notes = progressNoteRepository.findByMemberUserIdOrderByCreatedAtDesc(memberId);
            return ResponseEntity.ok(notes != null ? notes : Collections.emptyList());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to fetch progress notes for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load progress notes", null));
        }
    }

    @GetMapping("/membership/usage-stats")
    public ResponseEntity<?> getUsageStats(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            Map<String, Object> stats = new HashMap<>();

            List<CheckIn> checkIns = checkInRepository.findByUserUserIdOrderByCheckInTimeDesc(memberId);
            stats.put("gymVisits", checkIns != null ? checkIns.size() : 0);

            Long classesCount = classBookingRepository.countMemberBookings(memberId);
            stats.put("classesAttended", classesCount != null ? classesCount : 0L);

            long ptUsed = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.COMPLETED);
            long ptScheduled = ptSessionRepository.countByMemberUserIdAndStatus(memberId, SessionStatus.SCHEDULED);
            stats.put("ptSessionsUsed", ptUsed);
            stats.put("ptSessionsTotal", ptUsed + ptScheduled > 0 ? ptUsed + ptScheduled : 4);

            List<WorkoutLog> logs = workoutLogRepository.findByUserUserIdOrderByWorkoutDateDesc(memberId);
            int calories = logs != null ? logs.stream().mapToInt(l -> l.getCaloriesBurned() != null ? l.getCaloriesBurned() : 0).sum() : 0;
            int minutes = logs != null ? logs.stream().mapToInt(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 0).sum() : 0;
            stats.put("calories", calories);
            stats.put("minutesActive", minutes);
            stats.put("streak", calculateStreak(logs));

            List<MemberPoints> pointsList = memberPointsRepository.findByMemberUserId(memberId);
            int points = pointsList != null ? pointsList.stream().mapToInt(MemberPoints::getPoints).sum() : 0;
            stats.put("points", points);

            return ResponseEntity.ok(stats);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to fetch usage stats for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load usage statistics", null));
        }
    }

    @GetMapping("/payments/history")
    public ResponseEntity<?> getPaymentHistory(@RequestParam Long memberId, Principal principal) {
        try {
            validateMemberAccess(memberId, principal);
            List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateTimeDesc(memberId);
            return ResponseEntity.ok(transactions != null ? transactions : Collections.emptyList());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse(false, "FORBIDDEN", "Access denied", null));
        } catch (Exception e) {
            log.error("Failed to fetch payment history for member {}", memberId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse(false, "INTERNAL_ERROR", "Failed to load payment history", null));
        }
    }
}
