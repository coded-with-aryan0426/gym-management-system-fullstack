package com.gym.management.repository;

import com.gym.management.model.MemberPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberPreferenceRepository extends JpaRepository<MemberPreference, Long> {
}
