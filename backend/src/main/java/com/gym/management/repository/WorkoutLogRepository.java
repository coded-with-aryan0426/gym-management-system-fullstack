package com.gym.management.repository;

import com.gym.management.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {

    List<WorkoutLog> findByUserUserIdOrderByWorkoutDateDesc(Long userId);

    long countByUserUserId(Long userId);

    @Query("SELECT w FROM WorkoutLog w WHERE w.user.userId = :userId AND w.workoutDate >= :startDate ORDER BY w.workoutDate DESC")
    List<WorkoutLog> findRecentWorkouts(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT DISTINCT w.workoutDate FROM WorkoutLog w WHERE w.user.userId = :userId ORDER BY w.workoutDate DESC")
    List<LocalDate> findWorkoutDatesByUserId(@Param("userId") Long userId);
}
