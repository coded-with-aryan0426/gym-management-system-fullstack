package com.gym.subscription.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {
    private String sessionId;
    private String checkoutUrl;
    private String paymentIntentId;
    private String gateway;
    private String status;
}
