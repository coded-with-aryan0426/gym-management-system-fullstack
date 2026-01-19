package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Entity for session ratings - REAL data, no mocks
 * Supports both PT sessions and group class ratings
 */
@Entity
@Table(name = "session_ratings", indexes = {
        @Index(name = "idx_rating_trainer", columnList = "trainer_id"),
        @Index(name = "idx_rating_member", columnList = "member_id"),
        @Index(name = "idx_rating_session", columnList = "session_id"),
        @Index(name = "idx_rating_created", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "class_id")
    private Long classId; // For group class ratings

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private User member;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(name = "rating_comment", length = 500)
    private String ratingComment;

    @Column(name = "session_type", length = 50)
    private String sessionType; // PT, GROUP, HIIT, YOGA, etc.

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
