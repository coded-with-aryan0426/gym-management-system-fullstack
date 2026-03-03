package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing a staff member's association with a gym.
 * Links users to gyms with a specific role (OWNER, ADMIN, TRAINER,
 * RECEPTIONIST).
 */
@Entity
@Table(name = "gym_staff", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "gym_id", "user_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GymStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gym_id", nullable = false)
    private Gym gym;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The role enum and column have been removed.

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StaffStatus status = StaffStatus.ACTIVE;

    @Column(name = "invited_at")
    private LocalDateTime invitedAt;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null && status == StaffStatus.ACTIVE) {
            joinedAt = LocalDateTime.now();
        }
    }

    // Convenience getters
    public Long getId() {
        return id;
    }

    public Gym getGym() {
        return gym;
    }

    public User getUser() {
        return user;
    }

    public StaffStatus getStatus() {
        return status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
