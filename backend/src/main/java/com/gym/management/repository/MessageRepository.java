package com.gym.management.repository;

import com.gym.management.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    // Get the single most recent message in a conversation (for lastMessage preview)
    java.util.Optional<Message> findTopByConversationConversationIdOrderByCreatedAtDesc(Long conversationId);

    // Count messages after the user's lastReadMessageId in this conversation (true unread count)
    // Falls back to counting all non-self messages if lastReadMessageId is null
    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(m) FROM Message m WHERE m.conversation.conversationId = :convId " +
        "AND (m.sender IS NULL OR m.sender.userId <> :userId) AND m.isDeleted = false " +
        "AND (:lastReadId IS NULL OR m.messageId > :lastReadId)"
    )
    long countUnreadForUser(
        @org.springframework.data.repository.query.Param("convId") Long conversationId,
        @org.springframework.data.repository.query.Param("userId") Long userId,
        @org.springframework.data.repository.query.Param("lastReadId") Long lastReadMessageId
    );

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Message m SET m.isDeleted = true, m.content = 'Message deleted due to retention policy' WHERE m.createdAt < :cutoffDate AND m.isDeleted = false")
    void softDeleteOlderThan(@org.springframework.data.repository.query.Param("cutoffDate") java.time.LocalDateTime cutoffDate);

    // Full-text search within a conversation (case-insensitive LIKE)
    @org.springframework.data.jpa.repository.Query(
        "SELECT m FROM Message m WHERE m.conversation.conversationId = :convId " +
        "AND m.isDeleted = false AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "ORDER BY m.createdAt DESC"
    )
    Page<Message> searchByContent(
        @org.springframework.data.repository.query.Param("convId") Long conversationId,
        @org.springframework.data.repository.query.Param("query") String query,
        Pageable pageable
    );
}
