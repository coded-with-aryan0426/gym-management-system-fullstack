package com.gym.management.controller;

import com.gym.management.model.Transaction;
import com.gym.management.service.FinanceService;
import com.gym.management.security.DataScopeValidator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class FinanceController {

    private static final Logger log = LoggerFactory.getLogger(FinanceController.class);
    
    private final FinanceService financeService;
    
    @Autowired
    private DataScopeValidator dataScopeValidator;

    /**
     * Get financial overview with RBAC data scoping.
     * TRAINER: Gets only their own revenue data
     * ADMIN/OWNER: Gets global financial overview
     */
    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<Map<String, Object>> getOverview(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            dataScopeValidator.logDataAccess("financial_overview", trainerId, "READ");

            // RBAC: TRAINER can only access their own data
            if (dataScopeValidator.isTrainer()) {
                if (trainerId != null && !trainerId.equals(currentUserId)) {
                    log.warn("RBAC VIOLATION: Trainer {} attempted to access trainer {} financial overview", 
                             currentUserId, trainerId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied: You can only view your own financial data"));
                }
                // Force trainerId to current user for TRAINER role
                trainerId = currentUserId;
            }

            return ResponseEntity.ok(financeService.getFinancialStats(period, trainerId));
        } catch (Exception e) {
            log.error("Failed to retrieve financial overview", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve financial overview"));
        }
    }

    /**
     * Get transactions with RBAC data scoping.
     * TRAINER: Gets only transactions related to their clients
     * ADMIN/OWNER: Gets all transactions
     */
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long trainerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            
            // RBAC: TRAINER can only access their own transactions
            if (dataScopeValidator.isTrainer()) {
                if (trainerId != null && !trainerId.equals(currentUserId)) {
                    log.warn("RBAC VIOLATION: Trainer {} attempted to access trainer {} transactions", 
                             currentUserId, trainerId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied: You can only view your own transactions"));
                }
                trainerId = currentUserId;
            }
            
            return ResponseEntity.ok(financeService.getTransactions(
                    status, category, search, trainerId,
                    PageRequest.of(page, size, Sort.by("dateTime").descending())));
        } catch (Exception e) {
            log.error("Failed to retrieve transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve transactions"));
        }
    }

    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction) {
        try {
            return ResponseEntity.ok(financeService.createTransaction(transaction));
        } catch (Exception e) {
            log.error("Failed to create transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create transaction"));
        }
    }

    @PutMapping("/transactions/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction) {
        try {
            return ResponseEntity.ok(financeService.updateTransaction(id, transaction));
        } catch (Exception e) {
            log.error("Failed to update transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update transaction"));
        }
    }

    @DeleteMapping("/transactions/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            financeService.deleteTransaction(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete transaction"));
        }
    }

    /**
     * Get revenue/expense breakdown with RBAC.
     * TRAINER: Gets only their revenue breakdown
     * ADMIN/OWNER: Gets global breakdown
     */
    @GetMapping("/breakdown")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getBreakdown(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            
            // RBAC: TRAINER can only access their own breakdown
            if (dataScopeValidator.isTrainer()) {
                if (trainerId != null && !trainerId.equals(currentUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied"));
                }
                trainerId = currentUserId;
            }
            
            Map<String, List<Object[]>> breakdown = new HashMap<>();
            breakdown.put("revenue", financeService.getRevenueBreakdown(period, trainerId));
            if (dataScopeValidator.isAdminOrOwner()) {
                breakdown.put("expenses", financeService.getExpenseBreakdown(period));
            }
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            log.error("Failed to retrieve breakdown", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve breakdown"));
        }
    }

    @GetMapping("/chart")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getChartData(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            
            if (dataScopeValidator.isTrainer()) {
                trainerId = currentUserId;
            }
            
            return ResponseEntity.ok(financeService.getChartData(period, trainerId));
        } catch (Exception e) {
            log.error("Failed to retrieve chart data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve chart data"));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> getPendingTransactions(
            @RequestParam(defaultValue = "month") String period) {
        try {
            return ResponseEntity.ok(financeService.getPendingTransactions(period));
        } catch (Exception e) {
            log.error("Failed to retrieve pending transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve pending transactions"));
        }
    }

    @GetMapping("/category-stats")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getCategoryStats(
            @RequestParam(defaultValue = "INCOME") String type,
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            
            if (dataScopeValidator.isTrainer()) {
                trainerId = currentUserId;
            }
            
            return ResponseEntity.ok(financeService.getCategoryStats(type, period, trainerId));
        } catch (Exception e) {
            log.error("Failed to retrieve category stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve category stats"));
        }
    }

    @GetMapping("/daily-trend")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getDailyTrend(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            
            if (dataScopeValidator.isTrainer()) {
                trainerId = currentUserId;
            }
            
            return ResponseEntity.ok(financeService.getDailyTrend(period, trainerId));
        } catch (Exception e) {
            log.error("Failed to retrieve daily trend", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve daily trend"));
        }
    }

    @GetMapping("/top-transactions")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getTopTransactions(
            @RequestParam(defaultValue = "INCOME") String type,
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            
            if (dataScopeValidator.isTrainer()) {
                trainerId = currentUserId;
            }
            
            return ResponseEntity.ok(financeService.getTopTransactions(type, period, limit, trainerId));
        } catch (Exception e) {
            log.error("Failed to retrieve top transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve top transactions"));
        }
    }
}
