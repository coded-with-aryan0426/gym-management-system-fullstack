package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity for message attachments (files, images, voice notes, etc.)
 */
@Entity
@Table(name = "message_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Long attachmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = true) // Changed to nullable
    private Message message;

    @Column(name = "stored_file_name", length = 255)
    private String storedFileName;

    @Column(name = "file_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize; // In bytes

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl; // For images/videos

    @Column(name = "duration")
    private Integer duration; // In seconds, for voice/video

    @Column(name = "width")
    private Integer width; // For images/videos

    @Column(name = "height")
    private Integer height; // For images/videos

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum FileType {
        IMAGE,
        VIDEO,
        DOCUMENT,
        VOICE_NOTE,
        AUDIO,
        OTHER
    }
}
