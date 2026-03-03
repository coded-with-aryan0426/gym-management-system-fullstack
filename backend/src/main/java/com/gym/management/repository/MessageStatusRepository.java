package com.gym.management.repository;

import com.gym.management.model.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageStatusRepository extends JpaRepository<MessageStatus, MessageStatus.StatusId> {

    List<MessageStatus> findByIdMessageId(Long messageId);

    @Query("SELECT ms FROM MessageStatus ms WHERE ms.id.messageId IN :messageIds AND ms.id.userId <> :senderId")
    List<MessageStatus> findByMessageIdsAndNotSender(
            @Param("messageIds") List<Long> messageIds,
            @Param("senderId") Long senderId
    );

    /**
     * For a given conversation and viewer, return the effective delivery status of each message
     * sent by the viewer:
     *   READ     — at least one other participant has status = 'READ'
     *   DELIVERED — at least one other participant has status = 'DELIVERED' (but none READ)
     *   SENT     — only sender row exists (status = 'SENT')
     */
    @Query(
        "SELECT ms FROM MessageStatus ms " +
        "WHERE ms.id.messageId IN " +
        "  (SELECT m.messageId FROM Message m WHERE m.conversation.conversationId = :convId AND m.sender.userId = :senderId) " +
        "AND ms.id.userId <> :senderId"
    )
    List<MessageStatus> findOtherParticipantStatusesForSender(
            @Param("convId") Long conversationId,
            @Param("senderId") Long senderId
    );

    @Modifying
    @Query("UPDATE MessageStatus ms SET ms.status = 'READ' WHERE ms.id.messageId IN " +
           "(SELECT m.messageId FROM Message m WHERE m.conversation.conversationId = :convId) " +
           "AND ms.id.userId = :userId AND ms.status <> 'READ'")
    int markConversationAsRead(
            @Param("convId") Long conversationId,
            @Param("userId") Long userId
    );
}
