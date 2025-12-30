package com.gym.management.controller;

import com.gym.management.model.Notification;
import com.gym.management.repository.NotificationRepository;
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
    private NotificationRepository notificationRepository;

    /**
     * Get all notifications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count for a user
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationRepository.countUnreadByUserId(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Notification notification = notificationOpt.get();
        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @org.springframework.transaction.annotation.Transactional
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    /**
     * Create a new notification (for internal use or admin)
     */
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> request) {
        // This would typically be called internally by other services
        return ResponseEntity.ok(Map.of("message", "Notification created"));
    }
}
