package com.gym.management.controller;

import com.gym.management.dto.AuditLogDTO;
import com.gym.management.dto.AuditStatsDTO;
import com.gym.management.dto.UserSessionDTO;
import com.gym.management.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for audit log management
 * Enterprise-grade audit logging with comprehensive tracking
 */
@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    // ==================== AUDIT LOGS ====================

    /**
     * Get paginated audit logs with filters
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam Long gymId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        
        Page<AuditLogDTO> logs = auditLogService.getLogs(gymId, search, severity, startDate, endDate, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("logs", logs.getContent());
        response.put("totalElements", logs.getTotalElements());
        response.put("totalPages", logs.getTotalPages());
        response.put("currentPage", logs.getNumber());
        response.put("pageSize", logs.getSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get recent audit logs
     */
    @GetMapping("/recent")
    public ResponseEntity<List<AuditLogDTO>> getRecentLogs(@RequestParam Long gymId) {
        List<AuditLogDTO> logs = auditLogService.getRecentLogs(gymId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Create a new audit log entry
     */
    @PostMapping
    public ResponseEntity<AuditLogDTO> createLog(
            @RequestBody AuditLogDTO dto,
            @RequestParam Long gymId,
            HttpServletRequest request) {
        
        // Set IP address from request if not provided
        if (dto.getIpAddress() == null) {
            dto.setIpAddress(getClientIP(request));
        }
        
        AuditLogDTO created = auditLogService.createLog(dto, gymId);
        return ResponseEntity.ok(created);
    }

    /**
     * Get logs by user name
     */
    @GetMapping("/user/{userName}")
    public ResponseEntity<List<AuditLogDTO>> getLogsByUser(@PathVariable String userName) {
        List<AuditLogDTO> logs = auditLogService.getLogsByUser(userName);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs by action type
     */
    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogDTO>> getLogsByAction(@PathVariable String action) {
        List<AuditLogDTO> logs = auditLogService.getLogsByAction(action);
        return ResponseEntity.ok(logs);
    }

    // ==================== STATISTICS ====================

    /**
     * Get audit statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<AuditStatsDTO> getStats(@RequestParam Long gymId) {
        AuditStatsDTO stats = auditLogService.getStats(gymId);
        return ResponseEntity.ok(stats);
    }

    // ==================== USER SESSIONS ====================

    /**
     * Get user sessions
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<UserSessionDTO>> getSessions(
            @RequestParam Long gymId,
            @RequestParam(required = false) String status) {
        List<UserSessionDTO> sessions = auditLogService.getSessions(gymId, status);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Get active sessions
     */
    @GetMapping("/sessions/active")
    public ResponseEntity<List<UserSessionDTO>> getActiveSessions(@RequestParam Long gymId) {
        List<UserSessionDTO> sessions = auditLogService.getActiveSessions(gymId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Update session status
     */
    @PutMapping("/sessions/{userId}/status")
    public ResponseEntity<Void> updateSessionStatus(
            @PathVariable Long userId,
            @RequestParam String status) {
        auditLogService.updateSessionStatus(userId, status);
        return ResponseEntity.ok().build();
    }

    // ==================== EXPORT ====================

    /**
     * Export audit logs to CSV
     */
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportToCSV(
            @RequestParam Long gymId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        String csv = auditLogService.exportToCSV(gymId, startDate, endDate);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "audit-logs.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csv);
    }

    // ==================== DATA RETENTION ====================

    /**
     * Delete old audit logs
     */
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OWNER')")
    public ResponseEntity<Map<String, String>> deleteOldLogs(
            @RequestParam Long gymId,
            @RequestParam(defaultValue = "90") int daysToKeep) {
        
        auditLogService.deleteOldLogs(gymId, daysToKeep);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted audit logs older than " + daysToKeep + " days");
        
        return ResponseEntity.ok(response);
    }

    // ==================== LOGGING ENDPOINTS ====================

    /**
     * Log login event
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> logLogin(
            @RequestParam Long userId,
            @RequestParam(required = false) Long gymId,
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String browser,
            @RequestParam(required = false) String os,
            @RequestParam(required = false) String sessionId,
            HttpServletRequest request) {
        
        String ipAddress = getClientIP(request);
        auditLogService.logLogin(userId, gymId, ipAddress, deviceType, browser, os, sessionId);
        auditLogService.createSession(userId, gymId, ipAddress, deviceType, browser, os);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Login logged successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Log logout event
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logLogout(
            @RequestParam Long userId,
            @RequestParam(required = false) Long gymId,
            @RequestParam(required = false) String sessionId,
            HttpServletRequest request) {
        
        String ipAddress = getClientIP(request);
        auditLogService.logLogout(userId, gymId, ipAddress, sessionId);
        auditLogService.endSession(userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout logged successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Log failed login
     */
    @PostMapping("/login-failed")
    public ResponseEntity<Map<String, String>> logFailedLogin(
            @RequestParam String username,
            @RequestParam(required = false) String reason,
            HttpServletRequest request) {
        
        String ipAddress = getClientIP(request);
        auditLogService.logFailedLogin(username, ipAddress, reason != null ? reason : "Invalid credentials");
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Failed login logged");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Log data creation
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> logCreate(
            @RequestParam String entity,
            @RequestParam String entityId,
            @RequestParam(required = false) String entityName,
            @RequestParam Long userId,
            @RequestParam Long gymId,
            @RequestParam(required = false) String details,
            HttpServletRequest request) {
        
        String ipAddress = getClientIP(request);
        auditLogService.logCreate(entity, entityId, entityName, userId, gymId, details, ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Create action logged");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Log data update
     */
    @PostMapping("/update")
    public ResponseEntity<Map<String, String>> logUpdate(
            @RequestParam String entity,
            @RequestParam String entityId,
            @RequestParam(required = false) String entityName,
            @RequestParam Long userId,
            @RequestParam Long gymId,
            @RequestParam(required = false) String details,
            @RequestParam(required = false) String changes,
            HttpServletRequest request) {
        
        String ipAddress = getClientIP(request);
        auditLogService.logUpdate(entity, entityId, entityName, userId, gymId, details, changes, ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Update action logged");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Log data deletion
     */
    @PostMapping("/delete")
    public ResponseEntity<Map<String, String>> logDelete(
            @RequestParam String entity,
            @RequestParam String entityId,
            @RequestParam(required = false) String entityName,
            @RequestParam Long userId,
            @RequestParam Long gymId,
            @RequestParam(required = false) String details,
            HttpServletRequest request) {
        
        String ipAddress = getClientIP(request);
        auditLogService.logDelete(entity, entityId, entityName, userId, gymId, details, ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Delete action logged");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Log security event
     */
    @PostMapping("/security")
    public ResponseEntity<Map<String, String>> logSecurityEvent(
            @RequestParam String action,
            @RequestParam String details,
            @RequestParam(required = false) Long userId,
            @RequestParam Long gymId,
            @RequestParam(defaultValue = "medium") String severity,
            HttpServletRequest request) {
        
        String ipAddress = getClientIP(request);
        auditLogService.logSecurityEvent(action, details, userId, gymId, severity, ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Security event logged");
        
        return ResponseEntity.ok(response);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Get client IP address from request
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
