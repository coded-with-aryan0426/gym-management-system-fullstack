package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Entity representing a membership package offering
 * Maps to membership_packages table in the database
 */
@Entity
@Table(name = "membership_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id")
    private Long packageId;

    @Column(name = "package_name", nullable = false, length = 100)
    private String packageName;

    @Column(nullable = false)
    private Double price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "included_pt_sessions")
    private Integer includedPTSessions;

    @Column(name = "is_active")
    private Boolean isActive;

    @PrePersist
    protected void onCreate() {
        if (includedPTSessions == null) {
            includedPTSessions = 0;
        }
        if (isActive == null) {
            isActive = true;
        }
    }
}
