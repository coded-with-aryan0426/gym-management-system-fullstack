package com.gym.management.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import com.gym.management.model.PaymentGateway;
import com.gym.management.model.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private String gymId;
    private Long memberId;
    private String memberName;
    private PaymentGateway gateway;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private String description;
    private String checkoutUrl;
    private String sessionId;
    private String transactionId;
    private String paymentMethod;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Map<String, String> metadata;
}
