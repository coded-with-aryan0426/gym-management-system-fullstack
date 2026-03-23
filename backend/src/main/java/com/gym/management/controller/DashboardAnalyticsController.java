package com.gym.management.controller;

import com.gym.management.dto.dashboard.*;
import com.gym.management.service.DashboardAnalyticsService;
import com.gym.management.security.DataScopeValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Enhanced Dashboard Analytics Controller
 * Provides real data for dashboard charts and analytics
 * SECURITY: All endpoints require OWNER or ADMIN role
 */
@RestController
@RequestMapping("/api/dashboard/analytics")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public class DashboardAnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(DashboardAnalyticsController.class);

    @Autowired
    private DashboardAnalyticsService analyticsService;
    
    @Autowired
    private DataScopeValidator dataScopeValidator;

    /**
     * Get daily revenue trend for specified date range
     * Returns real revenue data for chart visualization
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/revenue-daily")
    public ResponseEntity<?> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to revenue-daily endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("revenue_daily", null, "READ");
            List<DailyRevenueDTO> data = analyticsService.getDailyRevenue(from, to);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve daily revenue data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve daily revenue data"));
        }
    }

    /**
     * Get daily attendance trend for specified date range
     * Returns real check-in data for chart visualization
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/attendance-daily")
    public ResponseEntity<?> getDailyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to attendance-daily endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("attendance_daily", null, "READ");
            List<DailyAttendanceDTO> data = analyticsService.getDailyAttendance(from, to);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve daily attendance data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve daily attendance data"));
        }
    }

    /**
     * Get membership breakdown with real counts
     * Returns actual member status distribution
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/membership-breakdown")
    public ResponseEntity<?> getMembershipBreakdown() {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to membership-breakdown endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("membership_breakdown", null, "READ");
            MembershipBreakdownDTO data = analyticsService.getMembershipBreakdown();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve membership breakdown", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve membership breakdown"));
        }
    }

    /**
     * Get revenue breakdown by source
     * Returns revenue split by membership, PT, classes, supplements, etc.
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/revenue-by-source")
    public ResponseEntity<?> getRevenueBySource(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to revenue-by-source endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("revenue_by_source", null, "READ");
            List<RevenueBySourceDTO> data = analyticsService.getRevenueBySource(from, to);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve revenue by source", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve revenue by source"));
        }
    }

    /**
     * Get overdue payments with member details
     * Returns members with pending payments and overdue amounts
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/overdue-payments")
    public ResponseEntity<?> getOverduePayments(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to overdue-payments endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("overdue_payments", null, "READ");
            List<OverduePaymentDTO> data = analyticsService.getOverduePayments(limit);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve overdue payments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve overdue payments"));
        }
    }

    /**
     * Get today's class schedule
     * Returns classes happening today with enrollment details
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/todays-classes")
    public ResponseEntity<?> getTodaysClasses() {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to todays-classes endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("todays_classes", null, "READ");
            List<TodaysClassDTO> data = analyticsService.getTodaysClasses();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve today's classes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve today's classes"));
        }
    }

    /**
     * Get gym occupancy data
     * Returns current occupancy percentage and capacity information
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/occupancy")
    public ResponseEntity<?> getOccupancy() {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to occupancy endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("occupancy", null, "READ");
            OccupancyDTO data = analyticsService.getOccupancy();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve occupancy data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve occupancy data"));
        }
    }

    /**
     * Get monthly revenue progress vs target
     * Returns current month revenue vs monthly target with projection
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/monthly-progress")
    public ResponseEntity<?> getMonthlyProgress() {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to monthly-progress endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("monthly_progress", null, "READ");
            MonthlyProgressDTO data = analyticsService.getMonthlyProgress();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve monthly progress", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve monthly progress"));
        }
    }

    /**
     * Get comprehensive dashboard summary
     * Returns all key metrics in a single call for initial dashboard load
     * SECURITY: Requires OWNER or ADMIN role
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated access attempt to summary endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }
            
            dataScopeValidator.logDataAccess("dashboard_summary", null, "READ");
            DashboardSummaryDTO data = analyticsService.getDashboardSummary();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Failed to retrieve dashboard summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve dashboard summary"));
        }
    }

    /**
     * Test endpoint - REMOVED FOR SECURITY
     * Use /summary endpoint instead with proper authentication
     */
}