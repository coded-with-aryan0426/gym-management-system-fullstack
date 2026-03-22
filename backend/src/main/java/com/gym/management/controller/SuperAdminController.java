package com.gym.management.controller;

import com.gym.management.service.SuperAdminAuthService;
import com.gym.management.service.SuperAdminDashboardService;
import com.gym.management.service.SuperAdminUsersService;
import com.gym.management.service.SuperAdminFeaturesService;
import com.gym.management.service.SuperAdminDatabaseService;
import com.gym.management.service.SuperAdminRevenueService;
import com.gym.management.service.SuperAdminAnalyticsService;
import com.gym.management.service.SuperAdminActionsService;
import com.gym.management.model.AuditLog;
import com.gym.management.model.Gym;
import com.gym.management.model.Membership;
import com.gym.management.model.MembershipStatus;
import com.gym.management.model.StaffStatus;
import com.gym.management.model.Transaction;
import com.gym.management.repository.AuditLogRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.GymStaffRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/superadmin")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class SuperAdminController {

    private final SuperAdminAuthService superAdminAuthService;
    private final SuperAdminDashboardService superAdminDashboardService;
    private final SuperAdminUsersService superAdminUsersService;
    private final SuperAdminFeaturesService superAdminFeaturesService;
    private final SuperAdminDatabaseService superAdminDatabaseService;
    private final SuperAdminRevenueService superAdminRevenueService;
    private final SuperAdminAnalyticsService superAdminAnalyticsService;
    private final SuperAdminActionsService superAdminActionsService;
    private final AuditLogRepository auditLogRepository;
    private final GymRepository gymRepository;
    private final GymStaffRepository gymStaffRepository;
    private final MembershipRepository membershipRepository;
    private final TransactionRepository transactionRepository;

    public SuperAdminController(
            SuperAdminAuthService superAdminAuthService,
            SuperAdminDashboardService superAdminDashboardService,
            SuperAdminUsersService superAdminUsersService,
            SuperAdminFeaturesService superAdminFeaturesService,
            SuperAdminDatabaseService superAdminDatabaseService,
            SuperAdminRevenueService superAdminRevenueService,
            SuperAdminAnalyticsService superAdminAnalyticsService,
            SuperAdminActionsService superAdminActionsService,
            AuditLogRepository auditLogRepository,
            GymRepository gymRepository,
            GymStaffRepository gymStaffRepository,
            MembershipRepository membershipRepository,
            TransactionRepository transactionRepository) {
        this.superAdminAuthService = superAdminAuthService;
        this.superAdminDashboardService = superAdminDashboardService;
        this.superAdminUsersService = superAdminUsersService;
        this.superAdminFeaturesService = superAdminFeaturesService;
        this.superAdminDatabaseService = superAdminDatabaseService;
        this.superAdminRevenueService = superAdminRevenueService;
        this.superAdminAnalyticsService = superAdminAnalyticsService;
        this.superAdminActionsService = superAdminActionsService;
        this.auditLogRepository = auditLogRepository;
        this.gymRepository = gymRepository;
        this.gymStaffRepository = gymStaffRepository;
        this.membershipRepository = membershipRepository;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String passphrase = body == null ? null : body.get("passphrase");
        boolean valid = superAdminAuthService.verifyPassphrase(passphrase);
        if (!valid) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid passphrase"));
        }

        String token = superAdminAuthService.issueToken();
        return ResponseEntity.ok(Map.of(
                "token", token,
                "expiresInSeconds", superAdminAuthService.getTokenTtl().toSeconds()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(superAdminDashboardService.getDashboardSnapshot());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String role) {
        return ResponseEntity.ok(superAdminUsersService.getUsers(search, role));
    }

    @GetMapping("/users/{userId}/telemetry")
    public ResponseEntity<Map<String, Object>> getUserTelemetry(
            @org.springframework.web.bind.annotation.PathVariable Long userId) {
        Map<String, Object> telemetry = superAdminUsersService.getUserTelemetry(userId);
        if (telemetry.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(telemetry);
    }

    @GetMapping("/gyms")
    public ResponseEntity<List<Map<String, Object>>> gyms() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sixtyDaysAgo = now.minusDays(60);

        List<Map<String, Object>> rows = new ArrayList<>();
        List<Gym> gyms = gymRepository.findAll();

        for (Gym gym : gyms) {
            Long gymId = gym.getGymId();
            int members = membershipRepository.findByGymGymIdAndStatus(gymId, MembershipStatus.ACTIVE).size();
            int trainers = gymStaffRepository.findByGymGymIdAndStatus(gymId, StaffStatus.ACTIVE).size();

            BigDecimal currentRevenue = transactionRepository.sumAmountByGymIdAndTypeAndStatusAndDateRange(
                    gymId, "INCOME", "Completed", thirtyDaysAgo, now);
            BigDecimal previousRevenue = transactionRepository.sumAmountByGymIdAndTypeAndStatusAndDateRange(
                    gymId, "INCOME", "Completed", sixtyDaysAgo, thirtyDaysAgo);

            if (currentRevenue == null) currentRevenue = BigDecimal.ZERO;
            if (previousRevenue == null) previousRevenue = BigDecimal.ZERO;

            double growth = previousRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? currentRevenue.subtract(previousRevenue)
                            .divide(previousRevenue, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue()
                    : (currentRevenue.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0);

            int healthScore = calculateHealthScore(members, trainers, growth, gym);

            String status = "active";
            if (members == 0 && trainers == 0) {
                status = "trial";
            }

            String ownerName = "—";
            String ownerEmail = "—";
            if (gym.getOwner() != null) {
                ownerName = safeText(gym.getOwner().getFullName(), "—");
                ownerEmail = safeText(gym.getOwner().getEmail(), "—");
            }

            // Fix: use HashMap to avoid Map.of() 10-entry limit
            Map<String, Object> row = new HashMap<>();
            row.put("id", gymId);
            row.put("name", safeText(gym.getName(), "Gym"));
            row.put("owner", ownerName);
            row.put("email", ownerEmail);
            row.put("plan", gym.getSubscriptionPlan() != null ? gym.getSubscriptionPlan().name() : "STARTER");
            row.put("status", status);
            row.put("members", members);
            row.put("trainers", trainers);
            row.put("revenue", currentRevenue);
            row.put("city", safeText(gym.getCity(), "—"));
            row.put("state", safeText(gym.getState(), "—"));
            row.put("created", gym.getCreatedAt() != null ? gym.getCreatedAt().toLocalDate().toString() : "");
            row.put("lastActive", "recently");
            row.put("healthScore", healthScore);
            row.put("growth", BigDecimal.valueOf(growth).setScale(2, RoundingMode.HALF_UP).doubleValue());
            rows.add(row);
        }

        rows.sort(Comparator.comparing(m -> (String) m.get("name")));
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/gyms/{gymId}/deep-dive")
    public ResponseEntity<?> gymDeepDive(@org.springframework.web.bind.annotation.PathVariable Long gymId) {
        Optional<Gym> gymOpt = gymRepository.findById(gymId);
        if (gymOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Gym not found"));
        }

        Gym gym = gymOpt.get();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sixMonthsAgo = now.minusMonths(5).withDayOfMonth(1).toLocalDate().atStartOfDay();

        List<Transaction> transactions = transactionRepository.findByDateRange(sixMonthsAgo, now).stream()
                .filter(t -> gymId.equals(t.getGymId()) && "INCOME".equalsIgnoreCase(t.getType()) && "Completed".equalsIgnoreCase(t.getStatus()))
                .toList();

        List<Map<String, Object>> revenueHistory = monthlyRevenueSeries(transactions, sixMonthsAgo, 6);
        List<Map<String, Object>> memberGrowth = monthlyMembershipSeries(gymId, sixMonthsAgo, 6);
        List<Map<String, Object>> peakHours = syntheticPeakHours(gymId);
        List<Map<String, Object>> recentActivity = recentActivity(gymId);

        int activeMembers = membershipRepository.findByGymGymIdAndStatus(gymId, MembershipStatus.ACTIVE).size();
        int activeTrainers = gymStaffRepository.findByGymGymIdAndStatus(gymId, StaffStatus.ACTIVE).size();
        BigDecimal revenue = transactions.stream()
                .map(Transaction::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<String> features = new ArrayList<>();
        features.add("Online Booking");
        features.add("Payment Gateway");
        features.add("Class Schedule");
        if (activeMembers > 100) {
            features.add("Progress Tracking");
        }
        if (activeMembers > 200) {
            features.add("QR Check-in");
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", gymId);
        payload.put("name", safeText(gym.getName(), "Gym"));
        payload.put("owner", gym.getOwner() != null ? safeText(gym.getOwner().getFullName(), "—") : "—");
        payload.put("email", gym.getOwner() != null ? safeText(gym.getOwner().getEmail(), "—") : "—");
        payload.put("plan", gym.getSubscriptionPlan() != null ? gym.getSubscriptionPlan().name() : "STARTER");
        payload.put("status", activeMembers == 0 ? "trial" : "active");
        payload.put("members", activeMembers);
        payload.put("trainers", activeTrainers);
        payload.put("revenue", revenue);
        payload.put("city", safeText(gym.getCity(), "—"));
        payload.put("state", safeText(gym.getState(), "—"));
        payload.put("created", gym.getCreatedAt() != null ? gym.getCreatedAt().toLocalDate().toString() : "");
        payload.put("lastActive", "recently");
        payload.put("healthScore", calculateHealthScore(activeMembers, activeTrainers, 0, gym));
        payload.put("retentionRate", Math.min(95, 55 + (activeMembers / 12)));
        payload.put("avgSessionDuration", activeMembers > 250 ? "1h 10m" : "52m");
        payload.put("growth", 0);
        payload.put("classesPerWeek", Math.max(6, activeTrainers * 3));
        payload.put("equipmentCount", Math.max(12, activeMembers / 4));
        payload.put("revenueHistory", revenueHistory);
        payload.put("memberGrowth", memberGrowth);
        payload.put("peakHours", peakHours);
        payload.put("recentActivity", recentActivity);
        payload.put("features", features);

        return ResponseEntity.ok(payload);
    }

    private int calculateHealthScore(int members, int trainers, double growth, Gym gym) {
        int score = 35;
        score += Math.min(30, members / 8);
        score += Math.min(15, trainers * 2);
        score += (int) Math.max(-10, Math.min(15, growth));
        if (gym.getIsPublic() != null && gym.getIsPublic()) {
            score += 5;
        }
        return Math.max(10, Math.min(99, score));
    }

    private List<Map<String, Object>> monthlyRevenueSeries(List<Transaction> transactions, LocalDateTime start, int months) {
        List<Map<String, Object>> series = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            LocalDate month = start.toLocalDate().plusMonths(i);
            int monthVal = month.getMonthValue();
            int yearVal = month.getYear();
            BigDecimal sum = transactions.stream()
                    .filter(t -> t.getDateTime() != null
                            && t.getDateTime().getYear() == yearVal
                            && t.getDateTime().getMonthValue() == monthVal)
                    .map(Transaction::getAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            series.add(Map.of("m", month.getMonth().name().substring(0, 3), "v", sum));
        }
        return series;
    }

    private List<Map<String, Object>> monthlyMembershipSeries(Long gymId, LocalDateTime start, int months) {
        List<Membership> memberships = membershipRepository.findByGymGymId(gymId);
        List<Map<String, Object>> series = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            LocalDate month = start.toLocalDate().plusMonths(i);
            int monthVal = month.getMonthValue();
            int yearVal = month.getYear();
            int count = (int) memberships.stream()
                    .filter(m -> m.getCreatedAt() != null
                            && m.getCreatedAt().getYear() == yearVal
                            && m.getCreatedAt().getMonthValue() == monthVal)
                    .count();
            if (i > 0) {
                Object prev = series.get(i - 1).get("v");
                count += ((Number) prev).intValue();
            }
            series.add(Map.of("m", month.getMonth().name().substring(0, 3), "v", count));
        }
        return series;
    }

    private List<Map<String, Object>> syntheticPeakHours(Long gymId) {
        int seed = (int) (gymId % 11);
        return List.of(
                Map.of("h", "6am", "v", 12 + seed),
                Map.of("h", "8am", "v", 38 + seed),
                Map.of("h", "10am", "v", 24 + seed),
                Map.of("h", "12pm", "v", 18 + seed),
                Map.of("h", "4pm", "v", 32 + seed),
                Map.of("h", "6pm", "v", 52 + seed),
                Map.of("h", "8pm", "v", 45 + seed),
                Map.of("h", "10pm", "v", 17 + seed));
    }

    private List<Map<String, Object>> recentActivity(Long gymId) {
        List<Map<String, Object>> activity = new ArrayList<>();

        activity.addAll(membershipRepository.findByGymGymId(gymId).stream()
                .sorted(Comparator.comparing(Membership::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(2)
                .map(m -> Map.<String, Object>of(
                        "action", "New member registered",
                        "detail", safeText(m.getUser() != null ? m.getUser().getFullName() : null, "Member"),
                        "time", m.getCreatedAt() != null ? m.getCreatedAt().toLocalDate().toString() : "recently"))
                .toList());

        activity.addAll(transactionRepository.findTop10ByGymIdOrderByDateTimeDesc(gymId).stream()
                .limit(2)
                .map(t -> Map.<String, Object>of(
                        "action", "Payment received",
                        "detail", safeText(t.getDescription(), "Transaction") + " · ₹" + (t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO),
                        "time", t.getDateTime() != null ? t.getDateTime().toLocalDate().toString() : "recently"))
                .toList());

        if (activity.isEmpty()) {
            activity.add(Map.of("action", "Gym onboarded", "detail", "No recent events yet", "time", "recently"));
        }
        return activity;
    }

    private String safeText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    @GetMapping("/features")
    public ResponseEntity<List<Map<String, Object>>> getFeatureFlags() {
        return ResponseEntity.ok(superAdminFeaturesService.getAllFlags());
    }

    @org.springframework.web.bind.annotation.PutMapping("/features/{key}")
    public ResponseEntity<Map<String, Object>> updateFeatureFlag(
            @org.springframework.web.bind.annotation.PathVariable String key,
            @RequestBody Map<String, Object> updates) {
        Boolean enabled = updates.containsKey("enabled") ? (Boolean) updates.get("enabled") : null;
        Integer rollout = updates.containsKey("rolloutPercentage") ? ((Number) updates.get("rolloutPercentage")).intValue() : null;
        
        try {
            Map<String, Object> updated = superAdminFeaturesService.updateFlag(key, enabled, rollout);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/database/health")
    public ResponseEntity<Map<String, Object>> getDatabaseHealth() {
        return ResponseEntity.ok(superAdminDatabaseService.getDatabaseHealth());
    }

    @GetMapping("/database/tables")
    public ResponseEntity<List<Map<String, Object>>> getTableSizes() {
        return ResponseEntity.ok(superAdminDatabaseService.getTableSizes());
    }

    // ══════════════════════════════════════════════════════════════════
    //  NEW ENDPOINTS — missing from original implementation
    // ══════════════════════════════════════════════════════════════════

    /** Platform-wide revenue analytics (real DB data). */
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue() {
        return ResponseEntity.ok(superAdminRevenueService.getRevenueSnapshot());
    }

    /** Platform-wide analytics: user growth, gym signups, audit severity. */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(superAdminAnalyticsService.getAnalyticsSnapshot());
    }

    /**
     * Super Admin audit log — returns the last N log entries.
     * @param limit number of entries to return (default 100)
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs(
            @RequestParam(defaultValue = "100") int limit) {
        List<AuditLog> logs = auditLogRepository.findTop100ByOrderByTimestampDesc()
                .stream().limit(Math.min(limit, 500)).toList();

        List<Map<String, Object>> result = logs.stream().map(log -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", log.getAuditId());
            entry.put("action", nullSafe(log.getAction(), "AUDIT"));
            entry.put("entity", nullSafe(log.getEntity(), "—"));
            entry.put("entityName", nullSafe(log.getEntityName(), "—"));
            entry.put("details", nullSafe(log.getDetails(), "—"));
            entry.put("userName", nullSafe(log.getUserName(), "System"));
            entry.put("userRole", nullSafe(log.getUserRole(), "—"));
            entry.put("severity", nullSafe(log.getSeverity(), "info"));
            entry.put("ipAddress", nullSafe(log.getIpAddress(), "—"));
            entry.put("timestamp", log.getTimestamp() != null ? log.getTimestamp().toString() : "—");
            return entry;
        }).toList();

        return ResponseEntity.ok(result);
    }

    /**
     * Fetch platform errors/crashes from audit logs.
     */
    @GetMapping("/errors")
    public ResponseEntity<List<Map<String, Object>>> getErrors(@RequestParam(defaultValue = "100") int limit) {
        List<AuditLog> logs = auditLogRepository.findTop100ByOrderByTimestampDesc()
                .stream()
                .filter(l -> "error".equalsIgnoreCase(l.getSeverity()) || "critical".equalsIgnoreCase(l.getSeverity()) || "high".equalsIgnoreCase(l.getSeverity()))
                .limit(Math.min(limit, 500))
                .toList();

        List<Map<String, Object>> result = logs.stream().map(log -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", "ERR-" + log.getAuditId());
            entry.put("type", "error");
            entry.put("service", nullSafe(log.getEntity(), "System"));
            entry.put("message", nullSafe(log.getAction(), "Error") + (log.getDetails() != null ? ": " + log.getDetails() : ""));
            entry.put("stackTrace", nullSafe(log.getChanges(), "No stack trace available."));
            entry.put("timestamp", log.getTimestamp() != null ? log.getTimestamp().toString() : "—");
            entry.put("status", "open");
            entry.put("severity", nullSafe(log.getSeverity(), "high"));
            entry.put("occurrences", 1);
            entry.put("usersAffected", log.getUserName() != null ? 1 : 0);
            return entry;
        }).toList();

        return ResponseEntity.ok(result);
    }

    /** Suspend a gym — sets isPublic=false. Body: { "reason": "..." } */
    @PutMapping("/gyms/{gymId}/suspend")
    public ResponseEntity<Map<String, Object>> suspendGym(
            @PathVariable Long gymId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        Map<String, Object> result = superAdminActionsService.suspendGym(gymId, reason);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(404).body(result);
    }

    /** Reactivate a suspended gym. */
    @PutMapping("/gyms/{gymId}/activate")
    public ResponseEntity<Map<String, Object>> activateGym(@PathVariable Long gymId) {
        Map<String, Object> result = superAdminActionsService.activateGym(gymId);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(404).body(result);
    }

    /** Ban a user — sets accountNonLocked=false. Body: { "reason": "..." } */
    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<Map<String, Object>> banUser(
            @PathVariable Long userId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        Map<String, Object> result = superAdminActionsService.banUser(userId, reason);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(404).body(result);
    }

    /** Unban a user — restores accountNonLocked=true. */
    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<Map<String, Object>> unbanUser(@PathVariable Long userId) {
        Map<String, Object> result = superAdminActionsService.unbanUser(userId);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.status(404).body(result);
    }

    private String nullSafe(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}


