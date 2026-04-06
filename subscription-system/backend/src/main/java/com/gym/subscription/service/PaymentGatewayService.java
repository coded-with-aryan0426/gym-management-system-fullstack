package com.gym.subscription.service;

import com.gym.subscription.dto.CheckoutRequest;
import com.gym.subscription.dto.CheckoutResponse;
import com.gym.subscription.entity.SubscriptionPlan;
import com.gym.subscription.entity.User;
import com.gym.subscription.entity.UserSubscription;
import com.gym.subscription.enums.SubscriptionStatus;
import com.gym.subscription.exception.PaymentException;
import com.gym.subscription.repository.SubscriptionPlanRepository;
import com.gym.subscription.repository.UserRepository;
import com.gym.subscription.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayService {

    private final SubscriptionPlanRepository planRepository;
    private final UserRepository userRepository;
    private final UserSubscriptionRepository subscriptionRepository;

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Value("${paypal.client.id:}")
    private String paypalClientId;

    @Value("${paddle.vendor.id:}")
    private String paddleVendorId;

    @Value("${app.base.url:http://localhost:8080}")
    private String appBaseUrl;

    public CheckoutResponse createCheckoutSession(String userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PaymentException("User not found"));

        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new PaymentException("Plan not found"));

        return switch (request.getGateway().toLowerCase()) {
            case "stripe" -> createStripeCheckout(user, plan, request);
            case "paypal" -> createPaypalCheckout(user, plan, request);
            case "paddle" -> createPaddleCheckout(user, plan, request);
            case "razorpay" -> createRazorpayCheckout(user, plan, request);
            default -> throw new PaymentException("Unsupported payment gateway: " + request.getGateway());
        };
    }

    private CheckoutResponse createStripeCheckout(User user, SubscriptionPlan plan, CheckoutRequest request) {
        log.info("Creating Stripe checkout session for user: {} and plan: {}", user.getId(), plan.getName());

        String sessionId = "stripe_" + UUID.randomUUID().toString();
        String checkoutUrl = String.format("%s/api/subscribe/stripe/callback?session_id=%s",
                appBaseUrl, sessionId);

        return CheckoutResponse.builder()
                .sessionId(sessionId)
                .checkoutUrl(checkoutUrl)
                .gateway("stripe")
                .status("pending")
                .build();
    }

    private CheckoutResponse createPaypalCheckout(User user, SubscriptionPlan plan, CheckoutRequest request) {
        log.info("Creating PayPal checkout for user: {} and plan: {}", user.getId(), plan.getName());

        String orderId = "paypal_" + UUID.randomUUID().toString();
        String checkoutUrl = String.format("%s/api/subscribe/paypal/callback?order_id=%s",
                appBaseUrl, orderId);

        return CheckoutResponse.builder()
                .sessionId(orderId)
                .checkoutUrl(checkoutUrl)
                .gateway("paypal")
                .status("pending")
                .build();
    }

    private CheckoutResponse createPaddleCheckout(User user, SubscriptionPlan plan, CheckoutRequest request) {
        log.info("Creating Paddle checkout for user: {} and plan: {}", user.getId(), plan.getName());

        String checkoutId = "paddle_" + UUID.randomUUID().toString();
        String checkoutUrl = String.format("%s/api/subscribe/paddle/callback?checkout_id=%s",
                appBaseUrl, checkoutId);

        return CheckoutResponse.builder()
                .sessionId(checkoutId)
                .checkoutUrl(checkoutUrl)
                .gateway("paddle")
                .status("pending")
                .build();
    }

    private CheckoutResponse createRazorpayCheckout(User user, SubscriptionPlan plan, CheckoutRequest request) {
        log.info("Creating Razorpay checkout for user: {} and plan: {}", user.getId(), plan.getName());

        String orderId = "razorpay_" + UUID.randomUUID().toString();
        String checkoutUrl = String.format("%s/payment/checkout/%s?userId=%s&plan=%s",
                appBaseUrl, orderId, user.getId(), plan.getName());

        return CheckoutResponse.builder()
                .sessionId(orderId)
                .checkoutUrl(checkoutUrl)
                .gateway("razorpay")
                .status("pending")
                .build();
    }

    public void cancelSubscription(String gateway, String subscriptionId) {
        log.info("Cancelling {} subscription: {}", gateway, subscriptionId);

        UserSubscription subscription = subscriptionRepository
                .findByGatewaySubscriptionIdAndStatusIn(subscriptionId,
                        java.util.List.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING))
                .orElse(null);

        if (subscription != null) {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscription.setCancelledAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
        }
    }

    public BigDecimal getPlanPrice(String planId, String billingCycle) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new PaymentException("Plan not found"));

        return plan.getPriceForCycle(billingCycle);
    }

    public Map<String, Object> getGatewaySettings(String gateway) {
        return switch (gateway.toLowerCase()) {
            case "stripe" -> Map.of(
                    "enabled", stripeApiKey != null && !stripeApiKey.isEmpty(),
                    "publicKey", stripeApiKey != null ? stripeApiKey.substring(0, Math.min(20, stripeApiKey.length())) + "..." : ""
            );
            case "paypal" -> Map.of(
                    "enabled", paypalClientId != null && !paypalClientId.isEmpty(),
                    "clientId", paypalClientId != null ? paypalClientId.substring(0, Math.min(20, paypalClientId.length())) + "..." : ""
            );
            case "paddle" -> Map.of(
                    "enabled", paddleVendorId != null && !paddleVendorId.isEmpty(),
                    "vendorId", paddleVendorId != null ? paddleVendorId.substring(0, Math.min(10, paddleVendorId.length())) + "..." : ""
            );
            default -> Map.of("enabled", false);
        };
    }
}
