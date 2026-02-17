package com.gym.management.service;

import com.gym.management.model.Transaction;
import com.gym.management.model.User;
import com.gym.management.repository.TransactionRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Transaction createTransaction(Long userId, BigDecimal amount, String category, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(amount);
        transaction.setCategory(category); // frontend "type" maps to "category"
        transaction.setDescription(description);
        transaction.setDateTime(LocalDateTime.now());
        transaction.setStatus("Completed"); // Auto-complete for now

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
