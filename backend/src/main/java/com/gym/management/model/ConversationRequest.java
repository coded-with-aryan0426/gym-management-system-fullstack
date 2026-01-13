package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity for conversation request/invitation system.
 * When starting a new chat, a request is sent that the receiver can
 * accept/reject.
 * Until accepted, only basic profile info is visible.
 */
@Entity
@Table(name = "conversation_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation; // The pending conversation

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(length = 500)
    private String message; // Optional intro message with the request

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum RequestStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}
