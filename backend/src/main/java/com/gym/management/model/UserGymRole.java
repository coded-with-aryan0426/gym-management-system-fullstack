package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing a user's role at a specific gym.
 * This is the central table for gym-scoped role assignments.
 * One user can have multiple roles at different gyms.
 */
@Entity
@Table(name = "user_gym_roles", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "gym_id", "role" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGymRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id", nullable = false)
    private Gym gym;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private GymRole role;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleStatus status = RoleStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "granted_by")
    private User grantedBy;

    @Column(name = "granted_at")
    private LocalDateTime grantedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (grantedAt == null) {
            grantedAt = LocalDateTime.now();
        }
    }

    /**
     * Check if this role is currently active and not expired.
     */
    public boolean isActiveAndValid() {
        if (status != RoleStatus.ACTIVE) {
            return false;
        }
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            return false;
        }
        return true;
    }
}
