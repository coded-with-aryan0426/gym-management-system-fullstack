package com.gym.management.service;

import com.gym.management.model.Transaction;
import com.gym.management.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    public Page<Transaction> getTransactions(String status, String category, String search, Pageable pageable) {
        return transactionRepository.findAllWithFilters(
                status != null && status.isEmpty() ? null : status,
                category != null && category.isEmpty() ? null : category,
                search != null && search.isEmpty() ? null : search,
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

        tx.setDescription(details.getDescription());
        tx.setCategory(details.getCategory());
        tx.setAmount(details.getAmount());
        tx.setType(details.getType());
        tx.setStatus(details.getStatus());
        tx.setReferenceNumber(details.getReferenceNumber());
        tx.setDateTime(details.getDateTime());

        return transactionRepository.save(tx);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public Map<String, Object> getFinancialStats(String period) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = switch (period) {
            case "day" -> LocalDate.now().atStartOfDay();
            case "week" -> LocalDate.now().minusWeeks(1).atStartOfDay();
            case "month" -> LocalDate.now().minusMonths(1).atStartOfDay();
            case "year" -> LocalDate.now().minusYears(1).atStartOfDay();
            default -> LocalDate.now().minusMonths(1).atStartOfDay();
        };

        BigDecimal totalRevenue = transactionRepository.sumAmountByTypeAndStatusAndDateRange("INCOME", "Completed",
                startDate, endDate);
        BigDecimal totalExpenses = transactionRepository.sumAmountByTypeAndStatusAndDateRange("EXPENSE", "Completed",
                startDate, endDate);
        BigDecimal pendingDues = transactionRepository.sumAmountByStatusAndDateRange("Pending", startDate, endDate);

        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        double profitMargin = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalExpenses", totalExpenses);
        stats.put("netProfit", netProfit);
        stats.put("profitMargin", Math.round(profitMargin));
        stats.put("pendingPayments", pendingDues);

        stats.put("revenueChange", 0);
        stats.put("expensesChange", 0);

        return stats;
    }

    public List<Object[]> getRevenueBreakdown(String period) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = LocalDate.now().minusMonths(1).atStartOfDay();
        return transactionRepository.getRevenueByCategory(startDate, endDate);
    }

    public List<Object[]> getExpenseBreakdown(String period) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = LocalDate.now().minusMonths(1).atStartOfDay();
        return transactionRepository.getExpenseByCategory(startDate, endDate);
    }

    public List<Map<String, Object>> getChartData(String period) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = switch (period) {
            case "day" -> LocalDate.now().atStartOfDay();
            case "week" -> LocalDate.now().minusWeeks(1).atStartOfDay();
            case "month" -> LocalDate.now().minusMonths(1).atStartOfDay();
            case "year" -> LocalDate.now().minusYears(1).atStartOfDay();
            default -> LocalDate.now().minusMonths(1).atStartOfDay();
        };

        List<Transaction> transactions = transactionRepository.findByDateRange(startDate, endDate);

        Map<String, Map<String, BigDecimal>> grouped = new java.util.TreeMap<>();

        for (Transaction t : transactions) {
            if (!"Completed".equals(t.getStatus()))
                continue;

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
}
