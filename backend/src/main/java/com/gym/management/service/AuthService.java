package com.gym.management.service;

import com.gym.management.dto.AuthRequest;
import com.gym.management.dto.AuthResponse;
import com.gym.management.model.*;
import com.gym.management.repository.UserRepository;
import com.gym.management.security.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Enhanced authentication service for multi-role single-login system.
 * Handles login, token generation, and user context management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    /**
     * Authenticate user and generate JWT token with roles and permissions
     */
    public AuthResponse authenticateUser(AuthRequest authRequest) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUsername(),
                            authRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get user details
            String username = authRequest.getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Enrich user with permissions and roles
            permissionService.enrichUserWithPermissions(user);

            // Convert to strings for JWT
            Set<String> roleNames = user.getAllRoles().stream()
                    .map(Enum::name)
                    .collect(Collectors.toSet());

            Set<String> permissionNames = user.getPermissions().stream()
                    .map(Enum::name)
                    .collect(Collectors.toSet());

            String primaryRoleName = user.getPrimaryRole() != null ? user.getPrimaryRole().name() : null;

            // Generate JWT with enhanced claims
            String token = tokenProvider.generateTokenFromUser(
                    user,
                    "web",
                    null, // activeGymId - can be set later
                    null, // staffRole - derived from roles
                    null, // membershipStatus - can be added later
                    permissionNames,
                    roleNames,
                    primaryRoleName);

            // Create response
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setType("Bearer");
            response.setUserId(user.getUserId());
            response.setUsername(user.getUsername());
            response.setFullName(user.getFullName());
            response.setEmail(user.getEmail());
            response.setRoles(roleNames);
            response.setPermissions(permissionNames);
            response.setPrimaryRole(primaryRoleName);
            response.setIsFirstLogin(user.getIsFirstLogin());

            log.info("User {} authenticated successfully with roles: {}", username, roleNames);
            return response;

        } catch (Exception e) {
            log.error("Authentication failed for user: {}", authRequest.getUsername(), e);
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    /**
     * Refresh user token with updated permissions
     */
    public AuthResponse refreshToken(String token) {
        try {
            // Validate and extract user info from current token
            if (!tokenProvider.validateToken(token)) {
                throw new RuntimeException("Invalid token");
            }

            Long userId = tokenProvider.getUserIdFromJWT(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Refresh permissions and roles
            permissionService.enrichUserWithPermissions(user);

            // Convert to strings for JWT
            Set<String> roleNames = user.getAllRoles().stream()
                    .map(Enum::name)
                    .collect(Collectors.toSet());

            Set<String> permissionNames = user.getPermissions().stream()
                    .map(Enum::name)
                    .collect(Collectors.toSet());

            String primaryRoleName = user.getPrimaryRole() != null ? user.getPrimaryRole().name() : null;

            // Generate new token
            String newToken = tokenProvider.generateTokenFromUser(
                    user,
                    "web",
                    null, // activeGymId
                    null, // staffRole
                    null, // membershipStatus
                    permissionNames,
                    roleNames,
                    primaryRoleName);

            // Create response
            AuthResponse response = new AuthResponse();
            response.setToken(newToken);
            response.setType("Bearer");
            response.setUserId(user.getUserId());
            response.setUsername(user.getUsername());
            response.setFullName(user.getFullName());
            response.setEmail(user.getEmail());
            response.setRoles(roleNames);
            response.setPermissions(permissionNames);
            response.setPrimaryRole(primaryRoleName);
            response.setIsFirstLogin(user.getIsFirstLogin());

            log.info("Token refreshed for user: {}", user.getUsername());
            return response;

        } catch (Exception e) {
            log.error("Token refresh failed", e);
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Switch active gym context for the user
     */
    public AuthResponse switchGymContext(Long userId, Long gymId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has access to the gym
            if (!permissionService.getUserRolesForGym(userId, gymId).isEmpty()) {
                // Enrich user with permissions for the specific gym
                permissionService.enrichUserWithPermissions(user);

                Set<String> roleNames = user.getAllRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet());

                Set<String> permissionNames = permissionService.getUserPermissionsForGym(userId, gymId)
                        .stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet());

                String primaryRoleName = user.getPrimaryRole() != null ? user.getPrimaryRole().name() : null;

                // Generate new token with gym context
                String token = tokenProvider.generateTokenFromUser(
                        user,
                        "web",
                        gymId,
                        null, // staffRole
                        null, // membershipStatus
                        permissionNames,
                        roleNames,
                        primaryRoleName);

                AuthResponse response = new AuthResponse();
                response.setToken(token);
                response.setType("Bearer");
                response.setUserId(user.getUserId());
                response.setUsername(user.getUsername());
                response.setFullName(user.getFullName());
                response.setEmail(user.getEmail());
                response.setRoles(roleNames);
                response.setPermissions(permissionNames);
                response.setPrimaryRole(primaryRoleName);
                response.setIsFirstLogin(user.getIsFirstLogin());

                log.info("User {} switched to gym context: {}", user.getUsername(), gymId);
                return response;
            } else {
                throw new RuntimeException("User does not have access to this gym");
            }

        } catch (Exception e) {
            log.error("Gym context switch failed for user: {}, gym: {}", userId, gymId, e);
            throw new RuntimeException("Gym context switch failed: " + e.getMessage());
        }
    }

    /**
     * Get current authenticated user with enhanced details
     */
    public MultiRoleUserDetails getCurrentUserWithDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof MultiRoleUserDetails) {
            return (MultiRoleUserDetails) authentication.getPrincipal();
        }

        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = customUserDetails.getUser();

            // Enrich user with permissions
            permissionService.enrichUserWithPermissions(user);

            // Create multi-role user details
            MultiRoleUserDetails multiRoleUserDetails = new MultiRoleUserDetails(customUserDetails);
            multiRoleUserDetails.setRoles(user.getAllRoles());
            multiRoleUserDetails.setPermissions(user.getPermissions());
            multiRoleUserDetails.setPrimaryRole(user.getPrimaryRole());
            multiRoleUserDetails.setRolesByGym(user.getRolesByGym());

            return multiRoleUserDetails;
        }

        throw new RuntimeException("User not authenticated");
    }

    /**
     * Extract user ID from JWT token
     */
    public Long getUserIdFromToken(String token) {
        return tokenProvider.getUserIdFromToken(token);
    }

    /**
     * Logout user (clear security context)
     */
    public void logout() {
        SecurityContextHolder.clearContext();
        log.info("User logged out successfully");
    }
}
