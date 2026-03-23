package com.gym.management.controller;

import com.gym.management.dto.ChatUserDTO;
import com.gym.management.dto.ConversationDTO;
import com.gym.management.model.Conversation;
import com.gym.management.model.GymRole;
import com.gym.management.model.Message;
import com.gym.management.model.MessageStatus;
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

    @Autowired
    private com.gym.management.repository.ConversationParticipantRepository participantRepository;

    @Autowired
    private com.gym.management.repository.MessageRepository messageRepository;

    @Autowired
    private com.gym.management.repository.MessageStatusRepository messageStatusRepository;

    @Autowired
    private com.gym.management.repository.MessageAttachmentRepository messageAttachmentRepository;

    @Autowired
    private com.gym.management.repository.UserGymRoleRepository userGymRoleRepository;

    // ==================== CONVERSATION ENDPOINTS ====================

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Conversation> conversations = chatService.getUserConversations(userId, pageable);

        java.util.List<ConversationDTO> dtos = conversations.stream().map(c -> {
            ConversationDTO dto = new ConversationDTO();
            dto.setConversationId(c.getConversationId());
            dto.setType(c.getType());
            dto.setTitle(c.getTitle());
            dto.setMetadata(c.getMetadata());
            dto.setUpdatedAt(c.getUpdatedAt());

            // Populate last message preview using last_message_id FK (D5 — avoids N subqueries)
            Long lastMsgId = c.getLastMessageId();
            if (lastMsgId != null) {
                messageRepository.findById(lastMsgId).ifPresent(lastMsg -> {
                    String preview;
                    if (lastMsg.getIsDeleted() != null && lastMsg.getIsDeleted()) {
                        preview = "This message was deleted";
                    } else if (lastMsg.getContentType() != null && !lastMsg.getContentType().equals("TEXT")) {
                        preview = "[" + lastMsg.getContentType() + "]";
                    } else {
                        preview = lastMsg.getContent() != null ? lastMsg.getContent() : "";
                    }
                    dto.setLastMessageContent(preview);
                    dto.setLastMessageType(lastMsg.getContentType());
                    dto.setLastMessageAt(lastMsg.getCreatedAt());
                    if (lastMsg.getSender() != null) {
                        dto.setLastMessageSenderId(lastMsg.getSender().getUserId());
                    }
                });
            }

            // Populate unread count using lastReadMessageId from the participant row
            com.gym.management.model.ConversationParticipant myParticipant = participantRepository
                    .findById(new com.gym.management.model.ConversationParticipant.ParticipantId(c.getConversationId(), userId))
                    .orElse(null);
            Long lastReadId = myParticipant != null ? myParticipant.getLastReadMessageId() : null;
            long unread = messageRepository.countUnreadForUser(c.getConversationId(), userId, lastReadId);
            dto.setUnreadCount((int) unread);

            // Fetch participants explicitly with JOIN FETCH for User data
            java.util.List<com.gym.management.model.ConversationParticipant> participants = participantRepository
                    .findByConversationIdWithUser(c.getConversationId());
            dto.setParticipants(participants.stream().map(p -> {
                ConversationDTO.ParticipantDTO pd = new ConversationDTO.ParticipantDTO();
                pd.setUserId(p.getUser().getUserId());
                String name = p.getUser().getFullName();
                if (name == null || name.trim().isEmpty()) {
                    name = p.getUser().getUsername();
                }
                pd.setFullName(name);
                pd.setUsername(p.getUser().getUsername());
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

        Long currentUserId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Message> messages = chatService.getConversationMessages(conversationId, pageable);

        // Pre-fetch all other-participant status rows for messages sent by current user in one query
        List<Long> myMessageIds = messages.stream()
                .filter(m -> m.getSender() != null && m.getSender().getUserId().equals(currentUserId))
                .map(Message::getMessageId)
                .collect(java.util.stream.Collectors.toList());

        // Map: messageId -> effective status
        Map<Long, String> deliveryMap = new HashMap<>();
        if (!myMessageIds.isEmpty()) {
            List<MessageStatus> statuses = messageStatusRepository
                    .findByMessageIdsAndNotSender(myMessageIds, currentUserId);
            // Group by messageId, pick best status
            Map<Long, List<MessageStatus>> byMsg = statuses.stream()
                    .collect(java.util.stream.Collectors.groupingBy(s -> s.getId().getMessageId()));
            for (Map.Entry<Long, List<MessageStatus>> entry : byMsg.entrySet()) {
                boolean anyRead = entry.getValue().stream().anyMatch(s -> "READ".equals(s.getStatus()));
                boolean anyDelivered = entry.getValue().stream().anyMatch(s -> "DELIVERED".equals(s.getStatus()));
                deliveryMap.put(entry.getKey(), anyRead ? "READ" : (anyDelivered ? "DELIVERED" : "SENT"));
            }
        }

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
            dto.setIsEdited(m.getEditHistory() != null && !m.getEditHistory().isEmpty());
            dto.setReplyToMessageId(m.getReplyToMessageId());

            if (m.getSender() != null && m.getSender().getUserId().equals(currentUserId)) {
                dto.setDeliveryStatus(deliveryMap.getOrDefault(m.getMessageId(), "SENT"));
            }

            if (m.getReactions() != null) {
                dto.setReactions(m.getReactions().stream().map(r -> {
                    com.gym.management.dto.MessageReactionDTO rd = new com.gym.management.dto.MessageReactionDTO();
                    rd.setReactionId(r.getReactionId());
                    rd.setUserId(r.getUser().getUserId());
                    rd.setUserFullName(r.getUser().getFullName());
                    rd.setEmoji(r.getEmoji());
                    rd.setCreatedAt(r.getCreatedAt());
                    return rd;
                }).collect(java.util.stream.Collectors.toList()));
            } else {
                dto.setReactions(new java.util.ArrayList<>());
            }

            return dto;
        }).collect(java.util.stream.Collectors.toList());

        // B4 — return pagination metadata so frontend knows when to stop
        Map<String, Object> paged = new HashMap<>();
        paged.put("messages", dtos);
        paged.put("page", messages.getNumber());
        paged.put("totalPages", messages.getTotalPages());
        paged.put("hasMore", messages.hasNext());

        return ResponseEntity.ok(apiResponse(true, paged, null));
    }

    // B6 — Server-side message search within a conversation
    @PostMapping("/conversations/{conversationId}/messages/search")
    public ResponseEntity<?> searchMessages(
            @PathVariable Long conversationId,
            @RequestBody Map<String, Object> body,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long currentUserId = getAuthenticatedUserId();

        // Verify the caller is a participant in this conversation
        boolean isParticipant = participantRepository
                .findByConversationConversationIdAndUserUserId(conversationId, currentUserId)
                .isPresent();
        if (!isParticipant) {
            return ResponseEntity.status(403).body(apiResponse(false, null, "Not a participant"));
        }

        String query = body.getOrDefault("query", "").toString().trim();
        if (query.isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "Search query is required"));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Message> results = messageRepository.searchByContent(conversationId, query, pageable);

        java.util.List<Map<String, Object>> dtos = results.getContent().stream().map(m -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("messageId", m.getMessageId());
            dto.put("content", m.getContent());
            dto.put("contentType", m.getContentType());
            dto.put("createdAt", m.getCreatedAt());
            if (m.getSender() != null) {
                dto.put("senderId", m.getSender().getUserId());
                dto.put("senderName", m.getSender().getFullName());
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        Map<String, Object> paged = new HashMap<>();
        paged.put("messages", dtos);
        paged.put("page", results.getNumber());
        paged.put("totalPages", results.getTotalPages());
        paged.put("hasMore", results.hasNext());

        return ResponseEntity.ok(apiResponse(true, paged, null));
    }

    @PostMapping("/private")
    public ResponseEntity<?> startPrivateChat(@RequestParam Long targetUserId) {
        Long currentUserId = getAuthenticatedUserId();

        // Check if blocked
        if (blockingService.isBlocked(currentUserId, targetUserId)) {
            return ResponseEntity.badRequest()
                    .body(apiResponse(false, null, "Cannot start chat with this user"));
        }

        try {
            Conversation c = chatService.getOrCreatePrivateConversation(currentUserId, targetUserId);

            ConversationDTO dto = new ConversationDTO();
            dto.setConversationId(c.getConversationId());
            dto.setType(c.getType());
            dto.setTitle(c.getTitle());
            dto.setUpdatedAt(c.getUpdatedAt());
            dto.setParticipants(c.getParticipants().stream().map(p -> {
                ConversationDTO.ParticipantDTO pd = new ConversationDTO.ParticipantDTO();
                pd.setUserId(p.getUser().getUserId());
                String name = p.getUser().getFullName();
                if (name == null || name.trim().isEmpty()) {
                    name = p.getUser().getUsername();
                }
                pd.setFullName(name);
                pd.setUsername(p.getUser().getUsername());
                pd.setAvatarId(p.getUser().getAvatarId());
                return pd;
            }).collect(java.util.stream.Collectors.toList()));

            return ResponseEntity.ok(apiResponse(true, dto, "Chat started"));
        } catch (IllegalStateException e) {
            String msg = e.getMessage();
            if ("CHAT_REQUEST_REQUIRED".equals(msg)) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("error", "CHAT_REQUEST_REQUIRED");
                resp.put("message", "You must send a request first.");
                return ResponseEntity.status(403).body(resp);
            }
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(apiResponse(false, null, "Internal Error: " + e.getMessage()));
        }
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Long> payload) {
        Long currentUserId = getAuthenticatedUserId();
        Long targetUserId = payload.get("targetUserId");

        if (targetUserId == null) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "targetUserId required"));
        }

        try {
            com.gym.management.model.ConversationRequest req = chatService.createRequest(currentUserId, targetUserId);
            return ResponseEntity.ok(apiResponse(true, req, "Request sent"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getPendingRequests() {
        Long userId = getAuthenticatedUserId();
        java.util.List<com.gym.management.model.ConversationRequest> requests = chatService.getPendingRequests(userId);

        // Map to DTO to prevent recursion/lazy issues
        java.util.List<Map<String, Object>> dtos = requests.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("requestId", r.getRequestId());
            map.put("senderId", r.getSender().getUserId());
            map.put("senderName", r.getSender().getFullName());
            map.put("senderAvatarId", r.getSender().getAvatarId());
            map.put("createdAt", r.getCreatedAt());
            map.put("status", r.getStatus());
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(apiResponse(true, dtos, null));
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId) {
        Long userId = getAuthenticatedUserId();
        try {
            Conversation c = chatService.acceptRequest(requestId, userId);
            // Return conversation DTO
            ConversationDTO dto = new ConversationDTO();
            dto.setConversationId(c.getConversationId());
            dto.setType(c.getType());
            dto.setTitle(c.getTitle());
            dto.setUpdatedAt(c.getUpdatedAt());
            dto.setParticipants(c.getParticipants().stream().map(p -> {
                ConversationDTO.ParticipantDTO pd = new ConversationDTO.ParticipantDTO();
                pd.setUserId(p.getUser().getUserId());
                String name = p.getUser().getFullName();
                if (name == null || name.trim().isEmpty()) {
                    name = p.getUser().getUsername();
                }
                pd.setFullName(name);
                pd.setUsername(p.getUser().getUsername());
                pd.setAvatarId(p.getUser().getAvatarId());
                return pd;
            }).collect(java.util.stream.Collectors.toList()));

            return ResponseEntity.ok(apiResponse(true, dto, "Request accepted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        Long userId = getAuthenticatedUserId();
        try {
            chatService.rejectRequest(requestId, userId);
            return ResponseEntity.ok(apiResponse(true, null, "Request rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
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

    // ==================== MESSAGE ACTIONS ====================

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long conversationId) {
        Long userId = getAuthenticatedUserId();
        try {
            chatService.markConversationAsRead(conversationId, userId);
            return ResponseEntity.ok(apiResponse(true, null, "Conversation marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable Long messageId, @RequestBody Map<String, String> payload) {
        Long userId = getAuthenticatedUserId();
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "Content required"));
        }

        try {
            chatService.editMessage(messageId, userId, content);
            return ResponseEntity.ok(apiResponse(true, null, "Message updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        Long userId = getAuthenticatedUserId();
        try {
            chatService.deleteMessage(messageId, userId);
            return ResponseEntity.ok(apiResponse(true, null, "Message deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
    }

    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<?> addReaction(@PathVariable Long messageId, @RequestBody Map<String, String> payload) {
        Long userId = getAuthenticatedUserId();
        String emoji = payload.get("emoji");
        if (emoji == null || emoji.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "Emoji required"));
        }

        try {
            chatService.reactToMessage(messageId, userId, emoji);
            return ResponseEntity.ok(apiResponse(true, null, "Reaction added"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{messageId}/reactions")
    public ResponseEntity<?> removeReaction(@PathVariable Long messageId, @RequestParam String emoji) {
        Long userId = getAuthenticatedUserId();
        if (emoji == null || emoji.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "Emoji required"));
        }

        try {
            chatService.removeReaction(messageId, userId, emoji);
            return ResponseEntity.ok(apiResponse(true, null, "Reaction removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, e.getMessage()));
        }
    }

    // ==================== SHARED MEDIA (B5) ====================

    /**
     * GET /api/chat/conversations/{conversationId}/media?type=IMAGE&page=0&size=18
     * Returns paginated attachments for a conversation, filtered by file type.
     * type: IMAGE | VIDEO | DOCUMENT | VOICE_NOTE | AUDIO | OTHER (default: IMAGE)
     */
    @GetMapping("/conversations/{conversationId}/media")
    public ResponseEntity<?> getSharedMedia(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "IMAGE") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "18") int size) {

        com.gym.management.model.MessageAttachment.FileType fileType;
        try {
            fileType = com.gym.management.model.MessageAttachment.FileType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            fileType = com.gym.management.model.MessageAttachment.FileType.IMAGE;
        }

        // Fetch all then slice manually (repository returns List, not Page)
        java.util.List<com.gym.management.model.MessageAttachment> all =
                messageAttachmentRepository.findByConversationIdAndType(conversationId, fileType);

        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, all.size());
        java.util.List<com.gym.management.model.MessageAttachment> slice =
                start >= all.size() ? java.util.Collections.emptyList() : all.subList(start, end);

        java.util.List<Map<String, Object>> dtos = slice.stream().map(a -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("attachmentId", a.getAttachmentId());
            dto.put("fileType", a.getFileType());
            dto.put("fileUrl", a.getFileUrl());
            dto.put("fileName", a.getFileName());
            dto.put("fileSize", a.getFileSize());
            dto.put("mimeType", a.getMimeType());
            dto.put("thumbnailUrl", a.getThumbnailUrl());
            dto.put("duration", a.getDuration());
            dto.put("createdAt", a.getCreatedAt());
            if (a.getMessage() != null) {
                dto.put("messageId", a.getMessage().getMessageId());
                if (a.getMessage().getSender() != null) {
                    dto.put("senderId", a.getMessage().getSender().getUserId());
                    dto.put("senderName", a.getMessage().getSender().getFullName());
                }
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("items", dtos);
        result.put("page", page);
        result.put("totalCount", all.size());
        result.put("hasMore", end < all.size());

        return ResponseEntity.ok(apiResponse(true, result, null));
    }

    // ==================== ANNOUNCEMENT BROADCAST (B7 / O5) ====================

    /**
     * POST /api/chat/announcements
     * Sends a message to every TRAINER and MEMBER in the owner's gym.
     * Body: { "gymId": 1, "message": "...", "target": "ALL" | "TRAINERS" | "MEMBERS" }
     */
    @PostMapping("/announcements")
    public ResponseEntity<?> sendAnnouncement(@RequestBody Map<String, Object> body) {
        Long ownerId = getAuthenticatedUserId();

        Object gymIdObj = body.get("gymId");
        if (gymIdObj == null) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "gymId required"));
        }
        Long gymId = Long.parseLong(gymIdObj.toString());

        String message = body.getOrDefault("message", "").toString().trim();
        if (message.isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse(false, null, "message required"));
        }

        String target = body.getOrDefault("target", "ALL").toString().toUpperCase();

        // Verify caller is OWNER of this gym
        boolean isOwner = userGymRoleRepository.existsByUserUserIdAndGymGymIdAndRoleAndStatus(
                ownerId, gymId, com.gym.management.model.GymRole.OWNER,
                com.gym.management.model.RoleStatus.ACTIVE);
        if (!isOwner) {
            return ResponseEntity.status(403).body(apiResponse(false, null, "Not authorized for this gym"));
        }

        // Collect target user IDs
        java.util.Set<Long> targetIds = new java.util.HashSet<>();
        if ("ALL".equals(target) || "TRAINERS".equals(target)) {
            userGymRoleRepository.findByGymGymIdAndRoleAndStatus(
                    gymId, com.gym.management.model.GymRole.TRAINER,
                    com.gym.management.model.RoleStatus.ACTIVE)
                    .forEach(ugr -> targetIds.add(ugr.getUser().getUserId()));
        }
        if ("ALL".equals(target) || "MEMBERS".equals(target)) {
            userGymRoleRepository.findByGymGymIdAndRoleAndStatus(
                    gymId, com.gym.management.model.GymRole.MEMBER,
                    com.gym.management.model.RoleStatus.ACTIVE)
                    .forEach(ugr -> targetIds.add(ugr.getUser().getUserId()));
        }

        int sent = 0;
        int failed = 0;
        for (Long recipientId : targetIds) {
            try {
                Conversation conv = chatService.getOrCreatePrivateConversation(ownerId, recipientId);
                chatService.sendMessage(conv.getConversationId(), ownerId, message, "TEXT", null, null);
                sent++;
            } catch (Exception e) {
                failed++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("sent", sent);
        result.put("failed", failed);
        result.put("total", targetIds.size());
        return ResponseEntity.ok(apiResponse(true, result, "Announcement dispatched"));
    }

    // ==================== PRESENCE ENDPOINT ====================

    @Autowired
    private com.gym.management.service.PresenceService presenceService;

    @GetMapping("/presence")
    public ResponseEntity<?> getPresence(@RequestParam List<Long> userIds) {
        Map<Long, Boolean> presence = presenceService.getPresenceMap(userIds);
        return ResponseEntity.ok(apiResponse(true, presence, null));
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
