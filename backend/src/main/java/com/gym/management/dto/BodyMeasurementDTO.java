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
public class BodyMeasurementDTO {
    private Long id;
    private Long userId;
    private LocalDate recordDate;
    private BigDecimal chest;
    private BigDecimal waist;
    private BigDecimal hips;
    private BigDecimal arms;
    private BigDecimal legs;
    private BigDecimal shoulders;
    private BigDecimal neck;
    private BigDecimal calves;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
