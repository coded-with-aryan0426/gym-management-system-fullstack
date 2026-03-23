package com.gym.management.service;

import com.gym.management.model.Transaction;
import com.gym.management.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final TransactionRepository transactionRepository;

    private LocalDateTime[] getDateRange(String period) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = switch (period) {
            case "day" -> LocalDate.now().atStartOfDay();
            case "week" -> LocalDate.now().minusWeeks(1).atStartOfDay();
            case "month" -> LocalDate.now().minusMonths(1).atStartOfDay();
            case "6month" -> LocalDate.now().minusMonths(6).atStartOfDay();
            case "year" -> LocalDate.now().minusYears(1).atStartOfDay();
            default -> LocalDate.now().minusMonths(1).atStartOfDay();
        };
        return new LocalDateTime[] { startDate, endDate };
    }

    private LocalDateTime[] getPreviousDateRange(String period) {
        LocalDateTime[] current = getDateRange(period);
        long durationMillis = java.time.Duration.between(current[0], current[1]).toMillis();
        LocalDateTime prevEnd = current[0];
        LocalDateTime prevStart = prevEnd.minus(java.time.Duration.ofMillis(durationMillis));
        return new LocalDateTime[] { prevStart, prevEnd };
    }

    public Page<Transaction> getTransactions(String status, String category, String search, Long userId, Pageable pageable) {
        return transactionRepository.findAllWithFilters(
                status != null && status.isEmpty() ? null : status,
                category != null && category.isEmpty() ? null : category,
                search != null && search.isEmpty() ? null : search,
                userId,
                pageable);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        if (transaction.getDateTime() == null) {
            transaction.setDateTime(LocalDateTime.now());
        }
        if (transaction.getStatus() == null) {
            transaction.setStatus("Completed");
        }
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction updateTransaction(Long id, Transaction details) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (details.getDescription() != null)
            tx.setDescription(details.getDescription());
        if (details.getCategory() != null)
            tx.setCategory(details.getCategory());
        if (details.getAmount() != null)
            tx.setAmount(details.getAmount());
        if (details.getType() != null)
            tx.setType(details.getType());
        if (details.getStatus() != null)
            tx.setStatus(details.getStatus());
        if (details.getReferenceNumber() != null)
            tx.setReferenceNumber(details.getReferenceNumber());
        if (details.getDateTime() != null)
            tx.setDateTime(details.getDateTime());

        return transactionRepository.save(tx);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public Map<String, Object> getFinancialStats(String period, Long userId) {
        LocalDateTime[] range = getDateRange(period);
        LocalDateTime[] prevRange = getPreviousDateRange(period);

        // Revenue: only Completed income (cash actually received)
        BigDecimal totalRevenue = transactionRepository.sumAmountByTypeAndStatusAndDateRange("INCOME", "Completed",
                range[0], range[1], userId);
        if (totalRevenue == null)
            totalRevenue = BigDecimal.ZERO;

        // Expenses: ALL statuses (an expense is a liability whether paid or pending)
        BigDecimal totalExpenses = transactionRepository.sumAmountByTypeAndDateRange("EXPENSE",
                range[0], range[1], userId);
        if (totalExpenses == null)
            totalExpenses = BigDecimal.ZERO;

        BigDecimal pendingDues = transactionRepository.sumAmountByStatusAndDateRange("Pending", range[0], range[1], userId);
        if (pendingDues == null)
            pendingDues = BigDecimal.ZERO;

        Long pendingCount = transactionRepository.countPendingTransactions(range[0], range[1], userId);
        if (pendingCount == null)
            pendingCount = 0L;

        // Previous period for comparison
        BigDecimal prevRevenue = transactionRepository.sumAmountByTypeAndStatusAndDateRange("INCOME", "Completed",
                prevRange[0], prevRange[1], userId);
        if (prevRevenue == null)
            prevRevenue = BigDecimal.ZERO;

        BigDecimal prevExpenses = transactionRepository.sumAmountByTypeAndDateRange("EXPENSE",
                prevRange[0], prevRange[1], userId);
        if (prevExpenses == null)
            prevExpenses = BigDecimal.ZERO;

        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        double profitMargin = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        // Calculate percentage changes
        double revenueChange = prevRevenue.compareTo(BigDecimal.ZERO) > 0
                ? totalRevenue.subtract(prevRevenue).divide(prevRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;
        double expensesChange = prevExpenses.compareTo(BigDecimal.ZERO) > 0
                ? totalExpenses.subtract(prevExpenses).divide(prevExpenses, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalExpenses", totalExpenses);
        stats.put("netProfit", netProfit);
        stats.put("profitMargin", Math.round(profitMargin));
        stats.put("pendingPayments", pendingDues);
        stats.put("pendingCount", pendingCount);
        stats.put("revenueChange", Math.round(revenueChange));
        stats.put("expensesChange", Math.round(expensesChange));

        return stats;
    }

    public List<Object[]> getRevenueBreakdown(String period, Long userId) {
        LocalDateTime[] range = getDateRange(period);
        return transactionRepository.getRevenueByCategory(range[0], range[1], userId);
    }

    public List<Object[]> getExpenseBreakdown(String period) {
        LocalDateTime[] range = getDateRange(period);
        return transactionRepository.getExpenseByCategory(range[0], range[1]);
    }

    public List<Map<String, Object>> getChartData(String period, Long userId) {
        LocalDateTime[] range = getDateRange(period);

        List<Transaction> transactions = transactionRepository.findByDateRange(range[0], range[1], userId);

        Map<String, Map<String, BigDecimal>> grouped = new java.util.TreeMap<>();

        for (Transaction t : transactions) {
            if ("INCOME".equals(t.getType()) && !"Completed".equals(t.getStatus()))
                continue; // Only count completed income as received revenue

            String key = t.getDateTime().toLocalDate().toString();

            grouped.putIfAbsent(key, new HashMap<>());
            Map<String, BigDecimal> dayStats = grouped.get(key);
            dayStats.putIfAbsent("revenue", BigDecimal.ZERO);
            dayStats.putIfAbsent("expenses", BigDecimal.ZERO);

            if ("INCOME".equals(t.getType())) {
                dayStats.put("revenue", dayStats.get("revenue").add(t.getAmount()));
            } else if ("EXPENSE".equals(t.getType())) {
                dayStats.put("expenses", dayStats.get("expenses").add(t.getAmount()));
            }
        }

        return grouped.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("name", entry.getKey());
                    point.put("revenue", entry.getValue().get("revenue"));
                    point.put("expenses", entry.getValue().get("expenses"));
                    return point;
                })
                .collect(Collectors.toList());
    }

    public List<Transaction> getPendingTransactions(String period) {
        LocalDateTime[] range = getDateRange(period);
        return transactionRepository.findPendingTransactions(range[0], range[1], null);
    }

    public List<Map<String, Object>> getCategoryStats(String type, String period, Long userId) {
        LocalDateTime[] range = getDateRange(period);
        List<Object[]> results = transactionRepository.getCategoryStats(type, range[0], range[1], userId);
        return results.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("category", r[0]);
            m.put("count", r[1]);
            m.put("total", r[2]);
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDailyTrend(String period, Long userId) {
        LocalDateTime[] range = getDateRange(period);
        List<Object[]> results = transactionRepository.getDailyTotals(range[0], range[1], userId);

        Map<String, Map<String, BigDecimal>> grouped = new java.util.TreeMap<>();
        for (Object[] r : results) {
            String date = r[0].toString();
            String type = (String) r[1];
            // Safely convert whatever numeric type the DB returns to BigDecimal
            BigDecimal amount;
            if (r[2] instanceof BigDecimal) {
                amount = (BigDecimal) r[2];
            } else if (r[2] instanceof Number) {
                amount = BigDecimal.valueOf(((Number) r[2]).doubleValue());
            } else {
                amount = BigDecimal.ZERO;
            }
            grouped.putIfAbsent(date, new HashMap<>());
            Map<String, BigDecimal> dayData = grouped.get(date);
            dayData.putIfAbsent("revenue", BigDecimal.ZERO);
            dayData.putIfAbsent("expenses", BigDecimal.ZERO);
            if ("INCOME".equals(type)) {
                dayData.put("revenue", dayData.get("revenue").add(amount));
            } else if ("EXPENSE".equals(type)) {
                dayData.put("expenses", dayData.get("expenses").add(amount));
            }
        }

        return grouped.entrySet().stream().map(entry -> {
            Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey());
            point.put("revenue", entry.getValue().get("revenue"));
            point.put("expenses", entry.getValue().get("expenses"));
            point.put("profit", entry.getValue().get("revenue").subtract(entry.getValue().get("expenses")));
            return point;
        }).collect(Collectors.toList());
    }

    public List<Transaction> getTopTransactions(String type, String period, int limit, Long userId) {
        LocalDateTime[] range = getDateRange(period);
        List<Transaction> all = transactionRepository.findByDateRange(range[0], range[1], userId);
        return all.stream()
                .filter(t -> type.equals(t.getType()) && "Completed".equals(t.getStatus()))
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .limit(limit)
                .collect(Collectors.toList());
    }
}
