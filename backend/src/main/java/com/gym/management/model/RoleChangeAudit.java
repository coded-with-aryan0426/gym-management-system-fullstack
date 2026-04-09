package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Immutable audit log for role changes.
 * Used for compliance, security tracking, and debugging.
 */
@Entity
@Table(name = "role_change_audit")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleChangeAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "gym_id")
    private Long gymId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleAction action;

    @Column(name = "old_role")
    @Enumerated(EnumType.STRING)
    private GymRole oldRole;

    @Column(name = "new_role")
    @Enumerated(EnumType.STRING)
    private GymRole newRole;

    @Column(name = "performed_by", nullable = false)
    private Long performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (performedAt == null) {
            performedAt = LocalDateTime.now();
        }
    }

    /**
     * Create an audit entry for role switch.
     */
    public static RoleChangeAudit forRoleSwitch(Long userId, Long oldRoleId, Long newRoleId,
            Long performedBy,
            String ipAddress, String userAgent) {
        RoleChangeAudit audit = new RoleChangeAudit();
        audit.setUserId(userId);
        audit.setAction(RoleAction.ROLE_SWITCHED);
        audit.setOldRole(GymRole.MEMBER);
        audit.setNewRole(GymRole.MEMBER);
        audit.setPerformedBy(performedBy);
        audit.setIpAddress(ipAddress);
        return audit;
    }

    /**
     * Create an audit entry for role grant.
     */
    public static RoleChangeAudit forRoleGrant(Long userId, GymRole role,
            Long grantedBy, String ipAddress, String notes) {
        RoleChangeAudit audit = new RoleChangeAudit();
        audit.setUserId(userId);
        audit.setAction(RoleAction.ROLE_GRANTED);
        audit.setNewRole(role);
        audit.setPerformedBy(grantedBy);
        audit.setIpAddress(ipAddress);
        audit.setNotes(notes);
        return audit;
    }

    /**
     * Create an audit entry for role revocation.
     */
    public static RoleChangeAudit forRoleRevoke(Long userId, GymRole role,
            Long revokedBy, String ipAddress, String reason) {
        RoleChangeAudit audit = new RoleChangeAudit();
        audit.setUserId(userId);
        audit.setAction(RoleAction.ROLE_REVOKED);
        audit.setOldRole(role);
        audit.setPerformedBy(revokedBy);
        audit.setIpAddress(ipAddress);
        audit.setNotes(reason);
        return audit;
    }
}
