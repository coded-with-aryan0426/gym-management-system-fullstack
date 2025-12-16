package com.gym.management.controller;

import com.gym.management.dto.*;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import com.gym.management.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    /**
     * V1 Simplified Login - No gym dependency
     * User authenticates and gets access based on their roles
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            // Try finding by email as username
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // In production, use password encoder
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }

        // V1: Determine role from user's roles (no gym context needed)
        String userRole = "CUSTOMER"; // Default
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

        // Build simple response
        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setContext("STAFF"); // V1: everyone is effectively staff for dashboard access
        response.setStaffRole(userRole);
        response.setHasStaffAccess(true);
        response.setHasMemberAccess(true);

        // V1: Generate token without gym context
        String token = tokenProvider.generateTokenFromUser(user, "STAFF", null, userRole, null);
        response.setToken(token);

        return ResponseEntity.ok(response);
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
        user.setPassword(request.getPassword()); // In production, hash this
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
        user.setPassword(request.getPassword()); // In production, hash this
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
