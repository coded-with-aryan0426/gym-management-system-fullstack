package com.gym.management.controller;

import com.gym.management.model.Transaction;
import com.gym.management.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Map<String, Object> payload) {
        Long userId = ((Number) payload.get("userId")).longValue();
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String type = (String) payload.get("type"); // Maps to category
        String description = (String) payload.get("description");

        Transaction transaction = transactionService.createTransaction(userId, amount, type, description);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }
}
