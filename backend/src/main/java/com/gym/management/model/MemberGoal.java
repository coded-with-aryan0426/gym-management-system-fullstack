package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(name = "goal_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private GoalType goalType;

    @Column(name = "start_value", precision = 10, scale = 2)
    private BigDecimal startValue;

    @Column(name = "current_value", precision = 10, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "target_value", precision = 10, scale = 2, nullable = false)
    private BigDecimal targetValue;

    @Column(length = 20)
    private String unit;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "weekly_target", precision = 6, scale = 2)
    private BigDecimal weeklyTarget;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (isActive == null) {
            isActive = true;
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum GoalType {
        WEIGHT,
        MUSCLE,
        BODY_FAT,
        STRENGTH,
        ENDURANCE
    }
}
