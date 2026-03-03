package com.gym.management.controller;

import com.gym.management.model.Message;
import com.gym.management.service.ChatService;
import com.gym.management.service.PresenceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @Autowired
    private PresenceService presenceService;

    // ==================== PRESENCE EVENTS ====================

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        Principal principal = event.getUser();
        if (principal == null) return;
        Long userId = getUserIdFromPrincipal(principal);
        presenceService.setOnline(userId);
        broadcastPresence(userId, true);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) return;
        Long userId = getUserIdFromPrincipal(principal);
        presenceService.setOffline(userId);
        broadcastPresence(userId, false);
    }

    private void broadcastPresence(Long userId, boolean online) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "PRESENCE");
        event.put("userId", userId);
        event.put("online", online);
        messagingTemplate.convertAndSend("/topic/presence", event);
    }

    // ==================== CHAT MESSAGE ====================

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload com.gym.management.dto.ChatMessageDTO chatMessage, Principal principal) {
        Long senderId = getUserIdFromPrincipal(principal);

        // Use the ID from the token, ignore the one from the client
        Message savedMessage = chatService.sendMessage(
                chatMessage.getConversationId(),
                senderId,
                chatMessage.getContent(),
                chatMessage.getContentType(),
                chatMessage.getPayload(),
                chatMessage.getReplyToMessageId());

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
        responseDto.setReplyToMessageId(savedMessage.getReplyToMessageId());

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
}
