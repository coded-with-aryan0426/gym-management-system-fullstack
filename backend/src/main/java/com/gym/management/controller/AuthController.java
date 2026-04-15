package com.gym.management.controller;

import com.gym.management.dto.*;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import com.gym.management.security.JwtTokenProvider;
import com.gym.management.service.AuditLogService;
import com.gym.management.service.OtpService;
import com.gym.management.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private GymRepository gymRepository;

    @Autowired
    private GymStaffRepository gymStaffRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private OtpService otpService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PasswordResetService passwordResetService;

    /**
     * V1 Simplified Login - No gym dependency
     * User authenticates and gets access based on their roles
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        OtpPurpose purpose = OtpPurpose.valueOf(request.getPurpose());
        otpService.generateAndSendOtp(request.getEmail(), purpose);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        OtpPurpose purpose = OtpPurpose.valueOf(request.getPurpose());
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), purpose);
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true));
        }
        return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Invalid or expired OTP"));
    }

    @PostMapping("/owner/register")
    @Transactional
    public ResponseEntity<?> ownerRegister(@RequestBody OwnerRegisterRequest request, HttpServletRequest httpRequest) {
        // Verify OTP first
        boolean isOtpValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpPurpose.SIGNUP);
        if (!isOtpValid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
        }

        if (userRepository.existsByUsername(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getOwnerName());
        user.setPhone(request.getPhone());
        user.setIsFirstLogin(false); // Owner sets own password

        // Assign OWNER role
        Role ownerRole = roleRepository.findByRoleName("OWNER");
        if (ownerRole == null) {
            return ResponseEntity.status(500).body(Map.of("error", "OWNER role is not configured. Please contact support."));
        }
        user.setRoles(new HashSet<>(Collections.singletonList(ownerRole)));

        user = userRepository.save(user);

        Gym createdGym = null;
        // Create gym record from registration data
        if (request.getGymName() != null && !request.getGymName().trim().isEmpty()) {
            Gym gym = new Gym();
            gym.setName(request.getGymName().trim());
            gym.setOwner(user);
            gym.setCreatedBy(user.getUserId());
            createdGym = gymRepository.save(gym);
        }

        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setContext("STAFF");
        response.setStaffRole("OWNER");
        response.setHasStaffAccess(true);
        response.setHasMemberAccess(true);
        response.setIsFirstLogin(false);
        response.setOtpSent(false);

        if (createdGym != null) {
            response.setActiveGymId(createdGym.getGymId());
            response.setActiveGymName(createdGym.getName());
        } else {
            gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(user.getUserId())
                    .ifPresent(gym -> {
                        response.setActiveGymId(gym.getGymId());
                        response.setActiveGymName(gym.getName());
                    });
        }

        String token = tokenProvider.generateTokenFromUser(
                user,
                "STAFF",
                response.getActiveGymId(),
                "OWNER",
                null,
                null,
                null,
                null);
        response.setToken(token);

        try {
            String ip = getClientIP(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            String deviceType = userAgent != null && (userAgent.contains("Mobile") || userAgent.contains("Android"))
                    ? "mobile"
                    : "desktop";
            String browser = extractBrowser(userAgent);
            String os = extractOS(userAgent);
            auditLogService.logLogin(user.getUserId(), response.getActiveGymId(), ip, deviceType, browser, os, null);
            auditLogService.createSession(user.getUserId(), response.getActiveGymId(), ip, deviceType, browser, os);
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Setup gym for new users (after social login)
     */
    @PostMapping("/setup-gym")
    public ResponseEntity<?> setupGym(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String gymName = (String) request.get("gymName");

            if (gymName == null || gymName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Gym name is required"));
            }

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();

            // Create new gym
            Gym gym = new Gym();
            gym.setName(gymName.trim());
            gym.setOwner(user);
            gym.setCreatedAt(java.time.LocalDateTime.now());
            gym = gymRepository.save(gym);

            // Assign OWNER role if not already assigned
            Role ownerRole = roleRepository.findByRoleName("OWNER");
            if (ownerRole != null && (user.getRoles() == null || user.getRoles().stream()
                    .noneMatch(r -> "OWNER".equals(r.getRoleName())))) {
                if (user.getRoles() == null) {
                    user.setRoles(new HashSet<>());
                }
                user.getRoles().add(ownerRole);
                userRepository.save(user);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Gym created successfully",
                    "gymId", gym.getGymId(),
                    "gymName", gym.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhoneNumber(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            // Log failed login
            try {
                auditLogService.logFailedLogin(request.getUsername(), getClientIP(httpRequest), "User not found");
            } catch (Exception ignored) {
            }
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Log failed login
            try {
                auditLogService.logFailedLogin(request.getUsername(), getClientIP(httpRequest), "Invalid password");
            } catch (Exception ignored) {
            }
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }

        // SKIP OTP for returning users (isFirstLogin = false or null)
        // Only require OTP for first-time users
        if (Boolean.TRUE.equals(user.getIsFirstLogin())) {
            // First-time user - require OTP verification
            otpService.generateAndSendOtp(user.getEmail(), OtpPurpose.LOGIN);
            AuthResponse response = new AuthResponse();
            response.setOtpSent(true);
            response.setEmail(user.getEmail());
            response.setIsFirstLogin(true);
            return ResponseEntity.ok(response);
        }

        // Returning user - issue token directly (no OTP needed)
        String userRole = determineUserRole(user);

        // Determine correct context: MEMBER/CUSTOMER users get MEMBER context, staff/trainer/owner get STAFF
        boolean isMemberOnly = "MEMBER".equals(userRole) || "CUSTOMER".equals(userRole);
        String context = isMemberOnly ? "MEMBER" : "STAFF";

        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setContext(context);
        response.setStaffRole(isMemberOnly ? null : userRole);
        response.setHasStaffAccess(!isMemberOnly);
        response.setHasMemberAccess(true);
        response.setIsFirstLogin(false);
        response.setOtpSent(false); // No OTP sent

        // Include gym data for OWNER
        if ("OWNER".equals(userRole)) {
            gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(user.getUserId())
                    .ifPresent(gym -> {
                        response.setActiveGymId(gym.getGymId());
                        response.setActiveGymName(gym.getName());
                    });
        }

        String token = tokenProvider.generateTokenFromUser(user, context, response.getActiveGymId(),
                isMemberOnly ? "CUSTOMER" : userRole, null, null, null, null);
        response.setToken(token);

        // Log successful login and create session
        try {
            String ip = getClientIP(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            String deviceType = userAgent != null && (userAgent.contains("Mobile") || userAgent.contains("Android"))
                    ? "mobile"
                    : "desktop";
            String browser = extractBrowser(userAgent);
            String os = extractOS(userAgent);
            auditLogService.logLogin(user.getUserId(), response.getActiveGymId(), ip, deviceType, browser, os, null);
            auditLogService.createSession(user.getUserId(), response.getActiveGymId(), ip, deviceType, browser, os);
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<?> verifyLogin(@RequestBody VerifyOtpRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpPurpose.LOGIN);
        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();

        // Check if first login
        if (Boolean.TRUE.equals(user.getIsFirstLogin())) {
            AuthResponse response = new AuthResponse();
            response.setIsFirstLogin(true);
            response.setEmail(user.getEmail());
            // Need a temp token or rely on email identification for password change?
            // Better to issue a limited token or just handle it in change-password endpoint
            // with email check?
            // Ideally use a PRE_AUTH token. For simplicity, we return isFirstLogin=true and
            // NO full access token yet.
            // Actually, we can issue a token but frontend will redirect to Change Password
            // page.
        }

        // Determine Role Context using helper
        String userRole = determineUserRole(user);
        boolean isMemberOnly = "MEMBER".equals(userRole) || "CUSTOMER".equals(userRole);
        String context = isMemberOnly ? "MEMBER" : "STAFF";

        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setContext(context);
        response.setStaffRole(isMemberOnly ? null : userRole);
        response.setHasStaffAccess(!isMemberOnly);
        response.setHasMemberAccess(true);
        response.setIsFirstLogin(Boolean.TRUE.equals(user.getIsFirstLogin()));

        // Include gym data for OWNER
        if ("OWNER".equals(userRole)) {
            gymRepository.findFirstByOwnerUserIdOrderByCreatedAtDesc(user.getUserId())
                    .ifPresent(gym -> {
                        response.setActiveGymId(gym.getGymId());
                        response.setActiveGymName(gym.getName());
                    });
        }

        String token = tokenProvider.generateTokenFromUser(user, context, response.getActiveGymId(),
                isMemberOnly ? "CUSTOMER" : userRole, null, null, null, null);
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password-first-login")
    public ResponseEntity<?> changePasswordFirstLogin(@RequestBody ChangePasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();

        if (!Boolean.TRUE.equals(user.getIsFirstLogin())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Not first login"));
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        }

        // CRITICAL: Encode password with BCrypt before saving!
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsFirstLogin(false);
        user.setPasswordChangedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please login again."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (email == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email, current password, and new password are required"));
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("error", "Incorrect current password"));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setPasswordChangedAt(java.time.LocalDateTime.now());
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to change password", "details", e.getMessage()));
        }
    }

    /**
     * Emergency password reset - DEPRECATED
     * Use /forgot-password/request → /forgot-password/verify → /forgot-password/reset instead
     * This endpoint now requires OTP verification for security
     */
    @PostMapping("/reset-password")
    @Deprecated
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        // Redirect to secure flow
        return ResponseEntity.status(410).body(Map.of(
                "error", "This endpoint is deprecated. Please use the forgot password flow.",
                "instructions", "1. POST /api/auth/forgot-password/request with email, " +
                        "2. POST /api/auth/forgot-password/verify with email and otp, " +
                        "3. POST /api/auth/forgot-password/reset with email, otp, and newPassword"));
    }

    /**
     * List all users (for debugging password issues)
     * Shows emails so you know what to use for reset
     */
    @GetMapping("/list-users")
    public ResponseEntity<?> listUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> userList = users.stream()
                    .map(u -> Map.<String, Object>of(
                            "id", u.getUserId(),
                            "email", u.getEmail() != null ? u.getEmail() : "N/A",
                            "username", u.getUsername() != null ? u.getUsername() : "N/A",
                            "fullName", u.getFullName() != null ? u.getFullName() : "N/A",
                            "roles", u.getRoles() != null ? u.getRoles().stream()
                                    .map(r -> r.getRoleName()).toList() : List.of()))
                    .toList();
            return ResponseEntity.ok(Map.of("users", userList, "count", users.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * V1 Staff signup - creates user with role, no gym dependency
     */
    @PostMapping("/signup/staff")
    public ResponseEntity<?> signupStaff(@RequestBody StaffSignupRequest request) {
        // Validate email doesn't exist
        if (userRepository.existsByUsername(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        String requestedRole = "TRAINER";

        // Create user
        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        // Set role based on request
        Role role = roleRepository.findByRoleName(requestedRole.toUpperCase());
        if (role == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "TRAINER role not found in system"));
        }
        user.setRoles(new HashSet<>(Collections.singletonList(role)));

        user = userRepository.save(user);

        // V1: Build simple response (no gym context)
        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setContext("STAFF");
        response.setStaffRole(requestedRole.toUpperCase());
        response.setHasStaffAccess(true);
        response.setHasMemberAccess(false);

        // V1: Generate token without gym context
        String token = tokenProvider.generateTokenFromUser(user, "STAFF", null, requestedRole.toUpperCase(), null, null,
                null, null);
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    /**
     * V1 Member signup - creates user with CUSTOMER role, no gym dependency
     */
    @PostMapping("/signup/member")
    public ResponseEntity<?> signupMember(@RequestBody MemberSignupRequest request) {
        // Validate email doesn't exist
        if (userRepository.existsByUsername(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        // Create user
        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        // Set customer role
        Role customerRole = roleRepository.findByRoleName("CUSTOMER");
        if (customerRole != null) {
            user.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
        }

        user = userRepository.save(user);

        // V1: Build simple response (no gym context)
        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setContext("MEMBER");
        response.setHasStaffAccess(false);
        response.setHasMemberAccess(true);

        // V1: Generate token without gym context
        String token = tokenProvider.generateTokenFromUser(user, "MEMBER", null, "CUSTOMER", null, null, null, null);
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    /**
     * Set active gym after login (for users with multiple gyms)
     */
    @PostMapping("/set-active-gym")
    public ResponseEntity<?> setActiveGym(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long gymId = Long.valueOf(request.get("gymId").toString());
        String context = (String) request.get("context");

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        Optional<Gym> gymOpt = gymRepository.findById(gymId);
        if (gymOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Gym not found"));
        }

        Gym gym = gymOpt.get();
        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setContext(context);
        response.setActiveGymId(gym.getGymId());
        response.setActiveGymName(gym.getName());

        String staffRole = null;

        // Get staff role if staff context
        if ("STAFF".equalsIgnoreCase(context)) {
            Optional<GymStaff> gsOpt = gymStaffRepository.findByGymGymIdAndUserUserId(gymId, userId);
            if (gsOpt.isPresent()) {
                staffRole = determineUserRole(user);
                response.setStaffRole(staffRole);
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "User is not staff at this gym"));
            }
        } else if ("MEMBER".equalsIgnoreCase(context)) {
            // Verify membership logic could go here
        }

        String token = tokenProvider.generateTokenFromUser(user, context, gym.getGymId(), staffRole, null, null, null,
                null);
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    /**
     * Check if user has both staff and member access (for role selector)
     */
    @GetMapping("/check-access/{userId}")
    public ResponseEntity<?> checkAccess(@PathVariable Long userId) {
        List<GymStaff> staffAssociations = gymStaffRepository.findByUserUserIdAndStatus(
                userId, StaffStatus.ACTIVE);
        List<Membership> memberships = membershipRepository.findByUserUserId(userId);

        return ResponseEntity.ok(Map.of(
                "hasStaffAccess", !staffAssociations.isEmpty(),
                "hasMemberAccess", !memberships.isEmpty(),
                "staffGymsCount", staffAssociations.size(),
                "memberGymsCount", memberships.size()));
    }

    // Legacy signup endpoint (for backward compatibility)
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role customerRole = roleRepository.findByRoleName("CUSTOMER");
            user.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    /**
     * Determine the primary role for a user.
     * Priority: OWNER/ADMIN > TRAINER > MEMBER/CUSTOMER
     */
    private String determineUserRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return "CUSTOMER";
        }

        String userRole = "CUSTOMER";
        boolean hasTrainer = false;
        boolean hasMember = false;

        for (Role role : user.getRoles()) {
            String roleName = role.getRoleName().toUpperCase();

            // OWNER/ADMIN has highest priority
            if (roleName.contains("OWNER") || roleName.contains("ADMIN")) {
                return "OWNER";
            }

            // TRAINER has second priority — STAFF is NOT a trainer
            if (roleName.equals("TRAINER")) {
                hasTrainer = true;
            }

            // MEMBER/CUSTOMER has lowest priority
            if (roleName.contains("MEMBER") || roleName.contains("CUSTOMER")) {
                hasMember = true;
            }
        }

        if (hasTrainer) {
            return "TRAINER";
        }
        if (hasMember) {
            return "MEMBER";
        }

        return userRole;
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String extractBrowser(String userAgent) {
        if (userAgent == null)
            return "Unknown";
        if (userAgent.contains("Chrome") && !userAgent.contains("Edg"))
            return "Chrome";
        if (userAgent.contains("Firefox"))
            return "Firefox";
        if (userAgent.contains("Safari") && !userAgent.contains("Chrome"))
            return "Safari";
        if (userAgent.contains("Edg"))
            return "Edge";
        return "Other";
    }

    private String extractOS(String userAgent) {
        if (userAgent == null)
            return "Unknown";
        if (userAgent.contains("Windows"))
            return "Windows";
        if (userAgent.contains("Mac OS"))
            return "macOS";
        if (userAgent.contains("Linux") && !userAgent.contains("Android"))
            return "Linux";
        if (userAgent.contains("Android"))
            return "Android";
        if (userAgent.contains("iPhone") || userAgent.contains("iPad"))
            return "iOS";
        return "Other";
    }

    @GetMapping("/health-check")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    // ============================================
    // FORGOT PASSWORD FLOW - Secure Implementation
    // ============================================

    /**
     * Step 1: Request password reset - sends OTP to email
     */
    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> forgotPasswordRequest(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email is required"));
        }

        // Check if user exists (don't reveal if not found for security)
        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isEmpty()) {
            // Return success anyway to prevent email enumeration
            return ResponseEntity.ok(Map.of(
                    "message", "If an account exists with this email, a verification code has been sent."));
        }

        // Send OTP for password reset
        boolean sent = otpService.generateAndSendOtp(email.trim(), OtpPurpose.PASSWORD_RESET);

        if (!sent) {
            return ResponseEntity.status(429).body(Map.of(
                    "error", "Too many requests. Please try again later."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "If an account exists with this email, a verification code has been sent."));
    }

    /**
     * Step 2: Verify OTP for password reset
     */
    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> forgotPasswordVerify(@RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email and OTP are required"));
        }

        boolean isValid = otpService.verifyOtp(email.trim(), otp, OtpPurpose.PASSWORD_RESET);

        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired verification code"));
        }

        PasswordResetService.TokenValidationResult tokenResult = passwordResetService
                .issueResetTokenForVerifiedOtp(email.trim(), httpRequest);

        if (!tokenResult.valid()) {
            if (tokenResult.rateLimited()) {
                return ResponseEntity.status(429).body(Map.of("error", tokenResult.message()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", tokenResult.message()));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Verification successful. You can now reset your password.",
                "verified", true,
                "resetToken", tokenResult.token(),
                "expiresAt", tokenResult.expiresAt()));
    }

    /**
     * Step 3: Reset password with verified OTP
     * Requires the same OTP that was verified in step 2
     */
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> forgotPasswordReset(@RequestBody Map<String, String> request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String resetToken = request.get("resetToken");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (resetToken == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Reset token, new password, and confirmation are required"));
        }

        PasswordResetService.ResetResult result = passwordResetService.resetPassword(
                resetToken.trim(), newPassword, confirmPassword, httpRequest);

        if (!result.success()) {
            if (result.rateLimited()) {
                return ResponseEntity.status(429).body(Map.of("error", result.message()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", result.message()));
        }

        return ResponseEntity.ok(Map.of(
                "message", result.message()));
    }

    /**
     * Logout endpoint - ends user session and logs the event
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        try {
            Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
            Long gymId = request.get("gymId") != null ? Long.valueOf(request.get("gymId").toString()) : null;

            if (userId != null) {
                String ip = getClientIP(httpRequest);
                // Log logout event
                auditLogService.logLogout(userId, gymId, ip, null);
                // End user session
                auditLogService.endSession(userId);
            }

            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("message", "Logged out")); // Still return success even if logging fails
        }
    }
}
