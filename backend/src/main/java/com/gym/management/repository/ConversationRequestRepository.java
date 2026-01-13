package com.gym.management.repository;

import com.gym.management.model.ConversationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRequestRepository extends JpaRepository<ConversationRequest, Long> {

    /**
     * Find pending requests for a user (as receiver)
     */
    @Query("SELECT r FROM ConversationRequest r WHERE r.receiver.userId = :userId AND r.status = 'PENDING'")
    List<ConversationRequest> findPendingRequestsForUser(@Param("userId") Long userId);

    /**
     * Find requests sent by a user
     */
    @Query("SELECT r FROM ConversationRequest r WHERE r.sender.userId = :userId ORDER BY r.createdAt DESC")
    List<ConversationRequest> findRequestsBySender(@Param("userId") Long userId);

    /**
     * Check if a request already exists between two users (in either direction)
     */
    @Query("SELECT r FROM ConversationRequest r WHERE " +
            "((r.sender.userId = :user1Id AND r.receiver.userId = :user2Id) " +
            "OR (r.sender.userId = :user2Id AND r.receiver.userId = :user1Id)) " +
            "AND r.status = 'PENDING'")
    Optional<ConversationRequest> findPendingBetweenUsers(@Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id);

    /**
     * Find request by conversation ID
     */
    Optional<ConversationRequest> findByConversationConversationId(Long conversationId);

    /**
     * Count pending requests for a user
     */
    @Query("SELECT COUNT(r) FROM ConversationRequest r WHERE r.receiver.userId = :userId AND r.status = 'PENDING'")
    long countPendingForUser(@Param("userId") Long userId);
}
