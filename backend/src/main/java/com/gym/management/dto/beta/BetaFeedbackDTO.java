package com.gym.management.dto.beta;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BetaFeedbackDTO {

    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Tester name is required")
    private String testerName;

    @NotBlank(message = "Tester email is required")
    @Email(message = "Invalid email format")
    private String testerEmail;

    @NotBlank(message = "Tester role is required")
    private String testerRole; // OWNER, TRAINER, MEMBER

    @NotBlank(message = "Page route is required")
    @Size(max = 500, message = "Page route cannot exceed 500 characters")
    private String pageRoute;

    @Size(max = 255, message = "Page title cannot exceed 255 characters")
    private String pageTitle;

    @Size(max = 255, message = "Section cannot exceed 255 characters")
    private String section;

    @Size(max = 255, message = "Browser cannot exceed 255 characters")
    private String browser;

    @Size(max = 50, message = "Screen size cannot exceed 50 characters")
    private String screenSize;

    @NotBlank(message = "Severity is required")
    private String severity; // BUG, UI_ISSUE, SUGGESTION, IMPROVEMENT, QUESTION

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category; // UI, PERFORMANCE, LOGIC, FEATURE, SECURITY, DATA

    @NotBlank(message = "Subject is required")
    @Size(max = 500, message = "Subject cannot exceed 500 characters")
    private String subject;

    @Size(max = 10000, message = "Description is too long")
    private String description;

    @Size(max = 10000, message = "Steps to reproduce is too long")
    private String stepsToReproduce;

    @Size(max = 1000, message = "Screenshot URL cannot exceed 1000 characters")
    private String screenshotUrl;

    private String status; // NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, WONT_FIX

    private String adminNotes;

    private Integer priorityScore; // 0-10

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submittedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime resolvedAt;

    @Size(max = 100, message = "Session ID cannot exceed 100 characters")
    private String sessionId;

    private String betaVersion;
}
