package com.gym.management.repository;

import com.gym.management.model.MembershipPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for MembershipPackage entity
 * Provides CRUD operations and custom queries for membership package management
 */
@Repository
public interface MembershipPackageRepository extends JpaRepository<MembershipPackage, Long> {

    /**
     * Find all active packages
     * @return List of active membership packages
     */
    @Query("SELECT p FROM MembershipPackage p WHERE p.isActive = true " +
           "ORDER BY p.price")
    List<MembershipPackage> findActivePackages();

    /**
     * Find packages by active status
     * @param isActive The active status
     * @return List of packages
     */
    List<MembershipPackage> findByIsActive(Boolean isActive);

    /**
     * Find package by name
     * @param packageName The package name
     * @return Optional containing the package if found
     */
    Optional<MembershipPackage> findByPackageName(String packageName);

    /**
     * Find packages within a price range
     * @param minPrice Minimum price
     * @param maxPrice Maximum price
     * @return List of packages in price range
     */
    @Query("SELECT p FROM MembershipPackage p WHERE p.price BETWEEN :minPrice AND :maxPrice " +
           "AND p.isActive = true " +
           "ORDER BY p.price")
    List<MembershipPackage> findByPriceRange(
        @Param("minPrice") Double minPrice,
        @Param("maxPrice") Double maxPrice
    );

    /**
     * Find packages by duration range
     * @param minDays Minimum duration in days
     * @param maxDays Maximum duration in days
     * @return List of packages in duration range
     */
    @Query("SELECT p FROM MembershipPackage p WHERE p.durationDays BETWEEN :minDays AND :maxDays " +
           "AND p.isActive = true " +
           "ORDER BY p.durationDays")
    List<MembershipPackage> findByDurationRange(
        @Param("minDays") Integer minDays,
        @Param("maxDays") Integer maxDays
    );

    /**
     * Find packages that include PT sessions
     * @return List of packages with PT sessions
     */
    @Query("SELECT p FROM MembershipPackage p WHERE p.includedPTSessions > 0 " +
           "AND p.isActive = true " +
           "ORDER BY p.includedPTSessions DESC")
    List<MembershipPackage> findPackagesWithPTSessions();

    /**
     * Find the most popular packages (placeholder for future implementation with subscription tracking)
     * Currently returns all active packages ordered by price
     * @param limit Maximum number of results
     * @return List of popular packages
     */
    @Query("SELECT p FROM MembershipPackage p WHERE p.isActive = true " +
           "ORDER BY p.price DESC")
    List<MembershipPackage> findPopularPackages();

    /**
     * Count active packages
     * @return Count of active packages
     */
    @Query("SELECT COUNT(p) FROM MembershipPackage p WHERE p.isActive = true")
    Long countActivePackages();

    /**
     * Check if package name already exists
     * @param packageName The package name to check
     * @return true if exists, false otherwise
     */
    boolean existsByPackageName(String packageName);

    /**
     * Check if package name + duration already exists
     * @param packageName The package name to check
     * @param durationDays The duration in days
     * @return true if exists, false otherwise
     */
    boolean existsByPackageNameAndDurationDays(String packageName, Integer durationDays);

    /**
     * Check if package name + duration already exists excluding current id
     * @param packageName The package name to check
     * @param durationDays The duration in days
     * @param packageId The package id to exclude
     * @return true if exists, false otherwise
     */
    boolean existsByPackageNameAndDurationDaysAndPackageIdNot(String packageName, Integer durationDays, Long packageId);
}
