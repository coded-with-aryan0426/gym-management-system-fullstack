package com.gym.management.repository;

import com.gym.management.model.BodyMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, Long> {

    List<BodyMeasurement> findByUserUserIdOrderByRecordDateDesc(Long userId);

    List<BodyMeasurement> findByUserUserIdOrderByRecordDateAsc(Long userId);

    Optional<BodyMeasurement> findTopByUserUserIdOrderByRecordDateDesc(Long userId);

    Optional<BodyMeasurement> findTopByUserUserIdOrderByRecordDateAsc(Long userId);

    @Query("SELECT b FROM BodyMeasurement b WHERE b.user.userId = :userId AND b.recordDate >= :startDate ORDER BY b.recordDate ASC")
    List<BodyMeasurement> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    long countByUserUserId(Long userId);
}
