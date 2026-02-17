package com.gym.management.controller;

import com.gym.management.model.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private com.gym.management.service.NotificationService notificationService;

    @GetMapping("/user/{userId}")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<Notification>> getUserNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "all") String filter) {
        List<Notification> notifications = notificationService.getUserNotifications(userId, filter);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/by-type")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<Notification>> getByType(
            @PathVariable Long userId,
            @RequestParam String type) {
        return ResponseEntity.ok(notificationService.getByType(userId, type));
    }

    @GetMapping("/user/{userId}/by-priority")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<Notification>> getByPriority(
            @PathVariable Long userId,
            @RequestParam String priority) {
        return ResponseEntity.ok(notificationService.getByPriority(userId, priority));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/user/{userId}/stats")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getStats(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        Optional<Notification> updated = notificationService.markAsRead(notificationId);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{notificationId}/star")
    public ResponseEntity<?> toggleStar(@PathVariable Long notificationId) {
        Optional<Notification> updated = notificationService.toggleStar(notificationId);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{notificationId}/archive")
    public ResponseEntity<?> archiveNotification(@PathVariable Long notificationId) {
        Optional<Notification> updated = notificationService.archiveNotification(notificationId);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{notificationId}/unarchive")
    public ResponseEntity<?> unarchiveNotification(@PathVariable Long notificationId) {
        Optional<Notification> updated = notificationService.unarchiveNotification(notificationId);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        if (notificationService.deleteNotification(notificationId)) {
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bulk-action")
    public ResponseEntity<?> bulkAction(@RequestBody Map<String, Object> request) {
        String action = (String) request.get("action");
        List<?> rawIds = (List<?>) request.get("ids");

        if (rawIds == null || rawIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No IDs provided"));
        }

        try {
            List<Long> longIds = rawIds.stream()
                    .map(id -> {
                        if (id instanceof Integer) return ((Integer) id).longValue();
                        if (id instanceof Long) return (Long) id;
                        if (id instanceof String) return Long.parseLong((String) id);
                        throw new IllegalArgumentException("Invalid ID format");
                    })
                    .collect(java.util.stream.Collectors.toList());

            notificationService.performBulkAction(action, longIds);
            return ResponseEntity.ok(Map.of("message", "Bulk action completed"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ID format"));
        }
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
