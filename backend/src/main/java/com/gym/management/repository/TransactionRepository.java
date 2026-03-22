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

        // Get sum of ALL expenses (any status) in date range
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal sumAmountByTypeAndDateRange(
                        @Param("type") String type,
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

        // Get expense breakdown by category (all statuses - expenses are liabilities
        // regardless)
        @Query("SELECT t.category as category, SUM(t.amount) as total FROM Transaction t " +
                        "WHERE t.type = 'EXPENSE' AND t.dateTime BETWEEN :startDate AND :endDate " +
                        "GROUP BY t.category")
        List<Object[]> getExpenseByCategory(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Find transactions by user ID
        List<Transaction> findByUserIdOrderByDateTimeDesc(Long userId);

        List<Transaction> findTop10ByOrderByDateTimeDesc();

        // Pending transactions
        @Query("SELECT t FROM Transaction t WHERE t.status = 'Pending' AND t.dateTime BETWEEN :startDate AND :endDate ORDER BY t.amount DESC")
        List<Transaction> findPendingTransactions(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Count pending
        @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'Pending' AND t.dateTime BETWEEN :startDate AND :endDate")
        Long countPendingTransactions(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Category-wise transaction count
        @Query("SELECT t.category, COUNT(t), SUM(t.amount) FROM Transaction t WHERE t.type = :type AND t.dateTime BETWEEN :startDate AND :endDate GROUP BY t.category ORDER BY SUM(t.amount) DESC")
        List<Object[]> getCategoryStats(
                        @Param("type") String type,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Daily totals for trend — income = Completed only, expenses = all statuses
        // Using JPQL instead of native SQL for cross-database compatibility (no TRUNC)
        @Query("SELECT FUNCTION('DATE', t.dateTime) AS dt, t.type, SUM(t.amount) AS total " +
                        "FROM Transaction t WHERE ((t.type = 'INCOME' AND t.status = 'Completed') OR t.type = 'EXPENSE') "
                        +
                        "AND t.dateTime BETWEEN :startDate AND :endDate " +
                        "GROUP BY FUNCTION('DATE', t.dateTime), t.type " +
                        "ORDER BY FUNCTION('DATE', t.dateTime)")
        List<Object[]> getDailyTotals(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // LEGACY METHODS (Preserved to prevent compilation errors in legacy code)
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'INCOME' AND t.status = 'Completed' AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal getTotalRevenue(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'INCOME' AND t.status = 'Completed' AND t.dateTime >= :startOfDay")
        BigDecimal getTodayRevenue(@Param("startOfDay") LocalDateTime startOfDay);

        // NEW METHODS FOR DASHBOARD ANALYTICS

        // Get revenue for specific date range
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'INCOME' AND t.status = 'Completed' AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal getRevenueForDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // Get revenue by category for date range
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.category = :category AND t.type = 'INCOME' AND t.status = 'Completed' AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal getRevenueByCategoryAndDateRange(
                        @Param("category") String category,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT t.gymId, COALESCE(SUM(t.amount), 0) " +
                        "FROM Transaction t " +
                        "WHERE t.gymId IS NOT NULL " +
                        "AND t.type = 'INCOME' " +
                        "AND t.status = 'Completed' " +
                        "AND t.dateTime BETWEEN :startDate AND :endDate " +
                        "GROUP BY t.gymId " +
                        "ORDER BY COALESCE(SUM(t.amount), 0) DESC")
        List<Object[]> findTopGymsByRevenue(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
                        "WHERE t.gymId = :gymId " +
                        "AND t.type = :type " +
                        "AND t.status = :status " +
                        "AND t.dateTime BETWEEN :startDate AND :endDate")
        BigDecimal sumAmountByGymIdAndTypeAndStatusAndDateRange(
                        @Param("gymId") Long gymId,
                        @Param("type") String type,
                        @Param("status") String status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        List<Transaction> findTop10ByGymIdOrderByDateTimeDesc(Long gymId);
}
