package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entity representing a member's membership at a specific gym.
 * Links users (as members/customers) to gyms with membership details.
 */
@Entity
@Table(name = "memberships", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "gym_id", "user_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "membership_id")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gym_id", nullable = false)
    private Gym gym;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private MembershipPackage membershipPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tiered_plan_id")
    private TieredMembershipPlan tieredPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_variant_id")
    private PlanVariant planVariant;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MembershipStatus status = MembershipStatus.PENDING;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_date_time")
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setGym(Gym gym) {
        this.gym = gym;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setStatus(MembershipStatus status) {
        this.status = status;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
    }

    public void setMembershipPackage(MembershipPackage membershipPackage) {
        this.membershipPackage = membershipPackage;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Gym getGym() {
        return gym;
    }

    public User getUser() {
        return user;
    }

    public MembershipStatus getStatus() {
        return status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public User getApprovedBy() {
        return approvedBy;
    }

    public MembershipPackage getMembershipPackage() {
        return membershipPackage;
    }

    public TieredMembershipPlan getTieredPlan() {
        return tieredPlan;
    }

    public void setTieredPlan(TieredMembershipPlan tieredPlan) {
        this.tieredPlan = tieredPlan;
    }

    public PlanVariant getPlanVariant() {
        return planVariant;
    }

    public void setPlanVariant(PlanVariant planVariant) {
        this.planVariant = planVariant;
    }

    public LocalDateTime getEffectiveStartDateTime() {
        if (startDateTime != null) {
            return startDateTime;
        }
        if (startDate != null) {
            return startDate.atStartOfDay();
        }
        return null;
    }

    public LocalDateTime getEffectiveEndDateTime() {
        if (endDateTime != null) {
            return endDateTime;
        }
        if (endDate != null) {
            return LocalDateTime.of(endDate, LocalTime.MAX);
        }
        return null;
    }

    // Check if membership is currently active
    public boolean isActive() {
        if (status != MembershipStatus.ACTIVE && status != MembershipStatus.EXPIRING_SOON) {
            return false;
        }
        LocalDateTime effectiveEndDateTime = getEffectiveEndDateTime();
        if (effectiveEndDateTime == null) {
            return true;
        }
        return LocalDateTime.now().isBefore(effectiveEndDateTime);
    }
}
