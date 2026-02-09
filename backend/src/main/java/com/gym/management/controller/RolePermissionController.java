package com.gym.management.controller;

import com.gym.management.model.*;
import com.gym.management.repository.RolePermissionRepository;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for managing role permissions.
 * Provides CRUD operations for the access control matrix.
 */
@RestController
@RequestMapping("/api/settings/permissions")
@RequiredArgsConstructor
public class RolePermissionController {

    private static final Logger logger = LoggerFactory.getLogger(RolePermissionController.class);
    
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionService permissionService;

    /**
     * Get all permissions grouped by role for the access control matrix
     */
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getAllPermissions() {
        try {
            // Get all active role permissions
            List<RolePermission> allPermissions = rolePermissionRepository.findByIsActiveTrue();
            
            // Build permission matrix: role -> permission -> true/false
            Map<String, Map<String, Boolean>> matrix = new LinkedHashMap<>();
            
            // Initialize all roles with all permissions as false
            for (GymRole role : GymRole.values()) {
                Map<String, Boolean> rolePerms = new LinkedHashMap<>();
                for (Permission perm : Permission.values()) {
                    rolePerms.put(perm.name(), false);
                }
                matrix.put(role.name(), rolePerms);
            }
            
            // Set permissions that are active to true
            for (RolePermission rp : allPermissions) {
                if (rp.getRole() != null && rp.getPermission() != null) {
                    String roleName = rp.getRole().name();
                    String permName = rp.getPermission().name();
                    if (matrix.containsKey(roleName) && matrix.get(roleName).containsKey(permName)) {
                        matrix.get(roleName).put(permName, true);
                    }
                }
            }
            
            // Build response with permission metadata
            List<Map<String, Object>> permissionDefs = new ArrayList<>();
            for (Permission perm : Permission.values()) {
                Map<String, Object> def = new LinkedHashMap<>();
                def.put("key", perm.name());
                def.put("label", formatPermissionLabel(perm.name()));
                def.put("description", perm.getDescription());
                def.put("category", getPermissionCategory(perm.name()));
                permissionDefs.add(def);
            }
            
            // List of roles
            List<String> roles = Arrays.stream(GymRole.values())
                    .map(GymRole::name)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("roles", roles);
            response.put("permissions", permissionDefs);
            response.put("matrix", matrix);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching permissions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch permissions: " + e.getMessage()));
        }
    }
    
    /**
     * Update role permissions in bulk
     */
    @PutMapping("")
    public ResponseEntity<Map<String, Object>> updatePermissions(@RequestBody Map<String, Map<String, Boolean>> matrix) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }
            
            // Track changes for response
            List<Map<String, Object>> changes = new ArrayList<>();
            
            for (Map.Entry<String, Map<String, Boolean>> roleEntry : matrix.entrySet()) {
                String roleName = roleEntry.getKey();
                Map<String, Boolean> permissions = roleEntry.getValue();
                
                // Skip Owner role - cannot be modified
                if ("OWNER".equalsIgnoreCase(roleName)) {
                    continue;
                }
                
                GymRole role;
                try {
                    role = GymRole.valueOf(roleName.toUpperCase());
                } catch (IllegalArgumentException e) {
                    continue; // Skip unknown roles
                }
                
                for (Map.Entry<String, Boolean> permEntry : permissions.entrySet()) {
                    String permName = permEntry.getKey();
                    Boolean enabled = permEntry.getValue();
                    
                    Permission permission;
                    try {
                        permission = Permission.valueOf(permName);
                    } catch (IllegalArgumentException e) {
                        continue; // Skip unknown permissions
                    }
                    
                    // Check current state
                    boolean currentlyHas = rolePermissionRepository.hasPermission(role, permission);
                    
                    if (enabled && !currentlyHas) {
                        // Grant permission
                        RolePermission rp = new RolePermission();
                        rp.setRole(role);
                        rp.setPermission(permission);
                        rp.setIsActive(true);
                        rolePermissionRepository.save(rp);
                        
                        changes.add(Map.of(
                            "role", roleName,
                            "permission", permName,
                            "permissionLabel", formatPermissionLabel(permName),
                            "action", "GRANTED"
                        ));
                    } else if (!enabled && currentlyHas) {
                        // Revoke permission - soft delete by setting isActive to false
                        rolePermissionRepository.findByIsActiveTrue().stream()
                            .filter(rp -> rp.getRole() == role && rp.getPermission() == permission)
                            .forEach(rp -> {
                                rp.setIsActive(false);
                                rolePermissionRepository.save(rp);
                            });
                        
                        changes.add(Map.of(
                            "role", roleName,
                            "permission", permName,
                            "permissionLabel", formatPermissionLabel(permName),
                            "action", "REVOKED"
                        ));
                    }
                }
            }
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "Permissions updated successfully");
            response.put("changes", changes);
            response.put("changeCount", changes.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating permissions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update permissions: " + e.getMessage()));
        }
    }
    
    /**
     * Initialize default permissions (admin only)
     */
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializePermissions() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }
            
            permissionService.initializeDefaultPermissions();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Default permissions initialized successfully"
            ));
        } catch (Exception e) {
            logger.error("Error initializing permissions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to initialize permissions: " + e.getMessage()));
        }
    }
    
    /**
     * Get current user's permissions
     */
    @GetMapping("/my-permissions")
    public ResponseEntity<Map<String, Object>> getMyPermissions() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }
            
            Set<Permission> permissions = permissionService.getUserPermissions(userId);
            Set<GymRole> roles = permissionService.getUserRoles(userId);
            GymRole primaryRole = permissionService.getPrimaryRole(userId);
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("userId", userId);
            response.put("primaryRole", primaryRole != null ? primaryRole.name() : null);
            response.put("roles", roles.stream().map(GymRole::name).collect(Collectors.toList()));
            response.put("permissions", permissions.stream().map(Permission::name).collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching user permissions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch permissions: " + e.getMessage()));
        }
    }
    
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        return null;
    }
    
    private String formatPermissionLabel(String permName) {
        // Convert SNAKE_CASE to Title Case with spaces
        return Arrays.stream(permName.split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
    
    private String getPermissionCategory(String permName) {
        if (permName.startsWith("USER_")) return "User Management";
        if (permName.startsWith("GYM_")) return "Gym Management";
        if (permName.startsWith("MEMBER_")) return "Member Management";
        if (permName.startsWith("TRAINER_")) return "Trainer Management";
        if (permName.startsWith("SESSION_")) return "Training Sessions";
        if (permName.startsWith("STAFF_")) return "Staff Management";
        if (permName.startsWith("PERFORMANCE_") || permName.startsWith("ANALYTICS_") || permName.startsWith("REPORTS_")) return "Analytics & Reports";
        if (permName.startsWith("BILLING_") || permName.startsWith("PAYMENTS_") || permName.startsWith("REFUNDS_")) return "Financial";
        if (permName.startsWith("SYSTEM_") || permName.startsWith("AUDIT_") || permName.startsWith("MAINTENANCE_")) return "System";
        if (permName.startsWith("NOTIFICATIONS_") || permName.startsWith("EMAIL_") || permName.startsWith("ANNOUNCEMENTS_")) return "Communication";
        if (permName.startsWith("EQUIPMENT_")) return "Equipment";
        return "General";
    }
}
