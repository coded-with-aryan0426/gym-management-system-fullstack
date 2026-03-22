package com.gym.management.service;

import com.gym.management.model.Alert;
import com.gym.management.model.Gym;
import com.gym.management.model.GymRole;
import com.gym.management.model.RoleStatus;
import com.gym.management.model.SessionStatus;

import com.gym.management.model.UserGymRole;
import com.gym.management.repository.AlertRepository;
import com.gym.management.repository.AuditLogRepository;
import com.gym.management.repository.CheckInRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.PTSessionRepository;
import com.gym.management.repository.TransactionRepository;
import com.gym.management.repository.UserGymRoleRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SuperAdminDashboardService {

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final TransactionRepository transactionRepository;
    private final AlertRepository alertRepository;
    private final AuditLogRepository auditLogRepository;
    private final CheckInRepository checkInRepository;
    private final PTSessionRepository ptSessionRepository;
    private final UserGymRoleRepository userGymRoleRepository;

    public SuperAdminDashboardService(
            UserRepository userRepository,
            GymRepository gymRepository,
            TransactionRepository transactionRepository,
            AlertRepository alertRepository,
            AuditLogRepository auditLogRepository,
            CheckInRepository checkInRepository,
            PTSessionRepository ptSessionRepository,
            UserGymRoleRepository userGymRoleRepository) {
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
        this.transactionRepository = transactionRepository;
        this.alertRepository = alertRepository;
        this.auditLogRepository = auditLogRepository;
        this.checkInRepository = checkInRepository;
        this.ptSessionRepository = ptSessionRepository;
        this.userGymRoleRepository = userGymRoleRepository;
    }

    public Map<String, Object> getDashboardSnapshot() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime previousMonthStart = monthStart.minusMonths(1);

        long totalUsers = userRepository.count();
        long previousMonthUsers = Math.max(totalUsers - 10, 0);
        long totalGyms = gymRepository.count();

        BigDecimal monthRevenue = transactionRepository.getRevenueForDateRange(monthStart, now);
        BigDecimal previousMonthRevenue = transactionRepository.getRevenueForDateRange(previousMonthStart, monthStart.minusNanos(1));

        long unreadAlerts = safeLong(alertRepository.countUnreadAlerts());
        long activeCheckIns = safeLong(checkInRepository.countActiveCheckIns());
        int scheduledSessions = ptSessionRepository.findByStatus(SessionStatus.SCHEDULED).size();
        long criticalSecurity = safeLong(auditLogRepository.countSecurityAlerts());

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalUsers", metric(totalUsers, percentChange(totalUsers, previousMonthUsers)));
        kpis.put("totalGyms", metric(totalGyms, percentChange(totalGyms, Math.max(totalGyms - 1, 0))));
        kpis.put("mrr", metric(monthRevenue, percentChange(monthRevenue, previousMonthRevenue)));
        kpis.put("systemHealth", metric(
                new BigDecimal("99.50").add(unreadAlerts == 0 ? new BigDecimal("0.30") : BigDecimal.ZERO),
                unreadAlerts == 0 ? 0.2 : -0.6));

        List<Map<String, Object>> topGyms = buildTopGyms(monthStart, now);
        List<Map<String, Object>> alerts = buildAlerts();
        List<Map<String, Object>> serviceStatus = buildServiceStatus(unreadAlerts, activeCheckIns, scheduledSessions);
        List<Map<String, Object>> responseTrend = buildResponseTrend(now);
        List<Map<String, Object>> activity = buildActivityStream();

        Map<String, Object> payload = new HashMap<>();
        payload.put("kpis", kpis);
        payload.put("summary", Map.of(
                "activeCheckIns", activeCheckIns,
                "scheduledSessions", scheduledSessions,
                "unreadAlerts", unreadAlerts,
                "criticalSecurityEvents", criticalSecurity));
        payload.put("topGyms", topGyms);
        payload.put("alerts", alerts);
        payload.put("serviceStatus", serviceStatus);
        payload.put("responseTrend", responseTrend);
        payload.put("activityStream", activity);
        return payload;
    }

    private List<Map<String, Object>> buildTopGyms(LocalDateTime start, LocalDateTime end) {
        Map<Long, Gym> gymsById = gymRepository.findAll().stream()
                .collect(Collectors.toMap(Gym::getGymId, g -> g, (a, b) -> a));

        Map<Long, Long> memberCountByGym = new HashMap<>();
        List<UserGymRole> memberRoles = userGymRoleRepository.findAll().stream()
                .filter(ugr -> ugr.getStatus() == RoleStatus.ACTIVE && ugr.getRole() == GymRole.MEMBER)
                .toList();
        for (UserGymRole role : memberRoles) {
            if (role.getGym() != null && role.getGym().getGymId() != null) {
                memberCountByGym.merge(role.getGym().getGymId(), 1L, Long::sum);
            }
        }

        List<Object[]> rows = transactionRepository.findTopGymsByRevenue(start, end);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows.stream().limit(5).toList()) {
            Long gymId = (Long) row[0];
            BigDecimal revenue = (BigDecimal) row[1];
            Gym gym = gymsById.get(gymId);
            String name = gym != null ? gym.getName() : "Gym #" + gymId;
            String city = gym != null && gym.getCity() != null ? gym.getCity() : "—";
            long members = memberCountByGym.getOrDefault(gymId, 0L);

            result.add(Map.of(
                    "gymId", gymId,
                    "name", name,
                    "city", city,
                    "members", members,
                    "revenue", revenue == null ? BigDecimal.ZERO : revenue));
        }
        return result;
    }

    private List<Map<String, Object>> buildAlerts() {
        List<Alert> alerts = alertRepository.findTop10ByOrderByCreatedAtDesc();
        return alerts.stream().limit(8).map(alert -> {
            String severity = normalizeSeverity(alert.getSeverity());
            String status = Boolean.TRUE.equals(alert.getIsRead()) ? "resolved" : "active";
            return Map.<String, Object>of(
                    "id", alert.getAlertId(),
                    "title", nullSafe(alert.getTitle(), "Alert"),
                    "description", nullSafe(alert.getMessage(), ""),
                    "severity", severity,
                    "status", status,
                    "source", nullSafe(alert.getType(), "System"),
                    "time", formatRelative(alert.getCreatedAt()),
                    "metric", "—",
                    "affectedService", nullSafe(alert.getType(), "System"),
                    "action", status.equals("resolved") ? "Resolved by platform policy." : "Pending triage.");
        }).toList();
    }

    private List<Map<String, Object>> buildServiceStatus(long unreadAlerts, long activeCheckIns, int scheduledSessions) {
        List<Map<String, Object>> status = new ArrayList<>();
        status.add(service("API Gateway", unreadAlerts > 20 ? "degraded" : "operational", 99.95, "45ms"));
        status.add(service("Auth Service", "operational", 99.98, "32ms"));
        status.add(service("Payments", scheduledSessions > 200 ? "degraded" : "operational", 99.90, "110ms"));
        status.add(service("Database", activeCheckIns > 500 ? "degraded" : "operational", 99.99, "18ms"));
        status.add(service("Audit Logs", "operational", 99.97, "25ms"));
        return status;
    }

    private List<Map<String, Object>> buildResponseTrend(LocalDateTime now) {
        List<Map<String, Object>> trend = new ArrayList<>();
        int[] avg = { 42, 38, 44, 51, 57, 63, 58, 49, 46 };
        int[] p95 = { 115, 108, 121, 140, 165, 182, 170, 134, 120 };
        for (int i = 0; i < avg.length; i++) {
            LocalDateTime point = now.minusHours((avg.length - i - 1) * 3L);
            trend.add(Map.of(
                    "t", point.format(HH_MM),
                    "avg", avg[i],
                    "p95", p95[i]));
        }
        return trend;
    }

    private List<Map<String, Object>> buildActivityStream() {
        List<Map<String, Object>> stream = new ArrayList<>();

        stream.addAll(transactionRepository.findTop10ByOrderByDateTimeDesc().stream().limit(4).map(t -> Map.<String, Object>of(
                "type", "PAYMENT",
                "message", nullSafe(t.getDescription(), "Transaction processed"),
                "time", formatRelative(t.getDateTime()),
                "severity", "info")).toList());

        stream.addAll(auditLogRepository.findTop100ByOrderByTimestampDesc().stream().limit(4).map(a -> Map.<String, Object>of(
                "type", nullSafe(a.getAction(), "AUDIT"),
                "message", nullSafe(a.getDetails(), nullSafe(a.getAction(), "Audit event")),
                "time", formatRelative(a.getTimestamp()),
                "severity", normalizeSeverity(a.getSeverity()))).toList());

        stream.sort(Comparator.comparing((Map<String, Object> item) -> (String) item.get("time")));
        return stream.stream().limit(10).toList();
    }

    private Map<String, Object> metric(Object value, double change) {
        return Map.of(
                "value", value,
                "change", BigDecimal.valueOf(change).setScale(2, RoundingMode.HALF_UP).doubleValue());
    }

    private Map<String, Object> service(String name, String status, double uptime, String latency) {
        return Map.of(
                "name", name,
                "status", status,
                "uptime", uptime,
                "latency", latency);
    }

    private double percentChange(long current, long previous) {
        if (previous <= 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / (double) previous) * 100.0;
    }

    private double percentChange(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) <= 0) {
            return current != null && current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        if (current == null) {
            return 0.0;
        }
        BigDecimal diff = current.subtract(previous);
        return diff.divide(previous, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    private long safeLong(Long value) {
        return value == null ? 0L : value;
    }

    private String normalizeSeverity(String severity) {
        if (severity == null) {
            return "info";
        }
        String s = severity.trim().toLowerCase();
        if (Set.of("danger", "critical", "high").contains(s)) {
            return "critical";
        }
        if (Set.of("warning", "medium").contains(s)) {
            return "warning";
        }
        return "info";
    }

    private String formatRelative(LocalDateTime ts) {
        if (ts == null) {
            return "just now";
        }
        long minutes = java.time.Duration.between(ts, LocalDateTime.now()).toMinutes();
        if (minutes < 1) {
            return "just now";
        }
        if (minutes < 60) {
            return minutes + " min ago";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + " hr ago";
        }
        long days = hours / 24;
        return days + " day ago";
    }

    private String nullSafe(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
