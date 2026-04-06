package com.gym.subscription.scheduler;

import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.entity.SubscriptionNotification;
import com.gym.subscription.enums.NotificationType;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.repository.SubscriptionNotificationRepository;
import com.gym.subscription.repository.UserSubscriptionRepository;
import com.gym.subscription.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionScheduler {

    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionNotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void processExpiredSubscriptions() {
        log.info("Running expired subscriptions check...");

        List<UserSubscription> expired = subscriptionRepository.findExpiredSubscriptions(
                SubscriptionStatus.ACTIVE, LocalDateTime.now());

        for (UserSubscription subscription : expired) {
            if (subscription.getCancelAtPeriodEnd()) {
                subscription.setStatus(SubscriptionStatus.CANCELLED);
                subscription.setCancelledAt(LocalDateTime.now());
                subscriptionRepository.save(subscription);
                notificationService.sendCancellationNotification(subscription, false);
                log.info("Subscription {} cancelled at period end", subscription.getId());
            } else if (subscription.getGracePeriodEnd() != null &&
                       LocalDateTime.now().isBefore(subscription.getGracePeriodEnd())) {
                subscription.setStatus(SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(subscription);
                notificationService.sendGracePeriodNotification(subscription);
                log.info("Subscription {} entered grace period", subscription.getId());
            } else {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
                notificationService.sendExpiredNotification(subscription);
                log.info("Subscription {} expired", subscription.getId());
            }
        }
    }

    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void sendExpiryReminders() {
        log.info("Sending expiry reminders...");

        List<UserSubscription> activeSubscriptions = subscriptionRepository.findByStatus(SubscriptionStatus.ACTIVE);

        for (UserSubscription subscription : activeSubscriptions) {
            long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDateTime.now(), subscription.getCurrentPeriodEnd());

            if (daysUntilExpiry == 7 || daysUntilExpiry == 3 || daysUntilExpiry == 1) {
                if (!hasRecentlySent(subscription, NotificationType.TRIAL_EXPIRING.getValue())) {
                    notificationService.sendTrialExpiringNotification(subscription, (int) daysUntilExpiry);
                    log.info("Sent {} day expiry reminder for subscription {}", daysUntilExpiry, subscription.getId());
                }
            }

            if (daysUntilExpiry == 0) {
                if (!hasRecentlySent(subscription, NotificationType.TRIAL_EXPIRED.getValue())) {
                    notificationService.sendTrialExpiredNotification(subscription);
                    log.info("Sent expiry notification for subscription {}", subscription.getId());
                }
            }
        }
    }

    @Scheduled(cron = "0 0 10 * * *")
    @Transactional
    public void sendGracePeriodReminders() {
        log.info("Sending grace period reminders...");

        List<UserSubscription> pastDueSubscriptions = subscriptionRepository.findByStatus(SubscriptionStatus.PAST_DUE);

        for (UserSubscription subscription : pastDueSubscriptions) {
            if (subscription.isInGracePeriod()) {
                if (!hasRecentlySent(subscription, NotificationType.GRACE_PERIOD_STARTED.getValue())) {
                    notificationService.sendGracePeriodNotification(subscription);
                    log.info("Sent grace period reminder for subscription {}", subscription.getId());
                }
            }
        }
    }

    @Scheduled(cron = "0 0 */6 * * *")
    @Transactional
    public void processSubscriptionsPastGrace() {
        log.info("Processing subscriptions past grace period...");

        List<UserSubscription> pastGrace = subscriptionRepository.findSubscriptionsPastGracePeriod(LocalDateTime.now());

        for (UserSubscription subscription : pastGrace) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
            notificationService.sendExpiredNotification(subscription);
            log.info("Subscription {} moved to expired after grace period", subscription.getId());
        }
    }

    private boolean hasRecentlySent(UserSubscription subscription, String notificationType) {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        return notificationRepository.existsByNotificationTypeAndUserIdAndSubscriptionIdAndCreatedAtAfter(
                notificationType,
                subscription.getUser().getId(),
                subscription.getId(),
                yesterday
        );
    }
}
