package com.gym.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressMetricDTO {
    private Long id;
    private Long userId;
    private LocalDate recordDate;
    private BigDecimal weight;
    private BigDecimal bodyFat;
    private BigDecimal muscleMass;
    private BigDecimal bmi;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
