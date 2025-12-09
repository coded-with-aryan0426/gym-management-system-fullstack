package com.gym.management.repository;

import com.gym.management.model.BlackoutDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for BlackoutDay entity
 * Provides CRUD operations and custom queries for blackout day management
 */
@Repository
public interface BlackoutDayRepository extends JpaRepository<BlackoutDay, Long> {

    /**
     * Find blackout day by date
     * @param date The date to check
     * @return Optional containing the blackout day if found
     */
    Optional<BlackoutDay> findByDate(LocalDate date);

    /**
     * Find all blackout days within a date range
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of blackout days in range
     */
    @Query("SELECT b FROM BlackoutDay b WHERE b.date BETWEEN :startDate AND :endDate " +
           "ORDER BY b.date")
    List<BlackoutDay> findByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Find all upcoming blackout days
     * @param currentDate Current date
     * @return List of upcoming blackout days
     */
    @Query("SELECT b FROM BlackoutDay b WHERE b.date >= :currentDate " +
           "ORDER BY b.date")
    List<BlackoutDay> findUpcomingBlackoutDays(@Param("currentDate") LocalDate currentDate);

    /**
     * Find all past blackout days
     * @param currentDate Current date
     * @return List of past blackout days
     */
    @Query("SELECT b FROM BlackoutDay b WHERE b.date < :currentDate " +
           "ORDER BY b.date DESC")
    List<BlackoutDay> findPastBlackoutDays(@Param("currentDate") LocalDate currentDate);

    /**
     * Check if a specific date is a blackout day
     * @param date The date to check
     * @return true if it's a blackout day, false otherwise
     */
    boolean existsByDate(LocalDate date);

    /**
     * Delete blackout day by date
     * @param date The date to delete
     */
    void deleteByDate(LocalDate date);

    /**
     * Find blackout days in a specific month
     * @param year The year
     * @param month The month (1-12)
     * @return List of blackout days in that month
     */
    @Query("SELECT b FROM BlackoutDay b WHERE YEAR(b.date) = :year " +
           "AND MONTH(b.date) = :month " +
           "ORDER BY b.date")
    List<BlackoutDay> findByYearAndMonth(
        @Param("year") int year,
        @Param("month") int month
    );

    /**
     * Find blackout days in a specific year
     * @param year The year
     * @return List of blackout days in that year
     */
    @Query("SELECT b FROM BlackoutDay b WHERE YEAR(b.date) = :year " +
           "ORDER BY b.date")
    List<BlackoutDay> findByYear(@Param("year") int year);

    /**
     * Count blackout days in a date range
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return Count of blackout days
     */
    @Query("SELECT COUNT(b) FROM BlackoutDay b WHERE b.date BETWEEN :startDate AND :endDate")
    Long countByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
