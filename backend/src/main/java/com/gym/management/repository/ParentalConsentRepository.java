package com.gym.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.gym.management.model.ParentalConsent;
import java.util.Optional;
import java.util.List;

@Repository
public interface ParentalConsentRepository extends JpaRepository<ParentalConsent, Long> {

    Optional<ParentalConsent> findByUserIdAndConsentStatus(Long userId, String consentStatus);

    Optional<ParentalConsent> findByVerificationToken(String verificationToken);

    List<ParentalConsent> findByUserId(Long userId);

    @Query("SELECT pc FROM ParentalConsent pc WHERE pc.userId = :userId AND pc.consentStatus = 'APPROVED' AND pc.expiresAt > CURRENT_TIMESTAMP")
    Optional<ParentalConsent> findValidConsentByUserId(@Param("userId") Long userId);

    List<ParentalConsent> findByConsentStatus(String consentStatus);

    @Query("SELECT pc FROM ParentalConsent pc WHERE pc.expiresAt < CURRENT_TIMESTAMP AND pc.consentStatus = 'APPROVED'")
    List<ParentalConsent> findExpiredConsents();
}
