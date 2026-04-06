package com.gym.subscription.repository;

import com.gym.subscription.entity.LicenseKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseKeyRepository extends JpaRepository<LicenseKey, String> {

    Optional<LicenseKey> findByLicenseKey(String licenseKey);

    Optional<LicenseKey> findByUserIdAndIsRevokedFalseAndExpiresAtAfter(String userId, LocalDateTime now);

    List<LicenseKey> findByUserId(String userId);

    @Query("SELECT l FROM LicenseKey l WHERE l.user.id = :userId AND l.isRevoked = false ORDER BY l.createdAt DESC")
    List<LicenseKey> findActiveByUserId(@Param("userId") String userId);

    @Query("SELECT l FROM LicenseKey l WHERE l.isRevoked = false AND l.expiresAt < :now")
    List<LicenseKey> findExpiredLicenses(@Param("now") LocalDateTime now);

    @Query("SELECT l FROM LicenseKey l WHERE l.subscription.id = :subscriptionId")
    Optional<LicenseKey> findBySubscriptionId(@Param("subscriptionId") String subscriptionId);

    boolean existsByLicenseKey(String licenseKey);

    @Query("SELECT COUNT(l) FROM LicenseKey l WHERE l.planTier >= :tier AND l.isRevoked = false AND l.expiresAt > :now")
    long countActiveLicensesByTier(@Param("tier") int tier, @Param("now") LocalDateTime now);
}
