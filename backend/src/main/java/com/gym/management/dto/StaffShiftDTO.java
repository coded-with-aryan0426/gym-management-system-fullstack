package com.gym.management.dto;

import com.gym.management.model.ShiftStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Staff Shift
 * Used for API requests and responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffShiftDTO {

    private Long shiftId;

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    private String staffName;

    @NotNull(message = "Shift date is required")
    private LocalDate shiftDate;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private ShiftStatus status;

    /**
     * Custom validation to ensure end time is after start time
     */
    @AssertTrue(message = "End time must be after start time")
    public boolean isValidTimeRange() {
        if (startTime == null || endTime == null) {
            return true; // Let @NotNull handle null validation
        }
        return endTime.isAfter(startTime);
    }
}
