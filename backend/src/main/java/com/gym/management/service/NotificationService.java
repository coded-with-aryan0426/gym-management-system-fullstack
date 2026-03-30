package com.gym.management.service;

import com.gym.management.model.Membership;
import com.gym.management.model.Notification;
import com.gym.management.model.User;
import com.gym.management.repository.AlertRepository;
import com.gym.management.repository.EquipmentRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.NotificationRepository;
import com.gym.management.repository.TransactionRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Transactional
    public List<Notification> getUserNotifications(Long userId, String filter) {
        ensureOwnerNotificationFeed(userId);
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

    @Transactional
    public List<Notification> getByType(Long userId, String type) {
        ensureOwnerNotificationFeed(userId);
        return notificationRepository.findByUserUserIdAndTypeAndIsArchivedFalseOrderByCreatedAtDesc(userId, type);
    }

    @Transactional
    public List<Notification> getByPriority(Long userId, String priority) {
        ensureOwnerNotificationFeed(userId);
        return notificationRepository.findByUserUserIdAndPriorityAndIsArchivedFalseOrderByCreatedAtDesc(userId, priority);
    }

    @Transactional
    public Long getUnreadCount(Long userId) {
        ensureOwnerNotificationFeed(userId);
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public Map<String, Object> getStats(Long userId) {
        ensureOwnerNotificationFeed(userId);
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

    private void ensureOwnerNotificationFeed(Long userId) {
        if (userId == null) return;
        if (notificationRepository.countByUserId(userId) > 0) return;

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return;
        User user = userOpt.get();

        boolean isOwner = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(r -> r != null && "OWNER".equalsIgnoreCase(r.getRoleName()));
        if (!isOwner) return;

        List<Notification> generated = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        List<Membership> expiring = membershipRepository.findExpiringMemberships(LocalDate.now(), LocalDate.now().plusDays(7));
        if (!expiring.isEmpty()) {
            List<String> names = expiring.stream()
                    .map(Membership::getUser)
                    .filter(u -> u != null && u.getFullName() != null)
                    .map(User::getFullName)
                    .limit(3)
                    .collect(Collectors.toList());
            String preview = names.isEmpty() ? "members" : String.join(", ", names);
            String title = expiring.size() + " Memberships Expiring This Week";
            String message = "Expiring soon: " + preview + ". Reach out now to secure renewals and prevent churn.";
            generated.add(buildNotification(user, title, message, "MEMBERSHIP", "high", "/members", now.minusMinutes(8), "{\"expiringCount\":" + expiring.size() + "}"));
        }

        LocalDateTime startDate = now.minusDays(30);
        List<com.gym.management.model.Transaction> pending = transactionRepository.findPendingTransactions(startDate, now, null);
        if (!pending.isEmpty()) {
            BigDecimal amount = pending.stream()
                    .map(com.gym.management.model.Transaction::getAmount)
                    .filter(a -> a != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String priority = amount.compareTo(new BigDecimal("10000")) > 0 ? "urgent" : "high";
            String title = pending.size() + " Pending Payments Need Attention";
            String message = "Pending receivables in the last 30 days: ₹" + amount + ". Follow up to improve cash flow.";
            generated.add(buildNotification(user, title, message, "PAYMENT", priority, "/financials", now.minusMinutes(15), "{\"pendingCount\":" + pending.size() + ",\"pendingAmount\":\"" + amount + "\"}"));
        }

        List<User> allMembers = findUsersByRole("MEMBER");
        long newMembers = allMembers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(now.minusDays(7)))
                .count();
        if (newMembers > 0) {
            String title = newMembers + " New Member Signups This Week";
            String message = "Your gym added " + newMembers + " new members in the last 7 days. Keep onboarding and engagement high.";
            generated.add(buildNotification(user, title, message, "MEMBER", "normal", "/members", now.minusMinutes(25), "{\"newMembers\":" + newMembers + "}"));
        }

        List<User> allTrainers = findUsersByRole("TRAINER");
        long activeTrainers = allTrainers.stream()
                .filter(u -> u.getStatus() != null && !"DELETED".equalsIgnoreCase(u.getStatus()))
                .count();
        if (activeTrainers > 0) {
            String title = "Trainer Team Status Updated";
            String message = "You currently have " + activeTrainers + " active trainers. Review workloads and assignments for better class quality.";
            generated.add(buildNotification(user, title, message, "TRAINER", "low", "/trainers", now.minusMinutes(40), "{\"activeTrainers\":" + activeTrainers + "}"));
        }

        int overdueEquipment = equipmentRepository.findOverdueMaintenance() != null
                ? equipmentRepository.findOverdueMaintenance().size()
                : 0;
        if (overdueEquipment > 0) {
            String title = overdueEquipment + " Equipment Items Need Maintenance";
            String message = "Overdue maintenance detected for " + overdueEquipment + " equipment item(s). Schedule service to avoid downtime.";
            generated.add(buildNotification(user, title, message, "INVENTORY", "high", "/equipment", now.minusMinutes(55), "{\"overdueEquipment\":" + overdueEquipment + "}"));
        }

        Long unreadAlerts = alertRepository.countUnreadAlerts();
        if (unreadAlerts != null && unreadAlerts > 0) {
            String title = "Critical Alert Summary";
            String message = "There are " + unreadAlerts + " unread alert(s) requiring your attention.";
            generated.add(buildNotification(user, title, message, "ALERT", "urgent", "/dashboard", now.minusMinutes(70), "{\"unreadAlerts\":" + unreadAlerts + "}"));
        }

        generated.add(buildNotification(
                user,
                "System Update Digest",
                "Your dashboard now tracks payments, memberships, member growth, trainer operations, and maintenance alerts in real-time.",
                "SYSTEM",
                "normal",
                "/dashboard",
                now.minusMinutes(90),
                "{\"section\":\"owner_digest\"}"));

        if (generated.isEmpty()) {
            generated.add(buildNotification(
                    user,
                    "Welcome to Your Notification Center",
                    "This feed will show relevant gym events like renewals, payments, attendance trends, and operational alerts as activity occurs.",
                    "SYSTEM",
                    "normal",
                    "/dashboard",
                    now.minusMinutes(3),
                    "{\"seed\":\"welcome\"}"));
        }

        notificationRepository.saveAll(generated);
    }

    private List<User> findUsersByRole(String roleName) {
        Set<Long> seen = new java.util.HashSet<>();
        List<User> users = new ArrayList<>();
        List<String> roleCandidates = List.of(roleName, "ROLE_" + roleName);
        for (String role : roleCandidates) {
            List<User> found = userRepository.findByRoleName(role);
            if (found == null) continue;
            for (User u : found) {
                if (u != null && u.getUserId() != null && seen.add(u.getUserId())) {
                    users.add(u);
                }
            }
        }
        return users;
    }

    private Notification buildNotification(
            User user,
            String title,
            String message,
            String type,
            String priority,
            String link,
            LocalDateTime createdAt,
            String metaData) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setPriority(priority);
        n.setIsRead(false);
        n.setIsArchived(false);
        n.setIsStarred(false);
        n.setLink(link);
        n.setMetaData(metaData);
        n.setCreatedAt(createdAt);
        return n;
    }
}
