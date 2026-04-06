package com.gym.subscription.service;

import com.gym.subscription.entity.SubscriptionNotification;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.enums.NotificationType;
import com.gym.subscription.repository.SubscriptionNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SubscriptionNotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@gymapp.com}")
    private String fromEmail;

    @Value("${app.base.url:http://localhost:8080}")
    private String appBaseUrl;

    @Async
    public void sendTrialStartedNotification(UserSubscription subscription) {
        String subject = "Welcome! Your " + subscription.getPlan().getDisplayName() + " Trial has Started";
        String content = buildTrialStartedContent(subscription);
        sendEmail(subscription, NotificationType.TRIAL_STARTED, subject, content);
    }

    @Async
    public void sendTrialExpiringNotification(UserSubscription subscription, int daysRemaining) {
        String subject = "Action Required: Your " + subscription.getPlan().getDisplayName() + " Trial Expires in " + daysRemaining + " Days";
        String content = buildTrialExpiringContent(subscription, daysRemaining);
        sendEmail(subscription, NotificationType.TRIAL_EXPIRING, subject, content);
    }

    @Async
    public void sendTrialExpiredNotification(UserSubscription subscription) {
        String subject = "Your Trial has Expired - Choose Your Plan";
        String content = buildTrialExpiredContent(subscription);
        sendEmail(subscription, NotificationType.TRIAL_EXPIRED, subject, content);
    }

    @Async
    public void sendSubscriptionActivatedNotification(UserSubscription subscription) {
        String subject = "Welcome to " + subscription.getPlan().getDisplayName() + "!";
        String content = buildSubscriptionActivatedContent(subscription);
        sendEmail(subscription, NotificationType.SUBSCRIPTION_CREATED, subject, content);
    }

    @Async
    public void sendRenewalNotification(UserSubscription subscription) {
        String subject = "Your Subscription has been Renewed";
        String content = buildRenewalContent(subscription);
        sendEmail(subscription, NotificationType.SUBSCRIPTION_RENEWED, subject, content);
    }

    @Async
    public void sendCancellationNotification(UserSubscription subscription, boolean immediate) {
        String subject = immediate
                ? "Your Subscription has been Cancelled"
                : "Your Subscription will be Cancelled at Period End";
        String content = buildCancellationContent(subscription, immediate);
        sendEmail(subscription, NotificationType.SUBSCRIPTION_CANCELLED, subject, content);
    }

    @Async
    public void sendReactivationNotification(UserSubscription subscription) {
        String subject = "Great News! Your Subscription has been Reactivated";
        String content = buildReactivationContent(subscription);
        sendEmail(subscription, NotificationType.SUBSCRIPTION_RENEWED, subject, content);
    }

    @Async
    public void sendExpiredNotification(UserSubscription subscription) {
        String subject = "Your Subscription has Expired";
        String content = buildExpiredContent(subscription);
        sendEmail(subscription, NotificationType.SUBSCRIPTION_EXPIRED, subject, content);
    }

    @Async
    public void sendGracePeriodNotification(UserSubscription subscription) {
        String subject = "Urgent: Your Subscription is Past Due";
        String content = buildGracePeriodContent(subscription);
        sendEmail(subscription, NotificationType.GRACE_PERIOD_STARTED, subject, content);
    }

    @Async
    public void sendUpgradeNotification(UserSubscription subscription,
                                       com.gym.subscription.entity.SubscriptionPlan oldPlan,
                                       com.gym.subscription.entity.SubscriptionPlan newPlan) {
        String subject = "Congratulations! You've Upgraded to " + newPlan.getDisplayName();
        String content = buildUpgradeContent(subscription, oldPlan, newPlan);
        sendEmail(subscription, NotificationType.SUBSCRIPTION_UPGRADED, subject, content);
    }

    @Async
    public void sendDowngradeNotification(UserSubscription subscription,
                                        com.gym.subscription.entity.SubscriptionPlan oldPlan,
                                        com.gym.subscription.entity.SubscriptionPlan newPlan) {
        String subject = "Your Subscription has been Changed to " + newPlan.getDisplayName();
        String content = buildDowngradeContent(subscription, oldPlan, newPlan);
        sendEmail(subscription, NotificationType.SUBSCRIPTION_DOWNGRADED, subject, content);
    }

    @Async
    public void sendPaymentFailedNotification(UserSubscription subscription) {
        String subject = "Payment Failed - Action Required";
        String content = buildPaymentFailedContent(subscription);
        sendEmail(subscription, NotificationType.PAYMENT_FAILED, subject, content);
    }

    @Async
    public void sendPaymentRecoveredNotification(UserSubscription subscription) {
        String subject = "Payment Successful - You're All Set!";
        String content = buildPaymentRecoveredContent(subscription);
        sendEmail(subscription, NotificationType.PAYMENT_RECOVERED, subject, content);
    }

    private void sendEmail(UserSubscription subscription, NotificationType type, String subject, String content) {
        try {
            SubscriptionNotification notification = SubscriptionNotification.builder()
                    .user(subscription.getUser())
                    .subscription(subscription)
                    .notificationType(type.getValue())
                    .channel("email")
                    .subject(subject)
                    .content(content)
                    .sentAt(LocalDateTime.now())
                    .metadata(new HashMap<>())
                    .build();

            notificationRepository.save(notification);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(subscription.getUser().getEmail());
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);

            notification.setDeliveredAt(LocalDateTime.now());
            notificationRepository.save(notification);

            log.info("Sent {} notification to user: {}", type, subscription.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send {} notification to user: {}: {}",
                    type, subscription.getUser().getEmail(), e.getMessage());

            try {
                SubscriptionNotification notification = SubscriptionNotification.builder()
                        .user(subscription.getUser())
                        .subscription(subscription)
                        .notificationType(type.getValue())
                        .channel("email")
                        .subject(subject)
                        .content(content)
                        .failedAt(LocalDateTime.now())
                        .failureReason(e.getMessage())
                        .build();
                notificationRepository.save(notification);
            } catch (Exception ex) {
                log.error("Failed to save failed notification: {}", ex.getMessage());
            }
        }
    }

    private String buildTrialStartedContent(UserSubscription subscription) {
        return String.format("""
            Welcome to %s!

            Your %d-day trial has started. Here's what you get:

            • Access to all %s features
            • Up to %d devices
            • Valid until: %s

            After your trial ends, you'll be moved to our free tier unless you upgrade.

            Upgrade now: %s/subscribe?plan=%s

            Questions? Reply to this email.
            """,
            subscription.getPlan().getDisplayName(),
            subscription.getPlan().getTrialDays(),
            subscription.getPlan().getDisplayName(),
            subscription.getPlan().getMaxDevices(),
            subscription.getTrialEnd(),
            appBaseUrl,
            subscription.getPlan().getName()
        );
    }

    private String buildTrialExpiringContent(UserSubscription subscription, int daysRemaining) {
        return String.format("""
            Your %s trial expires in %d days!

            Don't lose access to:
            • %s
            • %d device connections
            • Priority support

            Upgrade now to keep your data and settings:
            %s/subscribe?plan=%s

            After %s, you'll be moved to our free tier.
            """,
            subscription.getPlan().getDisplayName(),
            daysRemaining,
            subscription.getPlan().getDescription(),
            subscription.getPlan().getMaxDevices(),
            appBaseUrl,
            subscription.getPlan().getName(),
            subscription.getTrialEnd()
        );
    }

    private String buildTrialExpiredContent(UserSubscription subscription) {
        return String.format("""
            Your %s trial has expired.

            You've been moved to our free tier. You can still access basic features,
            but premium features are now locked.

            Want to continue with %s?
            Upgrade here: %s/subscribe

            Thank you for trying %s!
            """,
            subscription.getPlan().getDisplayName(),
            subscription.getPlan().getDisplayName(),
            appBaseUrl,
            subscription.getPlan().getDisplayName()
        );
    }

    private String buildSubscriptionActivatedContent(UserSubscription subscription) {
        return String.format("""
            Welcome to %s!

            Your subscription is now active. Here's what's included:

            • %s
            • Up to %d devices
            • Valid until: %s

            Manage your subscription: %s/dashboard/billing

            Thank you for subscribing!
            """,
            subscription.getPlan().getDisplayName(),
            subscription.getPlan().getDescription(),
            subscription.getPlan().getMaxDevices(),
            subscription.getCurrentPeriodEnd(),
            appBaseUrl
        );
    }

    private String buildRenewalContent(UserSubscription subscription) {
        return String.format("""
            Your %s subscription has been renewed!

            • Amount: %s %s
            • Next renewal: %s
            • Billing cycle: %s

            Thank you for your continued support!
            """,
            subscription.getPlan().getDisplayName(),
            subscription.getPlan().getPriceMonthly(),
            subscription.getPlan().getCurrency(),
            subscription.getCurrentPeriodEnd(),
            subscription.getBillingCycle()
        );
    }

    private String buildCancellationContent(UserSubscription subscription, boolean immediate) {
        if (immediate) {
            return String.format("""
                Your %s subscription has been cancelled.

                You've lost access to premium features. Your license has been revoked.

                Reactivate anytime: %s/subscribe

                Thank you for using our service.
                """,
                subscription.getPlan().getDisplayName(),
                appBaseUrl
            );
        } else {
            return String.format("""
                Your %s subscription will be cancelled on %s.

                You still have access until then. After that, you'll be moved to our free tier.

                Changed your mind?
                Reactivate here: %s/dashboard/billing

                You'll not be charged again after %s.
                """,
                subscription.getPlan().getDisplayName(),
                subscription.getCurrentPeriodEnd(),
                appBaseUrl,
                subscription.getCurrentPeriodEnd()
            );
        }
    }

    private String buildReactivationContent(UserSubscription subscription) {
        return String.format("""
            Great news! Your %s subscription has been reactivated.

            Your premium features are back. Valid until: %s

            Keep enjoying:
            • %s
            • %d devices
            • Priority support

            Questions? We're here to help!
            """,
            subscription.getPlan().getDisplayName(),
            subscription.getCurrentPeriodEnd(),
            subscription.getPlan().getDescription(),
            subscription.getPlan().getMaxDevices()
        );
    }

    private String buildExpiredContent(UserSubscription subscription) {
        return String.format("""
            Your %s subscription has expired.

            Your premium features have been locked. Don't worry, your data is safe.

            Resubscribe to regain access:
            %s/subscribe

            Special offer: Use code WELCOME10 for 10%% off your first month!
            """,
            subscription.getPlan().getDisplayName(),
            appBaseUrl
        );
    }

    private String buildGracePeriodContent(UserSubscription subscription) {
        return String.format("""
            URGENT: Your subscription is past due!

            You've entered a %d-day grace period. Your premium features are still
            accessible, but you must update your payment method to avoid service interruption.

            Update payment: %s/dashboard/billing

            After %s, your account will be moved to the free tier.
            """,
            subscription.getPlan().getGracePeriodDays(),
            appBaseUrl,
            subscription.getGracePeriodEnd()
        );
    }

    private String buildUpgradeContent(UserSubscription subscription,
                                      com.gym.subscription.entity.SubscriptionPlan oldPlan,
                                      com.gym.subscription.entity.SubscriptionPlan newPlan) {
        return String.format("""
            Congratulations on upgrading to %s!

            You now have access to:
            • %s
            • Up to %d devices
            • Valid until: %s

            What's new in %s:
            %s

            Thank you for your support!
            """,
            newPlan.getDisplayName(),
            newPlan.getDescription(),
            newPlan.getMaxDevices(),
            subscription.getCurrentPeriodEnd(),
            newPlan.getDisplayName(),
            newPlan.getDescription()
        );
    }

    private String buildDowngradeContent(UserSubscription subscription,
                                        com.gym.subscription.entity.SubscriptionPlan oldPlan,
                                        com.gym.subscription.entity.SubscriptionPlan newPlan) {
        return String.format("""
            Your subscription has been changed to %s.

            You now have access to:
            • %s
            • Up to %d devices

            Don't worry - you can upgrade anytime to unlock more features.

            Questions about your new plan? Reply to this email.
            """,
            newPlan.getDisplayName(),
            newPlan.getDescription(),
            newPlan.getMaxDevices()
        );
    }

    private String buildPaymentFailedContent(UserSubscription subscription) {
        return String.format("""
            Payment Failed - Action Required

            We couldn't process your payment for your %s subscription.

            Please update your payment method immediately to avoid service interruption:
            %s/dashboard/billing

            Your account will enter a grace period after the first failed attempt.

            Questions? Contact support.
            """,
            subscription.getPlan().getDisplayName(),
            appBaseUrl
        );
    }

    private String buildPaymentRecoveredContent(UserSubscription subscription) {
        return String.format("""
            Payment Successful!

            Great news - your payment was successfully processed. Your %s
            subscription is active until %s.

            Thank you for your continued support!

            Manage your subscription: %s/dashboard/billing
            """,
            subscription.getPlan().getDisplayName(),
            subscription.getCurrentPeriodEnd(),
            appBaseUrl
        );
    }
}
