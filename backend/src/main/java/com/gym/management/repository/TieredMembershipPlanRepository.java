package com.gym.management.repository;

import com.gym.management.model.TieredMembershipPlan;
import com.gym.management.model.TieredMembershipPlan.PlanCategory;
import com.gym.management.model.TieredMembershipPlan.PlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TieredMembershipPlan entities.
 */
@Repository
public interface TieredMembershipPlanRepository extends JpaRepository<TieredMembershipPlan, Long> {

    // Find by plan name
    Optional<TieredMembershipPlan> findByPlanName(String planName);

    // Check if plan name exists
    boolean existsByPlanName(String planName);

    // Check if plan name exists (excluding a specific plan)
    boolean existsByPlanNameAndPlanIdNot(String planName, Long planId);

    // Find all active plans
    List<TieredMembershipPlan> findByStatusOrderBySortOrderAsc(PlanStatus status);

    // Find all plans by category
    List<TieredMembershipPlan> findByCategoryOrderBySortOrderAsc(PlanCategory category);

    // Find all active plans by category
    List<TieredMembershipPlan> findByStatusAndCategoryOrderBySortOrderAsc(PlanStatus status, PlanCategory category);

    // Find recommended plans
    List<TieredMembershipPlan> findByStatusAndIsRecommendedTrueOrderBySortOrderAsc(PlanStatus status);

    // Find all plans ordered by sort order
    List<TieredMembershipPlan> findAllByOrderBySortOrderAsc();

    // Count plans by status
    long countByStatus(PlanStatus status);

    // Count plans by category
    long countByCategory(PlanCategory category);

    // Get active plans with eager fetch of variants
    @Query("SELECT DISTINCT p FROM TieredMembershipPlan p " +
           "LEFT JOIN FETCH p.variants v " +
           "WHERE p.status = :status " +
           "ORDER BY p.sortOrder ASC")
    List<TieredMembershipPlan> findByStatusWithVariants(@Param("status") PlanStatus status);

    // Get plan by ID with eager fetch of variants and features
    @Query("SELECT p FROM TieredMembershipPlan p " +
           "LEFT JOIN FETCH p.variants " +
           "LEFT JOIN FETCH p.features " +
           "WHERE p.planId = :planId")
    Optional<TieredMembershipPlan> findByIdWithVariantsAndFeatures(@Param("planId") Long planId);

    // Get all plans with eager fetch
    @Query("SELECT DISTINCT p FROM TieredMembershipPlan p " +
           "LEFT JOIN FETCH p.variants " +
           "LEFT JOIN FETCH p.features " +
           "ORDER BY p.sortOrder ASC")
    List<TieredMembershipPlan> findAllWithVariantsAndFeatures();

    // Get max sort order
    @Query("SELECT COALESCE(MAX(p.sortOrder), 0) FROM TieredMembershipPlan p")
    Integer findMaxSortOrder();
}
