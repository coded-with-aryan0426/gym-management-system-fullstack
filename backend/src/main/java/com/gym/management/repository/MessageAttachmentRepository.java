package com.gym.management.repository;

import com.gym.management.model.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {

    /**
     * Find all attachments for a message
     */
    List<MessageAttachment> findByMessageMessageId(Long messageId);

    /**
     * Find all attachments in a conversation (for media gallery)
     */
    @Query("SELECT a FROM MessageAttachment a WHERE a.message.conversation.conversationId = :conversationId " +
            "ORDER BY a.createdAt DESC")
    List<MessageAttachment> findByConversationId(@Param("conversationId") Long conversationId);

    /**
     * Find attachments by type in a conversation
     */
    @Query("SELECT a FROM MessageAttachment a WHERE a.message.conversation.conversationId = :conversationId " +
            "AND a.fileType = :fileType ORDER BY a.createdAt DESC")
    List<MessageAttachment> findByConversationIdAndType(
            @Param("conversationId") Long conversationId,
            @Param("fileType") MessageAttachment.FileType fileType);

    /**
     * Count attachments in a conversation
     */
    @Query("SELECT COUNT(a) FROM MessageAttachment a WHERE a.message.conversation.conversationId = :conversationId")
    long countByConversationId(@Param("conversationId") Long conversationId);
}
