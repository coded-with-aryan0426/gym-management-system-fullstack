package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a Gym in the system.
 * Each gym can have multiple staff members and members.
 */
@Entity
@Table(name = "gyms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Gym {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gym_id")
    private Long gymId;

    @Column(nullable = false)
    private String name;

    private String address;

    private String city;

    private String state;

    @Column(nullable = false)
    private String country = "India";

    private String phone;

    private String email;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "subscription_plan")
    @Enumerated(EnumType.STRING)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.STARTER;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "invite_code", unique = true)
    private String inviteCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (inviteCode == null) {
            inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Convenience getters
    public Long getGymId() { return gymId; }
    public String getName() { return name; }
    public String getInviteCode() { return inviteCode; }
    public Boolean getIsPublic() { return isPublic; }
    public SubscriptionPlan getSubscriptionPlan() { return subscriptionPlan; }
}
