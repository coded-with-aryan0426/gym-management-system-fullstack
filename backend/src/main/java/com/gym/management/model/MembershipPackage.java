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
@Table(name = "membership_packages", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"package_name", "duration_days"}, name = "uk_membership_package_name_duration")
})
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

    @Column(name = "duration_months")
    private Integer durationMonths;

    @Column(name = "included_pt_sessions")
    private Integer includedPTSessions;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "plan_color", length = 7)
    private String planColor;

    @Column(name = "minimum_age")
    private Integer minimumAge = 16;

    @Column(name = "maximum_age")
    private Integer maximumAge;

    @Column(name = "requires_parental_consent_under")
    private Integer requiresParentalConsentUnder = 18;

    @Column(name = "age_verification_required")
    private Boolean ageVerificationRequired = false;

    @PrePersist
    protected void onCreate() {
        if (includedPTSessions == null) {
            includedPTSessions = 0;
        }
        if (isActive == null) {
            isActive = true;
        }
    }

    public String getPlanColor() { return planColor; }
    public void setPlanColor(String planColor) { this.planColor = planColor; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    public Integer getDurationDays() { return durationDays; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }

    public Integer getMinimumAge() { return minimumAge; }
    public void setMinimumAge(Integer minimumAge) { this.minimumAge = minimumAge; }

    public Integer getMaximumAge() { return maximumAge; }
    public void setMaximumAge(Integer maximumAge) { this.maximumAge = maximumAge; }

    public Integer getRequiresParentalConsentUnder() { return requiresParentalConsentUnder; }
    public void setRequiresParentalConsentUnder(Integer requiresParentalConsentUnder) { this.requiresParentalConsentUnder = requiresParentalConsentUnder; }

    public Boolean getAgeVerificationRequired() { return ageVerificationRequired; }
    public void setAgeVerificationRequired(Boolean ageVerificationRequired) { this.ageVerificationRequired = ageVerificationRequired; }
}
