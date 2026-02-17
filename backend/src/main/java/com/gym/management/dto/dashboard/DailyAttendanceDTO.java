package com.gym.management.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Daily Attendance Data Transfer Object
 * Used for attendance trend charts and analytics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyAttendanceDTO {
    private LocalDate date;
    private String day; // Mon, Tue, Wed, etc.
    private Integer checkIns;
    private Integer uniqueMembers;
    private Integer peakHour; // 0-23 hour format
}