package com.gym.management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "beta_feedback", indexes = {
    @Index(name = "idx_page_route", columnList = "page_route"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_severity", columnList = "severity"),
    @Index(name = "idx_submitted_at", columnList = "submitted_at"),
    @Index(name = "idx_tester_email", columnList = "tester_email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BetaFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tester_name", length = 255)
    private String testerName;

    @Column(name = "tester_email", length = 255, nullable = false)
    private String testerEmail;

    @Column(name = "tester_role", length = 50)
    private String testerRole; // OWNER, TRAINER, MEMBER

    @Column(name = "page_route", length = 500, nullable = false)
    private String pageRoute; // e.g., "/trainer/members"

    @Column(name = "page_title", length = 255)
    private String pageTitle; // Human-readable page name

    @Column(name = "section", length = 255)
    private String section; // Specific section within page

    @Column(name = "browser", length = 255)
    private String browser; // User agent string

    @Column(name = "screen_size", length = 50)
    private String screenSize; // e.g., "1440x900"

    @Column(name = "severity", length = 50, nullable = false)
    private String severity; // BUG, UI_ISSUE, SUGGESTION, IMPROVEMENT, QUESTION

    @Column(name = "category", length = 50)
    private String category; // UI, PERFORMANCE, LOGIC, FEATURE, SECURITY, DATA

    @Column(name = "subject", length = 500, nullable = false)
    private String subject;

    @Lob
    @Column(name = "description")
    private String description;

    @Lob
    @Column(name = "steps_to_reproduce")
    private String stepsToReproduce;

    @Column(name = "screenshot_url", length = 1000)
    private String screenshotUrl;

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "NEW"; // NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, WONT_FIX

    @Lob
    @Column(name = "admin_notes")
    private String adminNotes;

    @Column(name = "priority_score")
    @Builder.Default
    private Integer priorityScore = 0; // 0-10

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "beta_version", length = 50)
    @Builder.Default
    private String betaVersion = "1.0";

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
