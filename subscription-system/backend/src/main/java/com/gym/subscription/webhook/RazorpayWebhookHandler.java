package com.gym.subscription.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.subscription.entity.SubscriptionPayment;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.entity.WebhookEvent;
import com.gym.subscription.enums.PaymentStatus;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.repository.SubscriptionPaymentRepository;
import com.gym.subscription.repository.UserSubscriptionRepository;
import com.gym.subscription.repository.WebhookEventRepository;
import com.gym.subscription.service.NotificationService;
import com.gym.subscription.service.RazorpayPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayWebhookHandler {

    private final WebhookEventRepository webhookEventRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository paymentRepository;
    private final RazorpayPaymentService razorpayPaymentService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!razorpayPaymentService.verifyWebhookSignature(payload, signature)) {
            throw new IllegalArgumentException("Invalid Razorpay webhook signature");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(payload, Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> payloadObj = (Map<String, Object>) event.get("payload");
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentObj = (Map<String, Object>) payloadObj.get("payment");
            @SuppressWarnings("unchecked")
            Map<String, Object> entityObj = (Map<String, Object>) paymentObj.get("entity");
            String eventId = (String) entityObj.get("id");
            String eventType = (String) event.get("event");

            if (eventId == null) {
                eventId = String.valueOf(event.hashCode());
            }

            if (webhookEventRepository.existsByGatewayAndEventId("razorpay", eventId)) {
                log.info("Razorpay webhook already processed: {}", eventId);
                return;
            }

            WebhookEvent webhookEvent = WebhookEvent.builder()
                    .gateway("razorpay")
                    .eventId(eventId)
                    .eventType(eventType)
                    .payload(payload)
                    .processed(false)
                    .build();
            webhookEventRepository.save(webhookEvent);

            processEvent(eventType, event);

            webhookEvent.markProcessed();
            webhookEventRepository.save(webhookEvent);

            log.info("Processed Razorpay webhook: {} - {}", eventId, eventType);
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process webhook", e);
        }
    }

    @SuppressWarnings("unchecked")
    private void processEvent(String eventType, Map<String, Object> event) {
        switch (eventType) {
            case "payment.captured" -> handlePaymentCaptured(event);
            case "payment.failed" -> handlePaymentFailed(event);
            case "order.paid" -> handleOrderPaid(event);
            default -> log.info("Unhandled Razorpay event type: {}", eventType);
        }
    }

    @SuppressWarnings("unchecked")
    private void handlePaymentCaptured(Map<String, Object> event) {
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        Map<String, Object> paymentEntity = (Map<String, Object>) ((Map<String, Object>) payload.get("payment")).get("entity");

        String razorpayPaymentId = (String) paymentEntity.get("id");
        String razorpayOrderId = (String) paymentEntity.get("order_id");
        Number amount = (Number) paymentEntity.get("amount");
        String currency = (String) paymentEntity.get("currency");

        Optional<SubscriptionPayment> existingPayment = paymentRepository.findByGatewayPaymentIdAndGateway(
                razorpayPaymentId, "razorpay");

        if (existingPayment.isEmpty()) {
            Map<String, Object> notes = (Map<String, Object>) paymentEntity.get("notes");
            String userId = notes != null ? (String) notes.get("user_id") : null;

            if (userId != null) {
                SubscriptionPayment payment = SubscriptionPayment.builder()
                        .gateway("razorpay")
                        .gatewayPaymentId(razorpayPaymentId)
                        .gatewayInvoiceId(razorpayOrderId)
                        .amount(new java.math.BigDecimal(amount.doubleValue()).divide(new java.math.BigDecimal(100)))
                        .currency(currency != null ? currency : "INR")
                        .status(PaymentStatus.CAPTURED)
                        .paidAt(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);

                UserSubscription subscription = subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
                if (subscription != null) {
                    subscription.setStatus(SubscriptionStatus.ACTIVE);
                    subscription.setGateway("razorpay");
                    subscription.setGatewaySubscriptionId(razorpayOrderId);
                    subscriptionRepository.save(subscription);

                    notificationService.sendRenewalNotification(subscription);
                }
            }
        }

        log.info("Razorpay payment captured: {}", razorpayPaymentId);
    }

    @SuppressWarnings("unchecked")
    private void handlePaymentFailed(Map<String, Object> event) {
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        Map<String, Object> paymentEntity = (Map<String, Object>) ((Map<String, Object>) payload.get("payment")).get("entity");

        String razorpayPaymentId = (String) paymentEntity.get("id");
        String razorpayOrderId = (String) paymentEntity.get("order_id");
        String reason = (String) paymentEntity.get("error_description");

        Optional<SubscriptionPayment> existingPayment = paymentRepository.findByGatewayPaymentIdAndGateway(
                razorpayPaymentId, "razorpay");

        if (existingPayment.isPresent()) {
            SubscriptionPayment payment = existingPayment.get();
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        Map<String, Object> notes = (Map<String, Object>) paymentEntity.get("notes");
        String userId = notes != null ? (String) notes.get("user_id") : null;

        if (userId != null) {
            UserSubscription subscription = subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
            if (subscription != null) {
                subscription.setStatus(SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(subscription);

                notificationService.sendPaymentFailedNotification(subscription);
            }
        }

        log.info("Razorpay payment failed: {} - reason: {}", razorpayPaymentId, reason);
    }

    @SuppressWarnings("unchecked")
    private void handleOrderPaid(Map<String, Object> event) {
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        Map<String, Object> orderEntity = (Map<String, Object>) ((Map<String, Object>) payload.get("order")).get("entity");

        String razorpayOrderId = (String) orderEntity.get("id");
        String status = (String) orderEntity.get("status");

        log.info("Razorpay order paid: {} - status: {}", razorpayOrderId, status);
    }
}
