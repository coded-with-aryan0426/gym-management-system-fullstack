package com.gym.management.controller;

import com.gym.management.dto.FinancialDataDTO;
import com.gym.management.security.DataScopeValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Example controller demonstrating proper RBAC with data-level scoping.
 * 
 * Key principles:
 * 1. Always use @PreAuthorize for method-level authorization
 * 2. Use DataScopeValidator to enforce data-level access control
 * 3. Return DTOs, never entities
 * 4. TRAINER can only access their own data
 * 5. ADMIN/OWNER can access all data
 */
@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class FinanceControllerExample {

    private static final Logger log = LoggerFactory.getLogger(FinanceControllerExample.class);

    @Autowired
    private DataScopeValidator dataScopeValidator;

    /**
     * Get financial data with proper RBAC and data scoping.
     * 
     * TRAINER: Gets only their own revenue data
     * ADMIN/OWNER: Gets global financial reports
     */
    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getFinancialReports(@RequestParam(required = false) Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            // Log data access attempt
            dataScopeValidator.logDataAccess("financial_report", trainerId, "READ");

            // ROLE-BASED DATA SCOPING
            if (dataScopeValidator.isTrainer()) {
                // TRAINER can ONLY access their own data
                if (trainerId != null && !trainerId.equals(currentUserId)) {
                    log.warn("RBAC VIOLATION: Trainer {} attempted to access trainer {} data", 
                             currentUserId, trainerId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied: You can only view your own financial data"));
                }
                
                // Return TRAINER-SCOPED data only
                FinancialDataDTO trainerData = getTrainerFinancialData(currentUserId);
                return ResponseEntity.ok(trainerData);
            }

            // ADMIN/OWNER can access global data OR specific trainer data
            if (dataScopeValidator.isAdminOrOwner()) {
                if (trainerId != null) {
                    // Return specific trainer's data
                    FinancialDataDTO trainerData = getTrainerFinancialData(trainerId);
                    return ResponseEntity.ok(trainerData);
                } else {
                    // Return global financial report
                    FinancialDataDTO globalData = getGlobalFinancialData();
                    return ResponseEntity.ok(globalData);
                }
            }

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Insufficient permissions"));

        } catch (Exception e) {
            log.error("Failed to retrieve financial reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve financial data"));
        }
    }

    /**
     * Get trainer's own revenue data (limited scope)
     */
    private FinancialDataDTO getTrainerFinancialData(Long trainerId) {
        // Query database for THIS trainer's data only
        // Example: SELECT SUM(revenue) WHERE trainer_id = ?
        
        BigDecimal revenue = BigDecimal.valueOf(15000); // Mock data
        BigDecimal commission = BigDecimal.valueOf(3000); // Mock data
        Integer sessions = 45; // Mock data
        
        return FinancialDataDTO.createTrainerScoped(trainerId, revenue, commission, sessions);
    }

    /**
     * Get global financial data (ADMIN/OWNER only)
     */
    private FinancialDataDTO getGlobalFinancialData() {
        // Query database for ALL financial data
        // Example: SELECT SUM(revenue), SUM(expenses) FROM transactions
        
        BigDecimal totalRevenue = BigDecimal.valueOf(500000); // Mock data
        BigDecimal totalExpenses = BigDecimal.valueOf(300000); // Mock data
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        
        return FinancialDataDTO.createGlobalScoped(totalRevenue, totalExpenses, netProfit);
    }

    /**
     * Example: Get trainer's assigned members (with data scoping)
     */
    @GetMapping("/trainer/{trainerId}/members")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> getTrainerMembers(@PathVariable Long trainerId) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            
            // Validate data access
            if (!dataScopeValidator.canTrainerAccessData(trainerId, currentUserId)) {
                log.warn("RBAC VIOLATION: User {} attempted to access trainer {} members", 
                         currentUserId, trainerId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: You can only view your own assigned members"));
            }

            // Query ONLY members assigned to THIS trainer
            // Example: SELECT * FROM users WHERE assigned_trainer_id = ?
            
            Map<String, Object> response = new HashMap<>();
            response.put("trainerId", trainerId);
            response.put("members", java.util.List.of()); // Mock empty list
            response.put("dataScope", "TRAINER_SCOPED");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to retrieve trainer members", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve members"));
        }
    }
}
