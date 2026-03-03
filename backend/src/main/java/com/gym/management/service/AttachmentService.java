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

    /**
     * Store an attachment using the caller-supplied safe filename.
     * The controller is responsible for sanitizing the name before calling this method.
     */
    public MessageAttachment storeAttachment(MultipartFile file, Long conversationId, String safeName) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String storedFileName = safeName;
        Path targetPath = Paths.get(uploadDir, storedFileName);

        Files.copy(file.getInputStream(), targetPath);

        MessageAttachment attachment = new MessageAttachment();
        attachment.setFileName(originalFilename);
        attachment.setStoredFileName(storedFileName); // We need to add this field or use fileUrl
        attachment.setFileUrl("/api/chat/attachments/file/" + storedFileName); // Virtual URL
        attachment.setMimeType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setFileType(determineFileType(file.getContentType()));
        // Message FK is linked later when the message is actually sent.
        // The entity allows null message for pre-upload staging.
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
