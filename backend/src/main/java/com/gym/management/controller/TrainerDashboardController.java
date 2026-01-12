package com.gym.management.controller;

import com.gym.management.model.ProgressNote;
import com.gym.management.model.PTSession;
import com.gym.management.model.User;
import com.gym.management.repository.ProgressNoteRepository;
import com.gym.management.repository.NotificationRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.PTSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer")
public class TrainerDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;

    @Autowired
    private ProgressNoteRepository progressNoteRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Trainer Dashboard - aggregated stats
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainerOpt = userRepository.findById(trainerId);
            if (trainerOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User trainer = trainerOpt.get();
            Map<String, Object> dashboard = new HashMap<>();

            // Trainer info
            dashboard.put("trainerId", trainer.getUserId());
            dashboard.put("trainerName", trainer.getFullName());
            dashboard.put("email", trainer.getEmail());

            // Assigned members count
            int activeMembers = trainer.getCustomers() != null ? trainer.getCustomers().size() : 0;
            dashboard.put("activeMembers", activeMembers);
            dashboard.put("totalMembers", activeMembers); // For now same as active

            // Get all sessions for this trainer
            List<PTSession> allSessions = ptSessionRepository.findByTrainerId(trainerId);

            // Today's sessions
            LocalDate today = LocalDate.now();
            List<PTSession> todaysSessionsList = allSessions.stream()
                    .filter(s -> s.getSessionDate() != null && s.getSessionDate().toLocalDate().equals(today))
                    .collect(Collectors.toList());

            dashboard.put("totalToday", todaysSessionsList.size());
            long completedToday = todaysSessionsList.stream()
                    .filter(s -> com.gym.management.model.SessionStatus.COMPLETED.equals(s.getStatus()))
                    .count();
            dashboard.put("completedToday", completedToday);

            // Mock earnings (can be calculated from transactions if needed)
            dashboard.put("todayEarnings", completedToday * 500); // 500 per session
            dashboard.put("monthEarnings", allSessions.stream()
                    .filter(s -> com.gym.management.model.SessionStatus.COMPLETED.equals(s.getStatus()) && s.getSessionDate().getMonth() == today.getMonth())
                    .count() * 500);

            dashboard.put("attendanceRate", todaysSessionsList.isEmpty() ? 0 : (completedToday * 100 / todaysSessionsList.size()));

            // Upcoming sessions (next 7 days)
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime weekLater = now.plusDays(7);
            List<Map<String, Object>> sessions = allSessions.stream()
                    .filter(s -> s.getSessionDate() != null &&
                            (s.getSessionDate().toLocalDate().equals(today) ||
                                    (s.getSessionDate().isAfter(now) && s.getSessionDate().isBefore(weekLater))))
                    .map(s -> {
                        Map<String, Object> session = new HashMap<>();
                        session.put("id", String.valueOf(s.getSessionId()));
                        session.put("title", "PT: " + (s.getMember() != null ? s.getMember().getFullName() : "Member"));
                        session.put("type", "pt");
                        session.put("startTime", s.getSessionDate());
                        session.put("endTime", s.getSessionDate().plusMinutes(s.getDurationMinutes()));
                        session.put("room", "Training Zone");
                        session.put("enrolled", 1);
                        session.put("capacity", 1);
                        session.put("status", s.getStatus() != null ? s.getStatus().name().toLowerCase() : "upcoming");
                        return session;
                    })
                    .collect(Collectors.toList());

            dashboard.put("sessions", sessions);

            // Unread notifications count
            Long unreadNotifications = notificationRepository.countUnreadByUserId(trainerId);
            dashboard.put("unreadNotificationsCount", unreadNotifications);

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get trainer's own profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainer = userRepository.findById(trainerId);
            if (trainer.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(trainer.get());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update trainer's own profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates) {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainerOpt = userRepository.findById(trainerId);
            if (trainerOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User trainer = trainerOpt.get();

            if (updates.containsKey("fullName")) {
                trainer.setFullName((String) updates.get("fullName"));
            }
            if (updates.containsKey("phoneNumber")) {
                trainer.setPhoneNumber((String) updates.get("phoneNumber"));
            }
            if (updates.containsKey("avatarId")) {
                trainer.setAvatarId((String) updates.get("avatarId"));
            }

            User saved = userRepository.save(trainer);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get assigned members (only those assigned to this trainer)
     */
    @GetMapping("/my-members")
    public ResponseEntity<?> getMyMembers() {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainerOpt = userRepository.findById(trainerId);
            if (trainerOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Set<User> customers = trainerOpt.get().getCustomers();
            List<Map<String, Object>> members = customers.stream().map(m -> {
                Map<String, Object> memberData = new HashMap<>();
                memberData.put("userId", m.getUserId());
                memberData.put("fullName", m.getFullName());
                memberData.put("email", m.getEmail());
                memberData.put("phoneNumber", m.getPhoneNumber());
                memberData.put("avatarId", m.getAvatarId());
                memberData.put("createdAt", m.getCreatedAt());
                return memberData;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get trainer's schedule (PT sessions)
     */
    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Long tid = getAuthenticatedTrainerId();
            List<PTSession> sessions = ptSessionRepository.findByTrainerId(tid);

            // Filter by date range if provided
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(endDate).plusDays(1).atStartOfDay();
                sessions = sessions.stream()
                        .filter(s -> s.getSessionDate() != null &&
                                s.getSessionDate().isAfter(start) &&
                                s.getSessionDate().isBefore(end))
                        .collect(Collectors.toList());
            }

            // Map to DTOs to avoid lazy loading issues
            List<com.gym.management.dto.PTSessionDTO> sessionDTOs = sessions.stream()
                    .map(com.gym.management.dto.PTSessionDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(apiResponse(true, sessionDTOs, null));
        } catch (SecurityException e) {
            return ResponseEntity.status(401)
                    .body(apiResponse(false, null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add progress note for a member
     */
    @PostMapping("/members/{memberId}/notes")
    public ResponseEntity<?> addProgressNote(
            @PathVariable Long memberId,
            @RequestBody Map<String, String> request) {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainerOpt = userRepository.findById(trainerId);
            Optional<User> memberOpt = userRepository.findById(memberId);

            if (trainerOpt.isEmpty() || memberOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ProgressNote note = new ProgressNote(trainerOpt.get(), memberOpt.get(), request.get("note"));
            ProgressNote saved = progressNoteRepository.save(note);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get progress notes for a member
     */
    @GetMapping("/members/{memberId}/notes")
    public ResponseEntity<?> getMemberNotes(@PathVariable Long memberId) {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            List<ProgressNote> notes = progressNoteRepository.findByTrainerAndMember(trainerId, memberId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    // Helper methods

    private Map<String, Object> apiResponse(boolean success, Object data, String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", success);
        response.put("data", data);
        response.put("message", message);
        return response;
    }

    private Long getAuthenticatedTrainerId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.gym.management.security.CustomUserDetails) {
            return ((com.gym.management.security.CustomUserDetails) auth.getPrincipal()).getId();
        }
        // Fallback or throw
        throw new SecurityException("User not authenticated");
    }
}
