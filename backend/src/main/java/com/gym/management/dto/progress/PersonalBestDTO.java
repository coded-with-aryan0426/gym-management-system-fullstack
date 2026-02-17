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
public class PersonalBestDTO {
    private Long id;
    private Long userId;
    private String exercise;
    private BigDecimal weightValue;
    private Integer reps;
    private String unit;
    private LocalDate recordDate;
    private BigDecimal previousBest;
    private String category;
    private String notes;
    private LocalDateTime createdAt;
}
