package com.gym.management.controller;

import com.gym.management.dto.trainer.*;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.TrainerReportsService;
import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Trainer Reports Controller - Real data analytics
 * All endpoints require TRAINER, OWNER, or ADMIN role
 * Trainer can only see their own data
 */
@RestController
@RequestMapping("/api/trainer/reports")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
@PreAuthorize("hasAnyRole('TRAINER', 'OWNER', 'ADMIN')")
public class TrainerReportsController {

    @Autowired
    private TrainerReportsService reportsService;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/trainer/reports/overview
     * Returns KPI summary with period comparison
     */
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(
            @RequestParam(defaultValue = "This Month") String period) {
        Long trainerId = getAuthenticatedTrainerId();
        TrainerReportOverviewDTO overview = reportsService.getOverview(trainerId, period);
        return ResponseEntity.ok(apiResponse(true, overview, null));
    }

    /**
     * GET /api/trainer/reports/weekly-activity
     * Returns sessions per day of week
     */
    @GetMapping("/weekly-activity")
    public ResponseEntity<?> getWeeklyActivity(
            @RequestParam(defaultValue = "This Week") String period) {
        Long trainerId = getAuthenticatedTrainerId();
        TrainerWeeklyActivityDTO activity = reportsService.getWeeklyActivity(trainerId, period);
        return ResponseEntity.ok(apiResponse(true, activity, null));
    }

    /**
     * GET /api/trainer/reports/session-types
     * Returns session type percentage breakdown
     */
    @GetMapping("/session-types")
    public ResponseEntity<?> getSessionTypes(
            @RequestParam(defaultValue = "This Month") String period) {
        Long trainerId = getAuthenticatedTrainerId();
        TrainerSessionTypeBreakdownDTO breakdown = reportsService.getSessionTypeBreakdown(trainerId, period);
        return ResponseEntity.ok(apiResponse(true, breakdown, null));
    }

    /**
     * GET /api/trainer/reports/performance
     * Returns performance metrics with confidence levels
     */
    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance(
            @RequestParam(defaultValue = "This Month") String period) {
        Long trainerId = getAuthenticatedTrainerId();
        TrainerPerformanceMetricsDTO metrics = reportsService.getPerformanceMetrics(trainerId, period);
        return ResponseEntity.ok(apiResponse(true, metrics, null));
    }

    /**
     * GET /api/trainer/reports/achievements
     * Returns system-generated achievements (stored, idempotent)
     */
    @GetMapping("/achievements")
    public ResponseEntity<?> getAchievements() {
        Long trainerId = getAuthenticatedTrainerId();
        List<TrainerAchievementDTO> achievements = reportsService.getAchievements(trainerId);
        return ResponseEntity.ok(apiResponse(true, achievements, null));
    }

    /**
     * GET /api/trainer/reports/sessions
     * Returns paginated session history with filters
     */
    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(
            @RequestParam(defaultValue = "This Month") String period,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long trainerId = getAuthenticatedTrainerId();
        List<TrainerSessionReportDTO> sessions = reportsService.getSessions(
                trainerId, period, status, page, size);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", sessions);
        result.put("page", page);
        result.put("size", size);

        return ResponseEntity.ok(apiResponse(true, result, null));
    }

    /**
     * GET /api/trainer/reports/members-progress
     * Returns member progress cards
     */
    @GetMapping("/members-progress")
    public ResponseEntity<?> getMembersProgress() {
        Long trainerId = getAuthenticatedTrainerId();
        List<TrainerMemberProgressDTO> members = reportsService.getMembersProgress(trainerId);
        return ResponseEntity.ok(apiResponse(true, members, null));
    }

    /**
     * GET /api/trainer/reports/earnings
     * Returns earnings breakdown and projections
     */
    @GetMapping("/earnings")
    public ResponseEntity<?> getEarnings(
            @RequestParam(defaultValue = "This Month") String period) {
        Long trainerId = getAuthenticatedTrainerId();
        TrainerEarningsDTO earnings = reportsService.getEarnings(trainerId, period);
        return ResponseEntity.ok(apiResponse(true, earnings, null));
    }

    /**
     * GET /api/trainer/reports/export/{type}
     * Export data as CSV
     */
    @GetMapping("/export/{type}")
    public ResponseEntity<?> exportReport(
            @PathVariable String type,
            @RequestParam(defaultValue = "This Month") String period) {
        Long trainerId = getAuthenticatedTrainerId();

        StringBuilder csv = new StringBuilder();

        if ("sessions".equalsIgnoreCase(type)) {
            csv.append("Member,Type,Date,Time,Duration,Status,Rating\n");
            List<TrainerSessionReportDTO> sessions = reportsService.getSessions(
                    trainerId, period, "all", 0, 1000);

            for (TrainerSessionReportDTO s : sessions) {
                csv.append(String.format("%s,%s,%s,%s,%s,%s,%s\n",
                        escapeCsv(s.getMemberName()),
                        escapeCsv(s.getType()),
                        escapeCsv(s.getDate()),
                        escapeCsv(s.getTime()),
                        escapeCsv(s.getDuration()),
                        escapeCsv(s.getStatus()),
                        s.getRating() != null ? s.getRating() : "-"));
            }
        } else if ("earnings".equalsIgnoreCase(type)) {
            TrainerEarningsDTO earnings = reportsService.getEarnings(trainerId, period);

            csv.append("Earnings Report - ").append(period).append("\n\n");
            csv.append("Category,Amount,Sessions\n");

            for (TrainerEarningsDTO.EarningsCategory cat : earnings.getBreakdown()) {
                csv.append(String.format("%s,$%.2f,%d\n",
                        escapeCsv(cat.getCategory()),
                        cat.getAmount(),
                        cat.getSessions()));
            }

            csv.append(String.format("\nTotal,$%.2f,%d\n",
                    earnings.getTotalEarnings(),
                    earnings.getPaidSessions()));
            csv.append(String.format("Avg per Session,$%.2f\n", earnings.getAvgPerSession()));
            csv.append(String.format("Avg Daily,$%.2f\n", earnings.getAvgDailyEarnings()));
            csv.append(String.format("Projected Monthly,$%.2f\n", earnings.getProjectedMonthly()));
        } else {
            return ResponseEntity.badRequest()
                    .body(apiResponse(false, null, "Invalid export type. Use 'sessions' or 'earnings'"));
        }

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=\"" + type + "_report.csv\"")
                .body(csv.toString());
    }

    // ==================== HELPER METHODS ====================

    private Long getAuthenticatedTrainerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Authentication required - no valid session");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getId();
        } else if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return user.getUserId();
        } else if (principal instanceof String) {
            String username = (String) principal;
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            return user.getUserId();
        }
        throw new RuntimeException("Unable to determine trainer ID from authentication principal");
    }

    private Map<String, Object> apiResponse(boolean success, Object data, String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", success);
        response.put("data", data);
        response.put("message", message);
        return response;
    }

    private String escapeCsv(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
