package com.gym.management.service;

import com.gym.management.repository.AuditLogRepository;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.UserRepository;
import com.gym.management.model.MembershipStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Super Admin platform-wide analytics (signups, retention, activity).
 * Returns real aggregated data from the database.
 */
@Service
public class SuperAdminAnalyticsService {

    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final MembershipRepository membershipRepository;
    private final AuditLogRepository auditLogRepository;

    public SuperAdminAnalyticsService(UserRepository userRepository,
                                      GymRepository gymRepository,
                                      MembershipRepository membershipRepository,
                                      AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
        this.membershipRepository = membershipRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public Map<String, Object> getAnalyticsSnapshot() {
        LocalDateTime now = LocalDateTime.now();

        // --- KPI totals ---
        long totalUsers = userRepository.count();
        long totalGyms = gymRepository.count();

        long activeMembers = membershipRepository.findAll().stream()
                .filter(m -> MembershipStatus.ACTIVE.equals(m.getStatus()))
                .count();

        long totalAuditEvents = auditLogRepository.count();
        long securityAlerts = safeCount(auditLogRepository.countSecurityAlerts());

        // --- Monthly user growth — last 12 months ---
        List<Map<String, Object>> userGrowth = buildUserGrowthTrend(now, 12);

        // --- Monthly gym signups — last 12 months ---
        List<Map<String, Object>> gymSignups = buildGymSignupTrend(now, 12);

        // --- Audit severity distribution ---
        Map<String, Long> severityDist = buildSeverityDistribution();

        // --- Top actions from audit logs ---
        List<Map<String, Object>> topActions = buildTopActions();

        // --- Platform health summary ---
        Map<String, Object> health = Map.of(
                "totalUsers", totalUsers,
                "totalGyms", totalGyms,
                "activeMembers", activeMembers,
                "totalAuditEvents", totalAuditEvents,
                "securityAlerts", securityAlerts
        );

        Map<String, Object> result = new HashMap<>();
        result.put("health", health);
        result.put("userGrowth", userGrowth);
        result.put("gymSignups", gymSignups);
        result.put("severityDistribution", severityDist);
        result.put("topActions", topActions);
        result.put("generatedAt", now.toString());
        return result;
    }

    private List<Map<String, Object>> buildUserGrowthTrend(LocalDateTime now, int months) {
        List<Map<String, Object>> trend = new ArrayList<>();
        // We compute cumulative users created up to each month end
        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime monthEnd = now.minusMonths(i).withDayOfMonth(1)
                    .plusMonths(1).toLocalDate().atStartOfDay().minusNanos(1);
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).toLocalDate().atStartOfDay();
            String label = monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            long count = userRepository.findAll().stream()
                    .filter(u -> {
                        try {
                            var ca = u.getClass().getMethod("getCreatedAt");
                            Object ts = ca.invoke(u);
                            if (ts instanceof LocalDateTime ldt) {
                                return !ldt.isBefore(monthStart) && !ldt.isAfter(monthEnd);
                            }
                        } catch (Exception ignored) {}
                        return false;
                    }).count();

            trend.add(Map.of("month", label, "newUsers", count));
        }
        return trend;
    }

    private List<Map<String, Object>> buildGymSignupTrend(LocalDateTime now, int months) {
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).toLocalDate().atStartOfDay();
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusNanos(1);
            String label = monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            long count = gymRepository.findAll().stream()
                    .filter(g -> g.getCreatedAt() != null
                            && !g.getCreatedAt().isBefore(monthStart)
                            && !g.getCreatedAt().isAfter(monthEnd))
                    .count();

            trend.add(Map.of("month", label, "gyms", count));
        }
        return trend;
    }

    private Map<String, Long> buildSeverityDistribution() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .collect(Collectors.groupingBy(
                        a -> a.getSeverity() != null ? a.getSeverity() : "info",
                        Collectors.counting()
                ));
    }

    private List<Map<String, Object>> buildTopActions() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .collect(Collectors.groupingBy(
                        a -> a.getAction() != null ? a.getAction() : "UNKNOWN",
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> (Map<String, Object>) new HashMap<String, Object>(Map.of(
                        "action", e.getKey(),
                        "count", e.getValue()
                )))
                .collect(Collectors.toList());
    }

    private long safeCount(Long val) {
        return val == null ? 0L : val;
    }
}
