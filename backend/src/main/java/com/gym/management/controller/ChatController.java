package com.gym.management.controller;

import com.gym.management.dto.ChatUserDTO;
import com.gym.management.model.Conversation;
import com.gym.management.model.GymRole;
import com.gym.management.model.Message;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.BlockingService;
import com.gym.management.service.ChatService;
import com.gym.management.service.ChatUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private ChatUserService chatUserService;

    @Autowired
    private BlockingService blockingService;

    // ==================== CONVERSATION ENDPOINTS ====================

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Conversation> conversations = chatService.getUserConversations(userId, pageable);

        java.util.List<com.gym.management.dto.ConversationDTO> dtos = conversations.stream().map(c -> {
            com.gym.management.dto.ConversationDTO dto = new com.gym.management.dto.ConversationDTO();
            dto.setConversationId(c.getConversationId());
            dto.setType(c.getType());
            dto.setTitle(c.getTitle());
            dto.setMetadata(c.getMetadata());
            dto.setUpdatedAt(c.getUpdatedAt());
            dto.setParticipants(c.getParticipants().stream().map(p -> {
                com.gym.management.dto.ConversationDTO.ParticipantDTO pd = new com.gym.management.dto.ConversationDTO.ParticipantDTO();
                pd.setUserId(p.getUser().getUserId());
                pd.setFullName(p.getUser().getFullName());
                pd.setRole(p.getRole());
                pd.setAvatarId(p.getUser().getAvatarId());
                return pd;
            }).collect(java.util.stream.Collectors.toList()));
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(apiResponse(true, dtos, null));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messages = chatService.getConversationMessages(conversationId, pageable);

        java.util.List<com.gym.management.dto.ChatMessageDTO> dtos = messages.stream().map(m -> {
            com.gym.management.dto.ChatMessageDTO dto = new com.gym.management.dto.ChatMessageDTO();
            dto.setMessageId(m.getMessageId());
            dto.setConversationId(m.getConversation().getConversationId());
            if (m.getSender() != null) {
                dto.setSenderId(m.getSender().getUserId());
                dto.setSenderName(m.getSender().getFullName());
                dto.setSenderAvatarId(m.getSender().getAvatarId());
            }
            dto.setContent(m.getContent());
            dto.setContentType(m.getContentType());
            dto.setPayload(m.getPayload());
            dto.setCreatedAt(m.getCreatedAt());
            dto.setIsSystemMessage(m.getIsSystemMessage());
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(apiResponse(true, dtos, null));
    }

    @PostMapping("/private")
    public ResponseEntity<?> startPrivateChat(@RequestParam Long targetUserId) {
        Long currentUserId = getAuthenticatedUserId();

        // Check if blocked
        if (blockingService.isBlocked(currentUserId, targetUserId)) {
            return ResponseEntity.badRequest()
                    .body(apiResponse(false, null, "Cannot start chat with this user"));
        }

        Conversation c = chatService.getOrCreatePrivateConversation(currentUserId, targetUserId);

        com.gym.management.dto.ConversationDTO dto = new com.gym.management.dto.ConversationDTO();
        dto.setConversationId(c.getConversationId());
        dto.setType(c.getType());
        dto.setTitle(c.getTitle());
        dto.setUpdatedAt(c.getUpdatedAt());
        dto.setParticipants(c.getParticipants().stream().map(p -> {
            com.gym.management.dto.ConversationDTO.ParticipantDTO pd = new com.gym.management.dto.ConversationDTO.ParticipantDTO();
            pd.setUserId(p.getUser().getUserId());
            pd.setFullName(p.getUser().getFullName());
            pd.setAvatarId(p.getUser().getAvatarId());
            return pd;
        }).collect(java.util.stream.Collectors.toList()));

        return ResponseEntity.ok(apiResponse(true, dto, "Chat started"));
    }

    // ==================== USER DISCOVERY ENDPOINTS ====================

    /**
     * Get all users available for chat (gym-scoped, excludes blocked).
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAvailableChatUsers() {
        Long userId = getAuthenticatedUserId();
        List<ChatUserDTO> users = chatUserService.getAvailableChatUsers(userId);
        return ResponseEntity.ok(apiResponse(true, users, null));
    }

    /**
     * Search users by name within a gym.
     */
    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam String query,
            @RequestParam(required = false) Long gymId,
            @RequestParam(required = false) String role) {

        Long userId = getAuthenticatedUserId();
        GymRole roleFilter = role != null ? GymRole.valueOf(role.toUpperCase()) : null;

        // If gymId not provided, use first available gym (or handle accordingly)
        List<ChatUserDTO> users;
        if (gymId != null) {
            users = chatUserService.searchUsers(userId, query, gymId, roleFilter);
        } else {
            // Search across all user's gyms
            users = chatUserService.getAvailableChatUsers(userId).stream()
                    .filter(u -> u.getFullName() != null &&
                            u.getFullName().toLowerCase().contains(query.toLowerCase()))
                    .collect(java.util.stream.Collectors.toList());
        }

        return ResponseEntity.ok(apiResponse(true, users, null));
    }

    /**
     * Get users by role (for filter tabs).
     */
    @GetMapping("/users/byRole")
    public ResponseEntity<?> getUsersByRole(
            @RequestParam Long gymId,
            @RequestParam String role) {

        Long userId = getAuthenticatedUserId();
        GymRole gymRole = GymRole.valueOf(role.toUpperCase());
        List<ChatUserDTO> users = chatUserService.getUsersByRole(userId, gymId, gymRole);
        return ResponseEntity.ok(apiResponse(true, users, null));
    }

    // ==================== BLOCKING ENDPOINTS ====================

    /**
     * Block a user.
     */
    @PostMapping("/block")
    public ResponseEntity<?> blockUser(
            @RequestParam Long userId,
            @RequestParam(required = false) String reason) {

        Long currentUserId = getAuthenticatedUserId();

        if (currentUserId.equals(userId)) {
            return ResponseEntity.badRequest()
                    .body(apiResponse(false, null, "Cannot block yourself"));
        }

        blockingService.blockUser(currentUserId, userId, reason);
        return ResponseEntity.ok(apiResponse(true, null, "User blocked"));
    }

    /**
     * Unblock a user.
     */
    @DeleteMapping("/block")
    public ResponseEntity<?> unblockUser(@RequestParam Long userId) {
        Long currentUserId = getAuthenticatedUserId();
        blockingService.unblockUser(currentUserId, userId);
        return ResponseEntity.ok(apiResponse(true, null, "User unblocked"));
    }

    /**
     * Get list of blocked users.
     */
    @GetMapping("/blocked")
    public ResponseEntity<?> getBlockedUsers() {
        Long userId = getAuthenticatedUserId();
        var blockedUsers = blockingService.getBlockedUsers(userId).stream()
                .map(u -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", u.getUserId());
                    userInfo.put("fullName", u.getFullName());
                    userInfo.put("avatarId", u.getAvatarId());
                    return userInfo;
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(apiResponse(true, blockedUsers, null));
    }

    /**
     * Check if a specific user is blocked.
     */
    @GetMapping("/block/check")
    public ResponseEntity<?> checkBlocked(@RequestParam Long userId) {
        Long currentUserId = getAuthenticatedUserId();
        boolean isBlocked = blockingService.isBlocked(currentUserId, userId);
        boolean hasBlocked = blockingService.hasBlocked(currentUserId, userId);

        Map<String, Object> result = new HashMap<>();
        result.put("isBlocked", isBlocked);
        result.put("hasBlocked", hasBlocked);

        return ResponseEntity.ok(apiResponse(true, result, null));
    }

    // ==================== HELPER METHODS ====================

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        throw new RuntimeException("User not authenticated");
    }

    private Map<String, Object> apiResponse(boolean success, Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("data", data);
        response.put("message", message);
        return response;
    }
}
