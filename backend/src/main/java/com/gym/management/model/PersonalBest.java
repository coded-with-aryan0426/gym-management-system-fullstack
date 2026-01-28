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
@Table(name = "personal_bests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalBest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String exercise;

    @Column(name = "weight_value", precision = 10, scale = 2, nullable = false)
    private BigDecimal weightValue;

    private Integer reps;

    @Column(length = 10)
    private String unit;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "previous_best", precision = 10, scale = 2)
    private BigDecimal previousBest;

    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private ExerciseCategory category;

    @Column(columnDefinition = "CLOB")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (recordDate == null) {
            recordDate = LocalDate.now();
        }
        if (unit == null) {
            unit = "lbs";
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ExerciseCategory {
        PUSH,
        PULL,
        LEGS,
        CORE,
        CARDIO
    }
}
