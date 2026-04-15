package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "parental_consent")
@Data
@NoArgsConstructor
public class ParentalConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consent_id")
    private Long consentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "guardian_name", nullable = false)
    private String guardianName;

    @Column(name = "guardian_email", nullable = false)
    private String guardianEmail;

    @Column(name = "guardian_phone")
    private String guardianPhone;

    @Column(name = "guardian_relation", nullable = false)
    private String guardianRelation;

    @Column(name = "guardian_id_document_id")
    private Long guardianIdDocumentId;

    @Column(name = "consent_status")
    private String consentStatus = "PENDING";

    @Column(name = "consent_given_at")
    private LocalDateTime consentGivenAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (verificationToken == null) {
            verificationToken = UUID.randomUUID().toString();
        }
        if (consentStatus == null) {
            consentStatus = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return "APPROVED".equals(consentStatus) && !isExpired();
    }

    public boolean isPending() {
        return "PENDING".equals(consentStatus);
    }

    public boolean isApproved() {
        return "APPROVED".equals(consentStatus) && !isExpired();
    }
}
