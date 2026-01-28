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
@Table(name = "body_measurements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BodyMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "chest", precision = 5, scale = 2)
    private BigDecimal chest;

    @Column(name = "waist", precision = 5, scale = 2)
    private BigDecimal waist;

    @Column(name = "hips", precision = 5, scale = 2)
    private BigDecimal hips;

    @Column(name = "arms", precision = 5, scale = 2)
    private BigDecimal arms;

    @Column(name = "legs", precision = 5, scale = 2)
    private BigDecimal legs;

    @Column(name = "shoulders", precision = 5, scale = 2)
    private BigDecimal shoulders;

    @Column(name = "neck", precision = 5, scale = 2)
    private BigDecimal neck;

    @Column(name = "calves", precision = 5, scale = 2)
    private BigDecimal calves;

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
