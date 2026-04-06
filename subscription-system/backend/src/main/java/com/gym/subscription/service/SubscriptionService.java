package com.gym.subscription.service;

import com.gym.subscription.dto.PlanDTO;
import com.gym.subscription.dto.SubscriptionDTO;
import com.gym.subscription.entity.*;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.exception.SubscriptionException;
import com.gym.subscription.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserRepository userRepository;
    private final LicenseService licenseService;
    private final SubscriptionChangeRepository changeRepository;
    private final NotificationService notificationService;

    public List<PlanDTO> getAllActivePlans() {
        return planRepository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toPlanDTO)
                .collect(Collectors.toList());
    }

    public PlanDTO getPlanById(String planId) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new SubscriptionException("Plan not found"));
        return toPlanDTO(plan);
    }

    public PlanDTO getPlanByName(String name) {
        SubscriptionPlan plan = planRepository.findByName(name)
                .orElseThrow(() -> new SubscriptionException("Plan not found"));
        return toPlanDTO(plan);
    }

    public SubscriptionDTO getSubscription(String userId) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        if (subscription == null) {
            return null;
        }

        return toSubscriptionDTO(subscription);
    }

    public SubscriptionDTO getActiveSubscription(String userId) {
        List<SubscriptionStatus> activeStatuses = List.of(
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.TRIALING,
                SubscriptionStatus.PAST_DUE
        );

        UserSubscription subscription = subscriptionRepository
                .findByUserIdAndStatusIn(userId, activeStatuses)
                .orElse(null);

        if (subscription == null) {
            return null;
        }

        return toSubscriptionDTO(subscription);
    }

    @Transactional
    public SubscriptionDTO createTrialSubscription(String userId, String planId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new SubscriptionException("User not found"));

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new SubscriptionException("Plan not found"));

        if (plan.getTierLevel() == 0) {
            throw new SubscriptionException("Cannot create trial for free plan");
        }

        if (subscriptionRepository.existsByUserIdAndStatusIn(userId,
                List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING))) {
            throw new SubscriptionException("User already has an active subscription");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime trialEnd = now.plusDays(plan.getTrialDays());
        LocalDateTime periodEnd = trialEnd.plusDays(plan.getGracePeriodDays());

        UserSubscription subscription = UserSubscription.builder()
                .user(user)
                .plan(plan)
                .status(SubscriptionStatus.TRIALING)
                .billingCycle("trial")
                .trialStart(now)
                .trialEnd(trialEnd)
                .gracePeriodEnd(periodEnd)
                .currentPeriodStart(now)
                .currentPeriodEnd(periodEnd)
                .autoRenew(true)
                .build();

        subscription = subscriptionRepository.save(subscription);

        recordChange(subscription, "trial_started", null, plan, null, SubscriptionStatus.TRIALING, "system");

        notificationService.sendTrialStartedNotification(subscription);

        log.info("Created trial subscription for user: {} with plan: {}", userId, plan.getName());
        return toSubscriptionDTO(subscription);
    }

    @Transactional
    public SubscriptionDTO activateSubscription(String userId, String gateway, String gatewaySubscriptionId) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (subscription.getStatus() != SubscriptionStatus.TRIALING) {
            throw new SubscriptionException("Subscription is not in trial status");
        }

        SubscriptionPlan plan = subscription.getPlan();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime periodStart = now;
        LocalDateTime periodEnd = calculatePeriodEnd(now, subscription.getBillingCycle());

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setGateway(gateway);
        subscription.setGatewaySubscriptionId(gatewaySubscriptionId);
        subscription.setTrialStart(null);
        subscription.setTrialEnd(null);
        subscription.setCurrentPeriodStart(periodStart);
        subscription.setCurrentPeriodEnd(periodEnd);

        subscription = subscriptionRepository.save(subscription);

        licenseService.generateLicenseKey(subscription.getUser(), subscription, plan);

        recordChange(subscription, "activated", null, plan, SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, gateway);

        notificationService.sendSubscriptionActivatedNotification(subscription);

        log.info("Activated subscription for user: {} with plan: {}", userId, plan.getName());
        return toSubscriptionDTO(subscription);
    }

    @Transactional
    public SubscriptionDTO upgradeSubscription(String userId, String newPlanId) {
        UserSubscription current = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (!current.isActive()) {
            throw new SubscriptionException("Cannot upgrade inactive subscription");
        }

        SubscriptionPlan newPlan = planRepository.findById(newPlanId)
                .orElseThrow(() -> new SubscriptionException("Plan not found"));

        SubscriptionPlan oldPlan = current.getPlan();

        if (newPlan.getTierLevel() <= oldPlan.getTierLevel()) {
            throw new SubscriptionException("New plan must be of higher tier for upgrade");
        }

        SubscriptionPlan previousPlan = current.getPlan();
        current.setPreviousPlan(previousPlan);
        current.setPlan(newPlan);
        current.setStatus(SubscriptionStatus.ACTIVE);
        current.setCurrentPeriodEnd(LocalDateTime.now());

        current = subscriptionRepository.save(current);

        licenseService.generateLicenseKey(current.getUser(), current, newPlan);

        recordChange(current, "upgraded", oldPlan, newPlan, SubscriptionStatus.ACTIVE, SubscriptionStatus.ACTIVE, "user");

        notificationService.sendUpgradeNotification(current, oldPlan, newPlan);

        log.info("User {} upgraded from {} to {}", userId, oldPlan.getName(), newPlan.getName());
        return toSubscriptionDTO(current);
    }

    @Transactional
    public SubscriptionDTO downgradeSubscription(String userId, String newPlanId) {
        UserSubscription current = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (!current.isActive()) {
            throw new SubscriptionException("Cannot downgrade inactive subscription");
        }

        SubscriptionPlan newPlan = planRepository.findById(newPlanId)
                .orElseThrow(() -> new SubscriptionException("Plan not found"));

        SubscriptionPlan oldPlan = current.getPlan();

        if (newPlan.getTierLevel() >= oldPlan.getTierLevel()) {
            throw new SubscriptionException("New plan must be of lower tier for downgrade");
        }

        SubscriptionPlan previousPlan = current.getPlan();
        current.setPreviousPlan(previousPlan);
        current.setPlan(newPlan);
        current.setStatus(SubscriptionStatus.ACTIVE);
        current.setCurrentPeriodEnd(LocalDateTime.now());

        current = subscriptionRepository.save(current);

        licenseService.generateLicenseKey(current.getUser(), current, newPlan);

        recordChange(current, "downgraded", oldPlan, newPlan, SubscriptionStatus.ACTIVE, SubscriptionStatus.ACTIVE, "user");

        notificationService.sendDowngradeNotification(current, oldPlan, newPlan);

        log.info("User {} downregulated from {} to {}", userId, oldPlan.getName(), newPlan.getName());
        return toSubscriptionDTO(current);
    }

    @Transactional
    public SubscriptionDTO cancelSubscription(String userId, boolean immediate) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new SubscriptionException("Subscription is already cancelled");
        }

        SubscriptionStatus oldStatus = subscription.getStatus();

        if (immediate) {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscription.setCancelledAt(LocalDateTime.now());
        } else {
            subscription.setCancelAtPeriodEnd(true);
        }

        subscription = subscriptionRepository.save(subscription);

        recordChange(subscription, "cancelled", subscription.getPlan(), subscription.getPlan(),
                oldStatus, subscription.getStatus(), "user");

        notificationService.sendCancellationNotification(subscription, immediate);

        log.info("Subscription cancelled for user: {}, immediate: {}", userId, immediate);
        return toSubscriptionDTO(subscription);
    }

    @Transactional
    public SubscriptionDTO reactivateSubscription(String userId) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (subscription.getStatus() != SubscriptionStatus.CANCELLED) {
            throw new SubscriptionException("Subscription is not cancelled");
        }

        if (!subscription.getCancelAtPeriodEnd()) {
            throw new SubscriptionException("Subscription was cancelled immediately, cannot reactivate");
        }

        subscription.setCancelAtPeriodEnd(false);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCancelledAt(null);

        subscription = subscriptionRepository.save(subscription);

        recordChange(subscription, "reactivated", subscription.getPlan(), subscription.getPlan(),
                SubscriptionStatus.CANCELLED, SubscriptionStatus.ACTIVE, "user");

        notificationService.sendReactivationNotification(subscription);

        log.info("Subscription reactivated for user: {}", userId);
        return toSubscriptionDTO(subscription);
    }

    @Transactional
    public void processExpiredSubscriptions() {
        List<UserSubscription> expired = subscriptionRepository.findExpiredSubscriptions(
                SubscriptionStatus.ACTIVE, LocalDateTime.now());

        for (UserSubscription subscription : expired) {
            if (subscription.getCancelAtPeriodEnd()) {
                subscription.setStatus(SubscriptionStatus.CANCELLED);
                subscription.setCancelledAt(LocalDateTime.now());
                recordChange(subscription, "expired", subscription.getPlan(), subscription.getPlan(),
                        SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED, "system");
                notificationService.sendExpiredNotification(subscription);
            } else if (subscription.getGracePeriodEnd() != null &&
                       LocalDateTime.now().isBefore(subscription.getGracePeriodEnd())) {
                subscription.setStatus(SubscriptionStatus.PAST_DUE);
                recordChange(subscription, "grace_period_started", subscription.getPlan(), subscription.getPlan(),
                        SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, "system");
                notificationService.sendGracePeriodNotification(subscription);
            } else {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                recordChange(subscription, "expired", subscription.getPlan(), subscription.getPlan(),
                        SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED, "system");
                notificationService.sendExpiredNotification(subscription);
            }
            subscriptionRepository.save(subscription);
        }

        List<UserSubscription> pastGrace = subscriptionRepository.findSubscriptionsPastGracePeriod(LocalDateTime.now());
        for (UserSubscription subscription : pastGrace) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
            recordChange(subscription, "expired", subscription.getPlan(), subscription.getPlan(),
                    SubscriptionStatus.PAST_DUE, SubscriptionStatus.EXPIRED, "system");
            notificationService.sendExpiredNotification(subscription);
        }
    }

    @Transactional
    public SubscriptionDTO renewSubscription(String userId, String billingCycle) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new SubscriptionException("Subscription is not active");
        }

        LocalDateTime newPeriodStart = subscription.getCurrentPeriodEnd();
        LocalDateTime newPeriodEnd = calculatePeriodEnd(newPeriodStart, billingCycle);

        subscription.setCurrentPeriodStart(newPeriodStart);
        subscription.setCurrentPeriodEnd(newPeriodEnd);
        subscription.setBillingCycle(billingCycle);
        subscription.setGracePeriodEnd(null);

        subscription = subscriptionRepository.save(subscription);

        licenseService.generateLicenseKey(subscription.getUser(), subscription, subscription.getPlan());

        recordChange(subscription, "renewed", subscription.getPlan(), subscription.getPlan(),
                SubscriptionStatus.ACTIVE, SubscriptionStatus.ACTIVE, "system");

        notificationService.sendRenewalNotification(subscription);

        log.info("Subscription renewed for user: {} until {}", userId, newPeriodEnd);
        return toSubscriptionDTO(subscription);
    }

    private LocalDateTime calculatePeriodEnd(LocalDateTime start, String billingCycle) {
        return switch (billingCycle.toLowerCase()) {
            case "quarterly" -> start.plusMonths(3);
            case "yearly" -> start.plusYears(1);
            default -> start.plusMonths(1);
        };
    }

    private void recordChange(UserSubscription subscription, String changeType,
                             SubscriptionPlan oldPlan, SubscriptionPlan newPlan,
                             SubscriptionStatus oldStatus, SubscriptionStatus newStatus,
                             String initiatedBy) {
        SubscriptionChange change = SubscriptionChange.builder()
                .user(subscription.getUser())
                .subscription(subscription)
                .changeType(changeType)
                .oldPlan(oldPlan)
                .newPlan(newPlan)
                .oldStatus(oldStatus != null ? oldStatus.getValue() : null)
                .newStatus(newStatus.getValue())
                .initiatedBy(initiatedBy)
                .build();
        changeRepository.save(change);
    }

    private PlanDTO toPlanDTO(SubscriptionPlan plan) {
        return PlanDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .displayName(plan.getDisplayName())
                .description(plan.getDescription())
                .tierLevel(plan.getTierLevel())
                .priceMonthly(plan.getPriceMonthly())
                .priceQuarterly(plan.getPriceQuarterly())
                .priceYearly(plan.getPriceYearly())
                .priceUsdMonthly(plan.getPriceUsdMonthly())
                .priceUsdQuarterly(plan.getPriceUsdQuarterly())
                .priceUsdYearly(plan.getPriceUsdYearly())
                .currency(plan.getCurrency())
                .trialDays(plan.getTrialDays())
                .gracePeriodDays(plan.getGracePeriodDays())
                .maxDevices(plan.getMaxDevices())
                .features(plan.getFeatures())
                .isActive(plan.getIsActive())
                .isFeatured(plan.getIsFeatured())
                .sortOrder(plan.getSortOrder())
                .build();
    }

    private SubscriptionDTO toSubscriptionDTO(UserSubscription subscription) {
        SubscriptionPlan plan = subscription.getPlan();
        Map<String, Object> features = plan != null ? plan.getFeatures() : Map.of();

        return SubscriptionDTO.builder()
                .id(subscription.getId())
                .userId(subscription.getUser().getId())
                .planId(plan != null ? plan.getId() : null)
                .planName(plan != null ? plan.getName() : null)
                .planTier(plan != null ? plan.getTierLevel() : 0)
                .status(subscription.getStatus().getValue())
                .billingCycle(subscription.getBillingCycle())
                .currentPeriodStart(subscription.getCurrentPeriodStart())
                .currentPeriodEnd(subscription.getCurrentPeriodEnd())
                .trialStart(subscription.getTrialStart())
                .trialEnd(subscription.getTrialEnd())
                .gracePeriodEnd(subscription.getGracePeriodEnd())
                .cancelAtPeriodEnd(subscription.getCancelAtPeriodEnd())
                .autoRenew(subscription.getAutoRenew())
                .gateway(subscription.getGateway())
                .isInGracePeriod(subscription.isInGracePeriod())
                .daysUntilExpiry(subscription.getDaysUntilExpiry())
                .daysInGracePeriod(subscription.getDaysInGracePeriod())
                .features(features)
                .createdAt(subscription.getCreatedAt())
                .build();
    }
}
