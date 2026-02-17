package com.gym.management.repository;

import com.gym.management.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Page<Invoice> findByGymId(Long gymId, Pageable pageable);
    
    List<Invoice> findByGymIdAndMemberId(Long gymId, Long memberId);
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    List<Invoice> findByGymIdAndStatus(Long gymId, String status);
    
    List<Invoice> findByGymIdAndPaymentStatus(Long gymId, String paymentStatus);
    
    @Query("SELECT i FROM Invoice i WHERE i.gymId = :gymId AND i.dueDate < :date AND i.paymentStatus != 'PAID' AND i.status != 'CANCELLED'")
    List<Invoice> findOverdueInvoices(@Param("gymId") Long gymId, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.gymId = :gymId AND i.status = :status")
    long countByGymIdAndStatus(@Param("gymId") Long gymId, @Param("status") String status);
    
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.gymId = :gymId AND i.paymentStatus = 'PAID' AND i.invoiceDate BETWEEN :startDate AND :endDate")
    BigDecimal sumPaidAmountByDateRange(@Param("gymId") Long gymId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(i.balanceDue), 0) FROM Invoice i WHERE i.gymId = :gymId AND i.paymentStatus != 'PAID' AND i.status != 'CANCELLED'")
    BigDecimal sumOutstandingAmount(@Param("gymId") Long gymId);
    
    @Query("SELECT i FROM Invoice i WHERE i.gymId = :gymId AND i.dueDate = :date AND i.paymentStatus != 'PAID' AND i.status != 'CANCELLED'")
    List<Invoice> findDueTodayInvoices(@Param("gymId") Long gymId, @Param("date") LocalDate date);
    
    @Query("SELECT MAX(CAST(SUBSTRING(i.invoiceNumber, LENGTH(:prefix) + 1) AS integer)) FROM Invoice i WHERE i.gymId = :gymId AND i.invoiceNumber LIKE :prefix%")
    Integer findMaxInvoiceNumber(@Param("gymId") Long gymId, @Param("prefix") String prefix);
}
