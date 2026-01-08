package com.gym.management.controller;

import com.gym.management.dto.AuthRequest;
import com.gym.management.dto.AuthResponse;
import com.gym.management.service.AuthService;
import com.gym.management.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Enhanced authentication controller for multi-role single-login system
 */
@RestController
@RequestMapping("/api/multi-role/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MultiRoleAuthController {

    private final AuthService authService;
    private final PermissionService permissionService;

    /**
     * Authenticate user with multi-role support
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        try {
            AuthResponse response = authService.authenticateUser(authRequest);
            log.info("User {} authenticated successfully with roles: {}", 
                    authRequest.getUsername(), response.getRoles());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", authRequest.getUsername(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Refresh JWT token with updated permissions
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String token) {
        try {
            // Extract token from "Bearer <token>"
            String jwt = token.replace("Bearer ", "");
            AuthResponse response = authService.refreshToken(jwt);
            log.info("Token refreshed for user: {}", response.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Switch gym context for multi-gym users
     */
    @PostMapping("/switch-gym/{gymId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthResponse> switchGymContext(
            @PathVariable Long gymId,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            Long userId = authService.getUserIdFromToken(jwt);
            AuthResponse response = authService.switchGymContext(userId, gymId);
            
            log.info("User switched to gym context: {}", gymId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Gym context switch failed for gym: {}", gymId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get current user permissions
     */
    @GetMapping("/permissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserPermissions(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            Long userId = authService.getUserIdFromToken(jwt);
            
            var permissions = permissionService.getUserPermissions(userId);
            var roles = permissionService.getUserRoles(userId);
            var primaryRole = permissionService.getPrimaryRole(userId);
            var rolesByGym = permissionService.getUserRolesByGym(userId);
            
            return ResponseEntity.ok(java.util.Map.of(
                "permissions", permissions,
                "roles", roles,
                "primaryRole", primaryRole,
                "rolesByGym", rolesByGym
            ));
        } catch (Exception e) {
            log.error("Failed to get user permissions", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Check if user has specific permission
     */
    @PostMapping("/check-permission")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> checkPermission(
            @RequestBody java.util.Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            Long userId = authService.getUserIdFromToken(jwt);
            String permission = request.get("permission");
            
            if (permission == null) {
                return ResponseEntity.badRequest().body("Permission parameter is required");
            }
            
            boolean hasPermission = permissionService.hasPermission(userId, 
                    com.gym.management.model.Permission.valueOf(permission));
            
            return ResponseEntity.ok(java.util.Map.of("hasPermission", hasPermission));
        } catch (Exception e) {
            log.error("Permission check failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Initialize default permissions (system admin only)
     */
    @PostMapping("/init-permissions")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> initializePermissions() {
        try {
            permissionService.initializeDefaultPermissions();
            log.info("Default permissions initialized successfully");
            return ResponseEntity.ok("Permissions initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize permissions", e);
            return ResponseEntity.badRequest().body("Failed to initialize permissions");
        }
    }

    /**
     * Logout user
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            authService.logout();
            log.info("User logged out successfully");
            return ResponseEntity.ok("Logged out successfully");
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
