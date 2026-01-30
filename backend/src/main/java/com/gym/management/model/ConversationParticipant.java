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

    // Explicit getters and setters for Lombok compatibility
    public ParticipantId getId() { return id; }
    public void setId(ParticipantId id) { this.id = id; }
    
    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public ParticipantStatus getStatus() { return status; }
    public void setStatus(ParticipantStatus status) { this.status = status; }
    
    public Long getLastReadMessageId() { return lastReadMessageId; }
    public void setLastReadMessageId(Long lastReadMessageId) { this.lastReadMessageId = lastReadMessageId; }
    
    public Boolean getIsMuted() { return isMuted; }
    public void setIsMuted(Boolean isMuted) { this.isMuted = isMuted; }
    
    public Boolean getIsPinned() { return isPinned; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

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

        // Explicit getters and setters for Lombok compatibility
        public Long getConversationId() { return conversationId; }
        public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }
}
