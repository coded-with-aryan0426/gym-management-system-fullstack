package com.gym.management.repository;

import com.gym.management.model.TrainerCompensationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for TrainerCompensationRule - owner-configurable trainer rates
 */
@Repository
public interface TrainerCompensationRuleRepository extends JpaRepository<TrainerCompensationRule, Long> {

    // Find active rule for trainer on a specific date
    @Query("SELECT r FROM TrainerCompensationRule r WHERE r.trainer.userId = :trainerId " +
            "AND r.isActive = true AND r.effectiveFrom <= :date " +
            "AND (r.effectiveTo IS NULL OR r.effectiveTo >= :date) " +
            "ORDER BY r.effectiveFrom DESC")
    Optional<TrainerCompensationRule> findActiveRuleForTrainer(
            @Param("trainerId") Long trainerId,
            @Param("date") LocalDate date);

    // Find current active rule for trainer
    default Optional<TrainerCompensationRule> findCurrentActiveRule(Long trainerId) {
        return findActiveRuleForTrainer(trainerId, LocalDate.now());
    }

    // Find all rules for a trainer
    List<TrainerCompensationRule> findByTrainerUserIdOrderByEffectiveFromDesc(Long trainerId);

    // Find active rules only
    List<TrainerCompensationRule> findByTrainerUserIdAndIsActiveTrueOrderByEffectiveFromDesc(Long trainerId);

    // Check if trainer has any compensation rule
    boolean existsByTrainerUserIdAndIsActiveTrue(Long trainerId);
}
