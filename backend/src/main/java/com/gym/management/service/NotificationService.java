package com.gym.management.service;

import com.gym.management.model.Notification;
import com.gym.management.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId, String filter) {
        switch (filter) {
            case "unread":
                return notificationRepository.findByUserUserIdAndIsReadFalseAndIsArchivedFalseOrderByCreatedAtDesc(userId);
            case "starred":
                return notificationRepository.findByUserUserIdAndIsStarredTrueOrderByCreatedAtDesc(userId);
            case "archived":
                return notificationRepository.findByUserUserIdAndIsArchivedTrueOrderByCreatedAtDesc(userId);
            case "all":
            default:
                return notificationRepository.findByUserUserIdAndIsArchivedFalseOrderByCreatedAtDesc(userId);
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getByType(Long userId, String type) {
        return notificationRepository.findByUserUserIdAndTypeAndIsArchivedFalseOrderByCreatedAtDesc(userId, type);
    }

    @Transactional(readOnly = true)
    public List<Notification> getByPriority(Long userId, String priority) {
        return notificationRepository.findByUserUserIdAndPriorityAndIsArchivedFalseOrderByCreatedAtDesc(userId, priority);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", notificationRepository.countByUserId(userId));
        stats.put("unread", notificationRepository.countUnreadByUserId(userId));
        stats.put("starred", notificationRepository.countStarredByUserId(userId));
        stats.put("archived", notificationRepository.countArchivedByUserId(userId));
        stats.put("urgent", notificationRepository.countUrgentByUserId(userId));

        // Type counts
        Map<String, Long> typeCounts = new HashMap<>();
        List<Object[]> rawTypeCounts = notificationRepository.countByTypeForUser(userId);
        for (Object[] row : rawTypeCounts) {
            String type = (String) row[0];
            Long count = (Long) row[1];
            if (type != null) typeCounts.put(type, count);
        }
        stats.put("typeCounts", typeCounts);
        return stats;
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    public Optional<Notification> markAsRead(Long notificationId) {
        return updateNotification(notificationId, n -> n.setIsRead(true));
    }

    public Optional<Notification> toggleStar(Long notificationId) {
        return updateNotification(notificationId, n -> n.setIsStarred(!n.getIsStarred()));
    }

    public Optional<Notification> archiveNotification(Long notificationId) {
        return updateNotification(notificationId, n -> {
            n.setIsArchived(true);
            n.setIsRead(true);
        });
    }

    public Optional<Notification> unarchiveNotification(Long notificationId) {
        return updateNotification(notificationId, n -> n.setIsArchived(false));
    }

    public boolean deleteNotification(Long notificationId) {
        if (notificationRepository.existsById(notificationId)) {
            notificationRepository.deleteById(notificationId);
            return true;
        }
        return false;
    }

    @Transactional
    public void performBulkAction(String action, List<Long> ids) {
        List<Notification> notifications = notificationRepository.findAllById(ids);
        for (Notification n : notifications) {
            switch (action) {
                case "read":
                    n.setIsRead(true);
                    break;
                case "unread":
                    n.setIsRead(false);
                    break;
                case "star":
                    n.setIsStarred(true);
                    break;
                case "unstar":
                    n.setIsStarred(false);
                    break;
                case "archive":
                    n.setIsArchived(true);
                    n.setIsRead(true);
                    break;
                case "unarchive":
                    n.setIsArchived(false);
                    break;
                case "delete":
                    notificationRepository.delete(n);
                    continue;
            }
            notificationRepository.save(n);
        }
    }

    private Optional<Notification> updateNotification(Long id, java.util.function.Consumer<Notification> updater) {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            updater.accept(notification);
            return Optional.of(notificationRepository.save(notification));
        }
        return Optional.empty();
    }
}
