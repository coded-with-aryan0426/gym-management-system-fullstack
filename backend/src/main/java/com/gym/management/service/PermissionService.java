package com.gym.management.service;

import com.gym.management.model.*;
import com.gym.management.repository.RolePermissionRepository;
import com.gym.management.repository.UserGymRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PermissionService.class);
    private final RolePermissionRepository rolePermissionRepository;
    private final UserGymRoleRepository userGymRoleRepository;

    public Set<Permission> getUserPermissions(Long userId) {
        Set<GymRole> userRoles = getUserRoles(userId);
        return rolePermissionRepository.findPermissionsByRoles(userRoles);
    }

    public Set<GymRole> getUserRoles(Long userId) {
        List<UserGymRole> userGymRoles = userGymRoleRepository.findByUserUserId(userId);
        return userGymRoles.stream()
                .filter(UserGymRole::isActiveAndValid)
                .map(UserGymRole::getRole)
                .collect(Collectors.toSet());
    }

    public GymRole getPrimaryRole(Long userId) {
        Set<GymRole> userRoles = getUserRoles(userId);

        if (userRoles.contains(GymRole.OWNER))
            return GymRole.OWNER;
        if (userRoles.contains(GymRole.ADMIN))
            return GymRole.ADMIN;
        if (userRoles.contains(GymRole.TRAINER))
            return GymRole.TRAINER;
        if (userRoles.contains(GymRole.MEMBER))
            return GymRole.MEMBER;

        return null;
    }

    public boolean hasPermission(Long userId, Permission permission) {
        Set<Permission> userPermissions = getUserPermissions(userId);
        return userPermissions.contains(permission);
    }

    public boolean hasAnyPermission(Long userId, Set<Permission> permissions) {
        Set<Permission> userPermissions = getUserPermissions(userId);
        return userPermissions.stream().anyMatch(permissions::contains);
    }

    public boolean hasAllPermissions(Long userId, Set<Permission> permissions) {
        Set<Permission> userPermissions = getUserPermissions(userId);
        return userPermissions.containsAll(permissions);
    }

    public void enrichUserWithPermissions(User user) {
        if (user == null || user.getUserId() == null)
            return;

        Set<GymRole> allRoles = getUserRoles(user.getUserId());
        Set<Permission> permissions = rolePermissionRepository.findPermissionsByRoles(allRoles);
        GymRole primaryRole = getPrimaryRole(user.getUserId());

        user.setAllRoles(allRoles);
        user.setPermissions(permissions);
        user.setPrimaryRole(primaryRole);
    }

    public void initializeDefaultPermissions() {
        log.info("Initializing default permissions for gym roles");

        rolePermissionRepository.deleteAll();

        addPermission(GymRole.OWNER, Permission.USER_VIEW);
        addPermission(GymRole.OWNER, Permission.USER_CREATE);
        addPermission(GymRole.OWNER, Permission.USER_UPDATE);
        addPermission(GymRole.OWNER, Permission.USER_DELETE);
        addPermission(GymRole.OWNER, Permission.USER_ASSIGN_ROLES);
        addPermission(GymRole.OWNER, Permission.GYM_VIEW);
        addPermission(GymRole.OWNER, Permission.GYM_UPDATE);
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
        addPermission(GymRole.OWNER, Permission.ANALYTICS_VIEW);
        addPermission(GymRole.OWNER, Permission.REPORTS_GENERATE);
        addPermission(GymRole.OWNER, Permission.BILLING_MANAGE);

        addPermission(GymRole.ADMIN, Permission.USER_VIEW);
        addPermission(GymRole.ADMIN, Permission.USER_CREATE);
        addPermission(GymRole.ADMIN, Permission.USER_UPDATE);
        addPermission(GymRole.ADMIN, Permission.MEMBER_VIEW);
        addPermission(GymRole.ADMIN, Permission.MEMBER_CREATE);
        addPermission(GymRole.ADMIN, Permission.MEMBER_UPDATE);
        addPermission(GymRole.ADMIN, Permission.MEMBER_DELETE);
        addPermission(GymRole.ADMIN, Permission.TRAINER_VIEW);
        addPermission(GymRole.ADMIN, Permission.SESSION_VIEW);
        addPermission(GymRole.ADMIN, Permission.SESSION_CREATE);
        addPermission(GymRole.ADMIN, Permission.SESSION_UPDATE);
        addPermission(GymRole.ADMIN, Permission.ANALYTICS_VIEW);
        addPermission(GymRole.ADMIN, Permission.BILLING_MANAGE);

        addPermission(GymRole.TRAINER, Permission.TRAINER_VIEW);
        addPermission(GymRole.TRAINER, Permission.SESSION_VIEW);
        addPermission(GymRole.TRAINER, Permission.SESSION_CREATE);
        addPermission(GymRole.TRAINER, Permission.SESSION_UPDATE);
        addPermission(GymRole.TRAINER, Permission.MEMBER_VIEW);

        addPermission(GymRole.MEMBER, Permission.MEMBER_VIEW);
        addPermission(GymRole.MEMBER, Permission.SESSION_VIEW);

        log.info("Default permissions initialized for {} roles", GymRole.values().length);
    }

    private void addPermission(GymRole role, Permission permission) {
        RolePermission rp = new RolePermission();
        rp.setRole(role);
        rp.setPermission(permission);
        rolePermissionRepository.save(rp);
    }

    public Set<Permission> getPermissionsForRole(GymRole role) {
        return rolePermissionRepository.findPermissionsByRoles(Set.of(role));
    }
}
