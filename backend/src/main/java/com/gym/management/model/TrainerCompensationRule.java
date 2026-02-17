package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for trainer compensation rules - NO hardcoded rates
 * Owner-configurable pricing per trainer
 */
@Entity
@Table(name = "trainer_compensation_rules", indexes = {
        @Index(name = "idx_compensation_trainer", columnList = "trainer_id"),
        @Index(name = "idx_compensation_effective", columnList = "effective_from")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerCompensationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @Column(name = "per_session_rate", precision = 10, scale = 2)
    private BigDecimal perSessionRate; // Fixed rate per PT session

    @Column(name = "per_hour_rate", precision = 10, scale = 2)
    private BigDecimal perHourRate; // Hourly rate for PT

    @Column(name = "per_class_rate", precision = 10, scale = 2)
    private BigDecimal perClassRate; // Fixed rate per group class

    @Column(name = "per_attendee_rate", precision = 10, scale = 2)
    private BigDecimal perAttendeeRate; // Rate per group class attendee

    @Column(name = "commission_percent", precision = 5, scale = 2)
    private BigDecimal commissionPercent; // e.g., 10.00 for 10%

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo; // null = currently active

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null)
            isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
