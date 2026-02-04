package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * PLAN FEATURE
 * Represents an amenity or service included in a TieredMembershipPlan.
 * e.g., "Pool Access", "Personal Training", "Group Classes"
 */
@Entity
@Table(name = "plan_features")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feature_id")
    private Long featureId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private TieredMembershipPlan plan;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private FeatureCategory category = FeatureCategory.ACCESS;

    @Column(name = "is_included")
    private Boolean isIncluded = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @PrePersist
    protected void onCreate() {
        if (category == null) category = FeatureCategory.ACCESS;
        if (isIncluded == null) isIncluded = true;
        if (sortOrder == null) sortOrder = 0;
    }

    // Enum for feature categories
    public enum FeatureCategory {
        ACCESS,      // Gym floor, facilities access
        EQUIPMENT,   // Equipment usage
        CLASSES,     // Group fitness classes
        AMENITIES,   // Locker, shower, sauna, pool
        SERVICES,    // PT, nutrition, massage
        PERKS        // Guest passes, towel service, etc.
    }
}
