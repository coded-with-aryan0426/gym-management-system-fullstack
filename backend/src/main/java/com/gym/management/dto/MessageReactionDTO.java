package com.gym.management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageReactionDTO {
    private Long reactionId;
    private Long userId;
    private String userFullName; // For tooltip
    private String emoji;
    private LocalDateTime createdAt;
}
