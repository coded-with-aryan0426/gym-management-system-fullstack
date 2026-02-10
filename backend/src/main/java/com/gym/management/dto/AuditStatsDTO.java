package com.gym.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
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
    private Integer onlineUsers;
    private String avgSessionTime; // formatted string like "2h 30m"
    private Integer securityAlerts;
    private Long totalSessions;
    private Long activeSessions;
    private List<Map<String, Object>> topActions; // list of {action, count}
    private Map<String, Long> actionCounts; // action type -> count
    private Map<String, Long> severityCounts; // severity -> count
    private Map<String, Long> dailyActivity; // date -> count
}
