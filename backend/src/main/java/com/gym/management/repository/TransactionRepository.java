package com.gym.management.repository;

import com.gym.management.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

        // Find transactions within date range
        @Query("SELECT t FROM Transaction t WHERE t.dateTime BETWEEN :startDate AND :endDate ORDER BY t.dateTime DESC")
        List<Transaction> findByDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Get sum of amount by Type and Status in date range
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.status = :status AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal sumAmountByTypeAndStatusAndDateRange(
                        @Param("type") String type,
                        @Param("status") String status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Get sum of amount by Status (e.g. Pending)
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = :status AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal sumAmountByStatusAndDateRange(
                        @Param("status") String status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Get transactions pageable with filter
        @Query("SELECT t FROM Transaction t WHERE " +
                        "(:status IS NULL OR t.status = :status) AND " +
                        "(:category IS NULL OR t.category = :category) AND " +
                        "(:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<Transaction> findAllWithFilters(
                        @Param("status") String status,
                        @Param("category") String category,
                        @Param("search") String search,
                        Pageable pageable);

        // Get revenue breakdown by category
        @Query("SELECT t.category as category, SUM(t.amount) as total FROM Transaction t " +
                        "WHERE t.type = 'INCOME' AND t.status = 'Completed' AND t.dateTime BETWEEN :startDate AND :endDate "
                        +
                        "GROUP BY t.category")
        List<Object[]> getRevenueByCategory(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Get expense breakdown by category
        @Query("SELECT t.category as category, SUM(t.amount) as total FROM Transaction t " +
                        "WHERE t.type = 'EXPENSE' AND t.status = 'Completed' AND t.dateTime BETWEEN :startDate AND :endDate "
                        +
                        "GROUP BY t.category")
        List<Object[]> getExpenseByCategory(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        List<Transaction> findTop10ByOrderByDateTimeDesc();

        // LEGACY METHODS (Preserved to prevent compilation errors in legacy code)
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'INCOME' AND t.status = 'Completed' AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal getTotalRevenue(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'INCOME' AND t.status = 'Completed' AND t.dateTime >= :startOfDay")
        BigDecimal getTodayRevenue(@Param("startOfDay") LocalDateTime startOfDay);
}
