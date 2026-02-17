package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_edit_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageEditHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @Lob
    @Column(name = "previous_content", nullable = false)
    private String previousContent;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @PrePersist
    protected void onCreate() {
        editedAt = LocalDateTime.now();
    }
}
