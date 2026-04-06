package com.gym.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Plan ID is required")
    private String planId;

    @NotBlank(message = "Billing cycle is required")
    private String billingCycle;

    @NotBlank(message = "Gateway is required")
    private String gateway;

    private String successUrl;
    private String cancelUrl;
}
