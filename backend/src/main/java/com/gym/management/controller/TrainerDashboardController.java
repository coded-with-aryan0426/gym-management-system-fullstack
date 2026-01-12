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
    public ResponseEntity<?> getDashboard(@RequestParam Long trainerId) {
        try {
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
            int assignedMembers = trainer.getCustomers() != null ? trainer.getCustomers().size() : 0;
            dashboard.put("assignedMembersCount", assignedMembers);

            // Get all sessions for this trainer
            List<PTSession> allSessions = ptSessionRepository.findByTrainerId(trainerId);

            // Today's sessions count
            LocalDate today = LocalDate.now();
            long todaysSessions = allSessions.stream()
                    .filter(s -> s.getSessionDate() != null && s.getSessionDate().toLocalDate().equals(today))
                    .count();
            dashboard.put("todaysSessionsCount", todaysSessions);

            // Upcoming sessions (next 7 days)
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime weekLater = now.plusDays(7);
            long upcomingSessions = allSessions.stream()
                    .filter(s -> s.getSessionDate() != null &&
                            s.getSessionDate().isAfter(now) &&
                            s.getSessionDate().isBefore(weekLater))
                    .count();
            dashboard.put("upcomingSessionsCount", upcomingSessions);

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
    public ResponseEntity<?> getProfile(@RequestParam Long trainerId) {
        Optional<User> trainer = userRepository.findById(trainerId);
        if (trainer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(trainer.get());
    }

    /**
     * Update trainer's own profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam Long trainerId, @RequestBody Map<String, Object> updates) {
        try {
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
    public ResponseEntity<?> getMyMembers(@RequestParam Long trainerId) {
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
    }

    /**
     * Get trainer's schedule (PT sessions)
     */
    /**
     * Get trainer's schedule (PT sessions)
     */
    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule(
            @RequestParam(required = false) Long trainerId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Long tid = (trainerId != null) ? trainerId : getAuthenticatedTrainerId();
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
            @RequestParam Long trainerId,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> request) {
        try {
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
    public ResponseEntity<?> getMemberNotes(@RequestParam Long trainerId, @PathVariable Long memberId) {
        List<ProgressNote> notes = progressNoteRepository.findByTrainerAndMember(trainerId, memberId);
        return ResponseEntity.ok(notes);
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
