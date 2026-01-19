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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Seeds data for trainer pages: Notifications, Progress Notes, Classes
 * Runs after TrainerReportsDataSeeder
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class TrainerPagesDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ProgressNoteRepository progressNoteRepository;
    private final TrainerClassRepository trainerClassRepository;

    private final Random random = new Random(42);

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Find ALL trainers in the system by role
        List<User> allTrainers = userRepository.findByRoleName("TRAINER");

        if (allTrainers.isEmpty()) {
            // Fallback to dev trainer
            User devTrainer = userRepository.findByEmail("trainer@dev.com").orElse(null);
            if (devTrainer != null) {
                allTrainers = List.of(devTrainer);
            } else {
                log.warn("⚠️ No trainers found, skipping pages data seeding");
                return;
            }
        }

        log.info("🌱 Found {} trainers to seed data for", allTrainers.size());

        for (User trainer : allTrainers) {
            // Check if already seeded for this trainer
            List<Notification> existingNotifications = notificationRepository
                    .findByUserUserIdAndIsArchivedFalseOrderByCreatedAtDesc(trainer.getUserId());

            if (existingNotifications.size() > 5) {
                log.info("📱 Data already seeded for trainer: {}", trainer.getFullName());
                continue;
            }

            log.info("🌱 Seeding data for trainer: {} ({})", trainer.getFullName(), trainer.getEmail());

            List<User> members = new ArrayList<>(trainer.getCustomers() != null ? trainer.getCustomers() : List.of());

            // Seed Notifications
            seedNotifications(trainer);

            // Seed Progress Notes - use any member if no assigned members
            if (!members.isEmpty()) {
                seedProgressNotes(trainer, members);
            } else {
                // Find some members from the system
                List<User> anyMembers = userRepository.findByRoleName("MEMBER");
                if (!anyMembers.isEmpty()) {
                    seedProgressNotes(trainer, anyMembers.subList(0, Math.min(5, anyMembers.size())));
                }
            }

            // Seed Trainer Classes
            seedTrainerClasses(trainer);
        }

        log.info("✅ Trainer Pages data seeded for all trainers!");
    }

    private void seedNotifications(User trainer) {
        List<Notification> notifications = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Session-related notifications
        notifications.add(createNotification(trainer, "New Session Booked",
                "Alice Member has booked a PT session for tomorrow at 10:00 AM",
                "BOOKING", "high", now.minusHours(2)));

        notifications.add(createNotification(trainer, "Session Reminder",
                "You have 3 sessions scheduled for today",
                "SCHEDULE", "normal", now.minusHours(5)));

        notifications.add(createNotification(trainer, "Session Cancelled",
                "Bob Member cancelled today's 2:00 PM session",
                "BOOKING", "high", now.minusDays(1)));

        // Achievement notifications
        notifications.add(createNotification(trainer, "Achievement Unlocked! 🏆",
                "Congratulations! You've completed 100 sessions this month.",
                "ACHIEVEMENT", "normal", now.minusDays(2)));

        notifications.add(createNotification(trainer, "New 5-Star Review ⭐",
                "Alice Member left a 5-star review: 'Amazing trainer! Highly recommend.'",
                "REVIEW", "normal", now.minusDays(3)));

        // System notifications
        notifications.add(createNotification(trainer, "Schedule Update",
                "Your schedule for next week has been published. Check your calendar.",
                "SCHEDULE", "low", now.minusDays(4)));

        notifications.add(createNotification(trainer, "Payment Processed 💰",
                "Your earnings of $2,450 for this period have been processed.",
                "PAYMENT", "normal", now.minusDays(5)));

        notifications.add(createNotification(trainer, "New Member Assigned",
                "A new member has been assigned to you. Check your members list.",
                "MEMBER", "high", now.minusDays(6)));

        // Mark some as read
        notifications.get(3).setIsRead(true);
        notifications.get(5).setIsRead(true);
        notifications.get(6).setIsRead(true);

        // Star one
        notifications.get(0).setIsStarred(true);

        notificationRepository.saveAll(notifications);
        log.info("🔔 Created {} notifications", notifications.size());
    }

    private Notification createNotification(User user, String title, String message,
            String type, String priority, LocalDateTime createdAt) {
        Notification n = new Notification(user, title, message, type, priority);
        n.setCreatedAt(createdAt);
        return n;
    }

    private void seedProgressNotes(User trainer, List<User> members) {
        List<ProgressNote> notes = new ArrayList<>();
        LocalDate today = LocalDate.now();
        String[] categories = { "Strength", "Cardio", "Flexibility", "HIIT" };
        String[] moods = { "motivated", "tired", "energetic", "focused", "challenging" };
        String[] sessionTypes = { "PT Session", "Group Class", "Assessment", "Check-in" };

        // Create 15-20 progress notes over the past 30 days
        for (int i = 0; i < 18; i++) {
            int daysAgo = random.nextInt(30);
            User member = members.get(random.nextInt(members.size()));

            ProgressNote note = new ProgressNote();
            note.setTrainer(trainer);
            note.setMember(member);
            note.setSessionDate(today.minusDays(daysAgo));
            note.setSessionTime(LocalTime.of(8 + random.nextInt(10), random.nextBoolean() ? 0 : 30));
            note.setCategory(categories[random.nextInt(categories.length)]);
            note.setMood(moods[random.nextInt(moods.length)]);
            note.setSessionType(sessionTypes[random.nextInt(sessionTypes.length)]);
            note.setNote(generateNoteContent(note.getCategory()));
            note.setHighlightsJson(generateHighlightsJson());
            note.setGoalsJson(generateGoalsJson());
            note.setCreatedAt(today.minusDays(daysAgo).atTime(note.getSessionTime()).plusHours(1));
            note.setPrivate(random.nextFloat() < 0.2f); // 20% private

            notes.add(note);
        }

        progressNoteRepository.saveAll(notes);
        log.info("📝 Created {} progress notes", notes.size());
    }

    private String generateNoteContent(String category) {
        switch (category) {
            case "Strength":
                return "Great progress on compound lifts today. Deadlift form has improved significantly. " +
                        "Increased weight on bench press by 5lbs. Need to focus more on mobility warm-up.";
            case "Cardio":
                return "Completed 30-minute HIIT circuit with minimal rest. Heart rate recovery improved from last week. "
                        +
                        "Endurance is building nicely. Ready to increase intensity next session.";
            case "Flexibility":
                return "Focused on hip mobility and hamstring flexibility. Notable improvement in forward fold. " +
                        "Recommended daily stretching routine for home. Check back in 2 weeks.";
            case "HIIT":
                return "High-intensity interval training - 8 rounds completed. Pushed through fatigue wall. " +
                        "Good mental toughness shown today. Recovery between sets is getting faster.";
            default:
                return "Good session overall. Member showed dedication and effort throughout.";
        }
    }

    private String generateHighlightsJson() {
        return "[\"Improved form on key exercises\", \"Increased weight/reps\", \"Great energy and attitude\"]";
    }

    private String generateGoalsJson() {
        return "[{\"title\":\"Increase bench press\",\"progress\":75},{\"title\":\"Run 5K under 25min\",\"progress\":60}]";
    }

    private void seedTrainerClasses(User trainer) {
        // Check if classes already exist
        List<TrainerClass> existing = trainerClassRepository
                .findByTrainerIdOrderByClassDateAscStartTimeAsc(trainer.getUserId());
        if (!existing.isEmpty()) {
            log.info("🏋️ Trainer classes already exist, skipping...");
            return;
        }

        LocalDate today = LocalDate.now();
        List<TrainerClass> classes = new ArrayList<>();

        // Create classes for this week and next week
        for (int daysOffset = -7; daysOffset <= 14; daysOffset++) {
            LocalDate date = today.plusDays(daysOffset);
            int dayOfWeek = date.getDayOfWeek().getValue();

            // Classes on Mon, Wed, Fri (Group) and Tue, Thu (PT-like smaller groups)
            if (dayOfWeek == 7)
                continue; // Skip Sunday

            String title;
            TrainerClass.ClassType type = TrainerClass.ClassType.GROUP;
            TrainerClass.ClassStatus status;
            LocalTime startTime;
            int capacity;
            int enrolled;

            switch (dayOfWeek) {
                case 1: // Monday - Morning HIIT
                    title = "Morning HIIT Blast";
                    startTime = LocalTime.of(7, 0);
                    capacity = 20;
                    enrolled = 12 + random.nextInt(8);
                    break;
                case 2: // Tuesday - Strength
                    title = "Strength & Conditioning";
                    startTime = LocalTime.of(18, 0);
                    capacity = 15;
                    enrolled = 8 + random.nextInt(6);
                    break;
                case 3: // Wednesday - Yoga
                    title = "Power Yoga Flow";
                    startTime = LocalTime.of(12, 0);
                    capacity = 25;
                    enrolled = 15 + random.nextInt(8);
                    break;
                case 4: // Thursday - CrossFit
                    title = "CrossFit WOD";
                    startTime = LocalTime.of(17, 30);
                    capacity = 12;
                    enrolled = 6 + random.nextInt(5);
                    break;
                case 5: // Friday - Circuit
                    title = "Friday Burn Circuit";
                    startTime = LocalTime.of(18, 30);
                    capacity = 20;
                    enrolled = 14 + random.nextInt(6);
                    break;
                case 6: // Saturday - Bootcamp
                    title = "Weekend Bootcamp";
                    startTime = LocalTime.of(9, 0);
                    capacity = 30;
                    enrolled = 20 + random.nextInt(8);
                    break;
                default:
                    continue;
            }

            // Determine status
            if (daysOffset < 0) {
                status = TrainerClass.ClassStatus.COMPLETED;
            } else if (daysOffset == 0 && LocalTime.now().isAfter(startTime)) {
                status = TrainerClass.ClassStatus.COMPLETED;
            } else {
                status = TrainerClass.ClassStatus.UPCOMING;
            }

            TrainerClass tc = new TrainerClass();
            tc.setTrainerId(trainer.getUserId());
            tc.setTitle(title);
            tc.setType(type);
            tc.setClassDate(date);
            tc.setStartTime(startTime);
            tc.setEndTime(startTime.plusMinutes(60));
            tc.setDuration(60);
            tc.setRoom("Studio " + (1 + dayOfWeek % 3));
            tc.setCapacity(capacity);
            tc.setEnrolled(Math.min(enrolled, capacity));
            tc.setStatus(status);
            tc.setRecurring(true);
            tc.setNotes("Regular weekly " + title + " class");

            classes.add(tc);
        }

        trainerClassRepository.saveAll(classes);
        log.info("🏋️ Created {} trainer classes", classes.size());
    }
}
