package com.gym.management.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gym.management.model.FinancialTransaction;
import com.gym.management.model.FinancialTransaction.TransactionStatus;
import com.gym.management.model.FinancialTransaction.TransactionType;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {

    Page<FinancialTransaction> findByGymIdOrderByTransactionDateDesc(Long gymId, Pageable pageable);

    Page<FinancialTransaction> findByGymIdAndTypeOrderByTransactionDateDesc(
            Long gymId, String type, Pageable pageable);

    @Query("SELECT ft FROM FinancialTransaction ft WHERE ft.gymId = :gymId " +
           "AND ft.transactionDate BETWEEN :startDate AND :endDate " +
           "ORDER BY ft.transactionDate DESC")
    List<FinancialTransaction> findByGymIdAndDateRange(
            @Param("gymId") Long gymId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ft FROM FinancialTransaction ft WHERE ft.gymId = :gymId " +
           "AND ft.type = :type AND ft.transactionDate BETWEEN :startDate AND :endDate")
    List<FinancialTransaction> findByGymIdAndTypeAndDateRange(
            @Param("gymId") Long gymId,
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ft FROM FinancialTransaction ft WHERE ft.gymId = :gymId " +
           "AND ft.type = 'INCOME' AND ft.transactionDate BETWEEN :startDate AND :endDate")
    List<FinancialTransaction> findIncomeByGymIdAndDateRange(
            @Param("gymId") Long gymId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ft FROM FinancialTransaction ft WHERE ft.gymId = :gymId " +
           "AND ft.type = 'EXPENSE' AND ft.transactionDate BETWEEN :startDate AND :endDate")
    List<FinancialTransaction> findExpenseByGymIdAndDateRange(
            @Param("gymId") Long gymId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ft.category, SUM(ft.amount) FROM FinancialTransaction ft " +
           "WHERE ft.gymId = :gymId AND ft.type = :type " +
           "AND ft.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY ft.category")
    List<Object[]> sumAmountByCategoryAndType(
            @Param("gymId") Long gymId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(ft.amount) FROM FinancialTransaction ft " +
           "WHERE ft.gymId = :gymId AND ft.type = 'INCOME' " +
           "AND ft.transactionDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumIncomeByGymIdAndDateRange(
            @Param("gymId") Long gymId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(ft.amount) FROM FinancialTransaction ft " +
           "WHERE ft.gymId = :gymId AND ft.type = 'EXPENSE' " +
           "AND ft.transactionDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumExpenseByGymIdAndDateRange(
            @Param("gymId") Long gymId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<FinancialTransaction> findByMemberIdOrderByTransactionDateDesc(Long memberId);

    Page<FinancialTransaction> findByGymIdAndStatusOrderByTransactionDateDesc(
            Long gymId, TransactionStatus status, Pageable pageable);

    @Query("SELECT ft FROM FinancialTransaction ft WHERE ft.gymId = :gymId " +
           "AND ft.isRecurring = true AND ft.status = 'COMPLETED'")
    List<FinancialTransaction> findRecurringTransactions(@Param("gymId") Long gymId);
}
