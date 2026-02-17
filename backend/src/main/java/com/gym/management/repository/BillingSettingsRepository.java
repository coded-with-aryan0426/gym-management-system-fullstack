package com.gym.management.repository;

import com.gym.management.model.BillingSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillingSettingsRepository extends JpaRepository<BillingSettings, Long> {
    
    Optional<BillingSettings> findByGymId(Long gymId);
    
    boolean existsByGymId(Long gymId);
}
