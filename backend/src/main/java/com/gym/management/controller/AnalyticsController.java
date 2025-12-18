package com.gym.management.controller;

import com.gym.management.dto.AnalyticsDTO.*;
import com.gym.management.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<FullAnalyticsDashboard> getFullDashboard(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getFullDashboard(period));
    }

    @GetMapping("/pt-revenue")
    public ResponseEntity<PTRevenueAnalytics> getPTRevenueAnalytics(
            @RequestParam(defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getPTRevenueAnalytics(period));
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
