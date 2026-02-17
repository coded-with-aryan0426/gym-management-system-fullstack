package com.gym.management.repository;

import com.gym.management.model.ProgressMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressMetricRepository extends JpaRepository<ProgressMetric, Long> {

    List<ProgressMetric> findByUserUserIdOrderByRecordDateDesc(Long userId);

    List<ProgressMetric> findByUserUserIdOrderByRecordDateAsc(Long userId);

    Optional<ProgressMetric> findTopByUserUserIdOrderByRecordDateDesc(Long userId);

    Optional<ProgressMetric> findTopByUserUserIdOrderByRecordDateAsc(Long userId);

    @Query("SELECT p FROM ProgressMetric p WHERE p.user.userId = :userId AND p.recordDate >= :startDate ORDER BY p.recordDate ASC")
    List<ProgressMetric> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT p FROM ProgressMetric p WHERE p.user.userId = :userId AND p.recordDate BETWEEN :startDate AND :endDate ORDER BY p.recordDate ASC")
    List<ProgressMetric> findByUserIdAndDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByUserUserId(Long userId);

    @Query("SELECT p FROM ProgressMetric p WHERE p.user.userId = :userId ORDER BY p.recordDate DESC FETCH FIRST :limit ROWS ONLY")
    List<ProgressMetric> findLatestEntriesByUserId(@Param("userId") Long userId, @Param("limit") int limit);
}
