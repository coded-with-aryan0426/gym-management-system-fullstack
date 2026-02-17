package com.gym.management.repository;

import com.gym.management.model.SessionRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for SessionRating - real ratings, no mocks
 */
@Repository
public interface SessionRatingRepository extends JpaRepository<SessionRating, Long> {

    // Find by session
    Optional<SessionRating> findBySessionId(Long sessionId);

    // Find by class
    List<SessionRating> findByClassId(Long classId);

    // Find all ratings for a trainer
    List<SessionRating> findByTrainerUserIdOrderByCreatedAtDesc(Long trainerId);

    // Average rating for trainer
    @Query("SELECT AVG(r.rating) FROM SessionRating r WHERE r.trainer.userId = :trainerId")
    Double findAverageRatingByTrainer(@Param("trainerId") Long trainerId);

    // Average rating for trainer in period
    @Query("SELECT AVG(r.rating) FROM SessionRating r WHERE r.trainer.userId = :trainerId " +
            "AND r.createdAt BETWEEN :start AND :end")
    Double findAverageRatingByTrainerAndPeriod(
            @Param("trainerId") Long trainerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Count ratings for trainer
    long countByTrainerUserId(Long trainerId);

    // Count ratings in period
    long countByTrainerUserIdAndCreatedAtBetween(Long trainerId, LocalDateTime start, LocalDateTime end);

    // Count perfect ratings (5 stars) in period
    @Query("SELECT COUNT(r) FROM SessionRating r WHERE r.trainer.userId = :trainerId " +
            "AND r.rating = 5 AND r.createdAt BETWEEN :start AND :end")
    long countPerfectRatingsByTrainerAndPeriod(
            @Param("trainerId") Long trainerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Check if all ratings in period are 5 stars
    @Query("SELECT CASE WHEN COUNT(r) = 0 THEN false " +
            "WHEN MIN(r.rating) = 5 THEN true ELSE false END " +
            "FROM SessionRating r WHERE r.trainer.userId = :trainerId " +
            "AND r.createdAt BETWEEN :start AND :end")
    boolean isPerfectRatingPeriod(
            @Param("trainerId") Long trainerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Recent ratings for display
    List<SessionRating> findTop10ByTrainerUserIdOrderByCreatedAtDesc(Long trainerId);
}
