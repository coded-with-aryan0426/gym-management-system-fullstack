package com.gym.management.repository;

import com.gym.management.model.MemberGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberGoalRepository extends JpaRepository<MemberGoal, Long> {

    List<MemberGoal> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<MemberGoal> findByUserUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);

    @Query("SELECT g FROM MemberGoal g WHERE g.user.userId = :userId AND g.goalType = :type AND g.isActive = true")
    List<MemberGoal> findActiveGoalsByType(@Param("userId") Long userId, @Param("type") MemberGoal.GoalType type);

    long countByUserUserIdAndIsActiveTrue(Long userId);

    long countByUserUserIdAndCompletedAtIsNotNull(Long userId);
}
