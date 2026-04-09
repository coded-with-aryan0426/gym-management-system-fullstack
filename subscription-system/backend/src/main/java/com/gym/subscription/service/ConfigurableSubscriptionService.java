package com.gym.subscription.service;

import com.gym.subscription.config.PlansConfigLoader;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConfigurableSubscriptionService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final PlansConfigLoader configLoader;
    private final LicenseService licenseService;
    private final SubscriptionChangeRepository changeRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public List<PlanDTO> getAllActivePlans() {
        return configLoader.getActivePlans().stream()
                .map(this::toPlanDTO)
                .collect(Collectors.toList());
    }

    public PlanDTO getPlanById(String planId) {
        PlansConfigLoader.PlanConfig plan = configLoader.getPlanById(planId);
        if (plan == null) {
            throw new SubscriptionException("Plan not found: " + planId);
        }
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

        PlansConfigLoader.PlanConfig planConfig = configLoader.getPlanById(planId);
        if (planConfig == null) {
            throw new SubscriptionException("Plan not found: " + planId);
        }

        if (planConfig.getTierLevel() == 0) {
            throw new SubscriptionException("Cannot create trial for free plan");
        }

        if (subscriptionRepository.existsByUserIdAndStatusIn(userId,
                List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING))) {
            throw new SubscriptionException("User already has an active subscription");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime trialEnd = now.plusDays(planConfig.getTrialDays());
        LocalDateTime periodEnd = trialEnd.plusDays(planConfig.getGracePeriodDays());

        SubscriptionPlan subscriptionPlan = SubscriptionPlan.builder()
                .name(planConfig.getName())
                .displayName(planConfig.getDisplayName())
                .description(planConfig.getDescription())
                .tierLevel(planConfig.getTierLevel())
                .priceMonthly(getPrice(planConfig, "monthly"))
                .priceQuarterly(getPrice(planConfig, "quarterly"))
                .priceYearly(getPrice(planConfig, "yearly"))
                .trialDays(planConfig.getTrialDays())
                .gracePeriodDays(planConfig.getGracePeriodDays())
                .maxDevices(planConfig.getMaxDevices())
                .features(planConfig.getFeatures())
                .isActive(true)
                .build();

        UserSubscription subscription = UserSubscription.builder()
                .user(user)
                .plan(subscriptionPlan)
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

        recordChange(subscription, "trial_started", null, subscriptionPlan, null, SubscriptionStatus.TRIALING, "system");

        notificationService.sendTrialStartedNotification(subscription);

        log.info("Created trial subscription for user: {} with plan: {}", userId, planConfig.getName());
        return toSubscriptionDTO(subscription);
    }

    @Transactional
    public SubscriptionDTO activateSubscription(String userId, String gateway, String gatewaySubscriptionId,
                                                String billingCycle) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (subscription.getStatus() != SubscriptionStatus.TRIALING) {
            throw new SubscriptionException("Subscription is not in trial status");
        }

        PlansConfigLoader.PlanConfig planConfig = configLoader.getPlanById(
                subscription.getPlan().getName().toLowerCase());
        if (planConfig == null) {
            throw new SubscriptionException("Plan configuration not found");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime periodStart = now;
        LocalDateTime periodEnd = calculatePeriodEnd(now, billingCycle != null ? billingCycle : "yearly");

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setGateway(gateway);
        subscription.setGatewaySubscriptionId(gatewaySubscriptionId);
        subscription.setTrialStart(null);
        subscription.setTrialEnd(null);
        subscription.setBillingCycle(billingCycle != null ? billingCycle : "yearly");
        subscription.setCurrentPeriodStart(periodStart);
        subscription.setCurrentPeriodEnd(periodEnd);
        subscription.setGracePeriodEnd(null);

        subscription = subscriptionRepository.save(subscription);

        SubscriptionPlan plan = subscription.getPlan();
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

        if (!current.isActive() && current.getStatus() != SubscriptionStatus.TRIALING) {
            throw new SubscriptionException("Cannot upgrade inactive subscription");
        }

        PlansConfigLoader.PlanConfig newPlanConfig = configLoader.getPlanById(newPlanId);
        if (newPlanConfig == null) {
            throw new SubscriptionException("Plan not found: " + newPlanId);
        }

        SubscriptionPlan oldPlan = current.getPlan();
        int oldTier = oldPlan != null ? oldPlan.getTierLevel() : 0;

        if (newPlanConfig.getTierLevel() <= oldTier) {
            throw new SubscriptionException("New plan must be of higher tier for upgrade");
        }

        SubscriptionPlan previousPlan = current.getPlan();

        SubscriptionPlan newPlan = SubscriptionPlan.builder()
                .name(newPlanConfig.getName())
                .displayName(newPlanConfig.getDisplayName())
                .description(newPlanConfig.getDescription())
                .tierLevel(newPlanConfig.getTierLevel())
                .priceMonthly(getPrice(newPlanConfig, "monthly"))
                .priceQuarterly(getPrice(newPlanConfig, "quarterly"))
                .priceYearly(getPrice(newPlanConfig, "yearly"))
                .trialDays(newPlanConfig.getTrialDays())
                .gracePeriodDays(newPlanConfig.getGracePeriodDays())
                .maxDevices(newPlanConfig.getMaxDevices())
                .features(newPlanConfig.getFeatures())
                .isActive(true)
                .build();

        current.setPreviousPlan(previousPlan);
        current.setPlan(newPlan);
        current.setStatus(SubscriptionStatus.ACTIVE);
        current.setCurrentPeriodEnd(LocalDateTime.now());

        current = subscriptionRepository.save(current);

        licenseService.generateLicenseKey(current.getUser(), current, newPlan);

        recordChange(current, "upgraded", oldPlan, newPlan, SubscriptionStatus.ACTIVE, SubscriptionStatus.ACTIVE, "user");

        notificationService.sendUpgradeNotification(current, oldPlan, newPlan);

        log.info("User {} upgraded from {} to {}", userId, oldPlan != null ? oldPlan.getName() : "none", newPlanConfig.getName());
        return toSubscriptionDTO(current);
    }

    @Transactional
    public SubscriptionDTO downgradeSubscription(String userId, String newPlanId) {
        UserSubscription current = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (!current.isActive() && current.getStatus() != SubscriptionStatus.TRIALING) {
            throw new SubscriptionException("Cannot downgrade inactive subscription");
        }

        PlansConfigLoader.PlanConfig newPlanConfig = configLoader.getPlanById(newPlanId);
        if (newPlanConfig == null) {
            throw new SubscriptionException("Plan not found: " + newPlanId);
        }

        SubscriptionPlan oldPlan = current.getPlan();
        int oldTier = oldPlan != null ? oldPlan.getTierLevel() : 0;

        if (newPlanConfig.getTierLevel() >= oldTier) {
            throw new SubscriptionException("New plan must be of lower tier for downgrade");
        }

        SubscriptionPlan previousPlan = current.getPlan();

        SubscriptionPlan newPlan = SubscriptionPlan.builder()
                .name(newPlanConfig.getName())
                .displayName(newPlanConfig.getDisplayName())
                .description(newPlanConfig.getDescription())
                .tierLevel(newPlanConfig.getTierLevel())
                .priceMonthly(getPrice(newPlanConfig, "monthly"))
                .priceQuarterly(getPrice(newPlanConfig, "quarterly"))
                .priceYearly(getPrice(newPlanConfig, "yearly"))
                .trialDays(newPlanConfig.getTrialDays())
                .gracePeriodDays(newPlanConfig.getGracePeriodDays())
                .maxDevices(newPlanConfig.getMaxDevices())
                .features(newPlanConfig.getFeatures())
                .isActive(true)
                .build();

        current.setPreviousPlan(previousPlan);
        current.setPlan(newPlan);
        current.setStatus(SubscriptionStatus.ACTIVE);
        current.setCurrentPeriodEnd(LocalDateTime.now());

        current = subscriptionRepository.save(current);

        licenseService.generateLicenseKey(current.getUser(), current, newPlan);

        recordChange(current, "downgraded", oldPlan, newPlan, SubscriptionStatus.ACTIVE, SubscriptionStatus.ACTIVE, "user");

        notificationService.sendDowngradeNotification(current, oldPlan, newPlan);

        log.info("User {} downregulated from {} to {}", userId, oldPlan != null ? oldPlan.getName() : "none", newPlanConfig.getName());
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
    public SubscriptionDTO renewSubscription(String userId, String billingCycle) {
        UserSubscription subscription = subscriptionRepository
                .findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new SubscriptionException("No subscription found"));

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new SubscriptionException("Subscription is not active");
        }

        LocalDateTime newPeriodStart = subscription.getCurrentPeriodEnd();
        LocalDateTime newPeriodEnd = calculatePeriodEnd(newPeriodStart,
                billingCycle != null ? billingCycle : subscription.getBillingCycle());

        subscription.setCurrentPeriodStart(newPeriodStart);
        subscription.setCurrentPeriodEnd(newPeriodEnd);
        if (billingCycle != null) {
            subscription.setBillingCycle(billingCycle);
        }
        subscription.setGracePeriodEnd(null);

        subscription = subscriptionRepository.save(subscription);

        licenseService.generateLicenseKey(subscription.getUser(), subscription, subscription.getPlan());

        recordChange(subscription, "renewed", subscription.getPlan(), subscription.getPlan(),
                SubscriptionStatus.ACTIVE, SubscriptionStatus.ACTIVE, "system");

        notificationService.sendRenewalNotification(subscription);

        log.info("Subscription renewed for user: {} until {}", userId, newPeriodEnd);
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
                subscriptionRepository.save(subscription);
                notificationService.sendCancellationNotification(subscription, false);
            } else if (subscription.getGracePeriodEnd() != null &&
                       LocalDateTime.now().isBefore(subscription.getGracePeriodEnd())) {
                subscription.setStatus(SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(subscription);
                notificationService.sendGracePeriodNotification(subscription);
            } else {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
                notificationService.sendExpiredNotification(subscription);
            }
        }

        List<UserSubscription> pastGrace = subscriptionRepository.findSubscriptionsPastGracePeriod(LocalDateTime.now());
        for (UserSubscription subscription : pastGrace) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
            notificationService.sendExpiredNotification(subscription);
        }
    }

    private LocalDateTime calculatePeriodEnd(LocalDateTime start, String billingCycle) {
        if (billingCycle == null) billingCycle = "yearly";
        return switch (billingCycle.toLowerCase()) {
            case "quarterly" -> start.plusMonths(3);
            case "yearly" -> start.plusYears(1);
            default -> start.plusMonths(1);
        };
    }

    private BigDecimal getPrice(PlansConfigLoader.PlanConfig config, String cycle) {
        Map<String, BigDecimal> prices = config.getPrices();
        if (prices == null) return BigDecimal.ZERO;
        return prices.getOrDefault(cycle, BigDecimal.ZERO);
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

    private PlanDTO toPlanDTO(PlansConfigLoader.PlanConfig plan) {
        PlansConfigLoader.CurrencyConfig currency = configLoader.getCurrencyConfig();

        Map<String, Object> features = new HashMap<>();
        features.put("maxMembers", plan.getMaxMembers());
        features.put("maxDevices", plan.getMaxDevices());
        features.put("maxStaff", plan.getMaxStaff());
        features.put("maxTrainers", plan.getMaxTrainers());
        features.put("maxClasses", plan.getMaxClasses());
        if (plan.getFeatures() != null) {
            features.putAll(plan.getFeatures());
        }

        return PlanDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .displayName(plan.getDisplayName())
                .description(plan.getDescription())
                .tierLevel(plan.getTierLevel())
                .priceMonthly(getPrice(plan, "monthly"))
                .priceQuarterly(getPrice(plan, "quarterly"))
                .priceYearly(getPrice(plan, "yearly"))
                .priceUsdMonthly(plan.getPricesUSD() != null ? plan.getPricesUSD().get("monthly") : null)
                .priceUsdQuarterly(plan.getPricesUSD() != null ? plan.getPricesUSD().get("quarterly") : null)
                .priceUsdYearly(plan.getPricesUSD() != null ? plan.getPricesUSD().get("yearly") : null)
                .currency(currency.getDefaultCurrency())
                .trialDays(plan.getTrialDays())
                .gracePeriodDays(plan.getGracePeriodDays())
                .maxDevices(plan.getMaxDevices())
                .features(features)
                .isActive(plan.isActive())
                .isFeatured(plan.isFeatured())
                .sortOrder(plan.getSortOrder())
                .build();
    }

    private SubscriptionDTO toSubscriptionDTO(UserSubscription subscription) {
        SubscriptionPlan plan = subscription.getPlan();
        PlansConfigLoader.PlanConfig planConfig = plan != null ?
                configLoader.getPlanById(plan.getName().toLowerCase()) : null;

        Map<String, Object> features = new HashMap<>();
        if (planConfig != null) {
            features.put("maxMembers", planConfig.getMaxMembers());
            features.put("maxDevices", planConfig.getMaxDevices());
            features.put("maxStaff", planConfig.getMaxStaff());
            features.put("maxTrainers", planConfig.getMaxTrainers());
            features.put("maxClasses", planConfig.getMaxClasses());
            if (planConfig.getFeatures() != null) {
                features.putAll(planConfig.getFeatures());
            }
        } else if (plan != null) {
            features = plan.getFeatures() != null ? plan.getFeatures() : new HashMap<>();
        }

        String planName = planConfig != null ? planConfig.getDisplayName() :
                         (plan != null ? plan.getDisplayName() : null);

        return SubscriptionDTO.builder()
                .id(subscription.getId())
                .userId(subscription.getUser().getId())
                .planId(planConfig != null ? planConfig.getId() : (plan != null ? plan.getId() : null))
                .planName(planName)
                .planTier(planConfig != null ? planConfig.getTierLevel() : (plan != null ? plan.getTierLevel() : 0))
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
