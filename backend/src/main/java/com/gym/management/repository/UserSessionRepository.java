package com.gym.management.repository;

import com.gym.management.model.UserSession;
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
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < :now OR (s.isActive = false AND s.lastActiveAt < :cutoff)")
    void cleanupExpiredSessions(@Param("now") LocalDateTime now, @Param("cutoff") LocalDateTime cutoff);

    Long countByUserUserIdAndIsActive(Long userId, Boolean isActive);
}
