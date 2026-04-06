package com.gym.subscription.repository;

import com.gym.subscription.entity.TrialRateLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrialRateLimitRepository extends JpaRepository<TrialRateLimit, String> {

    Optional<TrialRateLimit> findByUserIdAndEndpoint(String userId, String endpoint);
}
