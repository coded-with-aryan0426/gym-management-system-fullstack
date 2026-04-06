package com.gym.subscription.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookPayload {
    private String gateway;
    private String eventId;
    private String eventType;
    private String payload;
    private String signature;
}
