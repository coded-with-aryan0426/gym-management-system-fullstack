package com.gym.management.controller;

import com.gym.management.model.Transaction;
import com.gym.management.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // In production configure properly
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview(@RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(financeService.getFinancialStats(period));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<Transaction>> getTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(financeService.getTransactions(
                status, category, search,
                PageRequest.of(page, size, Sort.by("dateTime").descending())));
    }

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(financeService.createTransaction(transaction));
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction) {
        return ResponseEntity.ok(financeService.updateTransaction(id, transaction));
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        financeService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/breakdown")
    public ResponseEntity<Map<String, List<Object[]>>> getBreakdown(
            @RequestParam(defaultValue = "month") String period) {
        Map<String, List<Object[]>> breakdown = new HashMap<>();
        breakdown.put("revenue", financeService.getRevenueBreakdown(period));
        breakdown.put("expenses", financeService.getExpenseBreakdown(period));
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/chart")
    public ResponseEntity<List<Map<String, Object>>> getChartData(@RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(financeService.getChartData(period));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Transaction>> getPendingTransactions(
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(financeService.getPendingTransactions(period));
    }

    @GetMapping("/category-stats")
    public ResponseEntity<List<Map<String, Object>>> getCategoryStats(
            @RequestParam(defaultValue = "INCOME") String type,
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(financeService.getCategoryStats(type, period));
    }

    @GetMapping("/daily-trend")
    public ResponseEntity<List<Map<String, Object>>> getDailyTrend(
            @RequestParam(defaultValue = "month") String period) {
        return ResponseEntity.ok(financeService.getDailyTrend(period));
    }

    @GetMapping("/top-transactions")
    public ResponseEntity<List<Transaction>> getTopTransactions(
            @RequestParam(defaultValue = "INCOME") String type,
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(financeService.getTopTransactions(type, period, limit));
    }
}
