package com.gym.management.controller;

import com.gym.management.dto.AuthResponse;
import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import com.gym.management.security.JwtTokenProvider;
import com.gym.management.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Developer Controller - ONLY FOR DEVELOPMENT/DEBUGGING
 * Provides bypass authentication for testing purposes
 * 
 * WARNING: This controller should NEVER be deployed to production!
 */
@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DevController {

        private final UserRepository userRepository;
        private final JwtTokenProvider tokenProvider;
        private final PermissionService permissionService;
        private final com.gym.management.repository.PTSessionRepository ptSessionRepository;

        /**
         * Dev login endpoint - auto-generates JWT for the first user with the specified
         * role
         * Usage: GET /api/dev/login?role=TRAINER
         * 
         * This bypasses password authentication for development purposes only.
         */
        @GetMapping("/login")
        public ResponseEntity<?> devLogin(@RequestParam(defaultValue = "TRAINER") String role) {
                try {
                        log.warn("⚠️  DEV LOGIN INITIATED - Role: {} - THIS SHOULD NOT BE USED IN PRODUCTION!", role);

                        // Find first user with the specified role (null-safe)
                        User user = userRepository.findAll().stream()
                                        .filter(u -> {
                                                Set<?> roles = u.getAllRoles();
                                                if (roles == null)
                                                        return false;
                                                return roles.stream().anyMatch(
                                                                r -> ((Enum<?>) r).name().equalsIgnoreCase(role));
                                        })
                                        .findFirst()
                                        .orElse(null);

                        if (user == null) {
                                // Fallback - get any user and we'll assign them the role
                                user = userRepository.findAll().stream().findFirst().orElse(null);
                                if (user == null) {
                                        return ResponseEntity.badRequest().body(Map.of(
                                                        "success", false,
                                                        "message",
                                                        "No users found in database. Please create at least one user first."));
                                }
                                log.warn("No user with role {} found, using user: {}", role, user.getUsername());
                        }

                        // Enrich with permissions (may add roles)
                        try {
                                permissionService.enrichUserWithPermissions(user);
                        } catch (Exception e) {
                                log.warn("Failed to enrich permissions, continuing anyway: {}", e.getMessage());
                        }

                        // Convert roles/permissions to strings (null-safe)
                        Set<String> roleNames = new java.util.HashSet<>();
                        if (user.getAllRoles() != null) {
                                roleNames = user.getAllRoles().stream()
                                                .map(Enum::name)
                                                .collect(Collectors.toSet());
                        }

                        // Add the requested role
                        roleNames.add(role.toUpperCase());

                        Set<String> permissionNames = new java.util.HashSet<>();
                        if (user.getPermissions() != null) {
                                permissionNames = user.getPermissions().stream()
                                                .map(Enum::name)
                                                .collect(Collectors.toSet());
                        }

                        String primaryRoleName = role.toUpperCase();

                        // Generate JWT
                        String token = tokenProvider.generateTokenFromUser(
                                        user,
                                        "web",
                                        null,
                                        null,
                                        null,
                                        permissionNames,
                                        roleNames,
                                        primaryRoleName);

                        // Build response
                        AuthResponse response = new AuthResponse();
                        response.setToken(token);
                        response.setType("Bearer");
                        response.setUserId(user.getUserId());
                        response.setUsername(user.getUsername());
                        response.setFullName(user.getFullName());
                        response.setEmail(user.getEmail());
                        response.setRoles(roleNames);
                        response.setPermissions(permissionNames);
                        response.setPrimaryRole(primaryRoleName);
                        response.setIsFirstLogin(false);

                        log.info("✅ DEV LOGIN SUCCESS - User: {} as {}", user.getUsername(), primaryRoleName);

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "data", response,
                                        "message", "DEV LOGIN - User authenticated as " + primaryRoleName));

                } catch (Exception e) {
                        log.error("Dev login failed", e);
                        return ResponseEntity.status(500).body(Map.of(
                                        "success", false,
                                        "message", "Dev login failed: " + e.getMessage()));
                }
        }

        /**
         * Returns available roles for dev login
         */
        @GetMapping("/roles")
        public ResponseEntity<?> getAvailableRoles() {
                return ResponseEntity.ok(Map.of(
                                "roles", new String[] { "OWNER", "ADMIN", "TRAINER", "CUSTOMER", "MEMBER" },
                                "usage", "GET /api/dev/login?role=TRAINER"));
        }

        /**
         * Seed test PT sessions for schedule page testing
         * Creates sessions with various statuses: SCHEDULED, COMPLETED, CANCELLED,
         * NO_SHOW
         */
        @GetMapping("/seed-schedule")
        public ResponseEntity<?> seedScheduleData() {
                try {
                        log.warn("⚠️  SEEDING TEST PT SESSIONS - DEV ONLY!");

                        // Get first user as trainer
                        User trainer = userRepository.findAll().stream().findFirst().orElse(null);
                        if (trainer == null) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("success", false, "message", "No users found"));
                        }

                        // Get other users as members
                        java.util.List<User> allUsers = userRepository.findAll();
                        if (allUsers.size() < 2) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("success", false, "message", "Need at least 2 users"));
                        }

                        User member1 = allUsers.size() > 1 ? allUsers.get(1) : trainer;
                        User member2 = allUsers.size() > 2 ? allUsers.get(2) : member1;
                        User member3 = allUsers.size() > 3 ? allUsers.get(3) : member2;

                        java.time.LocalDateTime today = java.time.LocalDate.now().atStartOfDay();
                        java.util.List<com.gym.management.model.PTSession> sessions = new java.util.ArrayList<>();

                        // Session 1: Today 9:00 AM - SCHEDULED
                        com.gym.management.model.PTSession s1 = new com.gym.management.model.PTSession();
                        s1.setTrainer(trainer);
                        s1.setMember(member1);
                        s1.setSessionDate(today.plusHours(9));
                        s1.setDurationMinutes(60);
                        s1.setStatus(com.gym.management.model.SessionStatus.SCHEDULED);
                        s1.setProgressNotes("Focus on upper body strength");
                        s1.setIsRecurring(false);
                        sessions.add(s1);

                        // Session 2: Today 2:00 PM - COMPLETED
                        com.gym.management.model.PTSession s2 = new com.gym.management.model.PTSession();
                        s2.setTrainer(trainer);
                        s2.setMember(member2);
                        s2.setSessionDate(today.plusHours(14));
                        s2.setDurationMinutes(45);
                        s2.setStatus(com.gym.management.model.SessionStatus.COMPLETED);
                        s2.setProgressNotes("Great session! Improved squat form");
                        s2.setIsRecurring(false);
                        sessions.add(s2);

                        // Session 3: Tomorrow 10:00 AM - SCHEDULED, Recurring
                        com.gym.management.model.PTSession s3 = new com.gym.management.model.PTSession();
                        s3.setTrainer(trainer);
                        s3.setMember(member1);
                        s3.setSessionDate(today.plusDays(1).plusHours(10));
                        s3.setDurationMinutes(60);
                        s3.setStatus(com.gym.management.model.SessionStatus.SCHEDULED);
                        s3.setProgressNotes("Cardio and core workout");
                        s3.setIsRecurring(true);
                        s3.setRecurringFrequency(com.gym.management.model.RecurringFrequency.WEEKLY);
                        sessions.add(s3);

                        // Session 4: Tomorrow 4:00 PM - CANCELLED
                        com.gym.management.model.PTSession s4 = new com.gym.management.model.PTSession();
                        s4.setTrainer(trainer);
                        s4.setMember(member3);
                        s4.setSessionDate(today.plusDays(1).plusHours(16));
                        s4.setDurationMinutes(30);
                        s4.setStatus(com.gym.management.model.SessionStatus.CANCELLED);
                        s4.setProgressNotes("Member requested reschedule");
                        s4.setIsRecurring(false);
                        sessions.add(s4);

                        // Session 5: Day+2 8:00 AM - NO_SHOW
                        com.gym.management.model.PTSession s5 = new com.gym.management.model.PTSession();
                        s5.setTrainer(trainer);
                        s5.setMember(member2);
                        s5.setSessionDate(today.plusDays(2).plusHours(8));
                        s5.setDurationMinutes(60);
                        s5.setStatus(com.gym.management.model.SessionStatus.MISSED);
                        s5.setProgressNotes("Member did not arrive");
                        s5.setIsRecurring(false);
                        sessions.add(s5);

                        // Session 6: Day+2 11:00 AM - SCHEDULED, Recurring BiWeekly
                        com.gym.management.model.PTSession s6 = new com.gym.management.model.PTSession();
                        s6.setTrainer(trainer);
                        s6.setMember(member1);
                        s6.setSessionDate(today.plusDays(2).plusHours(11));
                        s6.setDurationMinutes(60);
                        s6.setStatus(com.gym.management.model.SessionStatus.SCHEDULED);
                        s6.setProgressNotes("Flexibility and mobility session");
                        s6.setIsRecurring(true);
                        s6.setRecurringFrequency(com.gym.management.model.RecurringFrequency.BIWEEKLY);
                        sessions.add(s6);

                        // Session 7: Day+3 3:00 PM - SCHEDULED, Extended 90min
                        com.gym.management.model.PTSession s7 = new com.gym.management.model.PTSession();
                        s7.setTrainer(trainer);
                        s7.setMember(member3);
                        s7.setSessionDate(today.plusDays(3).plusHours(15));
                        s7.setDurationMinutes(90);
                        s7.setStatus(com.gym.management.model.SessionStatus.SCHEDULED);
                        s7.setProgressNotes("Extended session - competition prep");
                        s7.setIsRecurring(false);
                        sessions.add(s7);

                        // Session 8: Day+4 9:30 AM - SCHEDULED, Weekly recurring
                        com.gym.management.model.PTSession s8 = new com.gym.management.model.PTSession();
                        s8.setTrainer(trainer);
                        s8.setMember(member2);
                        s8.setSessionDate(today.plusDays(4).plusHours(9).plusMinutes(30));
                        s8.setDurationMinutes(60);
                        s8.setStatus(com.gym.management.model.SessionStatus.SCHEDULED);
                        s8.setProgressNotes("Weight loss program - week 4");
                        s8.setIsRecurring(true);
                        s8.setRecurringFrequency(com.gym.management.model.RecurringFrequency.WEEKLY);
                        sessions.add(s8);

                        // Save all sessions
                        ptSessionRepository.saveAll(sessions);

                        log.info("✅ Created {} test PT sessions for trainer: {}", sessions.size(),
                                        trainer.getUsername());

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "message", "Created " + sessions.size() + " test PT sessions",
                                        "trainerId", trainer.getUserId(),
                                        "trainerName", trainer.getUsername()));

                } catch (Exception e) {
                        log.error("Failed to seed schedule data", e);
                        return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
                }
        }
}
