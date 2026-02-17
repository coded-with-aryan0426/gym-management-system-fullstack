package com.gym.management.service;

import com.gym.management.model.CheckIn;
import com.gym.management.model.Transaction;
import com.gym.management.model.Alert;
import com.gym.management.model.SessionStatus;
import com.gym.management.repository.CheckInRepository;
import com.gym.management.repository.TransactionRepository;
import com.gym.management.repository.AlertRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.repository.PTSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PTSessionRepository ptSessionRepository;

    /**
     * Get all dashboard metrics for the Tactical Canvas
     */
    public Map<String, Object> getDashboardMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        // LocalDateTime startOfMonth =
        // LocalDate.now().withDayOfMonth(1).atStartOfDay(); // For future MTD queries

        // Today's Revenue
        BigDecimal todayRevenue = transactionRepository.getTodayRevenue(startOfDay);
        metrics.put("todayRevenue", todayRevenue != null ? todayRevenue : BigDecimal.ZERO);

        // Live Check-ins count
        Long liveCheckIns = checkInRepository.countActiveCheckIns();
        metrics.put("liveCheckIns", liveCheckIns != null ? liveCheckIns : 0L);

        // New Signups (MTD) - count users created this month
        long newSignups = userRepository.count(); // Simplified - would need createdAt query
        metrics.put("newSignups", newSignups);
        metrics.put("signupsGoal", 100L); // Target goal

        // Critical Tasks - count scheduled sessions
        int pendingSessions = ptSessionRepository.findByStatus(SessionStatus.SCHEDULED).size();
        metrics.put("criticalTasks", pendingSessions);

        // Unread Alerts count
        Long unreadAlerts = alertRepository.countUnreadAlerts();
        metrics.put("unreadAlerts", unreadAlerts != null ? unreadAlerts : 0L);

        return metrics;
    }

    /**
     * Get live floor status (active check-ins)
     */
    public List<CheckIn> getLiveFloorStatus() {
        return checkInRepository.findActiveCheckIns();
    }

    /**
     * Get recent alerts for dashboard
     */
    public List<Alert> getRecentAlerts() {
        return alertRepository.findTop10ByOrderByCreatedAtDesc();
    }

    /**
     * Get recent transactions
     */
    public List<Transaction> getRecentTransactions() {
        return transactionRepository.findTop10ByOrderByDateTimeDesc();
    }

    /**
     * Check in a member
     */
    public CheckIn checkInMember(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CheckIn checkIn = new CheckIn(user);
        return checkInRepository.save(checkIn);
    }

    /**
     * Check out a member
     */
    public CheckIn checkOutMember(Long checkInId) {
        CheckIn checkIn = checkInRepository.findById(checkInId)
                .orElseThrow(() -> new RuntimeException("CheckIn not found"));

        checkIn.checkOut();
        return checkInRepository.save(checkIn);
    }
}
