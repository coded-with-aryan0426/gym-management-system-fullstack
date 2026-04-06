package com.gym.management.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public FileStorageService() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory");
        }
    }

    public String storeFile(MultipartFile file) {
        return storeFile(file, "");
    }

    public String storeFile(MultipartFile file, String subfolder) {
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        try {
            Path targetLocation = subfolder != null && !subfolder.isEmpty()
                ? this.fileStorageLocation.resolve(subfolder).resolve(fileName)
                : this.fileStorageLocation.resolve(fileName);
            Files.createDirectories(targetLocation.getParent());
            Files.copy(file.getInputStream(), targetLocation);
            return subfolder != null && !subfolder.isEmpty() ? subfolder + "/" + fileName : fileName;
        } catch (Exception ex) {
            throw new RuntimeException("Could not store file");
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (Exception ex) {
            throw new RuntimeException("Could not delete file");
        }
    }

    public org.springframework.core.io.Resource getFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName);
            if (!Files.exists(filePath)) {
                return null;
            }
            return new org.springframework.core.io.UrlResource(filePath.toUri());
        } catch (Exception ex) {
            return null;
        }
    }
}