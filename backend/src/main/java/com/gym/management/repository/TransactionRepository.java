package com.gym.management.repository;

import com.gym.management.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find transactions by category
    List<Transaction> findByCategoryOrderByDateTimeDesc(String category);

    // Find transactions by status
    List<Transaction> findByStatusOrderByDateTimeDesc(String status);

    // Find transactions within date range
    @Query("SELECT t FROM Transaction t WHERE t.dateTime BETWEEN :startDate AND :endDate ORDER BY t.dateTime DESC")
    List<Transaction> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Get total revenue for date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.category = 'Membership' AND t.status = 'Completed' AND t.dateTime BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Get today's revenue
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'Completed' AND t.dateTime >= :startOfDay")
    BigDecimal getTodayRevenue(@Param("startOfDay") LocalDateTime startOfDay);

    // Get recent transactions
    List<Transaction> findTop10ByOrderByDateTimeDesc();
}
