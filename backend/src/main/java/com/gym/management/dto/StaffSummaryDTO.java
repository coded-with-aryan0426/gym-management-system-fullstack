package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for staff summary metrics displayed on dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffSummaryDTO {

    private Long totalStaff;
    private Long activeTrainers;
    private Double averageAttendanceRate;
    private Double averageSatisfactionScore;
    private Integer totalSessionsThisMonth;
    private String recordMonth;
}
