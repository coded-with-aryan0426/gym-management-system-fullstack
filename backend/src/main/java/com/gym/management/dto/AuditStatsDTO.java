package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.Map;

/**
 * Data Transfer Object for audit log statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditStatsDTO {

    private Long totalLogs;
    private Long todayLogs;
    private Long onlineUsers;
    private Long avgSessionTime; // in seconds
    private Long securityAlerts;
    private Long totalSessions;
    private Long activeSessions;
    private Map<String, Long> actionCounts; // action type -> count
    private Map<String, Long> severityCounts; // severity -> count
    private Map<String, Long> dailyActivity; // date -> count
}
