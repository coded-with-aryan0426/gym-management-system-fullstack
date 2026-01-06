package com.gym.management.controller;

import com.gym.management.model.OtpChannel;
import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import com.gym.management.security.JwtTokenProvider;
import com.gym.management.service.OAuthService;
import com.gym.management.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Controller for OAuth2 social login and multi-channel OTP endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class OAuth2Controller {

    @Autowired
    private OAuthService oAuthService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Google OAuth token exchange.
     * Frontend sends Google ID token, backend verifies and returns JWT.
     */
    @PostMapping("/oauth/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> request) {
        String idToken = request.get("idToken");
        if (idToken == null || idToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "ID token is required"));
        }

        OAuthService.AuthResult result = oAuthService.authenticateWithGoogle(idToken);

        if (!result.success()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", result.message()));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", result.token(),
                "user", buildUserResponse(result.user())));
    }

    /**
     * Facebook OAuth token exchange.
     * Frontend sends Facebook access token, backend verifies and returns JWT.
     */
    @PostMapping("/oauth/facebook")
    public ResponseEntity<?> facebookAuth(@RequestBody Map<String, String> request) {
        String accessToken = request.get("accessToken");
        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Access token is required"));
        }

        OAuthService.AuthResult result = oAuthService.authenticateWithFacebook(accessToken);

        if (!result.success()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", result.message()));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", result.token(),
                "user", buildUserResponse(result.user())));
    }

    /**
     * Send OTP to email or phone.
     * Channel: EMAIL, SMS, or WHATSAPP
     */
    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String target = request.get("target"); // email or phone
        String channelStr = request.get("channel"); // EMAIL, SMS, WHATSAPP

        if (target == null || target.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Target (email/phone) is required"));
        }

        OtpChannel channel;
        try {
            channel = OtpChannel.valueOf(channelStr != null ? channelStr.toUpperCase() : "EMAIL");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid channel. Use EMAIL, SMS, or WHATSAPP"));
        }

        boolean sent = otpService.sendOtp(target, channel);

        if (!sent) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to send OTP. Please try again later."));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP sent to " + maskTarget(target, channel)));
    }

    /**
     * Verify OTP and login/create user.
     */
    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String target = request.get("target");
        String code = request.get("code");
        String channelStr = request.get("channel");

        if (target == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Target and code are required"));
        }

        OtpChannel channel;
        try {
            channel = OtpChannel.valueOf(channelStr != null ? channelStr.toUpperCase() : "EMAIL");
        } catch (IllegalArgumentException e) {
            channel = OtpChannel.EMAIL;
        }

        OtpService.VerifyResult result = otpService.verifyOtp(target, channel, code);

        if (!result.success()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", result.message()));
        }

        // Find or create user
        Optional<User> userOpt = channel == OtpChannel.EMAIL
                ? userRepository.findByEmail(target)
                : userRepository.findByPhoneNumber(target);

        User user;
        if (userOpt.isEmpty()) {
            // New user - create account
            user = new User();
            if (channel == OtpChannel.EMAIL) {
                user.setEmail(target);
                user.setUsername(target.split("@")[0] + "_" + System.currentTimeMillis() % 1000);
            } else {
                user.setPhone(target);
                user.setPhoneNumberPersisted(target);
                user.setUsername("user_" + target.substring(Math.max(0, target.length() - 4)));
            }
            user.setPassword("$NO_PASSWORD$"); // OTP-only users don't have passwords
            user.setStatus("ACTIVE");
            user = userRepository.save(user);
        } else {
            user = userOpt.get();
        }

        // Generate JWT
        String token = jwtTokenProvider.generateTokenFromUser(user, "otp_auth", null, null, null);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", token,
                "user", buildUserResponse(user),
                "message", "Login successful"));
    }

    private Map<String, Object> buildUserResponse(User user) {
        if (user == null)
            return Map.of();
        return Map.of(
                "id", user.getUserId(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "username", user.getUsername(),
                "roles", user.getRoles() != null ? user.getRoles().stream()
                        .map(r -> r.getRoleName()).toList() : java.util.List.of());
    }

    private String maskTarget(String target, OtpChannel channel) {
        if (channel == OtpChannel.EMAIL) {
            int atIndex = target.indexOf('@');
            if (atIndex > 2) {
                return target.substring(0, 2) + "***" + target.substring(atIndex);
            }
        } else {
            if (target.length() > 4) {
                return "****" + target.substring(target.length() - 4);
            }
        }
        return target;
    }
}
