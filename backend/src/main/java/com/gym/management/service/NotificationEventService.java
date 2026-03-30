package com.gym.management.service;

import com.gym.management.model.Notification;
import com.gym.management.model.User;
import com.gym.management.repository.NotificationRepository;
import com.gym.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for creating notifications triggered by real gym events.
 * Listens to service events and generates relevant notifications for users.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationEventService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Create notification for gym owner when member joins
     */
    @Transactional
    public void notifyNewMemberSignup(User member) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "New member joined: %s (%s). Their account is ready for membership assignment.",
                member.getFullName(), member.getEmail()
            );

            createNotification(owner, 
                "New Member Signup - " + member.getFullName(),
                message,
                "MEMBER", "normal",
                String.format("{\"memberId\":%d,\"memberName\":\"%s\",\"email\":\"%s\"}", 
                    member.getUserId(), member.getFullName(), member.getEmail()),
                "/members?search=" + member.getFullName()
            );

            log.info("Created notification for new member signup: {}", member.getFullName());
        } catch (Exception e) {
            log.warn("Failed to create new member signup notification: {}", e.getMessage());
        }
    }

    /**
     * Create notification for gym owner when membership is purchased
     */
    @Transactional
    public void notifyMembershipPurchase(User member, String planName, Double amount) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "%s purchased %s membership for Rs. %.2f. Membership is now ACTIVE.",
                member.getFullName(), planName, amount
            );

            createNotification(owner,
                "Membership Purchase - " + member.getFullName(),
                message,
                "MEMBERSHIP", "normal",
                String.format("{\"memberId\":%d,\"plan\":\"%s\",\"amount\":%.2f}", 
                    member.getUserId(), planName, amount),
                "/members?search=" + member.getFullName()
            );

            log.info("Created notification for membership purchase: {} - {}", member.getFullName(), planName);
        } catch (Exception e) {
            log.warn("Failed to create membership purchase notification: {}", e.getMessage());
        }
    }

    /**
     * Create notification for gym owner when payment is received
     */
    @Transactional
    public void notifyPaymentReceived(User member, Double amount, String planName) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "Payment of Rs. %.2f received from %s for %s membership. Transaction successful.",
                amount, member.getFullName(), planName
            );

            createNotification(owner,
                "Payment Received - " + member.getFullName(),
                message,
                "PAYMENT", "normal",
                String.format("{\"memberId\":%d,\"amount\":%.2f,\"plan\":\"%s\",\"status\":\"completed\"}", 
                    member.getUserId(), amount, planName),
                "/financials"
            );

            log.info("Created notification for payment received: {} - Rs. {}", member.getFullName(), amount);
        } catch (Exception e) {
            log.warn("Failed to create payment received notification: {}", e.getMessage());
        }
    }

    /**
     * Create notification for gym owner when payment fails
     */
    @Transactional
    public void notifyPaymentFailed(User member, Double amount, String reason) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "⚠️ Payment of Rs. %.2f from %s failed. Reason: %s. Member may need follow-up.",
                amount, member.getFullName(), reason
            );

            createNotification(owner,
                "Payment Failed - " + member.getFullName(),
                message,
                "PAYMENT", "high",
                String.format("{\"memberId\":%d,\"amount\":%.2f,\"reason\":\"%s\",\"status\":\"failed\"}", 
                    member.getUserId(), amount, reason),
                "/members?search=" + member.getFullName()
            );

            log.info("Created notification for payment failed: {} - {}", member.getFullName(), reason);
        } catch (Exception e) {
            log.warn("Failed to create payment failed notification: {}", e.getMessage());
        }
    }

    /**
     * Create notification for gym owner when PT session is booked
     */
    @Transactional
    public void notifyPTSessionBooked(User member, User trainer, LocalDateTime sessionDate) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "%s booked a PT session with %s on %s. Trainer will receive assignment notification.",
                member.getFullName(), trainer.getFullName(), sessionDate.toLocalDate()
            );

            createNotification(owner,
                "PT Session Booked - " + member.getFullName(),
                message,
                "BOOKING", "normal",
                String.format("{\"memberId\":%d,\"trainerId\":%d,\"sessionDate\":\"%s\"}", 
                    member.getUserId(), trainer.getUserId(), sessionDate),
                "/pt-sessions"
            );

            log.info("Created notification for PT session booked: {} with {}", member.getFullName(), trainer.getFullName());
        } catch (Exception e) {
            log.warn("Failed to create PT session booking notification: {}", e.getMessage());
        }
    }

    /**
     * Create notification for gym owner when class is fully booked
     */
    @Transactional
    public void notifyClassFullCapacity(String className, User trainer) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "Class '%s' by %s has reached full capacity. Consider adding another session.",
                className, trainer.getFullName()
            );

            createNotification(owner,
                "Class Full - " + className,
                message,
                "BOOKING", "high",
                String.format("{\"className\":\"%s\",\"trainer\":\"%s\",\"status\":\"full_capacity\"}", 
                    className, trainer.getFullName()),
                "/classes"
            );

            log.info("Created notification for class full capacity: {}", className);
        } catch (Exception e) {
            log.warn("Failed to create class full capacity notification: {}", e.getMessage());
        }
    }

    /**
     * Create notification for gym owner when trainer leaves applied
     */
    @Transactional
    public void notifyTrainerLeaveRequest(User trainer, LocalDateTime fromDate, LocalDateTime toDate, String reason) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "%s has applied for leave from %s to %s. Reason: %s. Please review and approve/deny in staff settings.",
                trainer.getFullName(), fromDate.toLocalDate(), toDate.toLocalDate(), reason
            );

            createNotification(owner,
                "Trainer Leave Request - " + trainer.getFullName(),
                message,
                "TRAINER", "high",
                String.format("{\"trainerId\":%d,\"fromDate\":\"%s\",\"toDate\":\"%s\",\"reason\":\"%s\"}", 
                    trainer.getUserId(), fromDate.toLocalDate(), toDate.toLocalDate(), reason),
                "/staff"
            );

            log.info("Created notification for trainer leave request: {}", trainer.getFullName());
        } catch (Exception e) {
            log.warn("Failed to create trainer leave request notification: {}", e.getMessage());
        }
    }

    /**
     * Create notification for gym owner on low attendance alert
     */
    @Transactional
    public void notifyLowAttendance(String metric, int count, String period) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "⚠️ Low attendance alert: Only %d members attended in the last %s. " +
                "Consider running promotions or engagement campaigns to boost participation.",
                count, period
            );

            createNotification(owner,
                "Low Attendance Alert",
                message,
                "ALERT", "high",
                String.format("{\"metric\":\"%s\",\"count\":%d,\"period\":\"%s\"}", metric, count, period),
                "/members"
            );

            log.info("Created notification for low attendance: {} in {}", count, period);
        } catch (Exception e) {
            log.warn("Failed to create low attendance notification: {}", e.getMessage());
        }
    }

    /**
     * Generic method to create notification
     */
    @Transactional
    public Notification createNotification(
            User user,
            String title,
            String message,
            String type,
            String priority,
            String metaData,
            String link
    ) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setPriority(priority);
        notification.setMetaData(metaData);
        notification.setLink(link);
        notification.setIsRead(false);
        notification.setIsStarred(false);
        notification.setIsArchived(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    /**
     * Create notification for gym owner when new trainer joins
     */
    @Transactional
    public void notifyNewTrainerSignup(User trainer) {
        try {
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();
            String message = String.format(
                "New trainer joined: %s (%s). Assign their certifications and availability in Staff settings.",
                trainer.getFullName(), trainer.getEmail()
            );

            createNotification(owner,
                "New Trainer Added - " + trainer.getFullName(),
                message,
                "TRAINER", "normal",
                "{\"trainerId\":" + trainer.getUserId() + ",\"name\":\"" + trainer.getFullName() + "\"}",
                "/staff"
            );

            log.info("Created notification for new trainer signup: {}", trainer.getFullName());
        } catch (Exception e) {
            log.warn("Failed to create new trainer signup notification: {}", e.getMessage());
        }
    }
}
