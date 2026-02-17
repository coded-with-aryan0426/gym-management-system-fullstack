package com.gym.management.dto.progress;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressMetricDTO {
    private Long id;
    private Long userId;
    private LocalDate recordDate;
    private BigDecimal weight;
    private BigDecimal bodyFat;
    private BigDecimal muscleMass;
    private BigDecimal bmi;
    private BigDecimal chest;
    private BigDecimal waist;
    private BigDecimal arms;
    private BigDecimal legs;
    private BigDecimal hips;
    private BigDecimal shoulders;
    private String notes;
    private LocalDateTime createdAt;
}
