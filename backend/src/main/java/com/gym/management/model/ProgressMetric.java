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
@Table(name = "progress_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "body_fat", precision = 5, scale = 2)
    private BigDecimal bodyFat;

    @Column(name = "muscle_mass", precision = 5, scale = 2)
    private BigDecimal muscleMass;

    @Column(name = "bmi", precision = 4, scale = 2)
    private BigDecimal bmi;

    @Column(name = "chest", precision = 5, scale = 2)
    private BigDecimal chest;

    @Column(name = "waist", precision = 5, scale = 2)
    private BigDecimal waist;

    @Column(name = "arms", precision = 5, scale = 2)
    private BigDecimal arms;

    @Column(name = "legs", precision = 5, scale = 2)
    private BigDecimal legs;

    @Column(name = "hips", precision = 5, scale = 2)
    private BigDecimal hips;

    @Column(name = "shoulders", precision = 5, scale = 2)
    private BigDecimal shoulders;

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
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
