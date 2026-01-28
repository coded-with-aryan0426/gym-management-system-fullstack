package com.gym.management.repository;

import com.gym.management.model.GymClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GymClassRepository extends JpaRepository<GymClass, Long> {

    List<GymClass> findByStartTimeAfterAndStatusOrderByStartTimeAsc(LocalDateTime startTime, GymClass.ClassStatus status);

    List<GymClass> findByStartTimeBetweenAndStatusOrderByStartTimeAsc(LocalDateTime start, LocalDateTime end, GymClass.ClassStatus status);

    @Query("SELECT gc FROM GymClass gc WHERE gc.trainer.userId = :trainerId AND gc.startTime > :now ORDER BY gc.startTime ASC")
    List<GymClass> findUpcomingByTrainer(@Param("trainerId") Long trainerId, @Param("now") LocalDateTime now);

    @Query("SELECT gc FROM GymClass gc WHERE gc.classType = :classType AND gc.startTime > :now AND gc.status = 'SCHEDULED' ORDER BY gc.startTime ASC")
    List<GymClass> findByClassType(@Param("classType") String classType, @Param("now") LocalDateTime now);

    @Query("SELECT gc FROM GymClass gc WHERE gc.startTime >= :startOfDay AND gc.startTime < :endOfDay AND gc.status = 'SCHEDULED' ORDER BY gc.startTime ASC")
    List<GymClass> findTodaysClasses(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(gc) FROM GymClass gc WHERE gc.startTime > :now AND gc.status = 'SCHEDULED'")
    Long countUpcomingClasses(@Param("now") LocalDateTime now);
}
