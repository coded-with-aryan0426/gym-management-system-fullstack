package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for persistent, idempotent trainer achievements
 * Once awarded, never recalculated - deterministic history
 */
@Entity
@Table(name = "trainer_achievements", indexes = {
        @Index(name = "idx_achievement_trainer", columnList = "trainer_id"),
        @Index(name = "idx_achievement_type", columnList = "achievement_type")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_trainer_achievement", columnNames = { "trainer_id", "achievement_type",
                "achievement_key" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @Column(name = "achievement_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AchievementType achievementType;

    @Column(name = "achievement_key", nullable = false, length = 100)
    private String achievementKey; // e.g., "MILESTONE_100", "STREAK_30", "RATING_PERFECT_2024-03-W10"

    @Column(nullable = false, length = 200)
    private String label; // "100 Sessions Milestone"

    @Column(name = "icon_name", length = 50)
    private String iconName; // Trophy, Star, Flame, Medal, Crown

    @Column(name = "color_hex", length = 10)
    private String colorHex; // #F59E0B

    @Column(name = "achieved_date", nullable = false)
    private LocalDate achievedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum AchievementType {
        MILESTONE, // 50, 100, 250, 500 sessions
        STREAK, // Consecutive days with sessions
        RATING, // Perfect rating week/month
        RANKING, // Top trainer of month
        RETENTION, // 100% member retention month
        ATTENDANCE // Perfect attendance week
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
