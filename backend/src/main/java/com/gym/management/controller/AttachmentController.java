package com.gym.management.controller;

import com.gym.management.model.MessageAttachment;
import com.gym.management.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    private static final long MAX_FILE_SIZE = 25L * 1024 * 1024; // 25 MB

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "conversationId", required = false) Long conversationId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "File exceeds the 25 MB limit"));
        }

        // Sanitize filename: strip path components, prefix with UUID to prevent collisions
        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload");
        // Reject any remaining path traversal attempts
        if (originalName.contains("..") || originalName.contains("/") || originalName.contains("\\")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid filename"));
        }
        String safeName = UUID.randomUUID() + "_" + originalName;

        try {
            MessageAttachment attachment = attachmentService.storeAttachment(file, conversationId, safeName);

            // If validation passes, we save (assuming nullable message)
            attachment = attachmentService.saveForLater(attachment);

            Map<String, Object> response = new HashMap<>();
            response.put("attachmentId", attachment.getAttachmentId());
            response.put("url", attachment.getFileUrl());
            response.put("fileName", attachment.getFileName());
            response.put("fileType", attachment.getFileType());
            response.put("fileSize", attachment.getFileSize());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        Path file = attachmentService.getFilePath(filename);
        try {
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = null;
                try {
                    contentType = java.nio.file.Files.probeContentType(file);
                } catch (IOException e) {
                    // Ignore, try fallback
                }

                if (contentType == null) {
                    String resFilename = resource.getFilename().toLowerCase();
                    if (resFilename.endsWith(".png"))
                        contentType = "image/png";
                    else if (resFilename.endsWith(".jpg") || resFilename.endsWith(".jpeg"))
                        contentType = "image/jpeg";
                    else if (resFilename.endsWith(".gif"))
                        contentType = "image/gif";
                    else if (resFilename.endsWith(".pdf"))
                        contentType = "application/pdf";
                    else
                        contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
