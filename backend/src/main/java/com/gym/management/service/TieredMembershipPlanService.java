package com.gym.management.service;

import com.gym.management.dto.TieredMembershipPlanDTO;
import com.gym.management.model.PlanFeature;
import com.gym.management.model.PlanVariant;
import com.gym.management.model.TieredMembershipPlan;
import com.gym.management.model.TieredMembershipPlan.PlanCategory;
import com.gym.management.model.TieredMembershipPlan.PlanStatus;
import com.gym.management.repository.TieredMembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Tiered Membership Plan management.
 * Handles CRUD operations for the hierarchical plan structure.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TieredMembershipPlanService {

    private final TieredMembershipPlanRepository planRepository;

    // Premium color palette
    private static final String[] PLAN_COLORS = {
        "#DC2626", "#EA580C", "#D97706", "#16A34A", 
        "#0891B2", "#2563EB", "#7C3AED", "#DB2777"
    };

    /**
     * Get all plans with variants and features
     */
    @Transactional(readOnly = true)
    public List<TieredMembershipPlanDTO> getAllPlans() {
        return planRepository.findAllWithVariantsAndFeatures().stream()
                .map(TieredMembershipPlanDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get active plans only
     */
    @Transactional(readOnly = true)
    public List<TieredMembershipPlanDTO> getActivePlans() {
        return planRepository.findByStatusWithVariants(PlanStatus.ACTIVE).stream()
                .map(TieredMembershipPlanDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get plan by ID with all nested data
     */
    @Transactional(readOnly = true)
    public TieredMembershipPlanDTO getPlanById(Long planId) {
        TieredMembershipPlan plan = planRepository.findByIdWithVariantsAndFeatures(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found with ID: " + planId));
        return TieredMembershipPlanDTO.fromEntity(plan);
    }

    /**
     * Get plans by category
     */
    @Transactional(readOnly = true)
    public List<TieredMembershipPlanDTO> getPlansByCategory(PlanCategory category) {
        return planRepository.findByStatusAndCategoryOrderBySortOrderAsc(PlanStatus.ACTIVE, category).stream()
                .map(TieredMembershipPlanDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create a new tiered plan
     */
    public TieredMembershipPlanDTO createPlan(TieredMembershipPlanDTO dto) {
        // Validate unique plan name
        if (planRepository.existsByPlanName(dto.getPlanName())) {
            throw new IllegalArgumentException("A plan with this name already exists");
        }

        // Convert DTO to entity
        TieredMembershipPlan plan = dto.toEntity();

        // Assign color if not provided
        if (plan.getPlanColor() == null || plan.getPlanColor().isEmpty()) {
            plan.setPlanColor(assignUniqueColor());
        }

        // Set sort order
        plan.setSortOrder(planRepository.findMaxSortOrder() + 1);

        // Set default status if not provided
        if (plan.getStatus() == null) {
            plan.setStatus(PlanStatus.ACTIVE);
        }

        // Save and return
        TieredMembershipPlan saved = planRepository.save(plan);
        return TieredMembershipPlanDTO.fromEntity(saved);
    }

    /**
     * Update an existing plan
     */
    public TieredMembershipPlanDTO updatePlan(Long planId, TieredMembershipPlanDTO dto) {
        TieredMembershipPlan existingPlan = planRepository.findByIdWithVariantsAndFeatures(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found with ID: " + planId));

        // Check name uniqueness (excluding current plan)
        if (!existingPlan.getPlanName().equals(dto.getPlanName()) && 
            planRepository.existsByPlanNameAndPlanIdNot(dto.getPlanName(), planId)) {
            throw new IllegalArgumentException("A plan with this name already exists");
        }

        // Update basic fields
        existingPlan.setPlanName(dto.getPlanName());
        existingPlan.setDescription(dto.getDescription());
        existingPlan.setCategory(dto.getCategory());
        existingPlan.setIconName(dto.getIconName());
        existingPlan.setIsRecommended(dto.getIsRecommended());
        
        if (dto.getStatus() != null) {
            existingPlan.setStatus(dto.getStatus());
        }
        if (dto.getPlanColor() != null && !dto.getPlanColor().isEmpty()) {
            existingPlan.setPlanColor(dto.getPlanColor());
        }
        if (dto.getSortOrder() != null) {
            existingPlan.setSortOrder(dto.getSortOrder());
        }

        // Update variants - clear and re-add
        existingPlan.getVariants().clear();
        if (dto.getVariants() != null) {
            for (TieredMembershipPlanDTO.PlanVariantDTO variantDTO : dto.getVariants()) {
                PlanVariant variant = new PlanVariant();
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
                existingPlan.addVariant(variant);
            }
        }

        // Update features - clear and re-add
        existingPlan.getFeatures().clear();
        if (dto.getFeatures() != null) {
            for (TieredMembershipPlanDTO.PlanFeatureDTO featureDTO : dto.getFeatures()) {
                PlanFeature feature = new PlanFeature();
                feature.setName(featureDTO.getName());
                feature.setDescription(featureDTO.getDescription());
                feature.setCategory(featureDTO.getCategory() != null ? 
                        featureDTO.getCategory() : PlanFeature.FeatureCategory.ACCESS);
                feature.setIsIncluded(featureDTO.getIsIncluded() != null ? featureDTO.getIsIncluded() : true);
                feature.setSortOrder(featureDTO.getSortOrder() != null ? featureDTO.getSortOrder() : 0);
                existingPlan.addFeature(feature);
            }
        }

        TieredMembershipPlan saved = planRepository.save(existingPlan);
        return TieredMembershipPlanDTO.fromEntity(saved);
    }

    /**
     * Delete a plan
     */
    public void deletePlan(Long planId) {
        TieredMembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found with ID: " + planId));

        // TODO: Add check for active members using this plan
        // long memberCount = membershipRepository.countByTieredPlanId(planId);
        // if (memberCount > 0) {
        //     throw new IllegalStateException("Cannot delete plan with active members");
        // }

        planRepository.delete(plan);
    }

    /**
     * Update plan status
     */
    public TieredMembershipPlanDTO updatePlanStatus(Long planId, PlanStatus status) {
        TieredMembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found with ID: " + planId));

        plan.setStatus(status);
        TieredMembershipPlan saved = planRepository.save(plan);
        return TieredMembershipPlanDTO.fromEntity(saved);
    }

    /**
     * Toggle recommended status
     */
    public TieredMembershipPlanDTO toggleRecommended(Long planId) {
        TieredMembershipPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found with ID: " + planId));

        plan.setIsRecommended(!plan.getIsRecommended());
        TieredMembershipPlan saved = planRepository.save(plan);
        return TieredMembershipPlanDTO.fromEntity(saved);
    }

    /**
     * Reorder plans
     */
    public void reorderPlans(List<Long> planIds) {
        for (int i = 0; i < planIds.size(); i++) {
            TieredMembershipPlan plan = planRepository.findById(planIds.get(i))
                    .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
            plan.setSortOrder(i);
            planRepository.save(plan);
        }
    }

    /**
     * Duplicate a plan
     */
    public TieredMembershipPlanDTO duplicatePlan(Long planId) {
        TieredMembershipPlan original = planRepository.findByIdWithVariantsAndFeatures(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found with ID: " + planId));

        TieredMembershipPlan duplicate = new TieredMembershipPlan();
        duplicate.setPlanName(original.getPlanName() + " (Copy)");
        duplicate.setDescription(original.getDescription());
        duplicate.setCategory(original.getCategory());
        duplicate.setPlanColor(assignUniqueColor());
        duplicate.setIconName(original.getIconName());
        duplicate.setStatus(PlanStatus.DRAFT);
        duplicate.setIsRecommended(false);
        duplicate.setSortOrder(planRepository.findMaxSortOrder() + 1);

        // Copy variants
        for (PlanVariant originalVariant : original.getVariants()) {
            PlanVariant variant = new PlanVariant();
            variant.setDurationValue(originalVariant.getDurationValue());
            variant.setDurationUnit(originalVariant.getDurationUnit());
            variant.setDurationDays(originalVariant.getDurationDays());
            variant.setPrice(originalVariant.getPrice());
            variant.setOriginalPrice(originalVariant.getOriginalPrice());
            variant.setDiscountPercent(originalVariant.getDiscountPercent());
            variant.setIncludedPTSessions(originalVariant.getIncludedPTSessions());
            variant.setIsPopular(originalVariant.getIsPopular());
            variant.setIsActive(true);
            variant.setSortOrder(originalVariant.getSortOrder());
            duplicate.addVariant(variant);
        }

        // Copy features
        for (PlanFeature originalFeature : original.getFeatures()) {
            PlanFeature feature = new PlanFeature();
            feature.setName(originalFeature.getName());
            feature.setDescription(originalFeature.getDescription());
            feature.setCategory(originalFeature.getCategory());
            feature.setIsIncluded(originalFeature.getIsIncluded());
            feature.setSortOrder(originalFeature.getSortOrder());
            duplicate.addFeature(feature);
        }

        TieredMembershipPlan saved = planRepository.save(duplicate);
        return TieredMembershipPlanDTO.fromEntity(saved);
    }

    /**
     * Get plan statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPlanStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalPlans", planRepository.count());
        stats.put("activePlans", planRepository.countByStatus(PlanStatus.ACTIVE));
        stats.put("draftPlans", planRepository.countByStatus(PlanStatus.DRAFT));
        stats.put("archivedPlans", planRepository.countByStatus(PlanStatus.ARCHIVED));
        
        // Plans by category
        Map<String, Long> byCategory = new HashMap<>();
        for (PlanCategory category : PlanCategory.values()) {
            byCategory.put(category.name(), planRepository.countByCategory(category));
        }
        stats.put("plansByCategory", byCategory);
        
        return stats;
    }

    /**
     * Assign a unique color from the palette
     */
    private String assignUniqueColor() {
        Set<String> usedColors = planRepository.findAll().stream()
                .map(TieredMembershipPlan::getPlanColor)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (String color : PLAN_COLORS) {
            if (!usedColors.contains(color)) {
                return color;
            }
        }

        // If all colors used, generate random
        Random random = new Random();
        return String.format("#%06X", random.nextInt(0xFFFFFF + 1));
    }
}
