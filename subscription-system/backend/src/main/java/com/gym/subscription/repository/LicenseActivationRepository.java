package com.gym.subscription.repository;

import com.gym.subscription.entity.LicenseActivation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseActivationRepository extends JpaRepository<LicenseActivation, String> {

    List<LicenseActivation> findByLicenseIdAndIsActiveTrue(String licenseId);

    Optional<LicenseActivation> findByLicenseIdAndDeviceFingerprint(String licenseId, String deviceFingerprint);

    @Query("SELECT a FROM LicenseActivation a WHERE a.license.user.id = :userId AND a.isActive = true")
    List<LicenseActivation> findActiveByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(a) FROM LicenseActivation a WHERE a.license.id = :licenseId AND a.isActive = true")
    int countActiveByLicenseId(@Param("licenseId") String licenseId);

    void deleteByLicenseId(String licenseId);
}
