package com.gym.management.scheduler;

import com.gym.management.model.Membership;
import com.gym.management.model.Transaction;
import com.gym.management.model.User;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.TransactionRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.service.NotificationEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

/**
 * Scheduled tasks to monitor gym events and generate notifications.
 * Runs periodically to check for conditions that warrant owner notifications.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationScheduler {

    private final NotificationEventService notificationEventService;
    private final MembershipRepository membershipRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    /**
     * Check for memberships expiring within 7 days
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void checkExpiringMemberships() {
        try {
            log.info("Running scheduled task: Check expiring memberships");
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime sevenDaysFromNow = now.plusDays(7);
            
            // Get all active memberships expiring in next 7 days
            List<Membership> expiringMemberships = membershipRepository
                .findByStatusAndEndDateBetweenOrderByEndDateAsc(
                    "ACTIVE",
                    now,
                    sevenDaysFromNow
                );

            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) {
                log.warn("No OWNER found for expiring membership notifications");
                return;
            }

            User owner = ownerOpt.get();

            for (Membership membership : expiringMemberships) {
                User member = membership.getUser();
                long daysLeft = java.time.temporal.ChronoUnit.DAYS
                    .between(now.toLocalDate(), membership.getEndDate());
                
                String message = String.format(
                    "🔔 %s's membership expires in %d days (%s). " +
                    "Consider sending renewal reminder or offering renewal incentive.",
                    member.getFullName(), daysLeft, membership.getEndDate()
                );

                notificationEventService.createNotification(
                    owner,
                    "Membership Expiring Soon - " + member.getFullName(),
                    message,
                    "MEMBERSHIP",
                    daysLeft <= 3 ? "high" : "normal",
                    String.format("{\"memberId\":%d,\"expiresAt\":\"%s\",\"daysLeft\":%d}", 
                        member.getUserId(), membership.getEndDate(), daysLeft),
                    "/members?search=" + member.getFullName()
                );
            }

            log.info("Checked {} expiring memberships", expiringMemberships.size());
        } catch (Exception e) {
            log.error("Error in checkExpiringMemberships task", e);
        }
    }

    /**
     * Check for pending/failed payments
     * Runs daily at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void checkPendingPayments() {
        try {
            log.info("Running scheduled task: Check pending payments");

            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            
            // Get all pending/failed transactions from last 30 days
            List<Transaction> pendingTransactions = transactionRepository
                .findByStatusAndDateTimeBetweenOrderByDateTimeDesc(
                    "Pending",
                    thirtyDaysAgo,
                    LocalDateTime.now()
                );

            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();

            for (Transaction transaction : pendingTransactions) {
                long daysOld = java.time.temporal.ChronoUnit.DAYS
                    .between(transaction.getDateTime().toLocalDate(), LocalDate.now());
                
                String message = String.format(
                    "⚠️ Payment of Rs. %.2f is PENDING for %d days. " +
                    "Consider follow-up or manual payment verification.",
                    transaction.getAmount(), daysOld
                );

                notificationEventService.createNotification(
                    owner,
                    "Pending Payment - Rs. " + transaction.getAmount(),
                    message,
                    "PAYMENT",
                    daysOld > 7 ? "urgent" : "high",
                    String.format("{\"amount\":%.2f,\"status\":\"pending\",\"daysOld\":%d,\"date\":\"%s\"}", 
                        transaction.getAmount(), daysOld, transaction.getDateTime()),
                    "/financials"
                );
            }

            log.info("Checked {} pending payments", pendingTransactions.size());
        } catch (Exception e) {
            log.error("Error in checkPendingPayments task", e);
        }
    }

    /**
     * Generate daily revenue summary for owner
     * Runs daily at 8:00 PM
     */
    @Scheduled(cron = "0 0 20 * * ?")
    public void generateDailyRevenueSummary() {
        try {
            log.info("Running scheduled task: Generate daily revenue summary");

            LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            // Get today's revenue
            Object dailyRevenueObj = transactionRepository
                .sumAmountByStatusAndDateRange(
                    "Completed",
                    startOfDay,
                    endOfDay,
                    null
                );

            Double dailyRevenue = dailyRevenueObj instanceof BigDecimal ? ((java.math.BigDecimal)dailyRevenueObj).doubleValue() : (Double)dailyRevenueObj;
            if (dailyRevenue == null || dailyRevenue == 0) {
                return; // Don't create notification if no revenue
            }

            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();

            String message = String.format(
                "💰 Today's Revenue: Rs. %.2f. Check the Financials dashboard for detailed breakdown by membership type and add-ons.",
                dailyRevenue
            );

            notificationEventService.createNotification(
                owner,
                "Daily Revenue Report",
                message,
                "REPORT",
                "normal",
                String.format("{\"amount\":%.2f,\"date\":\"%s\"}", dailyRevenue, LocalDate.now()),
                "/financials"
            );

            log.info("Generated daily revenue summary: Rs. {}", dailyRevenue);
        } catch (Exception e) {
            log.error("Error in generateDailyRevenueSummary task", e);
        }
    }

    /**
     * Generate weekly attendance report
     * Runs every Monday at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 ? * MON")
    public void generateWeeklyAttendanceReport() {
        try {
            log.info("Running scheduled task: Generate weekly attendance report");

            // This would need AttendanceRepository queries
            // For now, just log
            Optional<User> ownerOpt = userRepository.findByRoleName("OWNER").stream().findFirst();
            if (ownerOpt.isEmpty()) return;

            User owner = ownerOpt.get();

            notificationEventService.createNotification(
                owner,
                "Weekly Attendance Report",
                "Check the Members section for attendance trends, peak hours, and inactive member insights.",
                "REPORT",
                "normal",
                "{\"period\":\"weekly\"}",
                "/members"
            );

            log.info("Generated weekly attendance report");
        } catch (Exception e) {
            log.error("Error in generateWeeklyAttendanceReport task", e);
        }
    }

    /**
     * Clean up old archived notifications (keep 90 days)
     * Runs daily at 4:00 AM
     */
    @Scheduled(cron = "0 0 4 * * ?")
    public void cleanupOldNotifications() {
        try {
            log.info("Running scheduled task: Cleanup old notifications");

            LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);

            // Delete archived notifications older than 90 days
            // This would require a custom repository method
            log.info("Cleanup task executed");
        } catch (Exception e) {
            log.error("Error in cleanupOldNotifications task", e);
        }
    }
}
