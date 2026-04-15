package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens", indexes = {
        @Index(name = "idx_prt_token_hash", columnList = "token_hash", unique = true),
        @Index(name = "idx_prt_user_created", columnList = "user_id, created_at"),
        @Index(name = "idx_prt_expires_at", columnList = "expires_at")
})
@Data
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reset_token_id")
    private Long resetTokenId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "requested_ip", length = 64)
    private String requestedIp;

    @Column(name = "requested_user_agent", length = 500)
    private String requestedUserAgent;

    @Column(name = "consumed_ip", length = 64)
    private String consumedIp;

    @Column(name = "consumed_user_agent", length = 500)
    private String consumedUserAgent;

    @Column(name = "used_reason", length = 50)
    private String usedReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
