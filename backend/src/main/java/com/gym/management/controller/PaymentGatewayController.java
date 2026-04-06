package com.gym.management.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gym.management.dto.finance.CheckoutSessionDTO;
import com.gym.management.dto.finance.CreatePaymentRequest;
import com.gym.management.dto.finance.PaymentDTO;
import com.gym.management.model.PaymentGateway;
import com.gym.management.service.PaymentGatewayService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentGatewayController {

    private final List<PaymentGatewayService> paymentGatewayServices;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutSessionDTO> createCheckout(
            @RequestParam Long gymId,
            @RequestParam(defaultValue = "STRIPE") PaymentGateway gateway,
            @RequestBody CreatePaymentRequest request) {

        log.info("Creating checkout session for gym: {}, gateway: {}", gymId, gateway);

        PaymentGatewayService service = getPaymentGatewayService(gateway);
        CheckoutSessionDTO session = service.createCheckoutSession(gymId, request);

        return ResponseEntity.ok(session);
    }

    @PostMapping("/confirm/{sessionId}")
    public ResponseEntity<PaymentDTO> confirmPayment(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "STRIPE") PaymentGateway gateway) {

        log.info("Confirming payment for session: {}", sessionId);

        PaymentGatewayService service = getPaymentGatewayService(gateway);
        PaymentDTO payment = service.confirmPayment(sessionId, gateway);

        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<PaymentDTO> getPayment(
            @PathVariable String transactionId,
            @RequestParam(defaultValue = "STRIPE") PaymentGateway gateway) {

        PaymentGatewayService service = getPaymentGatewayService(gateway);
        PaymentDTO payment = service.getPaymentStatus(transactionId, gateway);

        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{transactionId}/refund")
    public ResponseEntity<PaymentDTO> refundPayment(
            @PathVariable String transactionId,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(defaultValue = "STRIPE") PaymentGateway gateway) {

        log.info("Processing refund for transaction: {}, amount: {}", transactionId, amount);

        PaymentGatewayService service = getPaymentGatewayService(gateway);
        PaymentDTO refund = service.refundPayment(transactionId, amount, gateway);

        return ResponseEntity.ok(refund);
    }

    @PostMapping("/webhook/{gateway}")
    public ResponseEntity<Void> handleWebhook(
            @PathVariable PaymentGateway gateway,
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        log.info("Received webhook for gateway: {}", gateway);

        PaymentGatewayService service = getPaymentGatewayService(gateway);
        service.handleWebhook(payload, signature, gateway);

        return ResponseEntity.ok().build();
    }

    private PaymentGatewayService getPaymentGatewayService(PaymentGateway gateway) {
        return paymentGatewayServices.stream()
                .filter(service -> {
                    try {
                        String serviceName = service.getClass().getSimpleName();
                        return switch (gateway) {
                            case STRIPE -> serviceName.contains("Stripe");
                            case RAZORPAY -> serviceName.contains("Razorpay");
                            case PAYPAL -> serviceName.contains("PayPal");
                            case SQUARE -> serviceName.contains("Square");
                            default -> false;
                        };
                    } catch (Exception e) {
                        return false;
                    }
                })
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment gateway not supported: " + gateway));
    }
}
