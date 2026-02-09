package com.gym.management.controller;

import com.gym.management.dto.AuditLogDTO;
import com.gym.management.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for audit log operations
 * Provides endpoints for retrieving and creating audit logs
 */
@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Get recent audit logs (default: last 100)
     */
    @GetMapping("")
    public ResponseEntity<List<AuditLogDTO>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        if (page == 0 && size == 100) {
            return ResponseEntity.ok(auditLogService.getRecentLogs());
        }
        Page<AuditLogDTO> logs = auditLogService.getLogs(page, size);
        return ResponseEntity.ok(logs.getContent());
    }

    /**
     * Search audit logs by action or user name
     */
    @GetMapping("/search")
    public ResponseEntity<Page<AuditLogDTO>> searchLogs(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditLogService.searchLogs(query, page, size));
    }

    /**
     * Get logs by user name
     */
    @GetMapping("/user/{userName}")
    public ResponseEntity<List<AuditLogDTO>> getLogsByUser(@PathVariable String userName) {
        return ResponseEntity.ok(auditLogService.getLogsByUser(userName));
    }

    /**
     * Get logs by action type
     */
    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogDTO>> getLogsByAction(@PathVariable String action) {
        return ResponseEntity.ok(auditLogService.getLogsByAction(action));
    }

    /**
     * Create a new audit log entry
     */
    @PostMapping("")
    public ResponseEntity<Void> createLog(@RequestBody AuditLogDTO dto) {
        auditLogService.createLog(dto);
        return ResponseEntity.ok().build();
    }

    /**
     * Batch create audit logs (for syncing from localStorage)
     */
    @PostMapping("/batch")
    public ResponseEntity<Void> createLogs(@RequestBody List<AuditLogDTO> logs) {
        for (AuditLogDTO dto : logs) {
            auditLogService.createLog(dto);
        }
        return ResponseEntity.ok().build();
    }
}
