package com.gym.management.controller;

import com.gym.management.dto.*;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import com.gym.management.security.JwtTokenProvider;
import com.gym.management.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<?> ownerRegister(@RequestBody OwnerRegisterRequest request) {
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
        if (ownerRole != null) {
            user.setRoles(new HashSet<>(Collections.singletonList(ownerRole)));
        }

        userRepository.save(user);

        // Auto-login (generate token) or redirect?
        // Let's return success and let them login
        return ResponseEntity.ok(Map.of("message", "Registration successful. Please login."));
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
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }

        // Credentials correct. Generate OTP and send it.
        otpService.generateAndSendOtp(user.getEmail(), OtpPurpose.LOGIN);

        AuthResponse response = new AuthResponse();
        response.setOtpSent(true);
        response.setEmail(user.getEmail());
        // Do not send token yet
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
            response.setFirstLogin(true);
            response.setEmail(user.getEmail());
            // Need a temp token or rely on email identification for password change?
            // Better to issue a limited token or just handle it in change-password endpoint
            // with email check?
            // Ideally use a PRE_AUTH token. For simplicity, we return isFirstLogin=true and
            // NO full access token yet.
            // Actually, we can issue a token but frontend will redirect to Change Password
            // page.
        }

        // Determine Role Context
        String userRole = "CUSTOMER";
        if (user.getRoles() != null) {
            for (Role role : user.getRoles()) {
                String roleName = role.getRoleName();
                if ("OWNER".equalsIgnoreCase(roleName)) {
                    userRole = "OWNER";
                    break;
                } else if ("TRAINER".equalsIgnoreCase(roleName) || "STAFF".equalsIgnoreCase(roleName)) {
                    userRole = "TRAINER";
                }
            }
        }

        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setContext("STAFF");
        response.setStaffRole(userRole);
        response.setHasStaffAccess(true);
        response.setHasMemberAccess(true);
        response.setFirstLogin(Boolean.TRUE.equals(user.getIsFirstLogin()));

        String token = tokenProvider.generateTokenFromUser(user, "STAFF", null, userRole, null);
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

        user.setPassword(request.getNewPassword());
        user.setIsFirstLogin(false);
        user.setPasswordChangedAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please login again."));
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

        // Determine role from request (default to TRAINER)
        String requestedRole = request.getRole();
        if (requestedRole == null) {
            requestedRole = "TRAINER";
        }

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
            role = roleRepository.findByRoleName("STAFF"); // Fallback
        }
        if (role != null) {
            user.setRoles(new HashSet<>(Collections.singletonList(role)));
        }

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
        String token = tokenProvider.generateTokenFromUser(user, "STAFF", null, requestedRole.toUpperCase(), null);
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
        String token = tokenProvider.generateTokenFromUser(user, "MEMBER", null, "CUSTOMER", null);
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
                staffRole = gsOpt.get().getStaffRole().name();
                response.setStaffRole(staffRole);
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "User is not staff at this gym"));
            }
        } else if ("MEMBER".equalsIgnoreCase(context)) {
            // Verify membership logic could go here
        }

        String token = tokenProvider.generateTokenFromUser(user, context, gym.getGymId(), staffRole, null);
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
}
