package com.gym.management.service;

import com.gym.management.model.OtpCode;
import com.gym.management.model.OtpChannel;
import com.gym.management.model.OtpPurpose;
import com.gym.management.model.User;
import com.gym.management.repository.OtpCodeRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for generating and verifying OTPs across multiple channels.
 * Supports EMAIL, SMS, and WhatsApp delivery.
 */
@Service
public class OtpService {

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private SmsService smsService;

    @Value("${spring.mail.username:noreply@athlonx.com}")
    private String fromEmail;

    @Value("${otp.expiry.minutes:10}")
    private int otpExpiryMinutes;

    @Value("${otp.max.attempts:5}")
    private int maxAttempts;

    private final SecureRandom random = new SecureRandom();

    /**
     * Generate and send OTP to target via specified channel.
     */
    @Transactional
    public boolean sendOtp(String target, OtpChannel channel) {
        // Rate limiting: max 5 OTPs per hour
        if (otpCodeRepository.countRecentOtps(target) >= 5) {
            return false;
        }

        // Invalidate existing OTPs for this target
        otpCodeRepository.findByTargetAndTargetTypeAndVerifiedFalse(target, channel)
                .forEach(otp -> {
                    otp.setVerified(true); // Mark as used
                    otpCodeRepository.save(otp);
                });

        // Generate 6-digit OTP
        String code = generateOtp();

        // Create OTP record
        OtpCode otpCode = OtpCode.create(target, channel, code);
        otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));

        // Link to user if exists
        Optional<User> user = findUserByTarget(target, channel);
        user.ifPresent(otpCode::setUser);

        otpCodeRepository.save(otpCode);

        // Send OTP via appropriate channel
        return switch (channel) {
            case EMAIL -> sendEmailOtp(target, code);
            case SMS -> sendSmsOtp(target, code);
            case WHATSAPP -> sendWhatsAppOtp(target, code);
        };
    }

    /**
     * Verify OTP for a target.
     */
    @Transactional
    public VerifyResult verifyOtp(String target, OtpChannel channel, String code) {
        Optional<OtpCode> otpOpt = otpCodeRepository.findLatestValidOtp(target, channel);

        if (otpOpt.isEmpty()) {
            return new VerifyResult(false, "No valid OTP found. Please request a new one.");
        }

        OtpCode otp = otpOpt.get();

        if (otp.isExpired()) {
            return new VerifyResult(false, "OTP has expired. Please request a new one.");
        }

        if (otp.getAttempts() >= maxAttempts) {
            return new VerifyResult(false, "Too many attempts. Please request a new OTP.");
        }

        otp.incrementAttempts();
        otpCodeRepository.save(otp);

        if (!otp.getOtpCode().equals(code)) {
            int remaining = maxAttempts - otp.getAttempts();
            return new VerifyResult(false, "Invalid OTP. " + remaining + " attempts remaining.");
        }

        // Success - mark as verified
        otp.markVerified();
        otpCodeRepository.save(otp);

        return new VerifyResult(true, "OTP verified successfully.");
    }

    private String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private Optional<User> findUserByTarget(String target, OtpChannel channel) {
        if (channel == OtpChannel.EMAIL) {
            return userRepository.findByEmail(target);
        } else {
            return userRepository.findByPhoneNumber(target);
        }
    }

    private boolean sendEmailOtp(String email, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Your AthlonX Verification Code");
            message.setText(
                    "Your verification code is: " + code + "\n\n" +
                            "This code will expire in " + otpExpiryMinutes + " minutes.\n\n" +
                            "If you didn't request this code, please ignore this email.\n\n" +
                            "- AthlonX Team");
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send email OTP: " + e.getMessage());
            return false;
        }
    }

    private boolean sendSmsOtp(String phone, String code) {
        if (smsService == null) {
            System.err.println("SMS service not configured");
            return false;
        }
        return smsService.sendSms(phone, "Your AthlonX code is: " + code);
    }

    private boolean sendWhatsAppOtp(String phone, String code) {
        if (smsService == null) {
            System.err.println("SMS service not configured");
            return false;
        }
        return smsService.sendWhatsApp(phone, "Your AthlonX verification code is: " + code);
    }

    /**
     * Result record for OTP verification.
     */
    public record VerifyResult(boolean success, String message) {
    }

    // ============================================
    // LEGACY METHODS FOR BACKWARD COMPATIBILITY
    // Used by existing AuthController
    // ============================================

    /**
     * Legacy method: Generate and send OTP for signup/login/password reset.
     */
    public boolean generateAndSendOtp(String email, OtpPurpose purpose) {
        return sendOtp(email, OtpChannel.EMAIL);
    }

    /**
     * Legacy method: Verify OTP with purpose (maps to channel-based verification).
     */
    public boolean verifyOtp(String email, String code, OtpPurpose purpose) {
        VerifyResult result = verifyOtp(email, OtpChannel.EMAIL, code);
        return result.success();
    }
}
