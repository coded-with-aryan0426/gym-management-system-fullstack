package com.gym.management.dto.progress;

import com.gym.management.model.MemberGoal;
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
}
