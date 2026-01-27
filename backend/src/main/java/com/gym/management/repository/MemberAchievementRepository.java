package com.gym.management.repository;

import com.gym.management.model.MemberAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberAchievementRepository extends JpaRepository<MemberAchievement, Long> {

    List<MemberAchievement> findByUserUserIdOrderByEarnedAtDesc(Long userId);

    long countByUserUserId(Long userId);
}
