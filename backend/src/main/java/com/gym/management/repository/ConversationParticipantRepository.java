package com.gym.management.repository;

import com.gym.management.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConversationParticipantRepository
        extends JpaRepository<ConversationParticipant, ConversationParticipant.ParticipantId> {

    List<ConversationParticipant> findByConversationConversationId(Long conversationId);

    Optional<ConversationParticipant> findByConversationConversationIdAndUserUserId(Long conversationId, Long userId);
}
