package com.gym.management.repository;

import com.gym.management.model.UserSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    List<UserSession> findByUserUserIdAndIsActiveOrderByLastActiveAtDesc(Long userId, Boolean isActive);

    Optional<UserSession> findByTokenHash(String tokenHash);

    Optional<UserSession> findBySessionIdAndUserUserId(Long sessionId, Long userId);

    // Get all active sessions
    List<UserSession> findByIsActiveTrueOrderByLastActiveAtDesc();

    // Get sessions by gym
    List<UserSession> findByGymGymIdAndIsActiveTrueOrderByLastActiveAtDesc(Long gymId);

    // Get all sessions (active and inactive) with pagination
    Page<UserSession> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Get sessions by gym with pagination
    Page<UserSession> findByGymGymIdOrderByCreatedAtDesc(Long gymId, Pageable pageable);

    // Count online users (active sessions with recent activity)
    @Query("SELECT COUNT(DISTINCT s.user.userId) FROM UserSession s WHERE s.isActive = true AND s.lastActiveAt > :since")
    Long countOnlineUsers(@Param("since") LocalDateTime since);

    // Count online users by gym
    @Query("SELECT COUNT(DISTINCT s.user.userId) FROM UserSession s WHERE s.isActive = true AND s.gym.gymId = :gymId AND s.lastActiveAt > :since")
    Long countOnlineUsersByGym(@Param("gymId") Long gymId, @Param("since") LocalDateTime since);

    // Get average session duration
    @Query("SELECT AVG(s.duration) FROM UserSession s WHERE s.duration IS NOT NULL AND s.duration > 0")
    Double getAverageSessionDuration();

    // Get average session duration by gym
    @Query("SELECT AVG(s.duration) FROM UserSession s WHERE s.duration IS NOT NULL AND s.duration > 0 AND s.gym.gymId = :gymId")
    Double getAverageSessionDurationByGym(@Param("gymId") Long gymId);

    // Count total sessions
    Long countByGymGymId(Long gymId);

    // Count active sessions
    Long countByGymGymIdAndIsActive(Long gymId, Boolean isActive);

    @Modifying
    @Transactional
    @Query("UPDATE UserSession s SET s.isActive = false WHERE s.user.userId = :userId AND s.sessionId != :currentSessionId")
    void deactivateAllOtherSessions(@Param("userId") Long userId, @Param("currentSessionId") Long currentSessionId);

    @Modifying
    @Transactional
    @Query("UPDATE UserSession s SET s.isActive = false WHERE s.sessionId = :sessionId")
    void deactivateSession(@Param("sessionId") Long sessionId);

    @Modifying
    @Transactional
    @Query("UPDATE UserSession s SET s.lastActiveAt = :lastActiveAt WHERE s.tokenHash = :tokenHash")
    void updateLastActive(@Param("tokenHash") String tokenHash, @Param("lastActiveAt") LocalDateTime lastActiveAt);

    @Modifying
    @Transactional
    @Query("UPDATE UserSession s SET s.status = :status, s.lastActiveAt = :lastActiveAt WHERE s.tokenHash = :tokenHash")
    void updateStatusAndLastActive(@Param("tokenHash") String tokenHash, @Param("status") String status, @Param("lastActiveAt") LocalDateTime lastActiveAt);

    @Modifying
    @Transactional
    @Query("UPDATE UserSession s SET s.isActive = false, s.status = 'offline', s.logoutAt = :logoutAt WHERE s.tokenHash = :tokenHash")
    void logoutSession(@Param("tokenHash") String tokenHash, @Param("logoutAt") LocalDateTime logoutAt);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < :now OR (s.isActive = false AND s.lastActiveAt < :cutoff)")
    void cleanupExpiredSessions(@Param("now") LocalDateTime now, @Param("cutoff") LocalDateTime cutoff);

    Long countByUserUserIdAndIsActive(Long userId, Boolean isActive);
}
