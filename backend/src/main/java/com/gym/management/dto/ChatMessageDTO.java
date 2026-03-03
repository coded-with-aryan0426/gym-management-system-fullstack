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

    // Delivery status for the requesting user's sent messages: SENT | DELIVERED | READ
    private String deliveryStatus;

    // Explicit getters and setters for Lombok compatibility
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    
    public String getSenderAvatarId() { return senderAvatarId; }
    public void setSenderAvatarId(String senderAvatarId) { this.senderAvatarId = senderAvatarId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Boolean getIsSystemMessage() { return isSystemMessage; }
    public void setIsSystemMessage(Boolean isSystemMessage) { this.isSystemMessage = isSystemMessage; }
    
    public Boolean getIsEdited() { return isEdited; }
    public void setIsEdited(Boolean isEdited) { this.isEdited = isEdited; }
    
    public java.util.List<MessageReactionDTO> getReactions() { return reactions; }
    public void setReactions(java.util.List<MessageReactionDTO> reactions) { this.reactions = reactions; }

    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
}
