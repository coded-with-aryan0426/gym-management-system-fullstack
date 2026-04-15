package com.gym.management.repository;

import com.gym.management.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    long countByRequestedIpAndCreatedAtAfter(String requestedIp, LocalDateTime createdAt);

    long countByUserUserIdAndCreatedAtAfter(Long userId, LocalDateTime createdAt);

    @Modifying
    @Query("""
            update PasswordResetToken t
               set t.usedAt = :usedAt,
                   t.usedReason = :usedReason
             where t.user.userId = :userId
               and t.usedAt is null
               and t.expiresAt > :usedAt
            """)
    int invalidateActiveTokensForUser(@Param("userId") Long userId,
            @Param("usedAt") LocalDateTime usedAt,
            @Param("usedReason") String usedReason);
}
