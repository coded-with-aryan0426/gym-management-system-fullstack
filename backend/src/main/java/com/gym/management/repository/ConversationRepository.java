package com.gym.management.repository;

import com.gym.management.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.user.userId = :userId ORDER BY c.updatedAt DESC")
    Page<Conversation> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 " +
            "WHERE c.type = 'PRIVATE' AND p1.user.userId = :user1Id AND p2.user.userId = :user2Id")
    Optional<Conversation> findPrivateChatBetween(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}
