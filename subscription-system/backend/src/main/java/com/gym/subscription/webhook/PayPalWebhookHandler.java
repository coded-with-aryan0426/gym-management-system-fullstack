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
public class PayPalWebhookHandler {

    private final WebhookEventRepository webhookEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    @SuppressWarnings("unchecked")
    public void handleWebhook(String payload) {
        try {
            Map<String, Object> event = objectMapper.readValue(payload, Map.class);
            String eventId = (String) event.get("id");
            String eventType = (String) event.get("event_type");

            if (webhookEventRepository.existsByGatewayAndEventId("paypal", eventId)) {
                log.info("PayPal webhook already processed: {}", eventId);
                return;
            }

            WebhookEvent webhookEvent = WebhookEvent.builder()
                    .gateway("paypal")
                    .eventId(eventId)
                    .eventType(eventType)
                    .payload(payload)
                    .processed(false)
                    .build();
            webhookEventRepository.save(webhookEvent);

            processEvent(eventType, event);

            webhookEvent.markProcessed();
            webhookEventRepository.save(webhookEvent);

            log.info("Processed PayPal webhook: {} - {}", eventId, eventType);
        } catch (Exception e) {
            log.error("Error processing PayPal webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process webhook", e);
        }
    }

    private void processEvent(String eventType, Map<String, Object> event) {
        switch (eventType) {
            case "BILLING.SUBSCRIPTION.CREATED" -> handleSubscriptionCreated(event);
            case "BILLING.SUBSCRIPTION.ACTIVATED" -> handleSubscriptionActivated(event);
            case "PAYMENT.SALE.COMPLETED" -> handlePaymentCompleted(event);
            case "BILLING.SUBSCRIPTION.CANCELLED" -> handleSubscriptionCancelled(event);
            case "PAYMENT.SALE.DENIED" -> handlePaymentDenied(event);
            default -> log.info("Unhandled PayPal event type: {}", eventType);
        }
    }

    private void handleSubscriptionCreated(Map<String, Object> event) {
        log.info("PayPal subscription created: {}", event.get("id"));
    }

    private void handleSubscriptionActivated(Map<String, Object> event) {
        log.info("PayPal subscription activated: {}", event.get("id"));
    }

    private void handlePaymentCompleted(Map<String, Object> event) {
        log.info("PayPal payment completed");
    }

    private void handleSubscriptionCancelled(Map<String, Object> event) {
        log.info("PayPal subscription cancelled");
    }

    private void handlePaymentDenied(Map<String, Object> event) {
        log.info("PayPal payment denied");
    }
}
