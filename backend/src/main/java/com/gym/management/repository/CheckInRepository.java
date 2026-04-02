package com.gym.management.repository;

import com.gym.management.model.CheckIn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.checkOutTime IS NULL AND c.gymId = :gymId ORDER BY c.checkInTime DESC")
    List<CheckIn> findActiveCheckInsByGymId(@Param("gymId") Long gymId);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.checkOutTime IS NULL ORDER BY c.checkInTime DESC")
    List<CheckIn> findActiveCheckIns();

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.checkInTime >= :startOfDay AND c.gymId = :gymId ORDER BY c.checkInTime DESC")
    List<CheckIn> findTodayCheckIns(@Param("startOfDay") LocalDateTime startOfDay, @Param("gymId") Long gymId);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.checkInTime >= :startOfDay ORDER BY c.checkInTime DESC")
    List<CheckIn> findTodayCheckIns(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.checkOutTime IS NULL AND c.gymId = :gymId")
    Long countActiveCheckInsByGymId(@Param("gymId") Long gymId);

    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.checkOutTime IS NULL")
    Long countActiveCheckIns();

    List<CheckIn> findByUserUserIdOrderByCheckInTimeDesc(Long userId);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.checkInTime BETWEEN :startDate AND :endDate AND c.gymId = :gymId ORDER BY c.checkInTime DESC")
    List<CheckIn> findCheckInsForDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("gymId") Long gymId);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.checkInTime BETWEEN :startDate AND :endDate ORDER BY c.checkInTime DESC")
    List<CheckIn> findCheckInsForDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT c FROM CheckIn c WHERE c.user.userId = :userId AND c.checkInTime >= :startOfDay AND c.checkInTime < :endOfDay AND c.checkOutTime IS NULL")
    Optional<CheckIn> findActiveCheckInByUserIdAndDate(
            @Param("userId") Long userId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.user.userId = :userId AND CAST(c.checkInTime AS DATE) = :date")
    long countByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.user.userId = :userId AND c.checkInTime BETWEEN :start AND :end ORDER BY c.checkInTime DESC")
    List<CheckIn> findByUserUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.gymId = :gymId AND c.checkInTime BETWEEN :start AND :end ORDER BY c.checkInTime DESC")
    Page<CheckIn> findByGymIdAndDateRangePaginated(
            @Param("gymId") Long gymId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    @Query("SELECT COUNT(DISTINCT c.user.userId) FROM CheckIn c WHERE c.gymId = :gymId AND CAST(c.checkInTime AS DATE) >= :since")
    long countUniqueMembersSince(@Param("gymId") Long gymId, @Param("since") LocalDate since);

    @Query(value = "SELECT COUNT(DISTINCT user_id) FROM check_ins WHERE gym_id = :gymId AND CAST(check_in_time AS DATE) >= :weekStart AND CAST(check_in_time AS DATE) < :weekEnd", nativeQuery = true)
    long countUniqueMembersForWeek(
            @Param("gymId") Long gymId,
            @Param("weekStart") LocalDate weekStart,
            @Param("weekEnd") LocalDate weekEnd);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.user.userId = :userId AND c.checkOutTime IS NOT NULL ORDER BY c.checkInTime DESC")
    List<CheckIn> findCompletedCheckInsByUserId(@Param("userId") Long userId);
}
