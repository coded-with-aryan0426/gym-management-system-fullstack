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
}
