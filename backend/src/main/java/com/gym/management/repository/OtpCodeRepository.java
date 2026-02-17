package com.gym.management.repository;

import com.gym.management.model.OtpCode;
import com.gym.management.model.OtpChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    /**
     * Find the latest unverified OTP for a target (email/phone).
     */
    @Query("SELECT o FROM OtpCode o WHERE o.target = :target AND o.targetType = :channel " +
            "AND o.verified = false AND o.expiresAt > CURRENT_TIMESTAMP " +
            "ORDER BY o.createdAt DESC")
    Optional<OtpCode> findLatestValidOtp(@Param("target") String target,
            @Param("channel") OtpChannel channel);

    /**
     * Find all unverified OTPs for a target to invalidate them.
     */
    List<OtpCode> findByTargetAndTargetTypeAndVerifiedFalse(String target, OtpChannel channel);

    /**
     * Count OTPs sent to a target in the last hour (rate limiting).
     * Using native query for Oracle date arithmetic.
     */
    @Query(value = "SELECT COUNT(*) FROM otp_codes WHERE target = :target " +
            "AND created_at > SYSTIMESTAMP - INTERVAL '1' HOUR", nativeQuery = true)
    long countRecentOtps(@Param("target") String target);
}
