package com.gym.management.controller;

import com.gym.management.dto.dashboard.*;
import com.gym.management.service.DashboardAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Enhanced Dashboard Analytics Controller
 * Provides real data for dashboard charts and analytics
 */
@RestController
@RequestMapping("/api/dashboard/analytics")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
// @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')") // Temporarily disabled for
// testing
public class DashboardAnalyticsController {

    @Autowired
    private DashboardAnalyticsService analyticsService;

    /**
     * Get daily revenue trend for specified date range
     * Returns real revenue data for chart visualization
     */
    @GetMapping("/revenue-daily")
    public ResponseEntity<List<DailyRevenueDTO>> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        try {
            List<DailyRevenueDTO> data = analyticsService.getDailyRevenue(from, to);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get daily attendance trend for specified date range
     * Returns real check-in data for chart visualization
     */
    @GetMapping("/attendance-daily")
    public ResponseEntity<List<DailyAttendanceDTO>> getDailyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        try {
            List<DailyAttendanceDTO> data = analyticsService.getDailyAttendance(from, to);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get membership breakdown with real counts
     * Returns actual member status distribution
     */
    @GetMapping("/membership-breakdown")
    public ResponseEntity<MembershipBreakdownDTO> getMembershipBreakdown() {
        try {
            MembershipBreakdownDTO data = analyticsService.getMembershipBreakdown();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get revenue breakdown by source
     * Returns revenue split by membership, PT, classes, supplements, etc.
     */
    @GetMapping("/revenue-by-source")
    public ResponseEntity<List<RevenueBySourceDTO>> getRevenueBySource(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        try {
            List<RevenueBySourceDTO> data = analyticsService.getRevenueBySource(from, to);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get overdue payments with member details
     * Returns members with pending payments and overdue amounts
     */
    @GetMapping("/overdue-payments")
    public ResponseEntity<List<OverduePaymentDTO>> getOverduePayments(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<OverduePaymentDTO> data = analyticsService.getOverduePayments(limit);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get today's class schedule
     * Returns classes happening today with enrollment details
     */
    @GetMapping("/todays-classes")
    public ResponseEntity<List<TodaysClassDTO>> getTodaysClasses() {
        try {
            List<TodaysClassDTO> data = analyticsService.getTodaysClasses();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get gym occupancy data
     * Returns current occupancy percentage and capacity information
     */
    @GetMapping("/occupancy")
    public ResponseEntity<OccupancyDTO> getOccupancy() {
        try {
            OccupancyDTO data = analyticsService.getOccupancy();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get monthly revenue progress vs target
     * Returns current month revenue vs monthly target with projection
     */
    @GetMapping("/monthly-progress")
    public ResponseEntity<MonthlyProgressDTO> getMonthlyProgress() {
        try {
            MonthlyProgressDTO data = analyticsService.getMonthlyProgress();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get comprehensive dashboard summary
     * Returns all key metrics in a single call for initial dashboard load
     */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        try {
            DashboardSummaryDTO data = analyticsService.getDashboardSummary();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Test endpoint - no authentication required
     * Returns simple test data to verify service is working
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        try {
            Map<String, Object> testData = new HashMap<>();
            testData.put("timestamp", LocalDate.now());
            testData.put("service", "DashboardAnalyticsService");
            testData.put("status", "active");

            // Test membership breakdown
            MembershipBreakdownDTO breakdown = analyticsService.getMembershipBreakdown();
            testData.put("membershipBreakdown", breakdown);

            return ResponseEntity.ok(testData);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", "error");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}