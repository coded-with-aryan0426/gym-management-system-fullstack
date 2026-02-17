package com.gym.management.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Trainer Reports Overview KPIs
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerReportOverviewDTO {

    private int totalSessions;
    private String totalSessionsChange;
    private String totalSessionsChangeType; // positive, negative, neutral
    private int previousPeriodSessions;

    private int activeMembers;
    private String activeMembersChange;
    private String activeMembersSubtext;

    private double avgAttendance;
    private String avgAttendanceChange;
    private String avgAttendanceChangeType;

    private double clientRating;
    private String clientRatingSubtext;
    private int reviewCount;
}
