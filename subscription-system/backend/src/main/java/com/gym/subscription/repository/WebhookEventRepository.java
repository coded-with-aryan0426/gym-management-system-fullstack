package com.gym.subscription.repository;

import com.gym.subscription.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, String> {

    Optional<WebhookEvent> findByGatewayAndEventId(String gateway, String eventId);

    boolean existsByGatewayAndEventId(String gateway, String eventId);
}
