package com.gym.management.service;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageReactionRepository messageReactionRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationRequestRepository conversationRequestRepository;

    @Autowired
    private MessageAttachmentRepository messageAttachmentRepository;

    @Autowired
    private MessageStatusRepository messageStatusRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Transactional
    public Conversation getOrCreatePrivateConversation(Long user1Id, Long user2Id) {
        // Check if exists
        Optional<Conversation> existing = conversationRepository.findPrivateChatBetween(user1Id, user2Id);
        if (existing.isPresent()) {
            Conversation conv = existing.get();
            conv.getParticipants().size(); // Force init
            conv.getParticipants().forEach(p -> p.getUser().getFullName());
            return conv;
        }

        // Check if creation is allowed without request (e.g. Trainer -> Assigned
        // Member)
        User user1 = userRepository.findById(user1Id).orElseThrow(() -> new RuntimeException("User 1 not found"));
        User user2 = userRepository.findById(user2Id).orElseThrow(() -> new RuntimeException("User 2 not found"));

        boolean isDirectAccess = isTrainerOf(user1, user2) || isTrainerOf(user2, user1)
                || isOwnerOf(user1, user2) || isOwnerOf(user2, user1);

        if (!isDirectAccess) {
            // If not direct access, we strictly require a conversation to ALREADY exist
            // (which we checked above)
            // or this method call is result of an ACCEPTED request.
            // But if we are here, it means NO conversation exists.
            // So we must check if this is being called from "acceptRequest" context or
            // generic "start chat" context.
            // Ideally, "acceptRequest" calls a specialized create method.
            // But to keep it simple: "startPrivateChat" controller should handle the
            // "Request" flow.
            // If we reach here, it implies we are trying to force create it.

            // We throw exception to tell Controller "Hey, send a request first"
            throw new IllegalStateException("CHAT_REQUEST_REQUIRED");
        }

        return createNewPrivateConversation(user1, user2);
    }

    @Transactional
    public Conversation createNewPrivateConversation(User user1, User user2) {
        // Create new
        Conversation conversation = new Conversation();
        conversation.setType("PRIVATE");
        conversation = conversationRepository.save(conversation);

        // Add participants
        addParticipant(conversation, user1.getUserId(), "MEMBER");
        addParticipant(conversation, user2.getUserId(), "MEMBER");

        // Re-fetch with participants and initialize User data to prevent lazy loading
        // issues
        Conversation result = conversationRepository.findById(conversation.getConversationId()).orElse(conversation);
        result.getParticipants().size(); // Force initialization
        result.getParticipants().forEach(p -> {
            p.getUser().getFullName(); // Initialize User proxy
            p.getUser().getUsername();
        });
        return result;
    }

    @Transactional
    public ConversationRequest createRequest(Long senderId, Long receiverId) {
        // Validate users
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Check if already connected or pending
        Optional<Conversation> existingChat = conversationRepository.findPrivateChatBetween(senderId, receiverId);
        if (existingChat.isPresent()) {
            throw new IllegalStateException("CONVERSATION_ALREADY_EXISTS");
        }

        Optional<ConversationRequest> existingReq = conversationRequestRepository.findPendingBetweenUsers(senderId,
                receiverId);
        if (existingReq.isPresent()) {
            throw new IllegalStateException("REQUEST_ALREADY_PENDING");
        }

        // Create Request
        ConversationRequest request = new ConversationRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(ConversationRequest.RequestStatus.PENDING);

        return conversationRequestRepository.save(request);
    }

    @Transactional
    public Conversation acceptRequest(Long requestId, Long userId) {
        ConversationRequest request = conversationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to accept this request");
        }

        if (request.getStatus() != ConversationRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not PENDING");
        }

        // Create conversation
        Conversation conv = createNewPrivateConversation(request.getSender(), request.getReceiver());

        // Update request
        request.setStatus(ConversationRequest.RequestStatus.ACCEPTED);
        request.setConversation(conv);
        request.setRespondedAt(LocalDateTime.now());
        conversationRequestRepository.save(request);

        return conv;
    }

    private boolean isTrainerOf(User trainer, User customer) {
        // Use native SQL to avoid Oracle lazy-load issues with trainer.getCustomers()
        return userRepository.countAssignment(trainer.getUserId(), customer.getUserId()) > 0;
    }

    private boolean isOwnerOf(User owner, User target) {
        // Check if owner is an OWNER role in the same gym as target via user_gym_roles
        return userRepository.countOwnerOfTarget(owner.getUserId(), target.getUserId()) > 0;
    }

    @Transactional
    public Message sendMessage(Long conversationId, Long senderId, String content, String type, String payload) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User sender = null;
        if (senderId != null) { // Null for System/AI
            sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setContentType(type != null ? type : "TEXT");
        message.setPayload(payload);

        message = messageRepository.save(message);
        final Message finalMessage = message;

        // Populate MessageStatus rows:
        // - SENT row for the sender
        // - DELIVERED row for every other participant (they receive it via WebSocket)
        if (sender != null) {
            MessageStatus sentStatus = new MessageStatus();
            sentStatus.setId(new MessageStatus.StatusId(finalMessage.getMessageId(), sender.getUserId()));
            sentStatus.setMessage(finalMessage);
            sentStatus.setUser(sender);
            sentStatus.setStatus("SENT");
            messageStatusRepository.save(sentStatus);

            List<ConversationParticipant> participants = participantRepository
                    .findByConversationIdWithUser(conversation.getConversationId());
            for (ConversationParticipant p : participants) {
                if (!p.getUser().getUserId().equals(sender.getUserId())) {
                    MessageStatus deliveredStatus = new MessageStatus();
                    deliveredStatus.setId(new MessageStatus.StatusId(finalMessage.getMessageId(), p.getUser().getUserId()));
                    deliveredStatus.setMessage(finalMessage);
                    deliveredStatus.setUser(p.getUser());
                    deliveredStatus.setStatus("DELIVERED");
                    messageStatusRepository.save(deliveredStatus);
                }
            }
        }

        // Link attachment if present in payload
        if (payload != null
                && (type.equals("IMAGE") || type.equals("VOICE_NOTE") || type.equals("FILE") || type.equals("VIDEO"))) {
            try {
                com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(payload);
                if (node.has("attachmentId")) {
                    Long attachmentId = node.get("attachmentId").asLong();
                    messageAttachmentRepository.findById(attachmentId).ifPresent(attachment -> {
                        attachment.setMessage(finalMessage);
                        messageAttachmentRepository.save(attachment);
                    });
                }
            } catch (Exception e) {
                // Log warning but allow message to proceed
                System.err.println("Failed to link attachment to message: " + e.getMessage());
            }
        }

        // Update conversation timestamp and last_message_id (D5)
        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setLastMessageId(message.getMessageId());
        conversationRepository.save(conversation);

        return message;
    }

    @Transactional(readOnly = true)
    public Page<Conversation> getUserConversations(Long userId, Pageable pageable) {
        Page<Conversation> conversations = conversationRepository.findByUserId(userId, pageable);
        conversations.forEach(c -> {
            c.getParticipants().size(); // Initialize
            c.getParticipants().forEach(p -> p.getUser().getFullName()); // Initialize users
        });
        return conversations;
    }

    @Transactional(readOnly = true)
    public Page<Message> getConversationMessages(Long conversationId, Pageable pageable) {
        Page<Message> messages = messageRepository.findByConversationConversationIdOrderByCreatedAtDesc(conversationId,
                pageable);
        messages.forEach(m -> {
            if (m.getSender() != null) {
                m.getSender().getFullName(); // Initialize sender proxy
            }
            // Initialize collections
            m.getEditHistory().size();
            m.getReactions().size();
        });
        return messages;
    }

    private void addParticipant(Conversation conversation, Long userId, String role) {
        User user = userRepository.findById(userId).orElseThrow();
        ConversationParticipant participant = new ConversationParticipant();
        participant.setId(new ConversationParticipant.ParticipantId(conversation.getConversationId(), userId));
        participant.setConversation(conversation);
        participant.setUser(user);
        participant.setRole(role);
        participantRepository.save(participant);
    }

    @Transactional(readOnly = true)
    public java.util.List<ConversationRequest> getPendingRequests(Long userId) {
        return conversationRequestRepository.findPendingRequestsForUser(userId);
    }

    @Transactional
    public void rejectRequest(Long requestId, Long userId) {
        ConversationRequest request = conversationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to reject this request");
        }

        request.setStatus(ConversationRequest.RequestStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());
        conversationRequestRepository.save(request);
    }

    @Transactional
    public Message editMessage(Long messageId, Long userId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to edit this message");
        }

        if (message.getIsDeleted()) {
            throw new RuntimeException("Cannot edit deleted message");
        }

        // Save history
        MessageEditHistory history = new MessageEditHistory();
        history.setMessage(message);
        history.setPreviousContent(message.getContent());
        message.getEditHistory().add(history);

        // Update content
        message.setContent(newContent);
        message = messageRepository.save(message);

        // Broadcast update
        java.util.Map<String, Object> event = new java.util.HashMap<>();
        event.put("type", "MESSAGE_EDIT");
        event.put("messageId", messageId);
        event.put("content", newContent);
        event.put("conversationId", message.getConversation().getConversationId());

        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getConversationId(), event);

        return message;
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this message");
        }

        message.setIsDeleted(true);
        message.setContent("This message was deleted");
        messageRepository.save(message);

        // Broadcast delete
        java.util.Map<String, Object> event = new java.util.HashMap<>();
        event.put("type", "MESSAGE_DELETE");
        event.put("messageId", messageId);
        event.put("conversationId", message.getConversation().getConversationId());

        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getConversationId(), event);
    }

    @Transactional
    public void reactToMessage(Long messageId, Long userId, String emoji) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<MessageReaction> existing = messageReactionRepository
                .findByMessageMessageIdAndUserUserIdAndEmoji(messageId, userId, emoji);
        if (existing.isPresent()) {
            return; // Already reacted
        }

        MessageReaction reaction = new MessageReaction();
        reaction.setMessage(message);
        reaction.setUser(user);
        reaction.setEmoji(emoji);
        messageReactionRepository.save(reaction);

        // Broadcast reaction
        java.util.Map<String, Object> event = new java.util.HashMap<>();
        event.put("type", "REACTION_ADD");
        event.put("messageId", messageId);
        event.put("userId", userId);
        event.put("emoji", emoji);
        event.put("conversationId", message.getConversation().getConversationId());

        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getConversationId(), event);
    }

    @Transactional
    public void removeReaction(Long messageId, Long userId, String emoji) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        messageReactionRepository.deleteByMessageMessageIdAndUserUserIdAndEmoji(messageId, userId, emoji);

        // Broadcast reaction remove
        java.util.Map<String, Object> event = new java.util.HashMap<>();
        event.put("type", "REACTION_REMOVE");
        event.put("messageId", messageId);
        event.put("userId", userId);
        event.put("emoji", emoji);
        event.put("conversationId", message.getConversation().getConversationId());

        messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversation().getConversationId(), event);
    }

    /**
     * Mark all messages in a conversation as READ for the given user.
     * Updates MessageStatus rows to READ and advances lastReadMessageId on the participant.
     */
    @Transactional
    public void markConversationAsRead(Long conversationId, Long userId) {
        // Update message_status rows for this user in this conversation
        messageStatusRepository.markConversationAsRead(conversationId, userId);

        // Advance lastReadMessageId to the latest message
        messageRepository.findTopByConversationConversationIdOrderByCreatedAtDesc(conversationId)
                .ifPresent(lastMsg -> {
                    ConversationParticipant participant = participantRepository
                            .findById(new ConversationParticipant.ParticipantId(conversationId, userId))
                            .orElse(null);
                    if (participant != null) {
                        participant.setLastReadMessageId(lastMsg.getMessageId());
                        participantRepository.save(participant);
                    }
                });

        // Notify other participants that their messages were read (updates their tick UI)
        java.util.Map<String, Object> event = new java.util.HashMap<>();
        event.put("type", "MESSAGES_READ");
        event.put("conversationId", conversationId);
        event.put("readByUserId", userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, event);
    }
}
