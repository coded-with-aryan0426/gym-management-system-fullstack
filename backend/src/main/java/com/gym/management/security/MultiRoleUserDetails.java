package com.gym.management.security;

import com.gym.management.model.Permission;
import com.gym.management.model.GymRole;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced UserDetails implementation for multi-role users.
 * Contains roles, permissions, and context information.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MultiRoleUserDetails extends CustomUserDetails {

    private Set<GymRole> roles;
    private Set<Permission> permissions;
    private GymRole primaryRole;
    private Map<Long, Set<GymRole>> rolesByGym;
    private Long activeGymId;

    public MultiRoleUserDetails(CustomUserDetails baseUserDetails) {
        super(baseUserDetails.getUser());
    }

    public MultiRoleUserDetails(com.gym.management.model.User user) {
        super(user);
    }

    /**
     * Create authorities from roles and permissions
     */
    public static Collection<? extends GrantedAuthority> createAuthorities(
            Set<GymRole> roles, Set<Permission> permissions) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // Add role-based authorities
        if (roles != null) {
            authorities.addAll(roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                    .collect(Collectors.toSet()));
        }
        
        // Add permission-based authorities
        if (permissions != null) {
            authorities.addAll(permissions.stream()
                    .map(permission -> new SimpleGrantedAuthority("PERMISSION_" + permission.name()))
                    .collect(Collectors.toSet()));
        }
        
        return authorities;
    }

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(GymRole role) {
        return roles != null && roles.contains(role);
    }

    /**
     * Check if user has a specific permission
     */
    public boolean hasPermission(Permission permission) {
        return permissions != null && permissions.contains(permission);
    }

    /**
     * Check if user has any of the specified roles
     */
    public boolean hasAnyRole(GymRole... roles) {
        if (this.roles == null || roles == null) return false;
        return Arrays.stream(roles).anyMatch(this.roles::contains);
    }

    /**
     * Check if user has any of the specified permissions
     */
    public boolean hasAnyPermission(Permission... permissions) {
        if (this.permissions == null || permissions == null) return false;
        return Arrays.stream(permissions).anyMatch(this.permissions::contains);
    }

    /**
     * Get roles for a specific gym
     */
    public Set<GymRole> getRolesForGym(Long gymId) {
        return rolesByGym != null ? rolesByGym.getOrDefault(gymId, Collections.emptySet()) : Collections.emptySet();
    }

    /**
     * Check if user has a specific role in a specific gym
     */
    public boolean hasRoleInGym(Long gymId, GymRole role) {
        Set<GymRole> gymRoles = getRolesForGym(gymId);
        return gymRoles.contains(role);
    }

    /**
     * Check if user is owner or admin in any gym
     */
    public boolean isOwnerOrAdmin() {
        return hasAnyRole(GymRole.OWNER, GymRole.ADMIN);
    }

    /**
     * Check if user is owner or admin in a specific gym
     */
    public boolean isOwnerOrAdminInGym(Long gymId) {
        Set<GymRole> gymRoles = getRolesForGym(gymId);
        return gymRoles.contains(GymRole.OWNER) || gymRoles.contains(GymRole.ADMIN);
    }

    /**
     * Check if user is trainer in any gym
     */
    public boolean isTrainer() {
        return hasRole(GymRole.TRAINER);
    }

    /**
     * Check if user is trainer in a specific gym
     */
    public boolean isTrainerInGym(Long gymId) {
        return hasRoleInGym(gymId, GymRole.TRAINER);
    }

    /**
     * Check if user is member in any gym
     */
    public boolean isMember() {
        return hasRole(GymRole.MEMBER);
    }

    /**
     * Check if user is member in a specific gym
     */
    public boolean isMemberInGym(Long gymId) {
        return hasRoleInGym(gymId, GymRole.MEMBER);
    }

    /**
     * Get all gym IDs where user has roles
     */
    public Set<Long> getAccessibleGymIds() {
        return rolesByGym != null ? rolesByGym.keySet() : Collections.emptySet();
    }

    /**
     * Check if user can access a specific gym
     */
    public boolean canAccessGym(Long gymId) {
        return getAccessibleGymIds().contains(gymId);
    }
}
