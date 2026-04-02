package com.gym.management.controller;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles the trainer-assignment request flow:
 *
 *  MEMBER side:
 *    POST   /api/trainer-requests              — member sends a request (with optional message)
 *    GET    /api/trainer-requests/my           — member sees all their outgoing requests
 *    DELETE /api/trainer-requests/{id}/cancel  — member cancels a pending request
 *
 *  TRAINER side:
 *    GET    /api/trainer-requests/incoming     — trainer sees pending requests
 *    POST   /api/trainer-requests/{id}/accept  — trainer accepts (assigns member, notifies member)
 *    POST   /api/trainer-requests/{id}/decline — trainer declines (notifies member)
 */
@RestController
@RequestMapping("/api/trainer-requests")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174","http://localhost:5175"})
public class TrainerRequestController {

    @Autowired private UserRepository userRepository;
    @Autowired private TrainerRequestRepository trainerRequestRepository;
    @Autowired private NotificationRepository notificationRepository;

    // ── helpers ─────────────────────────────────────────────────────────────

    private User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String username = auth.getName();
        if (username == null || username.isBlank()) return null;
        return userRepository.findByUsername(username).orElse(null);
    }

    private Notification buildNotification(User recipient, String title, String message,
                                            String type, String priority, Long senderId,
                                            String metaJson, String link) {
        Notification n = new Notification(recipient, title, message, type, priority);
        n.setSenderId(senderId);
        n.setMetaData(metaJson);
        n.setLink(link);
        return n;
    }

    // ── DTO projection ───────────────────────────────────────────────────────

    private Map<String, Object> toDTO(TrainerRequest r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("status", r.getStatus().name());
        m.put("memberMessage", r.getMemberMessage());
        m.put("trainerNote", r.getTrainerNote());
        m.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        m.put("resolvedAt", r.getResolvedAt() != null ? r.getResolvedAt().toString() : null);

        // Member info (for trainer-facing view)
        User mem = r.getMember();
        if (mem != null) {
            Map<String, Object> memberMap = new LinkedHashMap<>();
            memberMap.put("userId", mem.getUserId());
            memberMap.put("name", mem.getFullName());
            memberMap.put("email", mem.getEmail());
            memberMap.put("phone", mem.getPhone() != null ? mem.getPhone() : "");
            m.put("member", memberMap);
        }

        // Trainer info (for member-facing view)
        User tr = r.getTrainer();
        if (tr != null) {
            Map<String, Object> trainerMap = new LinkedHashMap<>();
            trainerMap.put("userId", tr.getUserId());
            trainerMap.put("name", tr.getFullName());
            trainerMap.put("email", tr.getEmail());
            m.put("trainer", trainerMap);
        }

        return m;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MEMBER ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Member sends a trainer assignment request.
     * Body: { "trainerId": 5, "message": "I want to lose 10kg..." }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MEMBER','CUSTOMER','OWNER','ADMIN')")
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Object> body) {
        User member = currentUser();
        if (member == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        Long trainerId;
        try {
            Object raw = body.get("trainerId");
            if (raw == null) return ResponseEntity.badRequest().body(Map.of("message", "trainerId is required"));
            trainerId = Long.valueOf(raw.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "trainerId must be a number"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "trainerId is required"));
        }
        String message = body.getOrDefault("message", "").toString().trim();

        User trainer = userRepository.findById(trainerId).orElse(null);
        if (trainer == null) return ResponseEntity.badRequest().body(Map.of("message", "Trainer not found"));

        // Idempotency: if already assigned, return success
        if (member.getTrainers() != null && member.getTrainers().stream()
                .anyMatch(t -> t.getUserId().equals(trainerId))) {
            return ResponseEntity.ok(Map.of(
                "message", trainer.getFullName() + " is already your trainer.",
                "alreadyAssigned", true));
        }

        // Check for existing PENDING request
        Optional<TrainerRequest> existing = trainerRequestRepository
                .findByMemberUserIdAndTrainerUserIdAndStatus(
                        member.getUserId(), trainerId, TrainerRequest.Status.PENDING);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of(
                "message", "You already have a pending request with " + trainer.getFullName(),
                "requestId", existing.get().getId(),
                "status", "PENDING"));
        }

        // Create request
        TrainerRequest req = new TrainerRequest();
        req.setMember(member);
        req.setTrainer(trainer);
        req.setStatus(TrainerRequest.Status.PENDING);
        req.setMemberMessage(message.isEmpty() ? null : message);
        trainerRequestRepository.save(req);

        // Notify trainer — type MEMBER so it shows in their Notifications > Clients tab
        String memberName = member.getFullName() != null ? member.getFullName() : member.getUsername();
        String metaJson = String.format(
                "{\"requestId\":%d,\"memberId\":%d,\"memberName\":\"%s\",\"action\":\"TRAINER_REQUEST\"}",
                req.getId(), member.getUserId(), memberName.replace("\"", "'"));
        Notification trainerNotif = buildNotification(
                trainer,
                "New Trainer Request from " + memberName,
                memberName + " wants you to be their personal trainer." +
                        (message.isEmpty() ? "" : " Their message: \"" + message + "\""),
                "MEMBER", "high",
                member.getUserId(),
                metaJson,
                "/trainer/members?tab=requests");
        notificationRepository.save(trainerNotif);

        return ResponseEntity.ok(Map.of(
                "message", "Request sent to " + trainer.getFullName() + ". Awaiting their response.",
                "requestId", req.getId(),
                "status", "PENDING"));
    }

    /** Member views all their outgoing requests (all statuses) */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('MEMBER','CUSTOMER','OWNER','ADMIN')")
    public ResponseEntity<?> myRequests() {
        User member = currentUser();
        if (member == null) return ResponseEntity.status(401).build();

        List<Map<String, Object>> combined = new ArrayList<>();
        for (TrainerRequest.Status s : new TrainerRequest.Status[]{
                TrainerRequest.Status.PENDING,
                TrainerRequest.Status.ACCEPTED,
                TrainerRequest.Status.DECLINED,
                TrainerRequest.Status.CANCELLED }) {
            trainerRequestRepository
                    .findByMemberUserIdAndStatusOrderByCreatedAtDesc(member.getUserId(), s)
                    .forEach(r -> combined.add(toDTO(r)));
        }
        return ResponseEntity.ok(combined);
    }

    /** Member cancels a pending request */
    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('MEMBER','CUSTOMER','OWNER','ADMIN')")
    public ResponseEntity<?> cancelRequest(@PathVariable Long id) {
        User member = currentUser();
        if (member == null) return ResponseEntity.status(401).build();

        TrainerRequest req = trainerRequestRepository.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();
        if (!req.getMember().getUserId().equals(member.getUserId()))
            return ResponseEntity.status(403).body(Map.of("message", "Not your request"));
        if (req.getStatus() != TrainerRequest.Status.PENDING)
            return ResponseEntity.badRequest().body(Map.of("message", "Request is no longer pending"));

        req.setStatus(TrainerRequest.Status.CANCELLED);
        req.setResolvedAt(LocalDateTime.now());
        trainerRequestRepository.save(req);

        return ResponseEntity.ok(Map.of("message", "Request cancelled"));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TRAINER ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    /** Trainer sees all pending requests */
    @GetMapping("/incoming")
    @PreAuthorize("hasAnyRole('TRAINER','OWNER','ADMIN')")
    public ResponseEntity<?> incomingRequests() {
        User trainer = currentUser();
        if (trainer == null) return ResponseEntity.status(401).build();

        List<Map<String, Object>> result = trainerRequestRepository
                .findByTrainerUserIdAndStatusOrderByCreatedAtDesc(
                        trainer.getUserId(), TrainerRequest.Status.PENDING)
                .stream().map(this::toDTO).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Trainer accepts a request.
     * Body (optional): { "note": "Welcome! Let's start Monday." }
     * Effect: assigns member to trainer, notifies member.
     */
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasAnyRole('TRAINER','OWNER','ADMIN')")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id,
                                            @RequestBody(required = false) Map<String, Object> body) {
        User trainer = currentUser();
        if (trainer == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        TrainerRequest req = trainerRequestRepository.findById(id).orElse(null);
        if (req == null) return ResponseEntity.status(404).body(Map.of("message", "Request not found"));
        if (!req.getTrainer().getUserId().equals(trainer.getUserId()))
            return ResponseEntity.status(403).body(Map.of("message", "Not your request"));
        if (req.getStatus() != TrainerRequest.Status.PENDING)
            return ResponseEntity.badRequest().body(Map.of("message", "Request is no longer pending"));

        String note = (body != null && body.get("note") != null) ? body.get("note").toString().trim() : "";

        try {
            // Update request status
            req.setStatus(TrainerRequest.Status.ACCEPTED);
            req.setTrainerNote(note.isEmpty() ? null : note);
            req.setResolvedAt(LocalDateTime.now());
            trainerRequestRepository.save(req);

            User member = req.getMember();
            
            // Check if assignment already exists (idempotency)
            int existingCount = userRepository.countAssignment(trainer.getUserId(), member.getUserId());
            if (existingCount == 0) {
                // Assign member → trainer via direct native INSERT
                userRepository.assignMemberToTrainer(trainer.getUserId(), member.getUserId());
            }

            // Fetch fresh user entities to avoid detached entity issues
            User memberFresh = userRepository.findById(member.getUserId()).orElse(member);
            User trainerFresh = userRepository.findById(trainer.getUserId()).orElse(trainer);
            
            // Notify member
            String trainerName = trainerFresh.getFullName() != null ? trainerFresh.getFullName() : trainerFresh.getUsername();
            String noteSnippet = note.isEmpty() ? "" : " They said: \"" + note + "\"";
            String metaJson = String.format(
                    "{\"requestId\":%d,\"trainerId\":%d,\"trainerName\":\"%s\",\"action\":\"REQUEST_ACCEPTED\"}",
                    req.getId(), trainerFresh.getUserId(), trainerName.replace("\"", "'"));
            Notification memberNotif = buildNotification(
                    memberFresh,
                    trainerName + " accepted your request!",
                    trainerName + " is now your personal trainer." + noteSnippet,
                    "MEMBER", "high",
                    trainerFresh.getUserId(),
                    metaJson,
                    "/member/trainer");
            notificationRepository.save(memberNotif);

            // Notify owner(s) about the new trainer-member assignment
            String memberName = memberFresh.getFullName() != null ? memberFresh.getFullName() : memberFresh.getUsername();
            String ownerMetaJson = String.format(
                    "{\"requestId\":%d,\"trainerId\":%d,\"trainerName\":\"%s\",\"memberId\":%d,\"memberName\":\"%s\",\"action\":\"TRAINER_ASSIGNED\"}",
                    req.getId(), trainerFresh.getUserId(), trainerName.replace("\"", "'"),
                    memberFresh.getUserId(), memberName.replace("\"", "'"));
            List<User> owners = userRepository.findAllOwners();
            for (User owner : owners) {
                Notification ownerNotif = buildNotification(
                        owner,
                        "New Trainer Assignment",
                        trainerName + " has accepted " + memberName + " as a new member.",
                        "MEMBER", "normal",
                        trainerFresh.getUserId(),
                        ownerMetaJson,
                        "/staff");
                notificationRepository.save(ownerNotif);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Request accepted. " + memberName + " has been added to your members.",
                    "status", "ACCEPTED"));
                    
        } catch (Exception e) {
            // Log the error and return a user-friendly message
            System.err.println("Error accepting trainer request " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "message", "An error occurred while accepting the request. Please try again or contact support if the issue persists."));
        }
    }

    /**
     * Trainer declines a request.
     * Body (optional): { "note": "My schedule is full right now." }
     */
    @PostMapping("/{id}/decline")
    @PreAuthorize("hasAnyRole('TRAINER','OWNER','ADMIN')")
    public ResponseEntity<?> declineRequest(@PathVariable Long id,
                                             @RequestBody(required = false) Map<String, Object> body) {
        User trainer = currentUser();
        if (trainer == null) return ResponseEntity.status(401).build();

        TrainerRequest req = trainerRequestRepository.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();
        if (!req.getTrainer().getUserId().equals(trainer.getUserId()))
            return ResponseEntity.status(403).body(Map.of("message", "Not your request"));
        if (req.getStatus() != TrainerRequest.Status.PENDING)
            return ResponseEntity.badRequest().body(Map.of("message", "Request is no longer pending"));

        String note = (body != null && body.get("note") != null) ? body.get("note").toString().trim() : "";

        try {
            // Update request status
            req.setStatus(TrainerRequest.Status.DECLINED);
            req.setTrainerNote(note.isEmpty() ? null : note);
            req.setResolvedAt(LocalDateTime.now());
            trainerRequestRepository.save(req);

            // Notify member
            User member = req.getMember();
            String trainerName = trainer.getFullName() != null ? trainer.getFullName() : trainer.getUsername();
            String noteSnippet = note.isEmpty() ? " You can browse other trainers." : " Reason: \"" + note + "\"";
            String metaJson = String.format(
                    "{\"requestId\":%d,\"trainerId\":%d,\"trainerName\":\"%s\",\"action\":\"REQUEST_DECLINED\"}",
                    req.getId(), trainer.getUserId(), trainerName.replace("\"", "'"));
            Notification memberNotif = buildNotification(
                    member,
                    "Request to " + trainerName + " was not accepted",
                    trainerName + " is unable to take you on at this time." + noteSnippet,
                    "MEMBER", "normal",
                    trainer.getUserId(),
                    metaJson,
                    "/member/trainer");
            notificationRepository.save(memberNotif);

            return ResponseEntity.ok(Map.of(
                    "message", "Request declined.",
                    "status", "DECLINED"));
                    
        } catch (Exception e) {
            // Log the error and return a user-friendly message
            System.err.println("Error declining trainer request " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "message", "An error occurred while declining the request. Please try again or contact support if the issue persists."));
        }
    }

    /** Quick check: get status of a specific request between current member and a trainer */
    @GetMapping("/status/{trainerId}")
    @PreAuthorize("hasAnyRole('MEMBER','CUSTOMER','TRAINER','OWNER','ADMIN')")
    public ResponseEntity<?> getRequestStatus(@PathVariable Long trainerId) {
        User member = currentUser();
        if (member == null) return ResponseEntity.status(401).build();

        Optional<TrainerRequest> pending = trainerRequestRepository
                .findByMemberUserIdAndTrainerUserIdAndStatus(
                        member.getUserId(), trainerId, TrainerRequest.Status.PENDING);

        if (pending.isPresent()) {
            return ResponseEntity.ok(Map.of("status", "PENDING", "requestId", pending.get().getId()));
        }
        return ResponseEntity.ok(Map.of("status", "NONE"));
    }

    /**
     * Member gets their currently assigned trainers (via owning-side query).
     * Returns a list of trainers who have this member in their customers set.
     */
    @GetMapping("/my-trainers")
    @PreAuthorize("hasAnyRole('MEMBER','CUSTOMER','OWNER','ADMIN')")
    public ResponseEntity<?> getMyAssignedTrainers() {
        User member = currentUser();
        if (member == null) return ResponseEntity.status(401).build();

        List<User> trainers = userRepository.findTrainersByMemberId(member.getUserId());
        List<Map<String, Object>> result = trainers.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("userId", t.getUserId());
            m.put("name", t.getFullName());
            m.put("email", t.getEmail());
            m.put("phone", t.getPhone() != null ? t.getPhone() : "");
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
