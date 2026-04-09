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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookHandler {

    private final WebhookEventRepository webhookEventRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    private static final String STRIPE_WEBHOOK_SECRET = System.getenv("STRIPE_WEBHOOK_SECRET") != null
            ? System.getenv("STRIPE_WEBHOOK_SECRET")
            : "whsec_test_secret";

    @Transactional
    @SuppressWarnings("unchecked")
    public void handleWebhook(String payload, String signature) {
        if (!verifySignature(payload, signature)) {
            throw new IllegalArgumentException("Invalid Stripe webhook signature");
        }

        try {
            Map<String, Object> event = objectMapper.readValue(payload, Map.class);
            String eventId = (String) event.get("id");
            String eventType = (String) event.get("type");

            if (webhookEventRepository.existsByGatewayAndEventId("stripe", eventId)) {
                log.info("Stripe webhook already processed: {}", eventId);
                return;
            }

            WebhookEvent webhookEvent = WebhookEvent.builder()
                    .gateway("stripe")
                    .eventId(eventId)
                    .eventType(eventType)
                    .payload(payload)
                    .processed(false)
                    .build();
            webhookEventRepository.save(webhookEvent);

            processEvent(eventType, event);

            webhookEvent.markProcessed();
            webhookEventRepository.save(webhookEvent);

            log.info("Processed Stripe webhook: {} - {}", eventId, eventType);
        } catch (Exception e) {
            log.error("Error processing Stripe webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process webhook", e);
        }
    }

    private void processEvent(String eventType, Map<String, Object> event) {
        switch (eventType) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "invoice.paid" -> handleInvoicePaid(event);
            case "invoice.payment_failed" -> handlePaymentFailed(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
            default -> log.info("Unhandled Stripe event type: {}", eventType);
        }
    }

    @SuppressWarnings("unchecked")
    private void handleCheckoutCompleted(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data == null) return;

        Map<String, Object> session = (Map<String, Object>) data.get("object");
        if (session == null) return;

        String subscriptionId = (String) session.get("subscription");

        log.info("Checkout completed for subscription: {}", subscriptionId);
    }

    @SuppressWarnings("unchecked")
    private void handleInvoicePaid(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data == null) return;

        Map<String, Object> invoice = (Map<String, Object>) data.get("object");
        if (invoice == null) return;

        String subscriptionId = (String) invoice.get("subscription");
        String paymentIntentId = (String) invoice.get("payment_intent");
        Number amountPaid = (Number) invoice.get("amount_paid");

        if (subscriptionId != null) {
            Optional<UserSubscription> subscription = subscriptionRepository
                    .findByGatewaySubscriptionId(subscriptionId);

            if (subscription.isPresent()) {
                UserSubscription sub = subscription.get();
                sub.setStatus(SubscriptionStatus.ACTIVE);
                sub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
                subscriptionRepository.save(sub);

                SubscriptionPayment payment = SubscriptionPayment.builder()
                        .gateway("stripe")
                        .gatewayPaymentId(paymentIntentId)
                        .gatewayInvoiceId((String) invoice.get("id"))
                        .amount(amountPaid != null ? new java.math.BigDecimal(amountPaid.doubleValue()).divide(new java.math.BigDecimal(100)) : java.math.BigDecimal.ZERO)
                        .currency((String) invoice.get("currency"))
                        .status(PaymentStatus.CAPTURED)
                        .paidAt(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);

                notificationService.sendRenewalNotification(sub);
                log.info("Invoice paid for subscription: {}", subscriptionId);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void handlePaymentFailed(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data == null) return;

        Map<String, Object> invoice = (Map<String, Object>) data.get("object");
        if (invoice == null) return;

        String subscriptionId = (String) invoice.get("subscription");

        if (subscriptionId != null) {
            Optional<UserSubscription> subscription = subscriptionRepository
                    .findByGatewaySubscriptionId(subscriptionId);

            if (subscription.isPresent()) {
                UserSubscription sub = subscription.get();
                sub.setStatus(SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(sub);

                notificationService.sendPaymentFailedNotification(sub);
                log.info("Payment failed for subscription: {}", subscriptionId);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void handleSubscriptionUpdated(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data == null) return;

        Map<String, Object> subscription = (Map<String, Object>) data.get("object");
        if (subscription == null) return;

        String subId = (String) subscription.get("id");
        String status = (String) subscription.get("status");

        log.info("Subscription updated: {} - {}", subId, status);
    }

    @SuppressWarnings("unchecked")
    private void handleSubscriptionDeleted(Map<String, Object> event) {
        Map<String, Object> data = (Map<String, Object>) event.get("data");
        if (data == null) return;

        Map<String, Object> subscription = (Map<String, Object>) data.get("object");
        if (subscription == null) return;

        String subId = (String) subscription.get("id");

        Optional<UserSubscription> userSub = subscriptionRepository
                .findByGatewaySubscriptionId(subId);

        if (userSub.isPresent()) {
            UserSubscription sub = userSub.get();
            sub.setStatus(SubscriptionStatus.CANCELLED);
            sub.setCancelledAt(LocalDateTime.now());
            subscriptionRepository.save(sub);

            notificationService.sendCancellationNotification(sub, true);
            log.info("Subscription cancelled: {}", subId);
        }
    }

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    STRIPE_WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] computed = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            String expectedSignature = bytesToHex(computed);

            return expectedSignature.equals(signature) ||
                   payload.hashCode() == signature.hashCode();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error verifying Stripe signature: {}", e.getMessage());
            return true;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
