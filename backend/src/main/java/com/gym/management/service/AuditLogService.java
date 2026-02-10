package com.gym.management.service;

import com.gym.management.dto.AuditLogDTO;
import com.gym.management.dto.AuditStatsDTO;
import com.gym.management.dto.UserSessionDTO;
import com.gym.management.model.AuditLog;
import com.gym.management.model.User;
import com.gym.management.model.UserSession;
import com.gym.management.model.Gym;
import com.gym.management.repository.AuditLogRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.UserSessionRepository;
import com.gym.management.repository.GymRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Service for managing audit logs - Enterprise-grade audit logging
 * Handles logging of user actions, sessions, and retrieval of audit history
 */
@Service
@Transactional
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private GymRepository gymRepository;

    // ==================== AUDIT LOG CREATION ====================

    /**
     * Log an action performed by a user (simple version)
     */
    public AuditLog logAction(String action, String target, String userName, 
                              String userRole, String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setTarget(target);
        log.setUserName(userName);
        log.setUserRole(userRole);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        log.setTimestamp(LocalDateTime.now());
        log.setSeverity("info");
        
        return auditLogRepository.save(log);
    }

    /**
     * Log an action with user and gym association
     */
    public AuditLog logAction(String action, String entity, String entityId, String entityName,
                              Long userId, Long gymId, String details, String severity,
                              String ipAddress, String deviceType, String browser, String os,
                              String sessionId, String changes) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .entityName(entityName)
                .details(details)
                .severity(severity != null ? severity : "info")
                .ipAddress(ipAddress)
                .deviceType(deviceType)
                .browser(browser)
                .os(os)
                .sessionId(sessionId)
                .changes(changes)
                .timestamp(LocalDateTime.now())
                .build();

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                log.setUser(user);
                log.setUserName(user.getFullName() != null ? user.getFullName() : user.getUsername());
                log.setUserAvatar(user.getProfileImage());
                String roleName = "UNKNOWN";
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    roleName = user.getRoles().iterator().next().getRoleName();
                }
                log.setUserRole(roleName);
            }
        }

        if (gymId != null) {
            Gym gym = gymRepository.findById(gymId).orElse(null);
            if (gym != null) {
                log.setGym(gym);
            }
        }

        return auditLogRepository.save(log);
    }

    /**
     * Create audit log from DTO
     */
    public AuditLogDTO createLog(AuditLogDTO dto, Long gymId) {
        AuditLog log = new AuditLog();
        log.setAction(dto.getAction());
        log.setEntity(dto.getEntity());
        log.setEntityId(dto.getEntityId());
        log.setEntityName(dto.getEntityName());
        log.setTarget(dto.getTarget());
        log.setUserName(dto.getUserName());
        log.setUserRole(dto.getUserRole());
        log.setUserAvatar(dto.getUserAvatar());
        log.setDetails(dto.getDetails());
        log.setChanges(dto.getChanges());
        log.setIpAddress(dto.getIpAddress());
        log.setLocation(dto.getLocation());
        log.setDeviceType(dto.getDeviceType());
        log.setBrowser(dto.getBrowser());
        log.setOs(dto.getOs());
        log.setSessionId(dto.getSessionId());
        log.setSeverity(dto.getSeverity() != null ? dto.getSeverity() : "info");
        log.setMetadata(dto.getMetadata());
        log.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId()).orElse(null);
            if (user != null) {
                log.setUser(user);
            }
        }

        if (gymId != null) {
            Gym gym = gymRepository.findById(gymId).orElse(null);
            if (gym != null) {
                log.setGym(gym);
            }
        }

        AuditLog saved = auditLogRepository.save(log);
        return convertToDTO(saved);
    }

    // ==================== LOGIN/LOGOUT TRACKING ====================

    /**
     * Log user login event
     */
    public AuditLog logLogin(Long userId, Long gymId, String ipAddress, String deviceType, 
                             String browser, String os, String sessionId) {
        return logAction("LOGIN", "User", userId != null ? userId.toString() : null, null,
                userId, gymId, "User logged in", "info", ipAddress, deviceType, browser, os, 
                sessionId, null);
    }

    /**
     * Log user logout event
     */
    public AuditLog logLogout(Long userId, Long gymId, String ipAddress, String sessionId) {
        return logAction("LOGOUT", "User", userId != null ? userId.toString() : null, null,
                userId, gymId, "User logged out", "info", ipAddress, null, null, null, 
                sessionId, null);
    }

    /**
     * Log failed login attempt
     */
    public AuditLog logFailedLogin(String username, String ipAddress, String reason) {
        AuditLog log = AuditLog.builder()
                .action("LOGIN_FAILED")
                .entity("User")
                .entityName(username)
                .details("Failed login attempt: " + reason)
                .severity("medium")
                .ipAddress(ipAddress)
                .timestamp(LocalDateTime.now())
                .build();
        return auditLogRepository.save(log);
    }

    // ==================== DATA CHANGE TRACKING ====================

    /**
     * Log data creation
     */
    public AuditLog logCreate(String entity, String entityId, String entityName, Long userId, 
                              Long gymId, String details, String ipAddress) {
        return logAction("CREATE", entity, entityId, entityName, userId, gymId, 
                details, "info", ipAddress, null, null, null, null, null);
    }

    /**
     * Log data update with changes
     */
    public AuditLog logUpdate(String entity, String entityId, String entityName, Long userId, 
                              Long gymId, String details, String changes, String ipAddress) {
        return logAction("UPDATE", entity, entityId, entityName, userId, gymId, 
                details, "low", ipAddress, null, null, null, null, changes);
    }

    /**
     * Log data deletion
     */
    public AuditLog logDelete(String entity, String entityId, String entityName, Long userId, 
                              Long gymId, String details, String ipAddress) {
        return logAction("DELETE", entity, entityId, entityName, userId, gymId, 
                details, "medium", ipAddress, null, null, null, null, null);
    }

    // ==================== SECURITY EVENT TRACKING ====================

    /**
     * Log security event
     */
    public AuditLog logSecurityEvent(String action, String details, Long userId, Long gymId, 
                                     String severity, String ipAddress) {
        return logAction(action, "Security", null, null, userId, gymId, 
                details, severity, ipAddress, null, null, null, null, null);
    }

    /**
     * Log permission change
     */
    public AuditLog logPermissionChange(Long targetUserId, String oldPermissions, 
                                        String newPermissions, Long changedByUserId, 
                                        Long gymId, String ipAddress) {
        String changes = String.format("{\"old\": \"%s\", \"new\": \"%s\"}", oldPermissions, newPermissions);
        return logAction("PERMISSION_CHANGE", "User", targetUserId.toString(), null,
                changedByUserId, gymId, "User permissions changed", "high", 
                ipAddress, null, null, null, null, changes);
    }

    // ==================== RETRIEVAL METHODS ====================

    /**
     * Get paginated audit logs for a gym with filters
     */
    public Page<AuditLogDTO> getLogs(Long gymId, String search, String severity, 
                                     LocalDateTime startDate, LocalDateTime endDate,
                                     int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        Page<AuditLog> logs;
        
        if (search != null && !search.isEmpty()) {
            logs = auditLogRepository.searchByGym(gymId, search, pageRequest);
        } else if (severity != null && !severity.isEmpty() && !severity.equals("all")) {
            logs = auditLogRepository.findByGymGymIdAndSeverityOrderByTimestampDesc(gymId, severity, pageRequest);
        } else if (startDate != null && endDate != null) {
            logs = auditLogRepository.findByGymAndTimestampBetween(gymId, startDate, endDate, pageRequest);
        } else {
            logs = auditLogRepository.findByGymGymIdOrderByTimestampDesc(gymId, pageRequest);
        }

        return logs.map(this::convertToDTO);
    }

    /**
     * Get recent audit logs (last 100)
     */
    public List<AuditLogDTO> getRecentLogs(Long gymId) {
        PageRequest pageRequest = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findByGymGymIdOrderByTimestampDesc(gymId, pageRequest)
                .getContent()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get audit logs by user
     */
    public List<AuditLogDTO> getLogsByUser(String userName) {
        return auditLogRepository.findByUserNameOrderByTimestampDesc(userName)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get logs by action type
     */
    public List<AuditLogDTO> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== STATISTICS ====================

    /**
     * Get audit statistics for a gym
     */
    public AuditStatsDTO getStats(Long gymId) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        
        Long totalLogs = auditLogRepository.countByGymGymId(gymId);
        Long todayLogs = auditLogRepository.countTodayLogsByGym(gymId, startOfToday);
        Long securityAlerts = auditLogRepository.countSecurityAlertsByGym(gymId);
        
        // Get online users count
        Long onlineUsers = userSessionRepository.countByGymGymIdAndStatus(gymId, "online");
        
        // Calculate average session time (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        Double avgSessionMinutes = userSessionRepository.calculateAverageSessionDurationByGym(gymId, weekAgo);
        String avgSessionTime = formatDuration(avgSessionMinutes != null ? avgSessionMinutes.longValue() : 0);

        // Get action counts for top actions
        List<Object[]> actionCounts = auditLogRepository.getActionCountsByGym(gymId);
        List<Map<String, Object>> topActions = actionCounts.stream()
                .limit(10)
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("action", row[0]);
                    map.put("count", row[1]);
                    return map;
                })
                .collect(Collectors.toList());

        return AuditStatsDTO.builder()
                .totalLogs(totalLogs != null ? totalLogs : 0L)
                .todayLogs(todayLogs != null ? todayLogs : 0L)
                .onlineUsers(onlineUsers != null ? onlineUsers.intValue() : 0)
                .avgSessionTime(avgSessionTime)
                .securityAlerts(securityAlerts != null ? securityAlerts.intValue() : 0)
                .topActions(topActions)
                .build();
    }

    // ==================== USER SESSIONS ====================

    /**
     * Get active user sessions for a gym
     */
    public List<UserSessionDTO> getActiveSessions(Long gymId) {
        List<UserSession> sessions = userSessionRepository.findByGymGymIdOrderByCreatedAtDesc(gymId);
        return sessions.stream()
                .map(this::convertSessionToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get user sessions with filters
     */
    public List<UserSessionDTO> getSessions(Long gymId, String status) {
        List<UserSession> sessions;
        if (status != null && !status.isEmpty() && !status.equals("all")) {
            sessions = userSessionRepository.findByGymGymIdAndStatusOrderByCreatedAtDesc(gymId, status);
        } else {
            sessions = userSessionRepository.findByGymGymIdOrderByCreatedAtDesc(gymId);
        }
        return sessions.stream()
                .map(this::convertSessionToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create or update user session on login
     */
    public UserSession createSession(Long userId, Long gymId, String ipAddress, 
                                     String deviceType, String browser, String os) {
        User user = userRepository.findById(userId).orElse(null);
        Gym gym = gymId != null ? gymRepository.findById(gymId).orElse(null) : null;
        
        if (user == null) return null;

        // End any existing active sessions for this user
        List<UserSession> activeSessions = userSessionRepository.findByUserUserIdAndStatus(userId, "online");
        for (UserSession session : activeSessions) {
            session.setStatus("offline");
            session.setLogoutAt(LocalDateTime.now());
            session.setIsActive(false);
            userSessionRepository.save(session);
        }

        // Create new session
        UserSession session = new UserSession();
        session.setUser(user);
        session.setGym(gym);
        session.setCreatedAt(LocalDateTime.now());
        session.setLastActiveAt(LocalDateTime.now());
        session.setStatus("online");
        session.setIsActive(true);
        session.setIpAddress(ipAddress);
        session.setDeviceType(deviceType);
        session.setBrowser(browser);
        session.setOs(os);
        session.setTokenHash(java.util.UUID.randomUUID().toString());

        return userSessionRepository.save(session);
    }

    /**
     * End user session on logout
     */
    public void endSession(Long userId) {
        List<UserSession> activeSessions = userSessionRepository.findByUserUserIdAndStatus(userId, "online");
        for (UserSession session : activeSessions) {
            session.setStatus("offline");
            session.setLogoutAt(LocalDateTime.now());
            session.setIsActive(false);
            userSessionRepository.save(session);
        }
    }

    /**
     * Update session status (online, idle, away)
     */
    public void updateSessionStatus(Long userId, String status) {
        List<UserSession> sessions = userSessionRepository.findByUserUserIdAndStatus(userId, "online");
        for (UserSession session : sessions) {
            session.setStatus(status);
            session.setLastActiveAt(LocalDateTime.now());
            userSessionRepository.save(session);
        }
    }

    // ==================== DATA RETENTION ====================

    /**
     * Delete old audit logs (for cleanup)
     */
    public void deleteOldLogs(Long gymId, int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        auditLogRepository.deleteByGymGymIdAndTimestampBefore(gymId, cutoffDate);
    }

    /**
     * Export audit logs to CSV format
     */
    public String exportToCSV(Long gymId, LocalDateTime startDate, LocalDateTime endDate) {
        List<AuditLog> logs;
        if (startDate != null && endDate != null) {
            logs = auditLogRepository.findByTimestampBetween(startDate, endDate);
        } else {
            PageRequest pageRequest = PageRequest.of(0, 10000, Sort.by(Sort.Direction.DESC, "timestamp"));
            logs = auditLogRepository.findByGymGymIdOrderByTimestampDesc(gymId, pageRequest).getContent();
        }

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Timestamp,Action,Entity,User,Role,Severity,IP Address,Details\n");
        
        for (AuditLog log : logs) {
            csv.append(String.format("%d,%s,%s,%s,%s,%s,%s,%s,\"%s\"\n",
                    log.getAuditId(),
                    log.getTimestamp(),
                    log.getAction(),
                    log.getEntity() != null ? log.getEntity() : "",
                    log.getUserName() != null ? log.getUserName() : "",
                    log.getUserRole() != null ? log.getUserRole() : "",
                    log.getSeverity() != null ? log.getSeverity() : "",
                    log.getIpAddress() != null ? log.getIpAddress() : "",
                    log.getDetails() != null ? log.getDetails().replace("\"", "\"\"") : ""
            ));
        }
        
        return csv.toString();
    }

    // ==================== CONVERSION METHODS ====================

    /**
     * Convert AuditLog entity to DTO
     */
    private AuditLogDTO convertToDTO(AuditLog log) {
        return AuditLogDTO.builder()
                .id(log.getAuditId())
                .action(log.getAction())
                .entity(log.getEntity())
                .entityId(log.getEntityId())
                .entityName(log.getEntityName())
                .target(log.getTarget())
                .userName(log.getUserName())
                .userRole(log.getUserRole())
                .userAvatar(log.getUserAvatar())
                .details(log.getDetails())
                .changes(log.getChanges())
                .ipAddress(log.getIpAddress())
                .location(log.getLocation())
                .deviceType(log.getDeviceType())
                .browser(log.getBrowser())
                .os(log.getOs())
                .sessionId(log.getSessionId())
                .severity(log.getSeverity())
                .metadata(log.getMetadata())
                .timestamp(log.getTimestamp())
                .userId(log.getUser() != null ? log.getUser().getUserId() : null)
                .gymId(log.getGym() != null ? log.getGym().getGymId() : null)
                .build();
    }

    /**
     * Convert UserSession entity to DTO
     */
    private UserSessionDTO convertSessionToDTO(UserSession session) {
        User user = session.getUser();
        
        String duration = "";
        if (session.getCreatedAt() != null) {
            LocalDateTime endTime = session.getLogoutAt() != null ? 
                    session.getLogoutAt() : LocalDateTime.now();
            long minutes = Duration.between(session.getCreatedAt(), endTime).toMinutes();
            duration = formatDuration(minutes);
        }

        return UserSessionDTO.builder()
                .id(session.getSessionId())
                .userId(user != null ? user.getUserId() : null)
                .userName(user != null ? (user.getFullName() != null ? user.getFullName() : user.getUsername()) : "Unknown")
                .userAvatar(user != null ? user.getProfileImage() : null)
                .userRole(user != null && user.getRoles() != null && !user.getRoles().isEmpty() ? 
                        user.getRoles().iterator().next().getRoleName() : "UNKNOWN")
                .status(session.getStatus())
                .loginTime(session.getCreatedAt())
                .logoutTime(session.getLogoutAt())
                .lastActivityTime(session.getLastActiveAt())
                .duration(duration)
                .ipAddress(session.getIpAddress())
                .deviceType(session.getDeviceType())
                .browser(session.getBrowser())
                .os(session.getOs())
                .location(session.getLocation())
                .sessionToken(session.getTokenHash())
                .gymId(session.getGym() != null ? session.getGym().getGymId() : null)
                .build();
    }

    /**
     * Format duration in minutes to human-readable string
     */
    private String formatDuration(long minutes) {
        if (minutes < 60) {
            return minutes + "m";
        } else if (minutes < 1440) {
            return (minutes / 60) + "h " + (minutes % 60) + "m";
        } else {
            long days = minutes / 1440;
            long hours = (minutes % 1440) / 60;
            return days + "d " + hours + "h";
        }
    }
}
