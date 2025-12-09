package com.gym.management.controller;

import com.gym.management.model.CheckIn;
import com.gym.management.model.Alert;
import com.gym.management.model.Transaction;
import com.gym.management.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * Get all dashboard metrics
     * GET /api/dashboard/metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> metrics = dashboardService.getDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get live floor status (active check-ins)
     * GET /api/dashboard/floor-status
     */
    @GetMapping("/floor-status")
    public ResponseEntity<List<CheckIn>> getFloorStatus() {
        List<CheckIn> checkIns = dashboardService.getLiveFloorStatus();
        return ResponseEntity.ok(checkIns);
    }

    /**
     * Get recent alerts
     * GET /api/dashboard/alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<Alert>> getAlerts() {
        List<Alert> alerts = dashboardService.getRecentAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get recent transactions
     * GET /api/dashboard/transactions
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions() {
        List<Transaction> transactions = dashboardService.getRecentTransactions();
        return ResponseEntity.ok(transactions);
    }

    /**
     * Check in a member
     * POST /api/dashboard/check-in/{userId}
     */
    @PostMapping("/check-in/{userId}")
    public ResponseEntity<CheckIn> checkIn(@PathVariable Long userId) {
        CheckIn checkIn = dashboardService.checkInMember(userId);
        return ResponseEntity.ok(checkIn);
    }

    /**
     * Check out a member
     * POST /api/dashboard/check-out/{checkInId}
     */
    @PostMapping("/check-out/{checkInId}")
    public ResponseEntity<CheckIn> checkOut(@PathVariable Long checkInId) {
        CheckIn checkIn = dashboardService.checkOutMember(checkInId);
        return ResponseEntity.ok(checkIn);
    }
}
