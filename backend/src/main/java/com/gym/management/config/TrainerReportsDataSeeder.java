package com.gym.management.config;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Seeds realistic trainer report data for development testing.
 * Populates: PT Sessions, Session Ratings, Achievements, Compensation Rules
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
@Order(2) // Run after DevDataSeeder
public class TrainerReportsDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PTSessionRepository ptSessionRepository;
    private final SessionRatingRepository sessionRatingRepository;
    private final TrainerAchievementRepository trainerAchievementRepository;
    private final TrainerCompensationRuleRepository trainerCompensationRuleRepository;
    private final TrainerClassRepository trainerClassRepository;
    private final ProgressNoteRepository progressNoteRepository;
    private final NotificationRepository notificationRepository;
    private final UserGymRoleRepository userGymRoleRepository;
    private final TrainerClassAttendeeRepository trainerClassAttendeeRepository;
    private final TrainerDetailsRepository trainerDetailsRepository;
    private final TrainerSettingsRepository trainerSettingsRepository;
    private final GymStaffRepository gymStaffRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;

    private final Random random = new Random(42); // Seeded for reproducibility

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Cleanup old dev trainer if exists
        cleanupDevTrainer();

        // Find ALL trainers in the system by role
        List<User> allTrainers = userRepository.findByRoleName("TRAINER");

        if (allTrainers.isEmpty()) {
            log.warn("⚠️ No trainers found, skipping report data seeding");
            return;
        }

        log.info("🌱 Found {} trainers to seed reports data for", allTrainers.size());

        for (User trainer : allTrainers) {
            // Skip if it's the dev trainer (we will delete it later)
            if ("trainer@dev.com".equals(trainer.getEmail())) {
                continue;
            }

            // Check if already seeded - use existing method
            List<PTSession> existingSessions = ptSessionRepository.findByTrainerId(trainer.getUserId());
            if (existingSessions.size() > 10) {
                log.info("📊 Reports data already seeded for trainer: {}", trainer.getFullName());
                continue;
            }

            log.info("🌱 Seeding Reports data for trainer: {} ({})", trainer.getFullName(), trainer.getEmail());

            // Get members assigned to this trainer
            List<User> members = new ArrayList<>(trainer.getCustomers() != null ? trainer.getCustomers() : List.of());
            if (members.isEmpty()) {
                // Try to find any members to assign temporarily for data generation
                List<User> anyMembers = userRepository.findByRoleName("MEMBER");
                if (!anyMembers.isEmpty()) {
                    members = anyMembers.subList(0, Math.min(5, anyMembers.size()));
                } else {
                    log.warn("⚠️ No members found for trainer {}, skipping session seeding", trainer.getFullName());
                    continue;
                }
            }

            // 1. Seed Compensation Rules
            seedCompensationRules(trainer);

            // 2. Seed PT Sessions (past 60 days)
            seedPTSessions(trainer, members);

            // 3. Seed Session Ratings
            seedSessionRatings(trainer, members);

            // 4. Seed Achievements
            seedAchievements(trainer);
        }

        // Note: Group classes are already created via TrainerClassRepository elsewhere

        log.info("✅ Trainer Reports demo data seeded successfully for all real trainers!");
    }

    private void seedCompensationRules(User trainer) {
        // Check if rule exists using the correct method
        if (!trainerCompensationRuleRepository.existsByTrainerUserIdAndIsActiveTrue(trainer.getUserId())) {
            TrainerCompensationRule rule = TrainerCompensationRule.builder()
                    .trainer(trainer)
                    .perSessionRate(new BigDecimal("50.00"))
                    .perHourRate(new BigDecimal("65.00"))
                    .perClassRate(new BigDecimal("75.00"))
                    .perAttendeeRate(new BigDecimal("5.00"))
                    .commissionPercent(new BigDecimal("15.00"))
                    .effectiveFrom(LocalDate.now().minusMonths(6))
                    .isActive(true)
                    .build();
            trainerCompensationRuleRepository.save(rule);
            log.info("💰 Created compensation rule for trainer");
        }
    }

    private void seedPTSessions(User trainer, List<User> members) {
        LocalDate today = LocalDate.now();
        List<PTSession> sessions = new ArrayList<>();

        // Generate sessions for past 60 days
        for (int daysAgo = 60; daysAgo >= 0; daysAgo--) {
            LocalDate date = today.minusDays(daysAgo);
            int dayOfWeek = date.getDayOfWeek().getValue();

            // Skip weekends for most sessions
            if (dayOfWeek == 7)
                continue; // Sunday: no sessions
            if (dayOfWeek == 6 && random.nextFloat() > 0.3)
                continue; // Saturday: 30% chance

            // 1-4 sessions per day based on weekday
            int sessionsToday = dayOfWeek <= 5 ? 1 + random.nextInt(3) : 1;

            for (int s = 0; s < sessionsToday; s++) {
                User member = members.get(random.nextInt(members.size()));
                LocalTime startTime = LocalTime.of(7 + random.nextInt(12), random.nextBoolean() ? 0 : 30);

                PTSession session = new PTSession();
                session.setTrainer(trainer);
                session.setMember(member);
                session.setSessionDate(LocalDateTime.of(date, startTime));
                session.setDurationMinutes(45 + random.nextInt(3) * 15); // 45, 60, 75, or 90 min

                // Status: mostly completed, some cancelled, few missed
                if (daysAgo == 0) {
                    session.setStatus(SessionStatus.SCHEDULED); // Today's sessions
                } else {
                    float statusRoll = random.nextFloat();
                    if (statusRoll < 0.85) {
                        session.setStatus(SessionStatus.COMPLETED);
                    } else if (statusRoll < 0.93) {
                        session.setStatus(SessionStatus.CANCELLED);
                    } else {
                        session.setStatus(SessionStatus.MISSED);
                    }
                }

                session.setProgressNotes(generateProgressNote(session.getStatus()));
                sessions.add(session);
            }
        }

        ptSessionRepository.saveAll(sessions);
        log.info("📅 Created {} PT sessions", sessions.size());
    }

    private String generateProgressNote(SessionStatus status) {
        if (status != SessionStatus.COMPLETED)
            return null;
        String[] notes = {
                "Great session! Member showed improved form on squats.",
                "Focused on upper body strength. Increased bench press by 5lbs.",
                "Cardio-focused session. Member completed 5K in personal best time.",
                "Core and flexibility work. Excellent progress on flexibility goals.",
                "HIIT session. Member pushed through all intervals successfully.",
                "Recovery session with stretching and light mobility work.",
                "Strength training legs. New PR on deadlift!",
                "Mixed session - strength and cardio. Good energy levels."
        };
        return notes[random.nextInt(notes.length)];
    }

    private void seedSessionRatings(User trainer, List<User> members) {
        // Get all trainer sessions and filter for completed
        List<PTSession> allSessions = ptSessionRepository.findByTrainerId(trainer.getUserId());
        List<PTSession> completedSessions = allSessions.stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                .toList();

        // Rate ~70% of completed sessions
        List<SessionRating> ratings = new ArrayList<>();
        for (PTSession session : completedSessions) {
            if (random.nextFloat() > 0.7)
                continue; // 30% unrated

            // Bias toward higher ratings (4-5 stars mostly)
            int rating = random.nextFloat() < 0.85 ? 4 + random.nextInt(2) : 2 + random.nextInt(3);

            SessionRating sessionRating = SessionRating.builder()
                    .sessionId(session.getSessionId())
                    .trainer(trainer)
                    .member(session.getMember())
                    .rating(rating)
                    .ratingComment(generateRatingComment(rating))
                    .sessionType("PT")
                    .createdAt(session.getSessionDate().plusHours(1))
                    .build();
            ratings.add(sessionRating);
        }

        sessionRatingRepository.saveAll(ratings);
        log.info("⭐ Created {} session ratings", ratings.size());
    }

    private String generateRatingComment(int rating) {
        if (rating >= 5) {
            String[] comments = {
                    "Amazing trainer! Really pushed me to my limits.",
                    "Best session ever! Can't wait for the next one.",
                    "So knowledgeable and motivating!",
                    "Excellent instruction and great attention to form."
            };
            return comments[random.nextInt(comments.length)];
        } else if (rating >= 4) {
            String[] comments = {
                    "Good session, learned a lot.",
                    "Great workout, felt challenged.",
                    "Very helpful with technique corrections."
            };
            return comments[random.nextInt(comments.length)];
        } else if (rating >= 3) {
            return "Session was okay, could be more engaging.";
        } else {
            return "Session didn't meet my expectations.";
        }
    }

    private void seedAchievements(User trainer) {
        List<TrainerAchievement> achievements = new ArrayList<>();

        // Milestone achievements
        addAchievementIfNotExists(achievements, trainer, TrainerAchievement.AchievementType.MILESTONE,
                "100_sessions", "Century Club", "Award", "#FFD700", LocalDate.now().minusDays(30));
        addAchievementIfNotExists(achievements, trainer, TrainerAchievement.AchievementType.MILESTONE,
                "first_session", "First Session Complete", "Star", "#4CAF50", LocalDate.now().minusDays(55));

        // Streak achievements
        addAchievementIfNotExists(achievements, trainer, TrainerAchievement.AchievementType.STREAK,
                "7_day_streak", "Week Warrior", "Flame", "#FF5722", LocalDate.now().minusDays(20));
        addAchievementIfNotExists(achievements, trainer, TrainerAchievement.AchievementType.STREAK,
                "30_day_streak", "Consistency King", "Zap", "#9C27B0", LocalDate.now().minusDays(10));

        // Rating achievements
        addAchievementIfNotExists(achievements, trainer, TrainerAchievement.AchievementType.RATING,
                "perfect_5_star_week", "Perfect Week", "Heart", "#E91E63", LocalDate.now().minusDays(15));
        addAchievementIfNotExists(achievements, trainer, TrainerAchievement.AchievementType.RATING,
                "4.5_avg_month", "Top Rated", "ThumbsUp", "#2196F3", LocalDate.now().minusDays(5));

        // Retention achievement
        addAchievementIfNotExists(achievements, trainer, TrainerAchievement.AchievementType.RETENTION,
                "high_retention", "Client Keeper", "Users", "#00BCD4", LocalDate.now().minusDays(25));

        if (!achievements.isEmpty()) {
            trainerAchievementRepository.saveAll(achievements);
            log.info("🏆 Created {} achievements", achievements.size());
        }
    }

    private void addAchievementIfNotExists(List<TrainerAchievement> list, User trainer,
            TrainerAchievement.AchievementType type, String key, String label, String icon, String color,
            LocalDate achDate) {
        // Use the correct method to check existence
        if (!trainerAchievementRepository.existsByTrainerUserIdAndAchievementKey(trainer.getUserId(), key)) {
            list.add(TrainerAchievement.builder()
                    .trainer(trainer)
                    .achievementType(type)
                    .achievementKey(key)
                    .label(label)
                    .iconName(icon)
                    .colorHex(color)
                    .achievedDate(achDate)
                    .build());
        }
    }

    private void cleanupDevTrainer() {
        userRepository.findByEmail("trainer@dev.com").ifPresent(trainer -> {
            log.info("🧹 Cleaning up old trainer@dev.com data...");
            try {
                // Delete dependent data using verified methods

                // Compensation Rules
                List<TrainerCompensationRule> rules = trainerCompensationRuleRepository
                        .findByTrainerUserIdOrderByEffectiveFromDesc(trainer.getUserId());
                trainerCompensationRuleRepository.deleteAll(rules);

                // Achievements
                List<TrainerAchievement> achievements = trainerAchievementRepository
                        .findByTrainerUserIdOrderByAchievedDateDesc(trainer.getUserId());
                trainerAchievementRepository.deleteAll(achievements);

                // Session Ratings
                List<SessionRating> ratings = sessionRatingRepository
                        .findByTrainerUserIdOrderByCreatedAtDesc(trainer.getUserId());
                sessionRatingRepository.deleteAll(ratings);

                // Sessions
                List<PTSession> sessions = ptSessionRepository.findByTrainerId(trainer.getUserId());
                ptSessionRepository.deleteAll(sessions);

                // Classes and attendees
                List<TrainerClass> classes = trainerClassRepository
                        .findByTrainerIdOrderByClassDateAscStartTimeAsc(trainer.getUserId());
                for (TrainerClass cls : classes) {
                    trainerClassAttendeeRepository.deleteByClassId(cls.getId());
                }
                trainerClassRepository.deleteAll(classes);

                // Progress Notes
                List<ProgressNote> notes = progressNoteRepository
                        .findByTrainerUserIdOrderByCreatedAtDesc(trainer.getUserId());
                progressNoteRepository.deleteAll(notes);

                // Notifications (Active and Archived)
                List<Notification> activeNotifs = notificationRepository
                        .findByUserUserIdAndIsArchivedFalseOrderByCreatedAtDesc(trainer.getUserId());
                notificationRepository.deleteAll(activeNotifs);
                List<Notification> archivedNotifs = notificationRepository
                        .findByUserUserIdAndIsArchivedTrueOrderByCreatedAtDesc(trainer.getUserId());
                notificationRepository.deleteAll(archivedNotifs);

                // User Gym Roles
                List<UserGymRole> roles = userGymRoleRepository.findByUserUserId(trainer.getUserId());
                userGymRoleRepository.deleteAll(roles);

                // Clear customers
                trainer.setCustomers(null);
                userRepository.save(trainer);

                // Trainer Settings
                trainerSettingsRepository.findByUserUserId(trainer.getUserId())
                        .ifPresent(trainerSettingsRepository::delete);

                // Gym Staff
                List<GymStaff> staffList = gymStaffRepository.findByUserUserId(trainer.getUserId());
                gymStaffRepository.deleteAll(staffList);

                // Conversation Participants
                List<ConversationParticipant> participants = conversationParticipantRepository
                        .findByUserUserId(trainer.getUserId());
                conversationParticipantRepository.deleteAll(participants);

                // Delete Trainer Details (OneToOne shared PK)
                if (trainerDetailsRepository.existsById(trainer.getUserId())) {
                    trainerDetailsRepository.deleteById(trainer.getUserId());
                }

                userRepository.delete(trainer);
                userRepository.flush(); // Flush to trigger constraints immediately
                log.info("✅ Deleted trainer@dev.com profile");
                log.info("✅ Deleted trainer@dev.com profile");
            } catch (Exception e) {
                log.error("❌ Failed to delete trainer@dev.com: {}", e.getMessage());
            }
        });
    }
}
