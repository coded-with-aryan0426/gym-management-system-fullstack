package com.gym.subscription.repository;

import com.gym.subscription.entity.SubscriptionNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionNotificationRepository extends JpaRepository<SubscriptionNotification, String> {

    List<SubscriptionNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<SubscriptionNotification> findBySubscriptionIdOrderByCreatedAtDesc(String subscriptionId);

    List<SubscriptionNotification> findByNotificationTypeAndUserId(String notificationType, String userId);

    boolean existsByNotificationTypeAndUserIdAndSubscriptionIdAndCreatedAtAfter(
            String notificationType, String userId, String subscriptionId, java.time.LocalDateTime after);
}
