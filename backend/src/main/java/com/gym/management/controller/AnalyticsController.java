package com.gym.management.controller;

import com.gym.management.dto.AnalyticsDTO.*;
import com.gym.management.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> getFullDashboard(
            @RequestParam(defaultValue = "30d") String period) {
        try {
            FullAnalyticsDashboard dashboard = analyticsService.getFullDashboard(period);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            log.error("Failed to get full dashboard analytics for period: {}", period, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve dashboard analytics"));
        }
    }

    @GetMapping("/pt-revenue")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> getPTRevenueAnalytics(
            @RequestParam(defaultValue = "30d") String period) {
        try {
            PTRevenueAnalytics analytics = analyticsService.getPTRevenueAnalytics(period);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Failed to get PT revenue analytics for period: {}", period, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve PT revenue analytics"));
        }
    }

    @GetMapping("/staff-attendance")
    public ResponseEntity<StaffAttendanceAnalytics> getStaffAttendanceAnalytics(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(analyticsService.getStaffAttendanceAnalytics(month));
    }

    @GetMapping("/insights")
    public ResponseEntity<InsightsPanel> getInsightsPanel(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getInsightsPanel(period));
    }

    @GetMapping("/traffic-heatmap")
    public ResponseEntity<TrafficHeatmapData> getTrafficHeatmap(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getTrafficHeatmap(period));
    }

    @GetMapping("/membership-movement")
    public ResponseEntity<MembershipMovement> getMembershipMovement(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getMembershipMovement(period));
    }

    @GetMapping("/trainer-performance")
    public ResponseEntity<List<TrainerPerformanceInsight>> getTrainerPerformance(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getTrainerPerformance(period));
    }
}
