package com.gym.management.controller;

import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.SecurityService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/security")
@CrossOrigin(origins = "*")
public class SecurityController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== Security Settings ====================

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSecuritySettings() {
        try {
            Map<String, Object> settings = securityService.getSecuritySettings();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            // Return default settings on error
            Map<String, Object> defaults = new HashMap<>();
            defaults.put("enforce2FA", false);
            defaults.put("sessionTimeout", 30);
            defaults.put("passwordExpiry", 90);
            defaults.put("maxLoginAttempts", 5);
            defaults.put("requireStrongPassword", true);
            return ResponseEntity.ok(defaults);
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSecuritySettings(@RequestBody Map<String, Object> settings) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            securityService.updateSecuritySettings(settings);
            return ResponseEntity.ok(Map.of("message", "Security settings updated"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update settings: " + e.getMessage()));
        }
    }

    // ==================== Active Sessions ====================

    @GetMapping("/sessions")
    public ResponseEntity<?> getActiveSessions(HttpServletRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            String token = extractToken(request);
            List<Map<String, Object>> sessions = securityService.getActiveSessions(userId, token);
            
            // If no sessions in DB, return the current session as a fallback
            if (sessions.isEmpty()) {
                Map<String, Object> currentSession = new HashMap<>();
                currentSession.put("id", "current");
                currentSession.put("device", getDeviceFromUserAgent(request.getHeader("User-Agent")));
                currentSession.put("browser", getBrowserFromUserAgent(request.getHeader("User-Agent")));
                currentSession.put("location", "Local");
                currentSession.put("ip", getClientIp(request));
                currentSession.put("lastActive", "Now");
                currentSession.put("current", true);
                sessions.add(currentSession);
            }
            
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            // Return current session info as fallback
            Map<String, Object> currentSession = new HashMap<>();
            currentSession.put("id", "current");
            currentSession.put("device", getDeviceFromUserAgent(request.getHeader("User-Agent")));
            currentSession.put("browser", getBrowserFromUserAgent(request.getHeader("User-Agent")));
            currentSession.put("location", "Local");
            currentSession.put("ip", getClientIp(request));
            currentSession.put("lastActive", "Now");
            currentSession.put("current", true);
            return ResponseEntity.ok(List.of(currentSession));
        }
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> terminateSession(@PathVariable String sessionId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            if (!"current".equals(sessionId)) {
                securityService.terminateSession(Long.parseLong(sessionId), userId);
            }
            return ResponseEntity.ok(Map.of("message", "Session terminated"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to terminate session: " + e.getMessage()));
        }
    }

    @PostMapping("/sessions/logout-all")
    public ResponseEntity<?> logoutAllOtherSessions(HttpServletRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            String token = extractToken(request);
            securityService.terminateAllOtherSessions(userId, token);
            return ResponseEntity.ok(Map.of("message", "All other sessions logged out"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to logout sessions: " + e.getMessage()));
        }
    }

    // ==================== Login History ====================

    @GetMapping("/login-history")
    public ResponseEntity<?> getLoginHistory() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            List<Map<String, Object>> history = securityService.getLoginHistory(userId);
            
            // If no history, return empty array (frontend will show "No login history")
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of()); // Return empty on error
        }
    }

    // ==================== Password Management ====================

    @GetMapping("/password-info")
    public ResponseEntity<?> getPasswordInfo() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            Map<String, Object> info = securityService.getPasswordInfo(userId);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            Map<String, Object> defaults = new HashMap<>();
            defaults.put("daysSinceChange", -1);
            defaults.put("lastChanged", null);
            defaults.put("isExpired", false);
            defaults.put("daysUntilExpiry", 90);
            return ResponseEntity.ok(defaults);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password and new password are required"));
        }

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Incorrect current password"));
            }

            // Validate new password strength
            if (!securityService.validatePasswordStrength(newPassword)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password does not meet strength requirements. Must contain uppercase, lowercase, number, and special character."));
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setPasswordChangedAt(java.time.LocalDateTime.now());
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to change password: " + e.getMessage()));
        }
    }

    @PostMapping("/validate-password")
    public ResponseEntity<?> validatePassword(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        if (password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        boolean isValid = securityService.validatePasswordStrength(password);
        Map<String, Object> result = new HashMap<>();
        result.put("valid", isValid);

        // Return detailed validation info
        result.put("hasMinLength", password.length() >= 8);
        result.put("hasUppercase", password.matches(".*[A-Z].*"));
        result.put("hasLowercase", password.matches(".*[a-z].*"));
        result.put("hasNumber", password.matches(".*[0-9].*"));
        result.put("hasSpecial", password.matches(".*[!@#$%^&*(),.?\":{}|<>].*"));

        return ResponseEntity.ok(result);
    }

    // ==================== Account Status ====================

    @GetMapping("/account-status")
    public ResponseEntity<?> getAccountStatus() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            Map<String, Object> status = new HashMap<>();
            status.put("isLocked", securityService.isAccountLocked(userId));
            status.put("failedAttempts", securityService.getFailedLoginCount(userId, 1));
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                status.put("twoFactorEnabled", Boolean.TRUE.equals(user.getTwoFactorEnabled()));
            }
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            Map<String, Object> defaults = new HashMap<>();
            defaults.put("isLocked", false);
            defaults.put("failedAttempts", 0);
            defaults.put("twoFactorEnabled", false);
            return ResponseEntity.ok(defaults);
        }
    }

    // ==================== Two-Factor Authentication ====================

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enable2FA() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setTwoFactorEnabled(true);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Two-factor authentication enabled"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to enable 2FA: " + e.getMessage()));
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disable2FA() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setTwoFactorEnabled(false);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Two-factor authentication disabled"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to disable 2FA: " + e.getMessage()));
        }
    }

    // ==================== Helper Methods ====================

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        return null;
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String getDeviceFromUserAgent(String userAgent) {
        if (userAgent == null) return "Unknown Device";
        
        if (userAgent.contains("iPhone")) return "iPhone";
        if (userAgent.contains("iPad")) return "iPad";
        if (userAgent.contains("Android")) return "Android Device";
        if (userAgent.contains("Windows")) return "Windows PC";
        if (userAgent.contains("Macintosh") || userAgent.contains("Mac OS")) return "Mac";
        if (userAgent.contains("Linux")) return "Linux PC";
        
        return "Unknown Device";
    }

    private String getBrowserFromUserAgent(String userAgent) {
        if (userAgent == null) return "Unknown";
        
        if (userAgent.contains("Edg/")) return "Microsoft Edge";
        if (userAgent.contains("Chrome/")) return "Chrome";
        if (userAgent.contains("Firefox/")) return "Firefox";
        if (userAgent.contains("Safari/") && !userAgent.contains("Chrome")) return "Safari";
        if (userAgent.contains("Opera") || userAgent.contains("OPR/")) return "Opera";
        
        return "Unknown Browser";
    }
}
