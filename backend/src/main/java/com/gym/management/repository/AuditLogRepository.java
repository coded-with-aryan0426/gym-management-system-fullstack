package com.gym.management.repository;

import com.gym.management.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for AuditLog entity
 * Provides CRUD operations and custom queries for audit log management
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find most recent audit logs ordered by timestamp descending
     * @return List of recent audit logs (limited to 100)
     */
    List<AuditLog> findTop100ByOrderByTimestampDesc();

    /**
     * Find audit logs by user name
     * @param userName The user name to search for
     * @return List of audit logs for the user
     */
    List<AuditLog> findByUserNameOrderByTimestampDesc(String userName);

    /**
     * Find audit logs by action type
     * @param action The action type to filter by
     * @return List of audit logs with that action
     */
    List<AuditLog> findByActionOrderByTimestampDesc(String action);

    /**
     * Find audit logs within a date range
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of audit logs in the range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByTimestampBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Search audit logs by action or user name (case insensitive)
     * @param action The action to search
     * @param userName The user name to search
     * @param pageable Pagination parameters
     * @return Page of matching audit logs
     */
    Page<AuditLog> findByActionContainingIgnoreCaseOrUserNameContainingIgnoreCase(
            String action, String userName, Pageable pageable);

    /**
     * Count audit logs by action type
     * @param action The action type
     * @return Count of logs with that action
     */
    Long countByAction(String action);

    /**
     * Find audit logs by user role
     * @param userRole The role to filter by
     * @param pageable Pagination parameters
     * @return Page of audit logs for that role
     */
    Page<AuditLog> findByUserRole(String userRole, Pageable pageable);

    /**
     * Delete audit logs older than a specific date
     * @param cutoffDate The date before which logs should be deleted
     */
    void deleteByTimestampBefore(LocalDateTime cutoffDate);
}
