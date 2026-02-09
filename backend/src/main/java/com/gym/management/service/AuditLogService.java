package com.gym.management.service;

import com.gym.management.dto.AuditLogDTO;
import com.gym.management.model.AuditLog;
import com.gym.management.model.User;
import com.gym.management.repository.AuditLogRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing audit logs
 * Handles logging of user actions and retrieval of audit history
 */
@Service
@Transactional
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Log an action performed by a user
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
        
        return auditLogRepository.save(log);
    }

    /**
     * Log an action with user association
     */
    public AuditLog logAction(String action, String target, Long userId,
                              String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setTarget(target);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        log.setTimestamp(LocalDateTime.now());

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                log.setUser(user);
                log.setUserName(user.getFullName() != null ? user.getFullName() : user.getUsername());
                // Get the first role from the roles set or default to UNKNOWN
                String roleName = "UNKNOWN";
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    roleName = user.getRoles().iterator().next().getRoleName();
                }
                log.setUserRole(roleName);
            }
        }

        return auditLogRepository.save(log);
    }

    /**
     * Create audit log from DTO
     */
    public AuditLog createLog(AuditLogDTO dto) {
        AuditLog log = new AuditLog();
        log.setAction(dto.getAction());
        log.setTarget(dto.getTarget());
        log.setUserName(dto.getUserName());
        log.setUserRole(dto.getUserRole());
        log.setDetails(dto.getDetails());
        log.setIpAddress(dto.getIpAddress());
        log.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());

        return auditLogRepository.save(log);
    }

    /**
     * Get recent audit logs (last 100)
     */
    public List<AuditLogDTO> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get paginated audit logs
     */
    public Page<AuditLogDTO> getLogs(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findAll(pageRequest).map(this::convertToDTO);
    }

    /**
     * Search audit logs
     */
    public Page<AuditLogDTO> searchLogs(String searchTerm, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findByActionContainingIgnoreCaseOrUserNameContainingIgnoreCase(
                searchTerm, searchTerm, pageRequest).map(this::convertToDTO);
    }

    /**
     * Get logs by user name
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

    /**
     * Get logs within date range
     */
    public List<AuditLogDTO> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete old audit logs (for cleanup)
     */
    public void deleteOldLogs(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        auditLogRepository.deleteByTimestampBefore(cutoffDate);
    }

    /**
     * Convert AuditLog entity to DTO
     */
    private AuditLogDTO convertToDTO(AuditLog log) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(log.getAuditId());
        dto.setAction(log.getAction());
        dto.setTarget(log.getTarget());
        dto.setUserName(log.getUserName());
        dto.setUserRole(log.getUserRole());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setTimestamp(log.getTimestamp());
        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getUserId());
        }
        return dto;
    }
}
