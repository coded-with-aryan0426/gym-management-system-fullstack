package com.gym.management.repository;

import com.gym.management.model.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    // Find all active check-ins (not checked out yet)
    @Query("SELECT c FROM CheckIn c WHERE c.checkOutTime IS NULL ORDER BY c.checkInTime DESC")
    List<CheckIn> findActiveCheckIns();

    // Find check-ins for today
    @Query("SELECT c FROM CheckIn c JOIN FETCH c.user WHERE c.checkInTime >= :startOfDay ORDER BY c.checkInTime DESC")
    List<CheckIn> findTodayCheckIns(@Param("startOfDay") LocalDateTime startOfDay);

    // Count active check-ins
    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.checkOutTime IS NULL")
    Long countActiveCheckIns();

    // Find check-ins by user
    List<CheckIn> findByUserUserIdOrderByCheckInTimeDesc(Long userId);
}
