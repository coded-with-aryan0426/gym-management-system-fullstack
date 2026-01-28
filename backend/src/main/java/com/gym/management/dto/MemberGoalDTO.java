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
public class MemberGoalDTO {
    private Long id;
    private Long userId;
    private String title;
    private String goalType;
    private BigDecimal startValue;
    private BigDecimal currentValue;
    private BigDecimal targetValue;
    private String unit;
    private LocalDate startDate;
    private LocalDate targetDate;
    private BigDecimal weeklyTarget;
    private Boolean isActive;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
