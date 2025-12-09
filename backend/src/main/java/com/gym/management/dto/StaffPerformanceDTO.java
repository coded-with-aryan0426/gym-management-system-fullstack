package com.gym.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Data Transfer Object for Staff Performance
 * Used for API requests and responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffPerformanceDTO {

    private Long performanceId;

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    private String staffName;

    @Min(value = 0, message = "Sessions completed cannot be negative")
    private Integer sessionsCompleted;

    @DecimalMin(value = "0.0", message = "Attendance rate cannot be negative")
    @DecimalMax(value = "100.0", message = "Attendance rate cannot exceed 100")
    private BigDecimal attendanceRate;

    @DecimalMin(value = "0.0", message = "Satisfaction score cannot be negative")
    @DecimalMax(value = "5.0", message = "Satisfaction score cannot exceed 5")
    private BigDecimal satisfactionScore;

    @Min(value = 0, message = "Present days cannot be negative")
    private Integer presentDays;

    @Min(value = 0, message = "Absent days cannot be negative")
    private Integer absentDays;

    @Min(value = 0, message = "Late days cannot be negative")
    private Integer lateDays;

    @NotNull(message = "Record month is required")
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Record month must be in YYYY-MM format")
    private String recordMonth;
}
