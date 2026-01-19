package com.gym.management.repository;

import com.gym.management.model.TrainerSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainerSettingsRepository extends JpaRepository<TrainerSettings, Long> {
    Optional<TrainerSettings> findByUserUserId(Long userId);
}
