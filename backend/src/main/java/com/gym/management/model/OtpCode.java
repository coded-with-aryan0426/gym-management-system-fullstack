package com.gym.management.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity for storing OTP codes for multi-channel verification.
 * Supports EMAIL, SMS, and WhatsApp OTP delivery.
 */
@Entity
@Table(name = "otp_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String target; // Email address or phone number

    @Column(name = "target_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private OtpChannel targetType;

    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(nullable = false)
    private Integer attempts = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expiresAt == null) {
            expiresAt = createdAt.plusMinutes(10); // 10-minute expiry
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !verified && !isExpired() && attempts < 5;
    }

    public void incrementAttempts() {
        this.attempts++;
    }

    public void markVerified() {
        this.verified = true;
    }

    // Static factory for creating OTP
    public static OtpCode create(String target, OtpChannel channel, String code) {
        OtpCode otp = new OtpCode();
        otp.setTarget(target);
        otp.setTargetType(channel);
        otp.setOtpCode(code);
        return otp;
    }
}
