package com.gym.management.repository;

import com.gym.management.model.PlanVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanVariantRepository extends JpaRepository<PlanVariant, Long> {
}
