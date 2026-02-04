package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * PLAN VARIANT
 * Represents a specific duration/pricing option within a TieredMembershipPlan.
 * e.g., "1 Month at $99" or "3 Months at $249"
 */
@Entity
@Table(name = "plan_variants", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"plan_id", "duration_value", "duration_unit"}, name = "uk_plan_variant_duration")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private TieredMembershipPlan plan;

    @Column(name = "duration_value", nullable = false)
    private Integer durationValue;

    @Column(name = "duration_unit", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private DurationUnit durationUnit = DurationUnit.MONTHS;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(nullable = false)
    private Double price;

    @Column(name = "original_price")
    private Double originalPrice;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "included_pt_sessions")
    private Integer includedPTSessions = 0;

    @Column(name = "is_popular")
    private Boolean isPopular = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @PrePersist
    protected void onCreate() {
        if (durationUnit == null) durationUnit = DurationUnit.MONTHS;
        if (includedPTSessions == null) includedPTSessions = 0;
        if (isPopular == null) isPopular = false;
        if (isActive == null) isActive = true;
        if (sortOrder == null) sortOrder = 0;
        calculateDurationDays();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateDurationDays();
    }

    /**
     * Calculate total days from duration value and unit
     */
    public void calculateDurationDays() {
        if (durationValue != null && durationUnit != null) {
            this.durationDays = switch (durationUnit) {
                case DAYS -> durationValue;
                case WEEKS -> durationValue * 7;
                case MONTHS -> durationValue * 30;
                case YEARS -> durationValue * 365;
            };
        }
    }

    /**
     * Get formatted duration string
     */
    public String getFormattedDuration() {
        String unit = durationUnit.name().toLowerCase();
        if (durationValue == 1) {
            // Remove trailing 's' for singular
            unit = unit.substring(0, unit.length() - 1);
        }
        return durationValue + " " + unit;
    }

    // Enum for duration units
    public enum DurationUnit {
        DAYS, WEEKS, MONTHS, YEARS
    }
}
