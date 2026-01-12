package com.gym.management.service;

import com.gym.management.model.*;
import com.gym.management.repository.RolePermissionRepository;
import com.gym.management.repository.UserGymRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing permissions and role-based access control.
 * Handles the core logic for multi-role permission resolution.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PermissionService.java);
    private final RolePermissionRepository rolePermissionRepository;
    private final UserGymRoleRepository userGymRoleRepository;

    /**
     * Get all permissions for a user across all gyms
     */
    public Set<Permission> getUserPermissions(Long userId) {
        Set<GymRole> userRoles = getUserRoles(userId);
        return rolePermissionRepository.findPermissionsByRoles(userRoles);
    }

    /**
     * Get permissions for a user in a specific gym
     */
    public Set<Permission> getUserPermissionsForGym(Long userId, Long gymId) {
        Set<GymRole> userRolesInGym = getUserRolesForGym(userId, gymId);
        return rolePermissionRepository.findPermissionsByRoles(userRolesInGym);
    }

    /**
     * Get all roles for a user across all gyms
     */
    public Set<GymRole> getUserRoles(Long userId) {
        List<UserGymRole> userGymRoles = userGymRoleRepository.findByUserUserId(userId);
        return userGymRoles.stream()
                .filter(UserGymRole::isActiveAndValid)
                .map(UserGymRole::getRole)
                .collect(Collectors.toSet());
    }

    /**
     * Get roles for a user in a specific gym
     */
    public Set<GymRole> getUserRolesForGym(Long userId, Long gymId) {
        List<UserGymRole> userGymRoles = userGymRoleRepository.findByUserUserIdAndGymGymId(userId, gymId);
        return userGymRoles.stream()
                .filter(UserGymRole::isActiveAndValid)
                .map(UserGymRole::getRole)
                .collect(Collectors.toSet());
    }

    /**
     * Get all gym roles for a user mapped by gym ID
     */
    public Map<Long, Set<GymRole>> getUserRolesByGym(Long userId) {
        List<UserGymRole> userGymRoles = userGymRoleRepository.findByUserUserId(userId);
        return userGymRoles.stream()
                .filter(UserGymRole::isActiveAndValid)
                .collect(Collectors.groupingBy(
                        ugr -> ugr.getGym().getGymId(),
                        Collectors.mapping(UserGymRole::getRole, Collectors.toSet())
                ));
    }

    /**
     * Determine primary role for a user (highest priority role)
     * Priority: OWNER > ADMIN > TRAINER > MEMBER
     */
    public GymRole getPrimaryRole(Long userId) {
        Set<GymRole> userRoles = getUserRoles(userId);
        
        if (userRoles.contains(GymRole.OWNER)) return GymRole.OWNER;
        if (userRoles.contains(GymRole.ADMIN)) return GymRole.ADMIN;
        if (userRoles.contains(GymRole.TRAINER)) return GymRole.TRAINER;
        if (userRoles.contains(GymRole.MEMBER)) return GymRole.MEMBER;
        
        return null;
    }

    /**
     * Check if user has a specific permission across any gym
     */
    public boolean hasPermission(Long userId, Permission permission) {
        Set<Permission> userPermissions = getUserPermissions(userId);
        return userPermissions.contains(permission);
    }

    /**
     * Check if user has a specific permission in a specific gym
     */
    public boolean hasPermission(Long userId, Long gymId, Permission permission) {
        Set<Permission> userPermissions = getUserPermissionsForGym(userId, gymId);
        return userPermissions.contains(permission);
    }

    /**
     * Check if user has any of the specified permissions
     */
    public boolean hasAnyPermission(Long userId, Set<Permission> permissions) {
        Set<Permission> userPermissions = getUserPermissions(userId);
        return userPermissions.stream().anyMatch(permissions::contains);
    }

    /**
     * Check if user has all of the specified permissions
     */
    public boolean hasAllPermissions(Long userId, Set<Permission> permissions) {
        Set<Permission> userPermissions = getUserPermissions(userId);
        return userPermissions.containsAll(permissions);
    }

    /**
     * Enrich user object with role and permission information
     */
    public void enrichUserWithPermissions(User user) {
        if (user == null || user.getUserId() == null) return;

        // Get all roles and permissions
        Set<GymRole> allRoles = getUserRoles(user.getUserId());
        Set<Permission> permissions = rolePermissionRepository.findPermissionsByRoles(allRoles);
        Map<Long, Set<GymRole>> rolesByGym = getUserRolesByGym(user.getUserId());
        GymRole primaryRole = getPrimaryRole(user.getUserId());

        // Set transient fields
        user.setAllRoles(allRoles);
        user.setPermissions(permissions);
        user.setRolesByGym(rolesByGym);
        user.setPrimaryRole(primaryRole);
    }

    /**
     * Initialize default permissions for all roles
     */
    public void initializeDefaultPermissions() {
        log.info("Initializing default permissions for gym roles");
        
        // Clear existing permissions
        rolePermissionRepository.deleteAll();
        
        // OWNER permissions (full access)
        addPermission(GymRole.OWNER, Permission.USER_VIEW);
        addPermission(GymRole.OWNER, Permission.USER_CREATE);
        addPermission(GymRole.OWNER, Permission.USER_UPDATE);
        addPermission(GymRole.OWNER, Permission.USER_DELETE);
        addPermission(GymRole.OWNER, Permission.USER_ASSIGN_ROLES);
        addPermission(GymRole.OWNER, Permission.GYM_VIEW);
        addPermission(GymRole.OWNER, Permission.GYM_CREATE);
        addPermission(GymRole.OWNER, Permission.GYM_UPDATE);
        addPermission(GymRole.OWNER, Permission.GYM_DELETE);
        addPermission(GymRole.OWNER, Permission.GYM_MANAGE_SETTINGS);
        addPermission(GymRole.OWNER, Permission.MEMBER_VIEW);
        addPermission(GymRole.OWNER, Permission.MEMBER_CREATE);
        addPermission(GymRole.OWNER, Permission.MEMBER_UPDATE);
        addPermission(GymRole.OWNER, Permission.MEMBER_DELETE);
        addPermission(GymRole.OWNER, Permission.MEMBER_MANAGE_MEMBERSHIP);
        addPermission(GymRole.OWNER, Permission.TRAINER_VIEW);
        addPermission(GymRole.OWNER, Permission.TRAINER_CREATE);
        addPermission(GymRole.OWNER, Permission.TRAINER_UPDATE);
        addPermission(GymRole.OWNER, Permission.TRAINER_DELETE);
        addPermission(GymRole.OWNER, Permission.TRAINER_ASSIGN_CUSTOMERS);
        addPermission(GymRole.OWNER, Permission.SESSION_VIEW);
        addPermission(GymRole.OWNER, Permission.SESSION_CREATE);
        addPermission(GymRole.OWNER, Permission.SESSION_UPDATE);
        addPermission(GymRole.OWNER, Permission.SESSION_DELETE);
        addPermission(GymRole.OWNER, Permission.STAFF_VIEW);
        addPermission(GymRole.OWNER, Permission.STAFF_CREATE);
        addPermission(GymRole.OWNER, Permission.STAFF_UPDATE);
        addPermission(GymRole.OWNER, Permission.STAFF_DELETE);
        addPermission(GymRole.OWNER, Permission.STAFF_MANAGE_SHIFTS);
        addPermission(GymRole.OWNER, Permission.PERFORMANCE_VIEW);
        addPermission(GymRole.OWNER, Permission.PERFORMANCE_MANAGE);
        addPermission(GymRole.OWNER, Permission.ANALYTICS_VIEW);
        addPermission(GymRole.OWNER, Permission.REPORTS_GENERATE);
        addPermission(GymRole.OWNER, Permission.BILLING_VIEW);
        addPermission(GymRole.OWNER, Permission.BILLING_MANAGE);
        addPermission(GymRole.OWNER, Permission.PAYMENTS_PROCESS);
        addPermission(GymRole.OWNER, Permission.REFUNDS_PROCESS);
        addPermission(GymRole.OWNER, Permission.SYSTEM_SETTINGS);
        addPermission(GymRole.OWNER, Permission.SYSTEM_BACKUP);
        addPermission(GymRole.OWNER, Permission.AUDIT_VIEW);
        addPermission(GymRole.OWNER, Permission.MAINTENANCE_MODE);
        addPermission(GymRole.OWNER, Permission.NOTIFICATIONS_SEND);
        addPermission(GymRole.OWNER, Permission.EMAIL_SEND);
        addPermission(GymRole.OWNER, Permission.ANNOUNCEMENTS_CREATE);
        addPermission(GymRole.OWNER, Permission.EQUIPMENT_VIEW);
        addPermission(GymRole.OWNER, Permission.EQUIPMENT_CREATE);
        addPermission(GymRole.OWNER, Permission.EQUIPMENT_UPDATE);
        addPermission(GymRole.OWNER, Permission.EQUIPMENT_DELETE);
        addPermission(GymRole.OWNER, Permission.EQUIPMENT_MAINTENANCE);

        // ADMIN permissions (most access, except system-level)
        addPermission(GymRole.ADMIN, Permission.USER_VIEW);
        addPermission(GymRole.ADMIN, Permission.USER_CREATE);
        addPermission(GymRole.ADMIN, Permission.USER_UPDATE);
        addPermission(GymRole.ADMIN, Permission.USER_ASSIGN_ROLES);
        addPermission(GymRole.ADMIN, Permission.GYM_VIEW);
        addPermission(GymRole.ADMIN, Permission.GYM_UPDATE);
        addPermission(GymRole.ADMIN, Permission.GYM_MANAGE_SETTINGS);
        addPermission(GymRole.ADMIN, Permission.MEMBER_VIEW);
        addPermission(GymRole.ADMIN, Permission.MEMBER_CREATE);
        addPermission(GymRole.ADMIN, Permission.MEMBER_UPDATE);
        addPermission(GymRole.ADMIN, Permission.MEMBER_DELETE);
        addPermission(GymRole.ADMIN, Permission.MEMBER_MANAGE_MEMBERSHIP);
        addPermission(GymRole.ADMIN, Permission.TRAINER_VIEW);
        addPermission(GymRole.ADMIN, Permission.TRAINER_CREATE);
        addPermission(GymRole.ADMIN, Permission.TRAINER_UPDATE);
        addPermission(GymRole.ADMIN, Permission.TRAINER_DELETE);
        addPermission(GymRole.ADMIN, Permission.TRAINER_ASSIGN_CUSTOMERS);
        addPermission(GymRole.ADMIN, Permission.SESSION_VIEW);
        addPermission(GymRole.ADMIN, Permission.SESSION_CREATE);
        addPermission(GymRole.ADMIN, Permission.SESSION_UPDATE);
        addPermission(GymRole.ADMIN, Permission.SESSION_DELETE);
        addPermission(GymRole.ADMIN, Permission.STAFF_VIEW);
        addPermission(GymRole.ADMIN, Permission.STAFF_CREATE);
        addPermission(GymRole.ADMIN, Permission.STAFF_UPDATE);
        addPermission(GymRole.ADMIN, Permission.STAFF_DELETE);
        addPermission(GymRole.ADMIN, Permission.STAFF_MANAGE_SHIFTS);
        addPermission(GymRole.ADMIN, Permission.PERFORMANCE_VIEW);
        addPermission(GymRole.ADMIN, Permission.PERFORMANCE_MANAGE);
        addPermission(GymRole.ADMIN, Permission.ANALYTICS_VIEW);
        addPermission(GymRole.ADMIN, Permission.REPORTS_GENERATE);
        addPermission(GymRole.ADMIN, Permission.BILLING_VIEW);
        addPermission(GymRole.ADMIN, Permission.BILLING_MANAGE);
        addPermission(GymRole.ADMIN, Permission.PAYMENTS_PROCESS);
        addPermission(GymRole.ADMIN, Permission.REFUNDS_PROCESS);
        addPermission(GymRole.ADMIN, Permission.NOTIFICATIONS_SEND);
        addPermission(GymRole.ADMIN, Permission.EMAIL_SEND);
        addPermission(GymRole.ADMIN, Permission.ANNOUNCEMENTS_CREATE);
        addPermission(GymRole.ADMIN, Permission.EQUIPMENT_VIEW);
        addPermission(GymRole.ADMIN, Permission.EQUIPMENT_CREATE);
        addPermission(GymRole.ADMIN, Permission.EQUIPMENT_UPDATE);
        addPermission(GymRole.ADMIN, Permission.EQUIPMENT_DELETE);
        addPermission(GymRole.ADMIN, Permission.EQUIPMENT_MAINTENANCE);

        // TRAINER permissions (training-focused)
        addPermission(GymRole.TRAINER, Permission.USER_VIEW);
        addPermission(GymRole.TRAINER, Permission.USER_UPDATE);
        addPermission(GymRole.TRAINER, Permission.MEMBER_VIEW);
        addPermission(GymRole.TRAINER, Permission.MEMBER_UPDATE);
        addPermission(GymRole.TRAINER, Permission.SESSION_VIEW);
        addPermission(GymRole.TRAINER, Permission.SESSION_CREATE);
        addPermission(GymRole.TRAINER, Permission.SESSION_UPDATE);
        addPermission(GymRole.TRAINER, Permission.SESSION_DELETE);
        addPermission(GymRole.TRAINER, Permission.SESSION_MANAGE_OWN);
        addPermission(GymRole.TRAINER, Permission.PERFORMANCE_VIEW);
        addPermission(GymRole.TRAINER, Permission.NOTIFICATIONS_SEND);
        addPermission(GymRole.TRAINER, Permission.EMAIL_SEND);
        addPermission(GymRole.TRAINER, Permission.EQUIPMENT_VIEW);

        // MEMBER permissions (basic access)
        addPermission(GymRole.MEMBER, Permission.USER_VIEW);
        addPermission(GymRole.MEMBER, Permission.USER_UPDATE);
        addPermission(GymRole.MEMBER, Permission.SESSION_VIEW);
        addPermission(GymRole.MEMBER, Permission.SESSION_MANAGE_OWN);
        addPermission(GymRole.MEMBER, Permission.BILLING_VIEW);
        addPermission(GymRole.MEMBER, Permission.EQUIPMENT_VIEW);

        log.info("Default permissions initialized successfully");
    }

    private void addPermission(GymRole role, Permission permission) {
        RolePermission rolePermission = new RolePermission();
        rolePermission.setRole(role);
        rolePermission.setPermission(permission);
        rolePermission.setIsActive(true);
        rolePermissionRepository.save(rolePermission);
    }
}
