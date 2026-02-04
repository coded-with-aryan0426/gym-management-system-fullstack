package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * TIERED MEMBERSHIP PLAN
 * Parent entity for the new hierarchical plan structure.
 * Contains multiple PlanVariants (durations/pricing) and PlanFeatures (amenities).
 */
@Entity
@Table(name = "membership_plans")
@Data
@EqualsAndHashCode(exclude = {"variants", "features"})
@ToString(exclude = {"variants", "features"})
@NoArgsConstructor
@AllArgsConstructor
public class TieredMembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PlanCategory category = PlanCategory.STANDARD;

    @Column(name = "plan_color", length = 7)
    private String planColor;

    @Column(name = "icon_name", length = 50)
    private String iconName;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PlanStatus status = PlanStatus.ACTIVE;

    @Column(name = "is_recommended")
    private Boolean isRecommended = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // One-to-Many: Plan has multiple duration variants
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private Set<PlanVariant> variants = new HashSet<>();

    // One-to-Many: Plan has multiple features
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private Set<PlanFeature> features = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (category == null) category = PlanCategory.STANDARD;
        if (status == null) status = PlanStatus.ACTIVE;
        if (isRecommended == null) isRecommended = false;
        if (sortOrder == null) sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addVariant(PlanVariant variant) {
        variants.add(variant);
        variant.setPlan(this);
    }

    public void removeVariant(PlanVariant variant) {
        variants.remove(variant);
        variant.setPlan(null);
    }

    public void addFeature(PlanFeature feature) {
        features.add(feature);
        feature.setPlan(this);
    }

    public void removeFeature(PlanFeature feature) {
        features.remove(feature);
        feature.setPlan(null);
    }

    /**
     * Get the lowest price among all active variants
     */
    public Double getStartingPrice() {
        return variants.stream()
                .filter(PlanVariant::getIsActive)
                .mapToDouble(PlanVariant::getPrice)
                .min()
                .orElse(0.0);
    }

    /**
     * Get count of active variants
     */
    public int getActiveVariantCount() {
        return (int) variants.stream()
                .filter(PlanVariant::getIsActive)
                .count();
    }

    // Enums
    public enum PlanCategory {
        STANDARD, PREMIUM, VIP, CORPORATE, STUDENT, CUSTOM
    }

    public enum PlanStatus {
        ACTIVE, INACTIVE, DRAFT, ARCHIVED
    }
}
