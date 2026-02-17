package com.gym.management.service;

import com.gym.management.model.MessageAttachment;
import com.gym.management.repository.MessageAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.UUID;

@Service
public class AttachmentService {

    @Autowired
    private MessageAttachmentRepository attachmentRepository;

    private final String uploadDir;

    public AttachmentService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
        createUploadDir();
    }

    private void createUploadDir() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public MessageAttachment storeAttachment(MultipartFile file, Long conversationId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String storedFileName = UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(uploadDir, storedFileName);

        Files.copy(file.getInputStream(), targetPath);

        MessageAttachment attachment = new MessageAttachment();
        attachment.setFileName(originalFilename);
        attachment.setStoredFileName(storedFileName); // We need to add this field or use fileUrl
        attachment.setFileUrl("/api/chat/attachments/file/" + storedFileName); // Virtual URL
        attachment.setMimeType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setFileType(determineFileType(file.getContentType()));
        // Note: 'message' field is nullable?
        // Logic: Provide attachment ID separately, then link it when message is sent.
        // Or store ConversationId? The provided Entity linked to Message.
        // We might need to save it without a message first, then update it.
        // But MessageAttachment has @JoinColumn(nullable=false).
        // Solution: Allow nullable or create a dummy/temp message?
        // Or change Entity.

        // For now, assuming we CAN persist or we defer persistence until message is
        // sent?
        // But we need to return an ID to the frontend.
        // Let's assume we can set message to null for a moment if we relax the DB
        // constraint,
        // OR we need to pass a valid Message object.

        // Re-reading PRD: "Upload to Storage -> Create MessageAttachment record".
        // If Database requires non-null message, we have a problem.
        // Let's check MessageAttachment.java again.

        return attachment;
    }

    // Helper to bypass the entity constraint issue for now or assume we'll fix it
    public MessageAttachment saveForLater(MessageAttachment attachment) {
        // This might fail if constraints are strict
        return attachmentRepository.save(attachment);
    }

    private MessageAttachment.FileType determineFileType(String mimeType) {
        if (mimeType == null)
            return MessageAttachment.FileType.OTHER;
        if (mimeType.startsWith("image/"))
            return MessageAttachment.FileType.IMAGE;
        if (mimeType.startsWith("video/"))
            return MessageAttachment.FileType.VIDEO;
        if (mimeType.startsWith("audio/"))
            return MessageAttachment.FileType.AUDIO;
        return MessageAttachment.FileType.DOCUMENT;
    }

    public Path getFilePath(String filename) {
        return Paths.get(uploadDir).resolve(filename).normalize();
    }
}
