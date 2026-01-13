package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.io.Serializable;

@Entity
@Table(name = "conversation_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationParticipant {

    @EmbeddedId
    private ParticipantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("conversationId")
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    private String role; // 'ADMIN', 'MEMBER'

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ParticipantStatus status = ParticipantStatus.ACTIVE;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;

    @Column(name = "is_muted")
    private Boolean isMuted = false;

    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    public enum ParticipantStatus {
        PENDING, // Awaiting acceptance
        ACTIVE, // Normal active participant
        LEFT, // User left the conversation
        BLOCKED // User blocked from this conversation
    }

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantId implements Serializable {
        private Long conversationId;
        private Long userId;
    }
}
