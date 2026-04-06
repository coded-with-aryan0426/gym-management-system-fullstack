package com.gym.management.service;

import java.math.BigDecimal;

import com.gym.management.dto.finance.CheckoutSessionDTO;
import com.gym.management.dto.finance.CreatePaymentRequest;
import com.gym.management.dto.finance.PaymentDTO;
import com.gym.management.model.PaymentGateway;

public interface PaymentGatewayService {

    CheckoutSessionDTO createCheckoutSession(Long gymId, CreatePaymentRequest request);

    PaymentDTO confirmPayment(String sessionId, PaymentGateway gateway);

    PaymentDTO getPaymentStatus(String transactionId, PaymentGateway gateway);

    PaymentDTO refundPayment(String transactionId, BigDecimal amount, PaymentGateway gateway);

    void handleWebhook(String payload, String signature, PaymentGateway gateway);

    String getWebhookSecret(PaymentGateway gateway);
}
