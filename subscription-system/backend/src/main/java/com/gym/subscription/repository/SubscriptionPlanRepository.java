package com.gym.subscription.repository;

import com.gym.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, String> {

    Optional<SubscriptionPlan> findByName(String name);

    List<SubscriptionPlan> findByIsActiveTrueOrderBySortOrderAsc();

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.isActive = true AND p.tierLevel > 0 ORDER BY p.sortOrder ASC")
    List<SubscriptionPlan> findAllPaidPlans();

    @Query("SELECT p FROM SubscriptionPlan p WHERE p.isFeatured = true AND p.isActive = true")
    List<SubscriptionPlan> findFeaturedPlans();

    boolean existsByName(String name);
}
