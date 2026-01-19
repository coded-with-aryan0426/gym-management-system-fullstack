package com.gym.management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageDTO {
    private Long messageId;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderAvatarId;
    private String content;
    private String contentType;
    private String payload;
    private LocalDateTime createdAt;
    private Boolean isSystemMessage;
    private Boolean isEdited;
    private java.util.List<MessageReactionDTO> reactions;
}
