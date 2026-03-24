package com.gym.management.controller;

import com.gym.management.model.Transaction;
import com.gym.management.service.TransactionService;
import com.gym.management.security.DataScopeValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TransactionController with RBAC enforcement.
 * - ADMIN/OWNER: Full access to all transactions
 * - TRAINER: Can create transactions for assigned members, view only their related transactions
 * - MEMBER: Can only view their own transactions
 */
@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class TransactionController {

    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private DataScopeValidator dataScopeValidator;

    /**
     * Create a new transaction with strict RBAC validation.
     * - ADMIN/OWNER: Can create transactions for any user
     * - TRAINER: Can only create transactions for their assigned members
     * - MEMBER: Cannot create transactions (prevented by @PreAuthorize)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> payload) {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated transaction creation attempt");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }

            // Validate payload
            if (!payload.containsKey("userId") || !payload.containsKey("amount") || 
                !payload.containsKey("type") || !payload.containsKey("description")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Missing required fields: userId, amount, type, description"));
            }

            Long userId = ((Number) payload.get("userId")).longValue();
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());
            String type = (String) payload.get("type");
            String description = (String) payload.get("description");

            dataScopeValidator.logDataAccess("transaction", userId, "CREATE");

            // RBAC: TRAINER can only create transactions for assigned members
            if (dataScopeValidator.isTrainer()) {
                if (!dataScopeValidator.canTrainerAccessMember(currentUserId, userId)) {
                    log.warn("RBAC VIOLATION: Trainer {} attempted to create transaction for unassigned user {}", 
                             currentUserId, userId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied: You can only create transactions for your assigned members"));
                }
                log.info("Trainer {} creating transaction for assigned user {}", currentUserId, userId);
            }

            // RBAC: Prevent unauthorized transaction creation
            if (dataScopeValidator.isMember() && !userId.equals(currentUserId)) {
                log.warn("RBAC VIOLATION: Member {} attempted to create transaction for user {}", 
                         currentUserId, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: You can only create transactions for yourself"));
            }

            Transaction transaction = transactionService.createTransaction(userId, amount, type, description);
            return ResponseEntity.ok(transaction);
            
        } catch (NumberFormatException e) {
            log.error("Invalid number format in transaction creation", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid amount format"));
        } catch (Exception e) {
            log.error("Failed to create transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create transaction"));
        }
    }

    /**
     * Get all transactions with data scoping based on user role.
     * - ADMIN/OWNER: See all transactions
     * - TRAINER: See only transactions related to their assigned members (filtered)
     * - MEMBER: See only their own transactions
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<?> getAllTransactions() {
        try {
            Long currentUserId = dataScopeValidator.getCurrentUserId();
            if (currentUserId == null) {
                log.warn("Unauthenticated transaction retrieval attempt");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }

            dataScopeValidator.logDataAccess("transactions", null, "READ_ALL");

            List<Transaction> transactions = transactionService.getAllTransactions();

            // RBAC: Apply data scoping based on role
            if (dataScopeValidator.isMember()) {
                // MEMBER: Filter to only their own transactions
                transactions = transactions.stream()
                        .filter(t -> t.getUserId() != null && t.getUserId().equals(currentUserId))
                        .collect(Collectors.toList());
                log.debug("Filtered {} transactions for member {}", transactions.size(), currentUserId);
            } 
            else if (dataScopeValidator.isTrainer()) {
                // TRAINER: Filter to transactions related to their assigned members
                transactions = transactions.stream()
                        .filter(t -> t.getUserId() != null && dataScopeValidator.canTrainerAccessMember(currentUserId, t.getUserId()))
                        .collect(Collectors.toList());
                log.debug("Filtered {} transactions for trainer {}", transactions.size(), currentUserId);
            }
            // ADMIN/OWNER: Return all transactions (no filter)

            return ResponseEntity.ok(transactions);
            
        } catch (Exception e) {
            log.error("Failed to retrieve transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve transactions"));
        }
    }
}
