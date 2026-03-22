package com.gym.management.service;

import com.gym.management.model.Gym;
import com.gym.management.repository.GymRepository;
import com.gym.management.repository.MembershipRepository;
import com.gym.management.repository.TransactionRepository;
import com.gym.management.model.MembershipStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Super Admin platform-wide revenue analytics.
 * Returns real data from the transactions table.
 */
@Service
public class SuperAdminRevenueService {

    private final TransactionRepository transactionRepository;
    private final GymRepository gymRepository;
    private final MembershipRepository membershipRepository;

    public SuperAdminRevenueService(TransactionRepository transactionRepository,
                                    GymRepository gymRepository,
                                    MembershipRepository membershipRepository) {
        this.transactionRepository = transactionRepository;
        this.gymRepository = gymRepository;
        this.membershipRepository = membershipRepository;
    }

    public Map<String, Object> getRevenueSnapshot() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime prevMonthStart = monthStart.minusMonths(1);
        LocalDateTime yearStart = now.withDayOfYear(1).toLocalDate().atStartOfDay();

        BigDecimal mrr = safe(transactionRepository.getRevenueForDateRange(monthStart, now));
        BigDecimal prevMrr = safe(transactionRepository.getRevenueForDateRange(prevMonthStart, monthStart));
        BigDecimal arr = safe(transactionRepository.getRevenueForDateRange(yearStart, now));

        // Monthly trend — last 12 months
        List<Map<String, Object>> monthlyTrend = buildMonthlyTrend(now, 12);

        // Revenue by category
        List<Map<String, Object>> byCategory = buildCategoryBreakdown(monthStart, now);

        // Top gyms by revenue
        List<Map<String, Object>> topGyms = buildTopGymRevenue(monthStart, now);

        // Plan distribution (subscriptionPlan field on Gym)
        Map<String, Long> planDist = gymRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        g -> g.getSubscriptionPlan() != null ? g.getSubscriptionPlan().name() : "STARTER",
                        Collectors.counting()
                ));

        Map<String, Object> result = new HashMap<>();
        result.put("mrr", mrr);
        result.put("prevMrr", prevMrr);
        result.put("mrrChange", percentChange(mrr, prevMrr));
        result.put("arr", arr);
        result.put("monthlyTrend", monthlyTrend);
        result.put("byCategory", byCategory);
        result.put("topGyms", topGyms);
        result.put("planDistribution", planDist);
        result.put("generatedAt", now.toString());
        return result;
    }

    private List<Map<String, Object>> buildMonthlyTrend(LocalDateTime now, int months) {
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).toLocalDate().atStartOfDay();
            LocalDateTime end = start.plusMonths(1).minusNanos(1);
            BigDecimal revenue = safe(transactionRepository.getRevenueForDateRange(start, end));
            String monthLabel = start.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + start.getYear();
            trend.add(Map.of(
                    "month", monthLabel,
                    "revenue", revenue,
                    "m", start.getMonth().name().substring(0, 3)
            ));
        }
        return trend;
    }

    private List<Map<String, Object>> buildCategoryBreakdown(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = transactionRepository.getRevenueByCategory(start, end);
        return rows.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("category", row[0] != null ? row[0].toString() : "Other");
            m.put("amount", row[1] != null ? row[1] : BigDecimal.ZERO);
            return m;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildTopGymRevenue(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = transactionRepository.findTopGymsByRevenue(start, end);
        Map<Long, String> gymNames = gymRepository.findAll().stream()
                .collect(Collectors.toMap(Gym::getGymId, g -> g.getName() != null ? g.getName() : "Gym"));

        return rows.stream().limit(10).map(row -> {
            Long gymId = (Long) row[0];
            BigDecimal revenue = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            int members = membershipRepository.findByGymGymIdAndStatus(gymId, MembershipStatus.ACTIVE).size();
            Map<String, Object> m = new HashMap<>();
            m.put("gymId", gymId);
            m.put("name", gymNames.getOrDefault(gymId, "Gym #" + gymId));
            m.put("revenue", revenue);
            m.put("members", members);
            return m;
        }).collect(Collectors.toList());
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private double percentChange(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) <= 0) {
            return current != null && current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        if (current == null) return 0.0;
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}
