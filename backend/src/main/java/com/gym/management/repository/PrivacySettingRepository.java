package com.gym.management.repository;

import com.gym.management.model.PrivacySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrivacySettingRepository extends JpaRepository<PrivacySetting, Long> {
}
