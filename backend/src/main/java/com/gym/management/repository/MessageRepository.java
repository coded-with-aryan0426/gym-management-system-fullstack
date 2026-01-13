package com.gym.management.repository;

import com.gym.management.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
}
