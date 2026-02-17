package com.gym.management.controller;

import com.gym.management.model.Message;
import com.gym.management.service.ChatService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload com.gym.management.dto.ChatMessageDTO chatMessage, Principal principal) {
        Long senderId = getUserIdFromPrincipal(principal);

        // Use the ID from the token, ignore the one from the client
        Message savedMessage = chatService.sendMessage(
                chatMessage.getConversationId(),
                senderId,
                chatMessage.getContent(),
                chatMessage.getContentType(), // Use getContentType() from shared DTO
                chatMessage.getPayload());

        // Map to DTO to send back (consistency)
        com.gym.management.dto.ChatMessageDTO responseDto = new com.gym.management.dto.ChatMessageDTO();
        responseDto.setMessageId(savedMessage.getMessageId());
        responseDto.setConversationId(savedMessage.getConversation().getConversationId());
        responseDto.setSenderId(savedMessage.getSender().getUserId());
        responseDto.setSenderName(savedMessage.getSender().getFullName());
        responseDto.setContent(savedMessage.getContent());
        responseDto.setContentType(savedMessage.getContentType());
        responseDto.setPayload(savedMessage.getPayload());
        responseDto.setCreatedAt(savedMessage.getCreatedAt());
        responseDto.setIsSystemMessage(savedMessage.getIsSystemMessage());
        responseDto.setIsEdited(false);
        responseDto.setReactions(new java.util.ArrayList<>());

        // Broadcast to conversation topic
        messagingTemplate.convertAndSend("/topic/conversation/" + chatMessage.getConversationId(), responseDto);
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(@Payload java.util.Map<String, Object> payload, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        
        Long conversationId = Long.valueOf(payload.get("conversationId").toString());
        Boolean isTyping = (Boolean) payload.get("isTyping");

        java.util.Map<String, Object> event = new java.util.HashMap<>();
        event.put("type", "TYPING");
        event.put("conversationId", conversationId);
        event.put("userId", userId);
        event.put("isTyping", isTyping);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, event);
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken) {
            Object principalParams = ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) principal)
                    .getPrincipal();
            if (principalParams instanceof com.gym.management.security.CustomUserDetails) {
                return ((com.gym.management.security.CustomUserDetails) principalParams).getId();
            }
        }
        throw new RuntimeException("Unauthorized: Valid user principal required");
    }

    // Inner class ChatMessageDTO removed in favor of
    // com.gym.management.dto.ChatMessageDTO
}
