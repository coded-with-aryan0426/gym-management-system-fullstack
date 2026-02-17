package com.gym.management.repository;

import com.gym.management.model.OtpRecord;
import com.gym.management.model.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRecordRepository extends JpaRepository<OtpRecord, Long> {
    Optional<OtpRecord> findTopByEmailAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(String email, OtpPurpose purpose);
}
