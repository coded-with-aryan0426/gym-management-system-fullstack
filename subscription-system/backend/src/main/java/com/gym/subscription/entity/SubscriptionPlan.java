package com.gym.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "description", columnDefinition = "CLOB")
    private String description;

    @Column(name = "tier_level", nullable = false)
    private Integer tierLevel;

    @Column(name = "price_monthly", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceMonthly;

    @Column(name = "price_quarterly", precision = 10, scale = 2)
    private BigDecimal priceQuarterly;

    @Column(name = "price_yearly", precision = 10, scale = 2)
    private BigDecimal priceYearly;

    @Column(name = "price_usd_monthly", precision = 10, scale = 2)
    private BigDecimal priceUsdMonthly;

    @Column(name = "price_usd_quarterly", precision = 10, scale = 2)
    private BigDecimal priceUsdQuarterly;

    @Column(name = "price_usd_yearly", precision = 10, scale = 2)
    private BigDecimal priceUsdYearly;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "trial_days")
    @Builder.Default
    private Integer trialDays = 0;

    @Column(name = "grace_period_days")
    @Builder.Default
    private Integer gracePeriodDays = 3;

    @Column(name = "max_devices")
    @Builder.Default
    private Integer maxDevices = 1;

    @Column(name = "features", columnDefinition = "CLOB")
    @Convert(converter = JsonConverter.class)
    @Builder.Default
    private Map<String, Object> features = Map.of();

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "gateway_plans", columnDefinition = "CLOB")
    @Convert(converter = JsonConverter.class)
    private Map<String, String> gatewayPlans;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BigDecimal getPriceForCycle(String billingCycle) {
        return switch (billingCycle.toLowerCase()) {
            case "quarterly" -> priceQuarterly;
            case "yearly" -> priceYearly;
            default -> priceMonthly;
        };
    }

    public boolean hasFeature(String feature) {
        if (features == null) return false;
        Object value = features.get(feature);
        return Boolean.TRUE.equals(value);
    }

    public int getFeatureLimit(String feature) {
        if (features == null) return 0;
        Object value = features.get(feature);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Boolean.TRUE.equals(value) ? -1 : 0;
    }
}
