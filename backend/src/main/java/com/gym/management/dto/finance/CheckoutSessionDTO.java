package com.gym.management.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutSessionDTO {
    private String sessionId;
    private String checkoutUrl;
    private String paymentIntentId;
    private String gateway;
    private String status;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime expiresAt;
    private List<String> allowedPaymentMethods;
}
