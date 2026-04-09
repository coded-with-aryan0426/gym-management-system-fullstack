package com.gym.subscription.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.subscription.entity.WebhookEvent;
import com.gym.subscription.repository.WebhookEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaddleWebhookHandler {

    private final WebhookEventRepository webhookEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    @SuppressWarnings("unchecked")
    public void handleWebhook(String payload) {
        try {
            Map<String, Object> event = objectMapper.readValue(payload, Map.class);
            Map<String, Object> alertName = (Map<String, Object>) event.get("alert_name");

            String eventType = alertName != null ? (String) alertName.get("type") : (String) event.get("event_type");
            String eventId = (String) event.get("id");

            if (eventId == null) {
                eventId = String.valueOf(event.hashCode());
            }

            if (webhookEventRepository.existsByGatewayAndEventId("paddle", eventId)) {
                log.info("Paddle webhook already processed: {}", eventId);
                return;
            }

            WebhookEvent webhookEvent = WebhookEvent.builder()
                    .gateway("paddle")
                    .eventId(eventId)
                    .eventType(eventType)
                    .payload(payload)
                    .processed(false)
                    .build();
            webhookEventRepository.save(webhookEvent);

            processEvent(eventType, event);

            webhookEvent.markProcessed();
            webhookEventRepository.save(webhookEvent);

            log.info("Processed Paddle webhook: {} - {}", eventId, eventType);
        } catch (Exception e) {
            log.error("Error processing Paddle webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process webhook", e);
        }
    }

    private void processEvent(String eventType, Map<String, Object> event) {
        if (eventType == null) return;

        switch (eventType.toLowerCase()) {
            case "subscription.created" -> handleSubscriptionCreated(event);
            case "subscription.paid" -> handleSubscriptionPaid(event);
            case "subscription.cancelled" -> handleSubscriptionCancelled(event);
            case "subscription.payment_failed" -> handlePaymentFailed(event);
            default -> log.info("Unhandled Paddle event type: {}", eventType);
        }
    }

    private void handleSubscriptionCreated(Map<String, Object> event) {
        log.info("Paddle subscription created");
    }

    private void handleSubscriptionPaid(Map<String, Object> event) {
        log.info("Paddle subscription paid");
    }

    private void handleSubscriptionCancelled(Map<String, Object> event) {
        log.info("Paddle subscription cancelled");
    }

    private void handlePaymentFailed(Map<String, Object> event) {
        log.info("Paddle payment failed");
    }
}
