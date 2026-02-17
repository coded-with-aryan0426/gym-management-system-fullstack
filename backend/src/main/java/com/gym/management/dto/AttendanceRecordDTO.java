package com.gym.management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for recording staff attendance
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordDTO {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Attendance status is required")
    @Pattern(regexp = "PRESENT|ABSENT|LATE", 
             message = "Status must be PRESENT, ABSENT, or LATE")
    private String status;

    private String notes;
}
