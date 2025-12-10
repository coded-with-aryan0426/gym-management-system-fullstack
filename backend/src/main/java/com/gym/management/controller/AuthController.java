package com.gym.management.controller;

import com.gym.management.dto.*;
import com.gym.management.model.*;
import com.gym.management.repository.*;
import com.gym.management.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
     * Login endpoint with role context selection
     * User chooses to login as either STAFF or MEMBER
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

        String loginContext = request.getLoginContext();
        if (loginContext == null) {
            loginContext = "STAFF"; // Default to staff for backward compatibility
        }

        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setContext(loginContext);

        // Initial defaults
        Long activeGymId = null;
        String activeStaffRole = null;

        // Check what access the user has
        List<GymStaff> staffAssociations = gymStaffRepository.findByUserUserIdAndStatus(
                user.getUserId(), StaffStatus.ACTIVE);
        List<Membership> memberships = membershipRepository.findByUserUserId(user.getUserId());

        response.setHasStaffAccess(!staffAssociations.isEmpty());
        response.setHasMemberAccess(!memberships.isEmpty());

        List<AuthResponse.GymAssociation> gymAssociations = new ArrayList<>();

        if ("STAFF".equalsIgnoreCase(loginContext)) {
            if (staffAssociations.isEmpty()) {
                // If attempting to login as staff but no access, check if they have member
                // access
                // If so, maybe we should suggest switching, but for API strictness we return
                // 403
                return ResponseEntity.status(403).body(Map.of(
                        "error", "No gym staff access found",
                        "hasMemberAccess", !memberships.isEmpty()));
            }

            // Build staff gym associations
            for (GymStaff gs : staffAssociations) {
                AuthResponse.GymAssociation ga = new AuthResponse.GymAssociation();
                ga.setGymId(gs.getGym().getGymId());
                ga.setGymName(gs.getGym().getName());
                ga.setRole(gs.getStaffRole().name());
                ga.setStatus("ACTIVE");
                gymAssociations.add(ga);
            }

            // If only one gym, auto-select it
            if (staffAssociations.size() == 1) {
                GymStaff gs = staffAssociations.get(0);
                activeGymId = gs.getGym().getGymId();
                activeStaffRole = gs.getStaffRole().name();

                response.setActiveGymId(activeGymId);
                response.setActiveGymName(gs.getGym().getName());
                response.setStaffRole(activeStaffRole);
            }

        } else if ("MEMBER".equalsIgnoreCase(loginContext)) {
            if (memberships.isEmpty()) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "No gym memberships found",
                        "hasStaffAccess", !staffAssociations.isEmpty()));
            }

            // Build member gym associations
            for (Membership m : memberships) {
                AuthResponse.GymAssociation ga = new AuthResponse.GymAssociation();
                ga.setGymId(m.getGym().getGymId());
                ga.setGymName(m.getGym().getName());
                ga.setStatus(m.getStatus().name());
                if (m.getEndDate() != null) {
                    ga.setMembershipEndDate(m.getEndDate().toString());
                }
                gymAssociations.add(ga);
            }

            // Filter to get active memberships
            List<Membership> activeMemberships = memberships.stream()
                    .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                    .collect(Collectors.toList());

            // If only one active gym, auto-select it
            if (activeMemberships.size() == 1) {
                Membership m = activeMemberships.get(0);
                activeGymId = m.getGym().getGymId();
                response.setActiveGymId(activeGymId);
                response.setActiveGymName(m.getGym().getName());
            }
        }

        response.setGymAssociations(gymAssociations);

        // Generate REAL JWT token
        String token = tokenProvider.generateTokenFromUser(user, loginContext, activeGymId, activeStaffRole, null);
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    /**
     * Staff signup - creates user, gym (optionally), and auto-logins with gym
     * context
     */
    @PostMapping("/signup/staff")
    public ResponseEntity<?> signupStaff(@RequestBody StaffSignupRequest request) {
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

        // Set staff role
        Role staffRole = roleRepository.findByRoleName("STAFF");
        if (staffRole != null) {
            user.setRoles(new HashSet<>(Collections.singletonList(staffRole)));
        }

        user = userRepository.save(user);

        Gym gym;
        StaffRole role;

        if (request.isCreateNewGym()) {
            // Create new gym
            gym = new Gym();
            gym.setName(request.getGymName());
            gym.setAddress(request.getGymAddress());
            gym.setCity(request.getGymCity());
            gym.setPhone(request.getGymPhone());
            gym.setEmail(request.getEmail());

            if (request.getSubscriptionPlan() != null) {
                try {
                    gym.setSubscriptionPlan(SubscriptionPlan.valueOf(request.getSubscriptionPlan()));
                } catch (IllegalArgumentException e) {
                    gym.setSubscriptionPlan(SubscriptionPlan.STARTER);
                }
            }

            gym = gymRepository.save(gym);
            role = StaffRole.OWNER;

        } else {
            // Join via invite code
            Optional<Gym> gymOpt = gymRepository.findByInviteCode(request.getInviteCode());
            if (gymOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid invite code"));
            }
            gym = gymOpt.get();
            role = StaffRole.TRAINER; // Default role for invited staff
        }

        // Create gym-staff association
        GymStaff gymStaff = new GymStaff();
        gymStaff.setGym(gym);
        gymStaff.setUser(user);
        gymStaff.setStaffRole(role);
        gymStaff.setStatus(StaffStatus.ACTIVE);
        gymStaff.setJoinedAt(LocalDateTime.now());
        gymStaffRepository.save(gymStaff);

        // AUTO-LOGIN: Build response with JWT (no redirect to login needed)
        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setContext("STAFF");
        response.setActiveGymId(gym.getGymId());
        response.setActiveGymName(gym.getName());
        response.setStaffRole(role.name());
        response.setHasStaffAccess(true);
        response.setHasMemberAccess(false);

        // Generate Token with gym context
        String token = tokenProvider.generateTokenFromUser(user, "STAFF", gym.getGymId(), role.name(), null);
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    /**
     * Member signup - creates user, optionally joins gym, and auto-logins with gym
     * context
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

        // Resolve gym context
        Long gymId = null;
        String gymName = null;
        Gym gym = null;

        // If gym ID or invite code provided, join gym
        if (request.getGymId() != null) {
            Optional<Gym> gymOpt = gymRepository.findById(request.getGymId());
            if (gymOpt.isPresent()) {
                gym = gymOpt.get();
            }
        } else if (request.getInviteCode() != null && !request.getInviteCode().isEmpty()) {
            Optional<Gym> gymOpt = gymRepository.findByInviteCode(request.getInviteCode());
            if (gymOpt.isPresent()) {
                gym = gymOpt.get();
            }
        }

        // Create membership if gym found
        String membershipStatus = null;
        if (gym != null) {
            Membership membership = new Membership();
            membership.setGym(gym);
            membership.setUser(user);

            // Public gyms allow instant join, private require approval
            if (gym.getIsPublic()) {
                membership.setStatus(MembershipStatus.ACTIVE);
                membership.setStartDate(LocalDate.now());
                membershipStatus = "APPROVED";
            } else {
                membership.setStatus(MembershipStatus.PENDING);
                membershipStatus = "PENDING";
            }

            membershipRepository.save(membership);

            gymId = gym.getGymId();
            gymName = gym.getName();
        }

        // AUTO-LOGIN: Build response with JWT
        AuthResponse response = new AuthResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setContext("MEMBER");
        response.setHasStaffAccess(false);
        response.setHasMemberAccess(gym != null);
        response.setMembershipStatus(membershipStatus);

        if (gym != null) {
            response.setActiveGymId(gymId);
            response.setActiveGymName(gymName);
        }

        // Generate Token with gym context (null gym ID if no gym joined yet)
        String token = tokenProvider.generateTokenFromUser(user, "MEMBER", gymId, null, membershipStatus);
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

