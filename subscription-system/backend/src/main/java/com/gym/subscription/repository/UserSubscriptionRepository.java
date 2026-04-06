package com.gym.subscription.repository;

import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, String> {

    Optional<UserSubscription> findByUserIdAndStatusIn(String userId, List<SubscriptionStatus> statuses);

    Optional<UserSubscription> findTopByUserIdOrderByCreatedAtDesc(String userId);

    Optional<UserSubscription> findByUserIdAndStatus(String userId, SubscriptionStatus status);

    List<UserSubscription> findByStatus(SubscriptionStatus status);

    @Query("SELECT s FROM UserSubscription s WHERE s.status = :status AND s.currentPeriodEnd < :now")
    List<UserSubscription> findExpiredSubscriptions(@Param("status") SubscriptionStatus status, @Param("now") LocalDateTime now);

    @Query("SELECT s FROM UserSubscription s WHERE s.status = 'active' AND s.gracePeriodEnd IS NOT NULL AND s.gracePeriodEnd < :now")
    List<UserSubscription> findSubscriptionsPastGracePeriod(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM UserSubscription s WHERE s.status = 'active' AND s.cancelAtPeriodEnd = true AND s.currentPeriodEnd BETWEEN :start AND :end")
    List<UserSubscription> findSubscriptionsExpiringBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM UserSubscription s WHERE s.plan.id = :planId AND s.status IN :statuses")
    long countByPlanIdAndStatusIn(@Param("planId") String planId, @Param("statuses") List<SubscriptionStatus> statuses);

    @Query("SELECT s FROM UserSubscription s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<UserSubscription> findAllByUserId(@Param("userId") String userId);

    Optional<UserSubscription> findByGatewaySubscriptionIdAndStatusIn(String gatewaySubscriptionId, List<SubscriptionStatus> statuses);

    Optional<UserSubscription> findByGatewaySubscriptionId(String gatewaySubscriptionId);

    boolean existsByUserIdAndStatusIn(String userId, List<SubscriptionStatus> statuses);
}
