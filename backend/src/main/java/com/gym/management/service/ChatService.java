package com.gym.management.service;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    @Transactional
    public Conversation getOrCreatePrivateConversation(Long user1Id, Long user2Id) {
        // Check if exists
        Optional<Conversation> existing = conversationRepository.findPrivateChatBetween(user1Id, user2Id);
        if (existing.isPresent()) {
            Conversation conv = existing.get();
            // Force initialization of participants to prevent LazyInitializationException
            // in Controller
            conv.getParticipants().size();
            // Also initialize the inner User objects since DTO mapping needs them
            conv.getParticipants().forEach(p -> p.getUser().getFullName());
            return conv;
        }

        // Create new
        Conversation conversation = new Conversation();
        conversation.setType("PRIVATE");
        conversation = conversationRepository.save(conversation);

        // Add participants
        addParticipant(conversation, user1Id, "MEMBER");
        addParticipant(conversation, user2Id, "MEMBER");

        // Refresh to get the fully populated entity with participants
        // (Though technically they are in the set if addParticipant updates the set in
        // memory,
        // but simpler to just return here as addParticipant saves to repo directly)

        // Better: ensure the returned object has the participants set populate
        // addParticipant saves the participant entity, but DOES NOT add it to the
        // 'conversation' object's set in memory if not handled manually.
        // Let's re-fetch or construct simply.
        return conversationRepository.findById(conversation.getConversationId()).orElse(conversation);
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

        // Update conversation timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
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
}
