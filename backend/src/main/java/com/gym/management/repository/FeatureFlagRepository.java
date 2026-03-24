package com.gym.management.repository;

import com.gym.management.model.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, Long> {

    Optional<FeatureFlag> findByFeatureKey(String featureKey);

    boolean existsByFeatureKey(String featureKey);
}