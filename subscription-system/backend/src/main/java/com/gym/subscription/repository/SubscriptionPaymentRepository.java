package com.gym.subscription.repository;

import com.gym.subscription.entity.SubscriptionPayment;
import com.gym.subscription.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, String> {

    List<SubscriptionPayment> findByUserIdOrderByCreatedAtDesc(String userId);

    List<SubscriptionPayment> findBySubscriptionIdOrderByCreatedAtDesc(String subscriptionId);

    Optional<SubscriptionPayment> findByGatewayPaymentIdAndGateway(String gatewayPaymentId, String gateway);

    List<SubscriptionPayment> findByStatus(PaymentStatus status);

    @Query("SELECT p FROM SubscriptionPayment p WHERE p.user.id = :userId AND p.status = :status ORDER BY p.createdAt DESC")
    List<SubscriptionPayment> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") PaymentStatus status);

    @Query("SELECT SUM(p.amount) FROM SubscriptionPayment p WHERE p.status = 'captured' AND p.createdAt BETWEEN :start AND :end")
    BigDecimal sumCapturedAmountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(p) FROM SubscriptionPayment p WHERE p.status = :status AND p.createdAt BETWEEN :start AND :end")
    long countByStatusAndCreatedAtBetween(@Param("status") PaymentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT p FROM SubscriptionPayment p WHERE p.gateway = :gateway AND p.createdAt BETWEEN :start AND :end ORDER BY p.createdAt DESC")
    List<SubscriptionPayment> findByGatewayAndCreatedAtBetween(@Param("gateway") String gateway, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
