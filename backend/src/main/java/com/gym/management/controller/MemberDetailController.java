package com.gym.management.controller;

import com.gym.management.model.CheckIn;
import com.gym.management.model.Notification;
import com.gym.management.model.Transaction;
import com.gym.management.model.User;
import com.gym.management.repository.CheckInRepository;
import com.gym.management.repository.NotificationRepository;
import com.gym.management.repository.TransactionRepository;
import com.gym.management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberDetailController {

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    /**
     * GET /api/members/{memberId}/attendance
     */
    @GetMapping("/{memberId}/attendance")
    public ResponseEntity<?> getMemberAttendance(@PathVariable Long memberId) {
        try {
            List<CheckIn> checkIns = checkInRepository.findByUserUserIdOrderByCheckInTimeDesc(memberId);

            List<Map<String, Object>> result = checkIns.stream().map(c -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("checkInId", c.getCheckInId());
                map.put("checkInTime", c.getCheckInTime() != null ? c.getCheckInTime().toString() : null);
                map.put("checkOutTime", c.getCheckOutTime() != null ? c.getCheckOutTime().toString() : null);
                map.put("status", c.getStatus() != null ? c.getStatus() : "check-in");
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch attendance: " + e.getMessage()));
        }
    }

    /**
     * GET /api/members/{memberId}/payments
     */
    @GetMapping("/{memberId}/payments")
    public ResponseEntity<?> getMemberPayments(@PathVariable Long memberId) {
        try {
            List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateTimeDesc(memberId);

            List<Map<String, Object>> result = transactions.stream().map(t -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("transactionId", t.getTransactionId());
                map.put("dateTime", t.getDateTime() != null ? t.getDateTime().toString() : null);
                map.put("description", t.getDescription());
                map.put("category", t.getCategory());
                map.put("type", t.getType());
                map.put("amount", t.getAmount());
                map.put("status", t.getStatus());
                map.put("referenceNumber", t.getReferenceNumber());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch payments: " + e.getMessage()));
        }
    }

    /**
     * GET /api/members/{memberId}/sessions
     */
    @GetMapping("/{memberId}/sessions")
    public ResponseEntity<?> getMemberSessions(@PathVariable Long memberId) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * POST /api/members/{memberId}/send-message
     * Sends a notification/message to a member.
     */
    @PostMapping("/{memberId}/send-message")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long memberId,
            @RequestBody Map<String, String> payload) {
        try {
            User member = userService.getUserById(memberId);
            if (member == null) {
                return ResponseEntity.notFound().build();
            }

            String subject = payload.getOrDefault("subject", "Message from Gym");
            String body = payload.getOrDefault("body", "");

            Notification notification = new Notification(
                    member,
                    subject,
                    body,
                    "MESSAGE",
                    "normal"
            );
            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of(
                    "message", "Message sent successfully",
                    "notificationId", notification.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to send message: " + e.getMessage()));
        }
    }
}
