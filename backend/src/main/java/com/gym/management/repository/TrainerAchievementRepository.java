package com.gym.management.repository;

import com.gym.management.model.TrainerAchievement;
import com.gym.management.model.TrainerAchievement.AchievementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for TrainerAchievement - persistent, idempotent achievements
 */
@Repository
public interface TrainerAchievementRepository extends JpaRepository<TrainerAchievement, Long> {

    // Find all achievements for trainer, most recent first
    List<TrainerAchievement> findByTrainerUserIdOrderByAchievedDateDesc(Long trainerId);

    // Find top N achievements (for display)
    List<TrainerAchievement> findTop4ByTrainerUserIdOrderByAchievedDateDesc(Long trainerId);

    // Check if achievement already exists (idempotency)
    boolean existsByTrainerUserIdAndAchievementKey(Long trainerId, String achievementKey);

    // Find by type
    List<TrainerAchievement> findByTrainerUserIdAndAchievementTypeOrderByAchievedDateDesc(
            Long trainerId, AchievementType achievementType);

    // Find by type and key (for checking specific milestone)
    Optional<TrainerAchievement> findByTrainerUserIdAndAchievementTypeAndAchievementKey(
            Long trainerId, AchievementType achievementType, String achievementKey);

    // Count achievements by type
    long countByTrainerUserIdAndAchievementType(Long trainerId, AchievementType achievementType);

    // Total achievements count
    long countByTrainerUserId(Long trainerId);

    // Recent achievements in date range
    List<TrainerAchievement> findByTrainerUserIdAndAchievedDateBetweenOrderByAchievedDateDesc(
            Long trainerId, LocalDate start, LocalDate end);
}
