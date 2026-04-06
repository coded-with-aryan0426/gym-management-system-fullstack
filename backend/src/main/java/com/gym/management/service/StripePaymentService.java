package com.gym.management.service;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.management.dto.finance.CheckoutSessionDTO;
import com.gym.management.dto.finance.CreatePaymentRequest;
import com.gym.management.dto.finance.PaymentDTO;
import com.gym.management.model.PaymentGateway;
import com.gym.management.model.PaymentStatus;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class StripePaymentService implements PaymentGatewayService {

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret:}")
    private String stripeWebhookSecret;

    @Value("${stripe.api.base.url:https://api.stripe.com/v1}")
    private String stripeBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, PaymentDTO> pendingPayments = new ConcurrentHashMap<>();

    @Override
    public CheckoutSessionDTO createCheckoutSession(Long gymId, CreatePaymentRequest request) {
        try {
            String basicAuth = "Basic " + Base64.getEncoder().encodeToString(
                (stripeApiKey + ":").getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", basicAuth);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String amountInCents = request.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .stripTrailingZeros()
                .toPlainString();

            StringBuilder body = new StringBuilder();
            body.append("mode=payment");
            body.append("&success_url=").append(java.net.URLEncoder.encode(
                "https://yourapp.com/payment/success?session_id={CHECKOUT_SESSION_ID}", java.nio.charset.StandardCharsets.UTF_8));
            body.append("&cancel_url=").append(java.net.URLEncoder.encode(
                "https://yourapp.com/payment/cancel", java.nio.charset.StandardCharsets.UTF_8));
            body.append("&line_items[0][quantity]=1");
            body.append("&line_items[0][price_data][currency]=").append(request.getCurrency().toLowerCase());
            body.append("&line_items[0][price_data][product_data][name]=")
                .append(java.net.URLEncoder.encode(request.getDescription(), java.nio.charset.StandardCharsets.UTF_8));
            body.append("&line_items[0][price_data][unit_amount]=").append(amountInCents);
            body.append("&payment_intent_data[metadata][gym_id]=").append(gymId);
            body.append("&payment_intent_data[metadata][description]=")
                .append(java.net.URLEncoder.encode(request.getDescription(), java.nio.charset.StandardCharsets.UTF_8));

            if (request.getMemberId() != null) {
                body.append("&payment_intent_data[metadata][member_id]=").append(request.getMemberId());
            }

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

            String url = stripeBaseUrl + "/checkout/sessions";
            JsonNode response = restTemplate.postForObject(url, entity, JsonNode.class);

            if (response != null && response.has("id")) {
                PaymentDTO payment = PaymentDTO.builder()
                    .id(System.currentTimeMillis())
                    .gymId(String.valueOf(gymId))
                    .gateway(PaymentGateway.STRIPE)
                    .status(PaymentStatus.PENDING)
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .description(request.getDescription())
                    .checkoutUrl(response.get("url").asText())
                    .build();

                pendingPayments.put(response.get("id").asText(), payment);

                return CheckoutSessionDTO.builder()
                    .sessionId(response.get("id").asText())
                    .checkoutUrl(response.get("url").asText())
                    .gateway("STRIPE")
                    .status("PENDING")
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .expiresAt(java.time.LocalDateTime.now().plusMinutes(30))
                    .allowedPaymentMethods(java.util.List.of("card", "upi", "netbanking", "wallet"))
                    .build();
            }

            throw new RuntimeException("Failed to create Stripe checkout session");

        } catch (Exception e) {
            log.error("Failed to create Stripe checkout session", e);
            throw new RuntimeException("Payment initialization failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentDTO confirmPayment(String sessionId, PaymentGateway gateway) {
        try {
            String basicAuth = "Basic " + Base64.getEncoder().encodeToString(
                (stripeApiKey + ":").getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", basicAuth);

            String url = stripeBaseUrl + "/checkout/sessions/" + sessionId;
            JsonNode session = restTemplate.getForObject(url, JsonNode.class, headers);

            if (session != null && "complete".equals(session.get("payment_status").asText())) {
                String paymentIntentId = session.has("payment_intent") ?
                    session.get("payment_intent").asText() : null;

                PaymentDTO payment = pendingPayments.get(sessionId);
                if (payment == null) {
                    payment = PaymentDTO.builder().build();
                }

                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setTransactionId(paymentIntentId);
                payment.setCompletedAt(java.time.LocalDateTime.now());
                pendingPayments.remove(sessionId);

                return payment;
            }

            return PaymentDTO.builder()
                .sessionId(sessionId)
                .status(PaymentStatus.PENDING)
                .build();

        } catch (Exception e) {
            log.error("Failed to confirm Stripe payment", e);
            throw new RuntimeException("Payment confirmation failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentDTO getPaymentStatus(String transactionId, PaymentGateway gateway) {
        try {
            String basicAuth = "Basic " + Base64.getEncoder().encodeToString(
                (stripeApiKey + ":").getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", basicAuth);

            String url = stripeBaseUrl + "/payment_intents/" + transactionId;
            JsonNode paymentIntent = restTemplate.getForObject(url, JsonNode.class, headers);

            if (paymentIntent != null) {
                PaymentStatus status = mapStripeStatus(paymentIntent.get("status").asText());
                BigDecimal amount = new BigDecimal(paymentIntent.get("amount").asText())
                    .divide(new BigDecimal(100));

                return PaymentDTO.builder()
                    .transactionId(transactionId)
                    .status(status)
                    .amount(amount)
                    .currency(paymentIntent.get("currency").asText().toUpperCase())
                    .gateway(PaymentGateway.STRIPE)
                    .build();
            }

            throw new RuntimeException("Payment not found");

        } catch (Exception e) {
            log.error("Failed to get Stripe payment status", e);
            throw new RuntimeException("Failed to retrieve payment status: " + e.getMessage());
        }
    }

    @Override
    public PaymentDTO refundPayment(String transactionId, BigDecimal amount, PaymentGateway gateway) {
        try {
            String basicAuth = "Basic " + Base64.getEncoder().encodeToString(
                (stripeApiKey + ":").getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", basicAuth);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            StringBuilder body = new StringBuilder();
            body.append("payment_intent=").append(transactionId);
            if (amount != null) {
                String amountInCents = amount.multiply(BigDecimal.valueOf(100))
                    .stripTrailingZeros().toPlainString();
                body.append("&amount=").append(amountInCents);
            }

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);

            String url = stripeBaseUrl + "/refunds";
            JsonNode refund = restTemplate.postForObject(url, entity, JsonNode.class);

            if (refund != null) {
                return PaymentDTO.builder()
                    .transactionId(refund.get("id").asText())
                    .status("succeeded".equals(refund.get("status").asText()) ?
                        PaymentStatus.REFUNDED : PaymentStatus.PENDING)
                    .amount(amount)
                    .gateway(PaymentGateway.STRIPE)
                    .build();
            }

            throw new RuntimeException("Refund failed");

        } catch (Exception e) {
            log.error("Failed to refund Stripe payment", e);
            throw new RuntimeException("Refund failed: " + e.getMessage());
        }
    }

    @Override
    public void handleWebhook(String payload, String signature, PaymentGateway gateway) {
        try {
            String expectedSignature = computeSignature(payload);

            if (!expectedSignature.equals(signature)) {
                throw new RuntimeException("Webhook signature verification failed");
            }

            JsonNode event = objectMapper.readTree(payload);
            String eventType = event.get("type").asText();
            JsonNode data = event.get("data").get("object");

            switch (eventType) {
                case "checkout.session.completed":
                    log.info("Checkout completed: {}", data.get("id").asText());
                    break;
                case "payment_intent.succeeded":
                    log.info("Payment succeeded: {}", data.get("id").asText());
                    break;
                case "payment_intent.payment_failed":
                    log.error("Payment failed: {}", data.get("id").asText());
                    break;
                default:
                    log.info("Unhandled Stripe webhook event: {}", eventType);
            }

        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            throw new RuntimeException("Webhook processing failed: " + e.getMessage());
        }
    }

    @Override
    public String getWebhookSecret(PaymentGateway gateway) {
        return stripeWebhookSecret;
    }

    private PaymentStatus mapStripeStatus(String status) {
        return switch (status) {
            case "succeeded" -> PaymentStatus.COMPLETED;
            case "processing" -> PaymentStatus.PROCESSING;
            case "requires_payment_method", "requires_confirmation", "requires_action" -> PaymentStatus.PENDING;
            case "canceled" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.PENDING;
        };
    }

    private String computeSignature(String payload) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                stripeWebhookSecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return "v1=" + hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Signature computation failed", e);
        }
    }
}
