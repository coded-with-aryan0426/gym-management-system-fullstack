package com.gym.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "subscription_changes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionChange {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private UserSubscription subscription;

    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_plan_id")
    private SubscriptionPlan oldPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_plan_id")
    private SubscriptionPlan newPlan;

    @Column(name = "old_status", length = 50)
    private String oldStatus;

    @Column(name = "new_status", length = 50)
    private String newStatus;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "initiated_by", length = 50)
    private String initiatedBy;

    @Column(name = "gateway_action_id", length = 255)
    private String gatewayActionId;

    @Column(name = "metadata", columnDefinition = "CLOB")
    @Convert(converter = JsonConverter.class)
    private Map<String, Object> metadata;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
