package com.gym.management.controller;

import com.gym.management.model.ProgressNote;
import com.gym.management.model.PTSession;
import com.gym.management.model.SessionStatus;
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
                return ResponseEntity.status(404).body(apiResponse(false, null, "Trainer not found"));
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
            dashboard.put("totalMembers", activeMembers);

            // Get all sessions for this trainer
            List<PTSession> allSessions = ptSessionRepository.findByTrainerId(trainerId);

            // Today's sessions
            LocalDate today = LocalDate.now();
            List<PTSession> todaysSessionsList = allSessions.stream()
                    .filter(s -> s.getSessionDate() != null && s.getSessionDate().toLocalDate().equals(today))
                    .collect(Collectors.toList());

            dashboard.put("totalToday", todaysSessionsList.size());
            long completedToday = todaysSessionsList.stream()
                    .filter(s -> s.getStatus() != null && s.getStatus().name().equals("COMPLETED"))
                    .count();
            dashboard.put("completedToday", completedToday);

            // Mock earnings
            dashboard.put("todayEarnings", completedToday * 500);
            dashboard.put("monthEarnings", allSessions.stream()
                    .filter(s -> s.getStatus() != null && 
                            s.getStatus().name().equals("COMPLETED") && 
                            s.getSessionDate() != null && 
                            s.getSessionDate().getMonth() == today.getMonth())
                    .count() * 500);

            dashboard.put("attendanceRate", todaysSessionsList.isEmpty() ? 0 : (completedToday * 100 / todaysSessionsList.size()));

            // Upcoming sessions
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime weekLater = now.plusDays(7);
            List<Map<String, Object>> sessions = allSessions.stream()
                    .filter(s -> s.getSessionDate() != null &&
                            (s.getSessionDate().toLocalDate().equals(today) ||
                                    (s.getSessionDate().isAfter(now) && s.getSessionDate().isBefore(weekLater))))
                    .map(s -> {
                        Map<String, Object> sessionMap = new HashMap<>();
                        sessionMap.put("id", s.getSessionId());
                        sessionMap.put("title", "PT: " + (s.getMember() != null ? s.getMember().getFullName() : "Member"));
                        sessionMap.put("type", "pt");
                        sessionMap.put("startTime", s.getSessionDate());
                        sessionMap.put("endTime", s.getSessionDate().plusMinutes(s.getDurationMinutes()));
                        sessionMap.put("room", "Training Zone");
                        sessionMap.put("enrolled", 1);
                        sessionMap.put("capacity", 1);
                        sessionMap.put("status", s.getStatus() != null ? s.getStatus().name().toLowerCase() : "upcoming");
                        return sessionMap;
                    })
                    .collect(Collectors.toList());

            dashboard.put("sessions", sessions);

            // Unread notifications count
            Long unreadNotifications = notificationRepository.countUnreadByUserId(trainerId);
            dashboard.put("unreadNotificationsCount", unreadNotifications);

            return ResponseEntity.ok(apiResponse(true, dashboard, null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(apiResponse(false, null, e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainer = userRepository.findById(trainerId);
            if (trainer.isEmpty()) {
                return ResponseEntity.status(404).body(apiResponse(false, null, "Trainer not found"));
            }
            return ResponseEntity.ok(apiResponse(true, trainer.get(), null));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(apiResponse(false, null, e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates) {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainerOpt = userRepository.findById(trainerId);
            if (trainerOpt.isEmpty()) {
                return ResponseEntity.status(404).body(apiResponse(false, null, "Trainer not found"));
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
            return ResponseEntity.ok(apiResponse(true, saved, "Profile updated"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(apiResponse(false, null, e.getMessage()));
        }
    }

    @GetMapping("/my-members")
    public ResponseEntity<?> getMyMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status) {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            Optional<User> trainerOpt = userRepository.findById(trainerId);
            if (trainerOpt.isEmpty()) {
                return ResponseEntity.status(404).body(apiResponse(false, null, "Trainer not found"));
            }

            Set<User> customers = trainerOpt.get().getCustomers();
            if (customers == null) customers = new HashSet<>();
            
            List<User> filteredList = customers.stream()
                    .filter(c -> q == null || q.isEmpty() || 
                            c.getFullName().toLowerCase().contains(q.toLowerCase()) || 
                            c.getEmail().toLowerCase().contains(q.toLowerCase()))
                    .collect(Collectors.toList());

            int totalItems = filteredList.size();
            int totalPages = (int) Math.ceil((double) totalItems / size);
            int start = Math.min(page * size, totalItems);
            int end = Math.min(start + size, totalItems);

            List<Map<String, Object>> memberDataList = filteredList.subList(start, end).stream().map(m -> {
                Map<String, Object> memberData = new HashMap<>();
                memberData.put("userId", m.getUserId());
                memberData.put("fullName", m.getFullName());
                memberData.put("email", m.getEmail());
                memberData.put("phoneNumber", m.getPhoneNumber());
                memberData.put("avatarId", m.getAvatarId());
                memberData.put("createdAt", m.getCreatedAt());
                memberData.put("status", "active");
                memberData.put("plan", "Pro");
                memberData.put("expiryDays", 25);
                memberData.put("goal", "Muscle Gain");
                return memberData;
            }).collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("items", memberDataList);
            result.put("totalPages", totalPages);
            result.put("totalItems", totalItems);
            result.put("page", page);
            result.put("size", size);

            return ResponseEntity.ok(apiResponse(true, result, null));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(apiResponse(false, null, e.getMessage()));
        }
    }

    @GetMapping("/schedule")
    public ResponseEntity<?> getSchedule(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Long tid = getAuthenticatedTrainerId();
            List<PTSession> sessions = ptSessionRepository.findByTrainerId(tid);

            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(endDate).plusDays(1).atStartOfDay();
                sessions = sessions.stream()
                        .filter(s -> s.getSessionDate() != null &&
                                s.getSessionDate().isAfter(start) &&
                                s.getSessionDate().isBefore(end))
                        .collect(Collectors.toList());
            }

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

            return ResponseEntity.ok(apiResponse(true, saved, "Note added successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(apiResponse(false, null, e.getMessage()));
        }
    }

    @GetMapping("/members/{memberId}/notes")
    public ResponseEntity<?> getMemberNotes(@PathVariable Long memberId) {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            List<ProgressNote> notes = progressNoteRepository.findByTrainerAndMember(trainerId, memberId);
            return ResponseEntity.ok(apiResponse(true, notes, null));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(apiResponse(false, null, e.getMessage()));
        }
    }

    @GetMapping("/notes")
    public ResponseEntity<?> getAllNotes() {
        try {
            Long trainerId = getAuthenticatedTrainerId();
            List<ProgressNote> notes = progressNoteRepository.findByTrainerId(trainerId);
            return ResponseEntity.ok(apiResponse(true, notes, null));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(apiResponse(false, null, e.getMessage()));
        }
    }

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
        throw new SecurityException("User not authenticated");
    }
}
