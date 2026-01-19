package com.gym.management.repository;

import com.gym.management.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    Optional<MessageReaction> findByMessageMessageIdAndUserUserIdAndEmoji(Long messageId, Long userId, String emoji);
    void deleteByMessageMessageIdAndUserUserIdAndEmoji(Long messageId, Long userId, String emoji);
}
