package com.gym.management.repository;

import com.gym.management.model.PTSession;
import com.gym.management.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for PTSession entity
 * Provides CRUD operations and custom queries for PT session management
 */
@Repository
public interface PTSessionRepository extends JpaRepository<PTSession, Long> {

        long countByMemberUserIdAndStatus(Long memberId, SessionStatus status);

        PTSession findTopByMemberUserIdOrderBySessionDateDesc(Long memberId);

        /**
         * Find all sessions for a specific trainer
         * 
         * @param trainerId The trainer's user ID
         * @return List of PT sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.trainer.userId = :trainerId ORDER BY s.sessionDate")
        List<PTSession> findByTrainerId(@Param("trainerId") Long trainerId);

        /**
         * Find all sessions for a specific member
         * 
         * @param memberId The member's user ID
         * @return List of PT sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.member.userId = :memberId ORDER BY s.sessionDate")
        List<PTSession> findByMemberId(@Param("memberId") Long memberId);

        /**
         * Find sessions for a trainer within a date range
         * 
         * @param trainerId The trainer's user ID
         * @param startDate Start of date range
         * @param endDate   End of date range
         * @return List of PT sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.trainer.userId = :trainerId " +
                        "AND s.sessionDate BETWEEN :startDate AND :endDate " +
                        "ORDER BY s.sessionDate")
        List<PTSession> findByTrainerIdAndDateRange(
                        @Param("trainerId") Long trainerId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Find sessions for a member within a date range
         * 
         * @param memberId  The member's user ID
         * @param startDate Start of date range
         * @param endDate   End of date range
         * @return List of PT sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.member.userId = :memberId " +
                        "AND s.sessionDate BETWEEN :startDate AND :endDate " +
                        "ORDER BY s.sessionDate")
        List<PTSession> findByMemberIdAndDateRange(
                        @Param("memberId") Long memberId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Find conflicting sessions for a trainer at a specific time
         * Used for availability checking
         * 
         * @param trainerId       The trainer's user ID
         * @param sessionDate     The proposed session date/time
         * @param durationMinutes The session duration
         * @return List of conflicting sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.trainer.userId = :trainerId " +
                        "AND s.status IN ('SCHEDULED', 'COMPLETED') " +
                        "AND s.sessionDate < :endTime " +
                        "AND FUNCTION('DATEADD', MINUTE, s.durationMinutes, s.sessionDate) > :sessionDate")
        List<PTSession> findConflictingSessions(
                        @Param("trainerId") Long trainerId,
                        @Param("sessionDate") LocalDateTime sessionDate,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Find sessions by status
         * 
         * @param status The session status
         * @return List of PT sessions
         */
        List<PTSession> findByStatus(SessionStatus status);

        /**
         * Find upcoming sessions for a trainer
         * 
         * @param trainerId   The trainer's user ID
         * @param currentDate Current date/time
         * @return List of upcoming PT sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.trainer.userId = :trainerId " +
                        "AND s.sessionDate >= :currentDate " +
                        "AND s.status = 'SCHEDULED' " +
                        "ORDER BY s.sessionDate")
        List<PTSession> findUpcomingSessionsByTrainer(
                        @Param("trainerId") Long trainerId,
                        @Param("currentDate") LocalDateTime currentDate);

        /**
         * Find upcoming sessions for a member
         * 
         * @param memberId    The member's user ID
         * @param currentDate Current date/time
         * @return List of upcoming PT sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.member.userId = :memberId " +
                        "AND s.sessionDate >= :currentDate " +
                        "AND s.status = 'SCHEDULED' " +
                        "ORDER BY s.sessionDate")
        List<PTSession> findUpcomingSessionsByMember(
                        @Param("memberId") Long memberId,
                        @Param("currentDate") LocalDateTime currentDate);

        /**
         * Count sessions for a trainer on a specific date
         * Used for daily session limit enforcement
         * 
         * @param trainerId  The trainer's user ID
         * @param startOfDay Start of the day
         * @param endOfDay   End of the day
         * @return Count of sessions
         */
        @Query("SELECT COUNT(s) FROM PTSession s WHERE s.trainer.userId = :trainerId " +
                        "AND s.sessionDate BETWEEN :startOfDay AND :endOfDay " +
                        "AND s.status IN ('SCHEDULED', 'COMPLETED')")
        Long countSessionsByTrainerAndDate(
                        @Param("trainerId") Long trainerId,
                        @Param("startOfDay") LocalDateTime startOfDay,
                        @Param("endOfDay") LocalDateTime endOfDay);

        /**
         * Find sessions within 24 hours for reminder generation
         * 
         * @param startTime Start of time window
         * @param endTime   End of time window (24 hours later)
         * @return List of sessions needing reminders
         */
        @Query("SELECT s FROM PTSession s WHERE s.sessionDate BETWEEN :startTime AND :endTime " +
                        "AND s.status = 'SCHEDULED' " +
                        "ORDER BY s.sessionDate")
        List<PTSession> findSessionsWithin24Hours(
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * Find scheduled sessions that have passed their end time
         * 
         * @param now Current date/time
         * @return List of expired sessions
         */
        @Query("SELECT s FROM PTSession s WHERE s.status = 'SCHEDULED' " +
                        "AND FUNCTION('DATEADD', MINUTE, s.durationMinutes, s.sessionDate) < :now")
        List<PTSession> findExpiredScheduledSessions(@Param("now") LocalDateTime now);

        /**
         * Count completed sessions for a trainer within a date range
         * Used for revenue calculation
         */
        @Query("SELECT COUNT(s) FROM PTSession s WHERE s.trainer.userId = :trainerId " +
                        "AND s.status = 'COMPLETED' " +
                        "AND s.sessionDate BETWEEN :startDate AND :endDate")
        Long countCompletedSessionsByTrainerAndDateRange(
                        @Param("trainerId") Long trainerId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Count distinct active members for a trainer (clients with completed sessions)
         */
        @Query("SELECT COUNT(DISTINCT s.member.userId) FROM PTSession s " +
                        "WHERE s.trainer.userId = :trainerId " +
                        "AND s.status = 'COMPLETED'")
        Long countDistinctMembersByTrainer(@Param("trainerId") Long trainerId);

        /**
         * Get total session minutes for a trainer within a date range
         * Used for hourly-based revenue calculation
         */
        @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM PTSession s " +
                        "WHERE s.trainer.userId = :trainerId " +
                        "AND s.status = 'COMPLETED' " +
                        "AND s.sessionDate BETWEEN :startDate AND :endDate")
        Long sumSessionMinutesByTrainerAndDateRange(
                        @Param("trainerId") Long trainerId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}
