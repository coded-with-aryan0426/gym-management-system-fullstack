package com.gym.management.repository;

import com.gym.management.model.StaffPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StaffPerformance entity
 * Provides CRUD operations and custom queries for staff performance tracking
 */
@Repository
public interface StaffPerformanceRepository extends JpaRepository<StaffPerformance, Long> {

    /**
     * Find performance record for a specific staff member and month
     * @param staffId The staff member's user ID
     * @param recordMonth The month in YYYY-MM format
     * @return Optional containing the performance record if found
     */
    @Query("SELECT sp FROM StaffPerformance sp WHERE sp.staff.userId = :staffId " +
           "AND sp.recordMonth = :recordMonth")
    Optional<StaffPerformance> findByStaffIdAndMonth(
        @Param("staffId") Long staffId,
        @Param("recordMonth") String recordMonth
    );

    /**
     * Find all performance records for a specific staff member
     * @param staffId The staff member's user ID
     * @return List of performance records ordered by month
     */
    @Query("SELECT sp FROM StaffPerformance sp WHERE sp.staff.userId = :staffId " +
           "ORDER BY sp.recordMonth DESC")
    List<StaffPerformance> findByStaffId(@Param("staffId") Long staffId);

    /**
     * Find performance records for a specific month across all staff
     * @param recordMonth The month in YYYY-MM format
     * @return List of performance records
     */
    List<StaffPerformance> findByRecordMonth(String recordMonth);

    /**
     * Find top performing staff by sessions completed for a given month
     * @param recordMonth The month in YYYY-MM format
     * @param limit Maximum number of results
     * @return List of top performers
     */
    @Query("SELECT sp FROM StaffPerformance sp WHERE sp.recordMonth = :recordMonth " +
           "ORDER BY sp.sessionsCompleted DESC")
    List<StaffPerformance> findTopPerformersByMonth(
        @Param("recordMonth") String recordMonth
    );

    /**
     * Calculate average attendance rate for all staff in a given month
     * @param recordMonth The month in YYYY-MM format
     * @return Average attendance rate
     */
    @Query("SELECT AVG(sp.attendanceRate) FROM StaffPerformance sp " +
           "WHERE sp.recordMonth = :recordMonth")
    Double calculateAverageAttendanceRate(@Param("recordMonth") String recordMonth);

    /**
     * Calculate average satisfaction score for all staff in a given month
     * @param recordMonth The month in YYYY-MM format
     * @return Average satisfaction score
     */
    @Query("SELECT AVG(sp.satisfactionScore) FROM StaffPerformance sp " +
           "WHERE sp.recordMonth = :recordMonth")
    Double calculateAverageSatisfactionScore(@Param("recordMonth") String recordMonth);

    /**
     * Count total staff with performance records for a given month
     * @param recordMonth The month in YYYY-MM format
     * @return Count of staff members
     */
    @Query("SELECT COUNT(sp) FROM StaffPerformance sp WHERE sp.recordMonth = :recordMonth")
    Long countStaffByMonth(@Param("recordMonth") String recordMonth);
}
