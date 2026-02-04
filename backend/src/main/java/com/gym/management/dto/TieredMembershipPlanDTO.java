package com.gym.management.dto;

import com.gym.management.model.PlanFeature;
import com.gym.management.model.PlanVariant;
import com.gym.management.model.TieredMembershipPlan;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for Tiered Membership Plan
 * Used for API requests and responses in the new hierarchical plan system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TieredMembershipPlanDTO {

    private Long planId;

    @NotBlank(message = "Plan name is required")
    @Size(max = 100, message = "Plan name cannot exceed 100 characters")
    private String planName;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Category is required")
    private TieredMembershipPlan.PlanCategory category;

    @Size(max = 7, message = "Plan color must be a valid hex color code")
    private String planColor;

    @Size(max = 50, message = "Icon name cannot exceed 50 characters")
    private String iconName;

    private TieredMembershipPlan.PlanStatus status;

    private Boolean isRecommended;

    private Integer sortOrder;

    // Variants (duration/pricing options)
    @Valid
    @Size(min = 1, message = "At least one variant is required")
    private List<PlanVariantDTO> variants = new ArrayList<>();

    // Features (amenities/access)
    @Valid
    private List<PlanFeatureDTO> features = new ArrayList<>();

    // Computed fields for UI
    private Double startingPrice;
    private Integer variantCount;
    private Integer memberCount;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // =====================================
    // NESTED DTOs
    // =====================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanVariantDTO {
        
        private Long variantId;

        @NotNull(message = "Duration value is required")
        @Min(value = 1, message = "Duration must be at least 1")
        private Integer durationValue;

        @NotNull(message = "Duration unit is required")
        private PlanVariant.DurationUnit durationUnit;

        private Integer durationDays; // Computed

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private Double price;

        private Double originalPrice;

        @Min(value = 0, message = "Discount cannot be negative")
        @Max(value = 100, message = "Discount cannot exceed 100%")
        private Double discountPercent;

        @Min(value = 0, message = "PT sessions cannot be negative")
        private Integer includedPTSessions;

        private Boolean isPopular;
        private Boolean isActive;
        private Integer sortOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanFeatureDTO {
        
        private Long featureId;

        @NotBlank(message = "Feature name is required")
        @Size(max = 100, message = "Feature name cannot exceed 100 characters")
        private String name;

        @Size(max = 255, message = "Description cannot exceed 255 characters")
        private String description;

        @NotNull(message = "Category is required")
        private PlanFeature.FeatureCategory category;

        private Boolean isIncluded;
        private Integer sortOrder;
    }

    // =====================================
    // MAPPER METHODS
    // =====================================

    /**
     * Convert Entity to DTO
     */
    public static TieredMembershipPlanDTO fromEntity(TieredMembershipPlan entity) {
        if (entity == null) return null;

        TieredMembershipPlanDTO dto = TieredMembershipPlanDTO.builder()
                .planId(entity.getPlanId())
                .planName(entity.getPlanName())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .planColor(entity.getPlanColor())
                .iconName(entity.getIconName())
                .status(entity.getStatus())
                .isRecommended(entity.getIsRecommended())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .startingPrice(entity.getStartingPrice())
                .variantCount(entity.getActiveVariantCount())
                .variants(new ArrayList<>())
                .features(new ArrayList<>())
                .build();

        // Map variants
        if (entity.getVariants() != null) {
            for (PlanVariant variant : entity.getVariants()) {
                dto.getVariants().add(PlanVariantDTO.builder()
                        .variantId(variant.getVariantId())
                        .durationValue(variant.getDurationValue())
                        .durationUnit(variant.getDurationUnit())
                        .durationDays(variant.getDurationDays())
                        .price(variant.getPrice())
                        .originalPrice(variant.getOriginalPrice())
                        .discountPercent(variant.getDiscountPercent())
                        .includedPTSessions(variant.getIncludedPTSessions())
                        .isPopular(variant.getIsPopular())
                        .isActive(variant.getIsActive())
                        .sortOrder(variant.getSortOrder())
                        .build());
            }
        }

        // Map features
        if (entity.getFeatures() != null) {
            for (PlanFeature feature : entity.getFeatures()) {
                dto.getFeatures().add(PlanFeatureDTO.builder()
                        .featureId(feature.getFeatureId())
                        .name(feature.getName())
                        .description(feature.getDescription())
                        .category(feature.getCategory())
                        .isIncluded(feature.getIsIncluded())
                        .sortOrder(feature.getSortOrder())
                        .build());
            }
        }

        return dto;
    }

    /**
     * Convert DTO to Entity (for create/update)
     */
    public TieredMembershipPlan toEntity() {
        TieredMembershipPlan entity = new TieredMembershipPlan();
        entity.setPlanId(this.planId);
        entity.setPlanName(this.planName);
        entity.setDescription(this.description);
        entity.setCategory(this.category != null ? this.category : TieredMembershipPlan.PlanCategory.STANDARD);
        entity.setPlanColor(this.planColor);
        entity.setIconName(this.iconName);
        entity.setStatus(this.status != null ? this.status : TieredMembershipPlan.PlanStatus.ACTIVE);
        entity.setIsRecommended(this.isRecommended != null ? this.isRecommended : false);
        entity.setSortOrder(this.sortOrder != null ? this.sortOrder : 0);

        // Map variants
        if (this.variants != null) {
            for (PlanVariantDTO variantDTO : this.variants) {
                PlanVariant variant = new PlanVariant();
                variant.setVariantId(variantDTO.getVariantId());
                variant.setDurationValue(variantDTO.getDurationValue());
                variant.setDurationUnit(variantDTO.getDurationUnit() != null ? 
                        variantDTO.getDurationUnit() : PlanVariant.DurationUnit.MONTHS);
                variant.setPrice(variantDTO.getPrice());
                variant.setOriginalPrice(variantDTO.getOriginalPrice());
                variant.setDiscountPercent(variantDTO.getDiscountPercent());
                variant.setIncludedPTSessions(variantDTO.getIncludedPTSessions() != null ? 
                        variantDTO.getIncludedPTSessions() : 0);
                variant.setIsPopular(variantDTO.getIsPopular() != null ? variantDTO.getIsPopular() : false);
                variant.setIsActive(variantDTO.getIsActive() != null ? variantDTO.getIsActive() : true);
                variant.setSortOrder(variantDTO.getSortOrder() != null ? variantDTO.getSortOrder() : 0);
                variant.calculateDurationDays();
                entity.addVariant(variant);
            }
        }

        // Map features
        if (this.features != null) {
            for (PlanFeatureDTO featureDTO : this.features) {
                PlanFeature feature = new PlanFeature();
                feature.setFeatureId(featureDTO.getFeatureId());
                feature.setName(featureDTO.getName());
                feature.setDescription(featureDTO.getDescription());
                feature.setCategory(featureDTO.getCategory() != null ? 
                        featureDTO.getCategory() : PlanFeature.FeatureCategory.ACCESS);
                feature.setIsIncluded(featureDTO.getIsIncluded() != null ? featureDTO.getIsIncluded() : true);
                feature.setSortOrder(featureDTO.getSortOrder() != null ? featureDTO.getSortOrder() : 0);
                entity.addFeature(feature);
            }
        }

        return entity;
    }
}
