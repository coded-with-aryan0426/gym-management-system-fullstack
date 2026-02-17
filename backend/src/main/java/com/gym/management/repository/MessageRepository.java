package com.gym.management.repository;

import com.gym.management.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Message m SET m.isDeleted = true, m.content = 'Message deleted due to retention policy' WHERE m.createdAt < :cutoffDate AND m.isDeleted = false")
    void softDeleteOlderThan(@org.springframework.data.repository.query.Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
