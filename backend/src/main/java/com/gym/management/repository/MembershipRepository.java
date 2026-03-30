package com.gym.management.repository;

import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Membership m LEFT JOIN FETCH m.membershipPackage WHERE m.user.userId = :userId")
    List<Membership> findByUserUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Membership m LEFT JOIN FETCH m.membershipPackage WHERE m.user.userId = :userId AND m.status = :status")
    List<Membership> findByUserUserIdAndStatus(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("status") MembershipStatus status);

    List<Membership> findByGymGymIdAndStatus(Long gymId, MembershipStatus status);

    List<Membership> findByGymGymId(Long gymId);

    Optional<Membership> findByGymGymIdAndUserUserId(Long gymId, Long userId);

    boolean existsByGymGymIdAndUserUserId(Long gymId, Long userId);

    Optional<Membership> findTopByUserUserIdAndStatusOrderByEndDateDesc(Long userId, MembershipStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Membership m LEFT JOIN FETCH m.membershipPackage JOIN FETCH m.user WHERE m.status = 'ACTIVE' AND m.endDate BETWEEN :startDate AND :endDate ORDER BY m.endDate ASC")
    List<Membership> findExpiringMemberships(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    /**
     * Check if any members are using a specific membership package
     * @param packageId The package ID to check
     * @return true if the package is in use by any member
     */
    boolean existsByMembershipPackagePackageId(Long packageId);

    /**
     * Count how many members are using a specific membership package
     * @param packageId The package ID to check
     * @return count of members using this package
     */
    long countByMembershipPackagePackageId(Long packageId);

    // NEW METHODS FOR DASHBOARD ANALYTICS
    
    /**
     * Count active memberships
     */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM Membership m WHERE m.status = 'ACTIVE'")
    Integer countActiveMemberships();

    /**
     * Count expiring memberships within date range
     */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM Membership m WHERE m.status = 'ACTIVE' AND m.endDate BETWEEN :startDate AND :endDate")
    Integer countExpiringMemberships(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    /**
     * Count frozen memberships
     */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM Membership m WHERE m.status = 'FROZEN'")
    Integer countFrozenMemberships();

    /**
     * Count expired memberships
     */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM Membership m WHERE m.status = 'EXPIRED'")
    Integer countExpiredMemberships();

    /**
     * Find memberships by status and date range (for notification scheduling)
     */
    @org.springframework.data.jpa.repository.Query("SELECT m FROM Membership m LEFT JOIN FETCH m.user LEFT JOIN FETCH m.membershipPackage WHERE m.status = :status AND m.endDate BETWEEN :startDate AND :endDate ORDER BY m.endDate ASC")
    List<Membership> findByStatusAndEndDateBetweenOrderByEndDateAsc(
            @org.springframework.data.repository.query.Param("status") String status,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);
}