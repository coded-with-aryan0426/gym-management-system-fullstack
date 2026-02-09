package com.gym.management.service;

import com.gym.management.model.*;
import com.gym.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class SecurityService {

    @Autowired
    private UserSessionRepository sessionRepository;

    @Autowired
    private LoginHistoryRepository loginHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GymSettingsService gymSettingsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== Session Management ====================

    @Transactional
    public UserSession createSession(User user, String token, String device, String browser, String os, String ip, String location) {
        UserSession session = new UserSession();
        session.setUser(user);
        session.setTokenHash(hashToken(token));
        session.setDevice(device);
        session.setBrowser(browser);
        session.setOs(os);
        session.setIpAddress(ip);
        session.setLocation(location);
        session.setCreatedAt(LocalDateTime.now());
        session.setLastActiveAt(LocalDateTime.now());
        
        // Get session timeout from settings (default 30 minutes)
        int sessionTimeout = getSessionTimeoutMinutes();
        session.setExpiresAt(LocalDateTime.now().plusMinutes(sessionTimeout));
        session.setIsActive(true);
        
        return sessionRepository.save(session);
    }

    public List<Map<String, Object>> getActiveSessions(Long userId, String currentToken) {
        List<UserSession> sessions = sessionRepository.findByUserUserIdAndIsActiveOrderByLastActiveAtDesc(userId, true);
        String currentTokenHash = hashToken(currentToken);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (UserSession session : sessions) {
            Map<String, Object> sessionMap = new HashMap<>();
            sessionMap.put("id", session.getSessionId().toString());
            sessionMap.put("device", formatDeviceString(session.getDevice(), session.getOs()));
            sessionMap.put("browser", session.getBrowser() != null ? session.getBrowser() : "Unknown");
            sessionMap.put("location", session.getLocation() != null ? session.getLocation() : "Unknown");
            sessionMap.put("ip", session.getIpAddress() != null ? session.getIpAddress() : "Unknown");
            sessionMap.put("lastActive", formatLastActive(session.getLastActiveAt()));
            sessionMap.put("current", session.getTokenHash().equals(currentTokenHash));
            result.add(sessionMap);
        }
        return result;
    }

    @Transactional
    public void terminateSession(Long sessionId, Long userId) {
        Optional<UserSession> sessionOpt = sessionRepository.findBySessionIdAndUserUserId(sessionId, userId);
        if (sessionOpt.isPresent()) {
            sessionRepository.deactivateSession(sessionId);
        }
    }

    @Transactional
    public void terminateAllOtherSessions(Long userId, String currentToken) {
        String currentTokenHash = hashToken(currentToken);
        Optional<UserSession> currentSessionOpt = sessionRepository.findByTokenHash(currentTokenHash);
        if (currentSessionOpt.isPresent()) {
            sessionRepository.deactivateAllOtherSessions(userId, currentSessionOpt.get().getSessionId());
        }
    }

    @Transactional
    public void updateSessionActivity(String token) {
        String tokenHash = hashToken(token);
        sessionRepository.updateLastActive(tokenHash, LocalDateTime.now());
    }

    public boolean isSessionValid(String token) {
        String tokenHash = hashToken(token);
        Optional<UserSession> sessionOpt = sessionRepository.findByTokenHash(tokenHash);
        if (sessionOpt.isEmpty()) {
            return false;
        }
        UserSession session = sessionOpt.get();
        return session.getIsActive() && 
               (session.getExpiresAt() == null || session.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    // ==================== Login History ====================

    @Transactional
    public void recordLogin(User user, String device, String browser, String os, String ip, String location, boolean success, String failureReason) {
        LoginHistory history = new LoginHistory();
        history.setUser(user);
        history.setDevice(device);
        history.setBrowser(browser);
        history.setOs(os);
        history.setIpAddress(ip);
        history.setLocation(location);
        history.setLoginTime(LocalDateTime.now());
        history.setSuccess(success);
        history.setFailureReason(failureReason);
        loginHistoryRepository.save(history);
    }

    public List<Map<String, Object>> getLoginHistory(Long userId) {
        List<LoginHistory> history = loginHistoryRepository.findTop20ByUserUserIdOrderByLoginTimeDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (LoginHistory entry : history) {
            Map<String, Object> historyMap = new HashMap<>();
            historyMap.put("id", entry.getHistoryId().toString());
            historyMap.put("device", formatDeviceString(entry.getDevice(), entry.getOs()));
            historyMap.put("ip", entry.getIpAddress() != null ? entry.getIpAddress() : "Unknown");
            historyMap.put("time", formatLoginTime(entry.getLoginTime()));
            historyMap.put("success", entry.getSuccess());
            historyMap.put("location", entry.getLocation() != null ? entry.getLocation() : "Unknown");
            if (!entry.getSuccess() && entry.getFailureReason() != null) {
                historyMap.put("failureReason", entry.getFailureReason());
            }
            result.add(historyMap);
        }
        return result;
    }

    public long getFailedLoginCount(Long userId, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return loginHistoryRepository.countByUserUserIdAndSuccessAndLoginTimeAfter(userId, false, since);
    }

    // ==================== Security Settings ====================

    public Map<String, Object> getSecuritySettings() {
        Map<String, String> allSettings = gymSettingsService.getAllSettings();
        Map<String, Object> securitySettings = new HashMap<>();
        
        securitySettings.put("enforce2FA", parseBoolean(allSettings.get("enforce2FA"), false));
        securitySettings.put("sessionTimeout", parseInt(allSettings.get("sessionTimeout"), 30));
        securitySettings.put("passwordExpiry", parseInt(allSettings.get("passwordExpiry"), 90));
        securitySettings.put("maxLoginAttempts", parseInt(allSettings.get("maxLoginAttempts"), 5));
        securitySettings.put("requireStrongPassword", parseBoolean(allSettings.get("requireStrongPassword"), true));
        
        return securitySettings;
    }

    @Transactional
    public void updateSecuritySettings(Map<String, Object> settings) {
        Map<String, Object> settingsToSave = new HashMap<>();
        
        if (settings.containsKey("enforce2FA")) {
            settingsToSave.put("enforce2FA", String.valueOf(settings.get("enforce2FA")));
        }
        if (settings.containsKey("sessionTimeout")) {
            settingsToSave.put("sessionTimeout", String.valueOf(settings.get("sessionTimeout")));
        }
        if (settings.containsKey("passwordExpiry")) {
            settingsToSave.put("passwordExpiry", String.valueOf(settings.get("passwordExpiry")));
        }
        if (settings.containsKey("maxLoginAttempts")) {
            settingsToSave.put("maxLoginAttempts", String.valueOf(settings.get("maxLoginAttempts")));
        }
        if (settings.containsKey("requireStrongPassword")) {
            settingsToSave.put("requireStrongPassword", String.valueOf(settings.get("requireStrongPassword")));
        }
        
        gymSettingsService.updateAllSettings(settingsToSave);
    }

    // ==================== Password Management ====================

    public Map<String, Object> getPasswordInfo(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Map<String, Object> info = new HashMap<>();
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            LocalDateTime changedAt = user.getPasswordChangedAt();
            if (changedAt != null) {
                long daysSinceChange = ChronoUnit.DAYS.between(changedAt, LocalDateTime.now());
                info.put("daysSinceChange", daysSinceChange);
                info.put("lastChanged", changedAt.toString());
            } else {
                info.put("daysSinceChange", -1);
                info.put("lastChanged", null);
            }
            
            // Check if password is expired based on settings
            int expiryDays = parseInt(gymSettingsService.getAllSettings().get("passwordExpiry"), 90);
            if (expiryDays > 0 && changedAt != null) {
                long daysSince = ChronoUnit.DAYS.between(changedAt, LocalDateTime.now());
                info.put("isExpired", daysSince >= expiryDays);
                info.put("daysUntilExpiry", Math.max(0, expiryDays - daysSince));
            } else {
                info.put("isExpired", false);
                info.put("daysUntilExpiry", expiryDays > 0 ? expiryDays : -1);
            }
        }
        
        return info;
    }

    public boolean validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        Map<String, String> settings = gymSettingsService.getAllSettings();
        boolean requireStrong = parseBoolean(settings.get("requireStrongPassword"), true);
        
        if (!requireStrong) {
            return true;
        }
        
        boolean hasUppercase = password.matches(".*[A-Z].*");
        boolean hasLowercase = password.matches(".*[a-z].*");
        boolean hasNumber = password.matches(".*[0-9].*");
        boolean hasSpecial = password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
        
        return hasUppercase && hasLowercase && hasNumber && hasSpecial;
    }

    // ==================== Account Lockout ====================

    public boolean isAccountLocked(Long userId) {
        int maxAttempts = parseInt(gymSettingsService.getAllSettings().get("maxLoginAttempts"), 5);
        long failedAttempts = getFailedLoginCount(userId, 1); // In last hour
        return failedAttempts >= maxAttempts;
    }

    // ==================== Cleanup ====================

    @Transactional
    public void cleanupExpiredData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sessionCutoff = now.minusDays(7); // Keep inactive sessions for 7 days
        LocalDateTime historyCutoff = now.minusDays(90); // Keep history for 90 days
        
        sessionRepository.cleanupExpiredSessions(now, sessionCutoff);
        loginHistoryRepository.cleanupOldHistory(historyCutoff);
    }

    // ==================== Helper Methods ====================

    private String hashToken(String token) {
        if (token == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return token.substring(0, Math.min(64, token.length()));
        }
    }

    private String formatDeviceString(String device, String os) {
        if (device != null && !device.isEmpty()) {
            return device;
        }
        if (os != null && !os.isEmpty()) {
            return "Unknown on " + os;
        }
        return "Unknown Device";
    }

    private String formatLastActive(LocalDateTime lastActive) {
        if (lastActive == null) {
            return "Unknown";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(lastActive, now);
        
        if (minutes < 1) return "Now";
        if (minutes < 60) return minutes + " minutes ago";
        
        long hours = ChronoUnit.HOURS.between(lastActive, now);
        if (hours < 24) return hours + " hours ago";
        
        long days = ChronoUnit.DAYS.between(lastActive, now);
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        
        return lastActive.toLocalDate().toString();
    }

    private String formatLoginTime(LocalDateTime loginTime) {
        if (loginTime == null) {
            return "Unknown";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long days = ChronoUnit.DAYS.between(loginTime.toLocalDate(), now.toLocalDate());
        
        String timeStr = String.format("%02d:%02d", loginTime.getHour(), loginTime.getMinute());
        
        if (days == 0) return "Today, " + timeStr;
        if (days == 1) return "Yesterday, " + timeStr;
        if (days < 7) return days + " days ago";
        
        return loginTime.toLocalDate().toString() + " " + timeStr;
    }

    private int getSessionTimeoutMinutes() {
        return parseInt(gymSettingsService.getAllSettings().get("sessionTimeout"), 30);
    }

    private boolean parseBoolean(String value, boolean defaultValue) {
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        return "true".equalsIgnoreCase(value) || "1".equals(value);
    }

    private int parseInt(String value, int defaultValue) {
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
