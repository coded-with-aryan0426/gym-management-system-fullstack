package com.gym.subscription.service;

import com.gym.subscription.config.PlansConfigLoader;
import com.gym.subscription.dto.CheckoutRequest;
import com.gym.subscription.dto.CheckoutResponse;
import com.gym.subscription.entity.SubscriptionPayment;
import com.gym.subscription.entity.User;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.enums.PaymentStatus;
import com.gym.subscription.repository.SubscriptionPaymentRepository;
import com.gym.subscription.repository.UserRepository;
import com.gym.subscription.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayPaymentService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository paymentRepository;
    private final PlansConfigLoader configLoader;

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook.secret:}")
    private String razorpayWebhookSecret;

    @Value("${app.base.url:http://localhost:8080}")
    private String appBaseUrl;

    private static final String RAZORPAY_CHECKOUT_JS = "https://checkout.razorpay.com/v1/checkout.js";

    @Transactional
    public CheckoutResponse createCheckout(String userId, CheckoutRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PlansConfigLoader.PlanConfig plan = configLoader.getPlanById(request.getPlanId());
        if (plan == null) {
            throw new RuntimeException("Plan not found: " + request.getPlanId());
        }

        BigDecimal amount = configLoader.getPrice(request.getPlanId(), request.getBillingCycle());
        if (amount.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("Invalid amount for plan");
        }

        String razorpayOrderId = createRazorpayOrder(userId, plan.getDisplayName(), amount, request.getBillingCycle());

        String checkoutUrl = String.format("%s/payment/%s", appBaseUrl, razorpayOrderId);

        log.info("Created Razorpay checkout for user: {}, plan: {}, amount: {}", userId, plan.getDisplayName(), amount);

        return CheckoutResponse.builder()
                .sessionId(razorpayOrderId)
                .checkoutUrl(checkoutUrl)
                .gateway("razorpay")
                .status("pending")
                .build();
    }

    private String createRazorpayOrder(String userId, String planName, BigDecimal amount, String billingCycle) {
        String orderId = "order_" + UUID.randomUUID().toString().substring(0, 16);

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("amount", amount.multiply(new BigDecimal("100")).intValue());
        orderData.put("currency", "INR");
        orderData.put("receipt", "rcpt_" + userId.substring(0, 8));
        orderData.put("notes", Map.of(
                "user_id", userId,
                "plan_name", planName,
                "billing_cycle", billingCycle
        ));

        log.info("Razorpay order created: {} for amount {} INR", orderId, amount);

        return orderId;
    }

    public String generateCheckoutOptions(String orderId, String userEmail, String userPhone) {
        PlansConfigLoader.CurrencyConfig currency = configLoader.getCurrencyConfig();

        Map<String, Object> options = new HashMap<>();
        options.put("key", razorpayKeyId);
        options.put("name", "Gym Management");
        options.put("description", "Subscription Payment");
        options.put("order_id", orderId);
        options.put("currency", currency.getDefaultCurrency());
        options.put("prefill", Map.of(
                "email", userEmail != null ? userEmail : "",
                "contact", userPhone != null ? userPhone : ""
        ));
        options.put("theme", Map.of(
                "color", "#6366f1"
        ));
        options.put("modal", Map.of(
                "confirm_close", true,
                "animation", true
        ));

        return toJson(options);
    }

    @Transactional
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String expectedSignature = generateSignature(razorpayOrderId + "|" + razorpayPaymentId, razorpayKeySecret);
            if (!expectedSignature.equals(razorpaySignature)) {
                log.error("Razorpay signature mismatch for order: {}", razorpayOrderId);
                return false;
            }

            log.info("Razorpay payment verified: {} for order: {}", razorpayPaymentId, razorpayOrderId);
            return true;
        } catch (Exception e) {
            log.error("Error verifying Razorpay payment: {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    public void processPaymentSuccess(String razorpayOrderId, String razorpayPaymentId,
                                     String razorpaySignature, Map<String, Object> paymentData) {
        if (!verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
            throw new RuntimeException("Invalid payment signature");
        }

        String userId = (String) paymentData.get("user_id");
        String planName = (String) paymentData.get("plan_name");
        String billingCycle = (String) paymentData.get("billing_cycle");

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found: " + userId);
        }

        PlansConfigLoader.PlanConfig planConfig = configLoader.getPlanById(planName.toLowerCase());
        if (planConfig == null) {
            throw new RuntimeException("Plan not found: " + planName);
        }

        BigDecimal amount = configLoader.getPrice(planName.toLowerCase(), billingCycle);

        SubscriptionPayment payment = SubscriptionPayment.builder()
                .user(user)
                .gateway("razorpay")
                .gatewayPaymentId(razorpayPaymentId)
                .gatewayInvoiceId(razorpayOrderId)
                .amount(amount)
                .currency("INR")
                .status(PaymentStatus.CAPTURED)
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        UserSubscription subscription = subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        if (subscription != null) {
            subscription.setGateway("razorpay");
            subscription.setGatewaySubscriptionId(razorpayOrderId);
            subscription.setStatus(com.gym.subscription.enums.SubscriptionStatus.ACTIVE);
            subscription.setCurrentPeriodEnd(calculatePeriodEnd(LocalDateTime.now(), billingCycle));
            subscriptionRepository.save(subscription);
        }

        log.info("Payment success processed for user: {}, plan: {}", userId, planName);
    }

    @Transactional
    public void processPaymentFailure(String razorpayOrderId, Map<String, Object> failureData) {
        String userId = (String) failureData.get("user_id");
        String reason = (String) failureData.get("reason");

        if (userId != null) {
            SubscriptionPayment payment = paymentRepository.findByGatewayPaymentIdAndGateway(razorpayOrderId, "razorpay")
                    .orElse(null);

            if (payment != null) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailedAt(LocalDateTime.now());
                paymentRepository.save(payment);
            }

            UserSubscription subscription = subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
            if (subscription != null) {
                subscription.setStatus(com.gym.subscription.enums.SubscriptionStatus.PAST_DUE);
                subscriptionRepository.save(subscription);
            }

            log.info("Payment failure processed for user: {}, reason: {}", userId, reason);
        }
    }

    public boolean verifyWebhookSignature(String payload, String signature) {
        if (razorpayWebhookSecret == null || razorpayWebhookSecret.isEmpty()) {
            log.warn("Razorpay webhook secret not configured");
            return true;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    razorpayWebhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] computedHash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedSignature = bytesToHex(computedHash);

            return computedSignature.equals(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Error verifying webhook signature: {}", e.getMessage());
            return false;
        }
    }

    private String generateSignature(String data, String secret) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private LocalDateTime calculatePeriodEnd(LocalDateTime start, String billingCycle) {
        if (billingCycle == null) billingCycle = "yearly";
        return switch (billingCycle.toLowerCase()) {
            case "quarterly" -> start.plusMonths(3);
            case "monthly" -> start.plusMonths(1);
            default -> start.plusYears(1);
        };
    }

    private String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value instanceof String) {
                sb.append("\"").append(value).append("\"");
            } else if (value instanceof Number) {
                sb.append(value);
            } else if (value instanceof Boolean) {
                sb.append(value);
            } else {
                @SuppressWarnings("unchecked")
                Map<String, Object> mapValue = (Map<String, Object>) value;
                sb.append(toJson(mapValue));
            }
        }
        sb.append("}");
        return sb.toString();
    }

    public Map<String, Object> getGatewaySettings() {
        boolean isConfigured = razorpayKeyId != null && !razorpayKeyId.isEmpty()
                && razorpayKeySecret != null && !razorpayKeySecret.isEmpty();

        return Map.of(
                "enabled", isConfigured,
                "gateway", "razorpay",
                "keyId", isConfigured ? razorpayKeyId.substring(0, Math.min(10, razorpayKeyId.length())) + "..." : "",
                "checkoutUrl", RAZORPAY_CHECKOUT_JS,
                "currency", "INR"
        );
    }
}
