package com.gym.management.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import com.gym.management.model.PaymentGateway;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialTransactionDTO {
    private Long id;
    private Long gymId;
    private String type;
    private String incomeCategory;
    private String expenseCategory;
    private BigDecimal amount;
    private String currency;
    private BigDecimal amountInBaseCurrency;
    private BigDecimal exchangeRate;
    private LocalDate transactionDate;
    private String description;
    private String referenceNumber;
    private String paymentMethod;
    private String gatewayTransactionId;
    private PaymentGateway gateway;
    private String receiptUrl;
    private String status;
    private Long memberId;
    private String memberName;
    private Long membershipId;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isRecurring;
    private Long recurringScheduleId;
    private Map<String, String> metadata;
}
