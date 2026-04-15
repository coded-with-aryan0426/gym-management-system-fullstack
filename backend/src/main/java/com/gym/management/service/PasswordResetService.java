package com.gym.management.service;

import com.gym.management.model.PasswordResetToken;
import com.gym.management.model.User;
import com.gym.management.repository.PasswordResetTokenRepository;
import com.gym.management.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Value("${password.reset.token.expiry.minutes:15}")
    private int resetTokenExpiryMinutes;

    @Value("${password.reset.max.requests.per.hour.ip:10}")
    private int maxRequestsPerHourPerIp;

    @Value("${password.reset.max.requests.per.hour.user:5}")
    private int maxRequestsPerHourPerUser;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public TokenValidationResult issueResetTokenForVerifiedOtp(String email, HttpServletRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return TokenValidationResult.invalid("User not found");
        }

        User user = userOpt.get();
        String clientIp = getClientIp(request);
        LocalDateTime windowStart = LocalDateTime.now().minusHours(1);

        if (clientIp != null
                && passwordResetTokenRepository.countByRequestedIpAndCreatedAtAfter(clientIp, windowStart) >= maxRequestsPerHourPerIp) {
            return TokenValidationResult.limited("Too many reset attempts from this device. Please try again later.");
        }

        if (passwordResetTokenRepository.countByUserUserIdAndCreatedAtAfter(user.getUserId(), windowStart) >= maxRequestsPerHourPerUser) {
            return TokenValidationResult.limited("Too many reset attempts for this account. Please try again later.");
        }

        LocalDateTime now = LocalDateTime.now();
        passwordResetTokenRepository.invalidateActiveTokensForUser(user.getUserId(), now, "SUPERSEDED");

        String rawToken = generateSecureToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setRequestedIp(clientIp);
        resetToken.setRequestedUserAgent(truncate(request != null ? request.getHeader("User-Agent") : null, 500));
        resetToken.setCreatedAt(now);
        resetToken.setExpiresAt(now.plusMinutes(resetTokenExpiryMinutes));
        passwordResetTokenRepository.save(resetToken);

        auditLogService.logSecurityEvent(
                "PASSWORD_RESET_VERIFIED",
                "Password reset verification completed and reset token issued",
                user.getUserId(),
                null,
                "medium",
                clientIp);

        return TokenValidationResult.valid(rawToken, resetToken.getExpiresAt());
    }

    @Transactional(readOnly = true)
    public TokenValidationResult validateResetToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return TokenValidationResult.invalid("Reset token is required");
        }

        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByTokenHash(hashToken(rawToken));
        if (tokenOpt.isEmpty()) {
            return TokenValidationResult.invalid("Invalid or expired reset link");
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.getUsedAt() != null) {
            return TokenValidationResult.invalid("This reset link has already been used");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return TokenValidationResult.invalid("This reset link has expired");
        }

        return TokenValidationResult.valid(rawToken, token.getExpiresAt());
    }

    @Transactional
    public ResetResult resetPassword(String rawToken, String newPassword, String confirmPassword, HttpServletRequest request) {
        TokenValidationResult validation = validateResetToken(rawToken);
        if (!validation.valid()) {
            return ResetResult.failure(validation.message(), validation.rateLimited());
        }

        if (newPassword == null || confirmPassword == null) {
            return ResetResult.failure("New password and confirmation are required", false);
        }
        if (!newPassword.equals(confirmPassword)) {
            return ResetResult.failure("Passwords do not match", false);
        }

        String passwordError = validatePasswordStrength(newPassword);
        if (passwordError != null) {
            return ResetResult.failure(passwordError, false);
        }

        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hashToken(rawToken)).orElse(null);
        if (token == null || token.getUsedAt() != null || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResetResult.failure("Invalid or expired reset link", false);
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setIsFirstLogin(false);
        userRepository.save(user);

        LocalDateTime usedAt = LocalDateTime.now();
        token.setUsedAt(usedAt);
        token.setUsedReason("PASSWORD_CHANGED");
        token.setConsumedIp(getClientIp(request));
        token.setConsumedUserAgent(truncate(request != null ? request.getHeader("User-Agent") : null, 500));
        passwordResetTokenRepository.save(token);

        passwordResetTokenRepository.invalidateActiveTokensForUser(user.getUserId(), usedAt, "PASSWORD_CHANGED");
        auditLogService.endSession(user.getUserId());
        auditLogService.logSecurityEvent(
                "PASSWORD_RESET",
                "Password reset completed successfully",
                user.getUserId(),
                null,
                "high",
                getClientIp(request));

        return ResetResult.ok();
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String validatePasswordStrength(String password) {
        if (password.length() < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter";
        }
        if (!password.matches(".*[a-z].*")) {
            return "Password must contain at least one lowercase letter";
        }
        if (!password.matches(".*[0-9].*")) {
            return "Password must contain at least one number";
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    public record TokenValidationResult(boolean valid, boolean rateLimited, String message, String token,
            LocalDateTime expiresAt) {
        public static TokenValidationResult valid(String token, LocalDateTime expiresAt) {
            return new TokenValidationResult(true, false, null, token, expiresAt);
        }

        public static TokenValidationResult invalid(String message) {
            return new TokenValidationResult(false, false, message, null, null);
        }

        public static TokenValidationResult limited(String message) {
            return new TokenValidationResult(false, true, message, null, null);
        }
    }

    public record ResetResult(boolean success, boolean rateLimited, String message) {
        public static ResetResult ok() {
            return new ResetResult(true, false, "Password reset successfully. Please login with your new password.");
        }

        public static ResetResult failure(String message, boolean rateLimited) {
            return new ResetResult(false, rateLimited, message);
        }
    }
}
