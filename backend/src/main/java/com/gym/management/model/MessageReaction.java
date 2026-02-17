package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_reactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"message_id", "user_id", "emoji"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id")
    private Long reactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String emoji;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Explicit getters and setters for Lombok compatibility
    public Long getReactionId() { return reactionId; }
    public void setReactionId(Long reactionId) { this.reactionId = reactionId; }
    
    public Message getMessage() { return message; }
    public void setMessage(Message message) { this.message = message; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
