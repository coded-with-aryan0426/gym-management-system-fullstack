package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.io.Serializable;

/**
 * Entity for user blocking functionality.
 * When a user blocks another, no communication is possible between them.
 * Blocks are silent - the blocked user is not notified.
 */
@Entity
@Table(name = "user_blocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBlock {

    @EmbeddedId
    private BlockId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("blockerId")
    @JoinColumn(name = "blocker_id")
    private User blocker;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("blockedId")
    @JoinColumn(name = "blocked_id")
    private User blocked;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(length = 500)
    private String reason; // Optional reason for admin auditing

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockId implements Serializable {
        @Column(name = "blocker_id")
        private Long blockerId;

        @Column(name = "blocked_id")
        private Long blockedId;
    }
}
