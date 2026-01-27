package com.gym.management.model;

import org.hibernate.annotations.SQLRestriction;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@SQLRestriction("is_deleted = 0")
@Data
@NoArgsConstructor
public class User {

    // Manual getters and setters for compilation
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<User> getCustomers() {
        return customers;
    }

    public void setCustomers(Set<User> customers) {
        this.customers = customers;
    }

    public Set<User> getTrainers() {
        return trainers;
    }

    public void setTrainers(Set<User> trainers) {
        this.trainers = trainers;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String email;

    private String phone;

    // Avatar ID for persistent avatar selection (nullable - uses initials if null)
    @Column(name = "avatar_id")
    private String avatarId;

    // Social login fields
    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "facebook_id", unique = true)
    private String facebookId;

    @Column(name = "phone_number", unique = true)
    private String phoneNumberPersisted;

    @Column(name = "auth_provider")
    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "account_non_locked")
    private Boolean accountNonLocked = true;

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getFacebookId() {
        return facebookId;
    }

    public void setFacebookId(String facebookId) {
        this.facebookId = facebookId;
    }

    public String getPhoneNumberPersisted() {
        return phoneNumberPersisted;
    }

    public void setPhoneNumberPersisted(String phoneNumberPersisted) {
        this.phoneNumberPersisted = phoneNumberPersisted;
    }

    public AuthProvider getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }

    public Boolean getAccountNonLocked() {
        return accountNonLocked;
    }

    public void setAccountNonLocked(Boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(String avatarId) {
        this.avatarId = avatarId;
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Staff leaving date (when they left the gym) - nullable
    @Column(name = "leaving_date")
    private java.time.LocalDate leavingDate;

    // Staff status: Active, On Leave, Inactive, Left
    @Column(name = "status")
    private String status;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "Active";
        }
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDate getLeavingDate() {
        return leavingDate;
    }

    public void setLeavingDate(java.time.LocalDate leavingDate) {
        this.leavingDate = leavingDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Column(name = "is_first_login")
    private Boolean isFirstLogin = true;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @Column(name = "created_by")
    private Long createdBy;

    public Boolean getIsFirstLogin() {
        return isFirstLogin;
    }

    public void setIsFirstLogin(Boolean isFirstLogin) {
        this.isFirstLogin = isFirstLogin;
    }

    public LocalDateTime getPasswordChangedAt() {
        return passwordChangedAt;
    }

    public void setPasswordChangedAt(LocalDateTime passwordChangedAt) {
        this.passwordChangedAt = passwordChangedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    @Column(name = "updated_by")
    private Long updatedBy;

    @Version
    private Long version;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "blood_type")
    private String bloodType;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "health_notes", columnDefinition = "TEXT")
    private String healthNotes;

    @Column(name = "fitness_goals", columnDefinition = "TEXT")
    private String fitnessGoals;

    @Column(name = "height", precision = 5, scale = 2)
    private BigDecimal height;

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "body_fat", precision = 4, scale = 2)
    private BigDecimal bodyFat;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_role_map", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "trainer_customer_map", joinColumns = @JoinColumn(name = "trainer_user_id"), inverseJoinColumns = @JoinColumn(name = "customer_user_id"))
    private Set<User> customers = new HashSet<>();

    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToMany(mappedBy = "customers", fetch = FetchType.EAGER)
    private Set<User> trainers = new HashSet<>();

    // Multi-role support fields
    @Transient
    private GymRole primaryRole;

    @Transient
    private java.util.Set<Permission> permissions;

    @Transient
    private java.util.Set<GymRole> allRoles;

    @Transient
    private java.util.Map<Long, java.util.Set<GymRole>> rolesByGym;

    // Transient fields for membership creation (not persisted)
    @Transient
    private Long packageId;

    @Transient
    private java.time.LocalDate startDate;

    @Transient
    private Integer duration;

    @Transient
    private String phoneNumber; // Maps to phone field

    @Transient
    private java.time.LocalDate joinDate;

    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public java.time.LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(java.time.LocalDate startDate) {
        this.startDate = startDate;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
        this.phone = phoneNumber;
    }

    public java.time.LocalDate getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(java.time.LocalDate joinDate) {
        this.joinDate = joinDate;
    }

    public void setAllRoles(java.util.Set<GymRole> allRoles) {
        this.allRoles = allRoles;
    }

    public void setPermissions(java.util.Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public void setRolesByGym(java.util.Map<Long, java.util.Set<GymRole>> rolesByGym) {
        this.rolesByGym = rolesByGym;
    }

    public void setPrimaryRole(GymRole primaryRole) {
        this.primaryRole = primaryRole;
    }
}
