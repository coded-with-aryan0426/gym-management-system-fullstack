package com.gym.management.service;

import com.gym.management.model.Notification;
import com.gym.management.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId, String filter) {
        switch (filter) {
            case "starred":
                return notificationRepository.findByUserUserIdAndIsStarredTrueOrderByCreatedAtDesc(userId);
            case "archived":
                return notificationRepository.findByUserUserIdAndIsArchivedTrueOrderByCreatedAtDesc(userId);
            case "all":
            default:
                // "all" typically excludes archived in main views unless explicitly requested,
                // but checking the repo method: findByUserUserIdAndIsArchivedFalse...
                return notificationRepository.findByUserUserIdAndIsArchivedFalseOrderByCreatedAtDesc(userId);
        }
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
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
                case "archive":
                    n.setIsArchived(true);
                    n.setIsRead(true);
                    break;
                case "delete":
                    notificationRepository.delete(n);
                    continue; // Skip save
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
