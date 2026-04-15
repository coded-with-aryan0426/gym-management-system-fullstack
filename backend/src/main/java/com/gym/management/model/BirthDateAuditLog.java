package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "birth_date_audit_log")
@Data
@NoArgsConstructor
public class BirthDateAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long auditId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "old_date_of_birth")
    private LocalDate oldDateOfBirth;

    @Column(name = "new_date_of_birth")
    private LocalDate newDateOfBirth;

    @Column(name = "changed_by", nullable = false)
    private Long changedBy;

    @Column(name = "change_reason")
    private String changeReason;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
