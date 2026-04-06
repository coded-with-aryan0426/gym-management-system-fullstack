package com.gym.subscription.entity;

import com.gym.subscription.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.TRIALING;

    @Column(name = "billing_cycle", nullable = false, length = 20)
    @Builder.Default
    private String billingCycle = "monthly";

    @Column(name = "current_period_start", nullable = false)
    private LocalDateTime currentPeriodStart;

    @Column(name = "current_period_end", nullable = false)
    private LocalDateTime currentPeriodEnd;

    @Column(name = "trial_start")
    private LocalDateTime trialStart;

    @Column(name = "trial_end")
    private LocalDateTime trialEnd;

    @Column(name = "grace_period_end")
    private LocalDateTime gracePeriodEnd;

    @Column(name = "cancel_at_period_end")
    @Builder.Default
    private Boolean cancelAtPeriodEnd = false;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "auto_renew")
    @Builder.Default
    private Boolean autoRenew = true;

    @Column(name = "gateway", length = 50)
    private String gateway;

    @Column(name = "gateway_subscription_id", length = 255)
    private String gatewaySubscriptionId;

    @Column(name = "gateway_customer_id", length = 255)
    private String gatewayCustomerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_plan_id")
    private SubscriptionPlan previousPlan;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE || status == SubscriptionStatus.TRIALING;
    }

    public boolean isInGracePeriod() {
        if (gracePeriodEnd == null) return false;
        return LocalDateTime.now().isBefore(gracePeriodEnd) &&
               (status == SubscriptionStatus.EXPIRED || status == SubscriptionStatus.PAST_DUE);
    }

    public boolean isExpired() {
        if (status == SubscriptionStatus.EXPIRED || status == SubscriptionStatus.CANCELLED) {
            return true;
        }
        return currentPeriodEnd != null && LocalDateTime.now().isAfter(currentPeriodEnd);
    }

    public long getDaysUntilExpiry() {
        if (currentPeriodEnd == null) return 0;
        return java.time.Duration.between(LocalDateTime.now(), currentPeriodEnd).toDays();
    }

    public long getDaysInGracePeriod() {
        if (gracePeriodEnd == null) return 0;
        return java.time.Duration.between(LocalDateTime.now(), gracePeriodEnd).toDays();
    }
}
