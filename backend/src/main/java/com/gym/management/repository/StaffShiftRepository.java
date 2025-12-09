package com.gym.management.repository;

import com.gym.management.model.StaffShift;
import com.gym.management.model.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for StaffShift entity
 * Provides CRUD operations and custom queries for staff shift management
 */
@Repository
public interface StaffShiftRepository extends JpaRepository<StaffShift, Long> {

    /**
     * Find all shifts for a specific staff member
     * @param staffId The staff member's user ID
     * @return List of shifts ordered by date
     */
    @Query("SELECT s FROM StaffShift s WHERE s.staff.userId = :staffId " +
           "ORDER BY s.shiftDate, s.startTime")
    List<StaffShift> findByStaffId(@Param("staffId") Long staffId);

    /**
     * Find shifts for a staff member within a date range
     * @param staffId The staff member's user ID
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of shifts
     */
    @Query("SELECT s FROM StaffShift s WHERE s.staff.userId = :staffId " +
           "AND s.shiftDate BETWEEN :startDate AND :endDate " +
           "ORDER BY s.shiftDate, s.startTime")
    List<StaffShift> findByStaffIdAndDateRange(
        @Param("staffId") Long staffId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Find all shifts for a specific date
     * @param shiftDate The date to query
     * @return List of shifts for that date
     */
    List<StaffShift> findByShiftDate(LocalDate shiftDate);

    /**
     * Find shifts by status
     * @param status The shift status
     * @return List of shifts with that status
     */
    List<StaffShift> findByStatus(ShiftStatus status);

    /**
     * Find upcoming shifts for a staff member
     * @param staffId The staff member's user ID
     * @param currentDate Current date
     * @return List of upcoming shifts
     */
    @Query("SELECT s FROM StaffShift s WHERE s.staff.userId = :staffId " +
           "AND s.shiftDate >= :currentDate " +
           "AND s.status = 'SCHEDULED' " +
           "ORDER BY s.shiftDate, s.startTime")
    List<StaffShift> findUpcomingShiftsByStaff(
        @Param("staffId") Long staffId,
        @Param("currentDate") LocalDate currentDate
    );

    /**
     * Find all shifts for a specific date range across all staff
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of shifts
     */
    @Query("SELECT s FROM StaffShift s WHERE s.shiftDate BETWEEN :startDate AND :endDate " +
           "ORDER BY s.shiftDate, s.startTime")
    List<StaffShift> findByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Count shifts for a staff member on a specific date
     * @param staffId The staff member's user ID
     * @param shiftDate The date to check
     * @return Count of shifts
     */
    @Query("SELECT COUNT(s) FROM StaffShift s WHERE s.staff.userId = :staffId " +
           "AND s.shiftDate = :shiftDate")
    Long countShiftsByStaffAndDate(
        @Param("staffId") Long staffId,
        @Param("shiftDate") LocalDate shiftDate
    );

    /**
     * Find conflicting shifts for a staff member
     * Used to prevent double-booking
     * @param staffId The staff member's user ID
     * @param shiftDate The proposed shift date
     * @param startTime The proposed start time
     * @param endTime The proposed end time
     * @return List of conflicting shifts
     */
    @Query("SELECT s FROM StaffShift s WHERE s.staff.userId = :staffId " +
           "AND s.shiftDate = :shiftDate " +
           "AND s.status != 'MISSED' " +
           "AND ((s.startTime < :endTime AND s.endTime > :startTime))")
    List<StaffShift> findConflictingShifts(
        @Param("staffId") Long staffId,
        @Param("shiftDate") LocalDate shiftDate,
        @Param("startTime") java.time.LocalDateTime startTime,
        @Param("endTime") java.time.LocalDateTime endTime
    );
}
