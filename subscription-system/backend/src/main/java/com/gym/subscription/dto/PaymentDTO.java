package com.gym.subscription.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private String id;
    private String userId;
    private String subscriptionId;
    private String gateway;
    private String gatewayPaymentId;
    private String gatewayInvoiceId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paymentMethod;
    private String cardLast4;
    private String cardBrand;
    private String billingCycle;
    private String description;
    private LocalDateTime paidAt;
    private LocalDateTime failedAt;
    private LocalDateTime refundedAt;
    private BigDecimal refundAmount;
    private LocalDateTime createdAt;
}
