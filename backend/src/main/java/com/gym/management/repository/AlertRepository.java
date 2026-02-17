package com.gym.management.repository;

import com.gym.management.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Find unread alerts
    List<Alert> findByIsReadFalseOrderByCreatedAtDesc();

    // Find alerts by type
    List<Alert> findByTypeOrderByCreatedAtDesc(String type);

    // Find alerts by severity
    List<Alert> findBySeverityOrderByCreatedAtDesc(String severity);

    // Count unread alerts
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.isRead = false")
    Long countUnreadAlerts();

    // Get recent alerts (last 10)
    List<Alert> findTop10ByOrderByCreatedAtDesc();
}
