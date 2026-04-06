package com.gym.subscription.repository;

import com.gym.subscription.entity.SubscriptionChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SubscriptionChangeRepository extends JpaRepository<SubscriptionChange, String> {

    List<SubscriptionChange> findByUserIdOrderByCreatedAtDesc(String userId);

    List<SubscriptionChange> findBySubscriptionIdOrderByCreatedAtDesc(String subscriptionId);

    @Query("SELECT c FROM SubscriptionChange c WHERE c.changeType = :changeType AND c.createdAt BETWEEN :start AND :end ORDER BY c.createdAt DESC")
    List<SubscriptionChange> findByChangeTypeAndCreatedAtBetween(
            @Param("changeType") String changeType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT c FROM SubscriptionChange c WHERE c.user.id = :userId AND c.changeType = :changeType ORDER BY c.createdAt DESC")
    List<SubscriptionChange> findByUserIdAndChangeType(@Param("userId") String userId, @Param("changeType") String changeType);
}
