package com.gym.management.repository;

import com.gym.management.model.GymRole;
import com.gym.management.model.Permission;
import com.gym.management.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    /**
     * Find all permissions for a specific role
     */
    @Query("SELECT rp.permission FROM RolePermission rp WHERE rp.role = :role AND rp.isActive = true")
    Set<Permission> findPermissionsByRole(@Param("role") GymRole role);

    /**
     * Find all role permissions for a given set of roles
     */
    @Query("SELECT DISTINCT rp.permission FROM RolePermission rp WHERE rp.role IN :roles AND rp.isActive = true")
    Set<Permission> findPermissionsByRoles(@Param("roles") Set<GymRole> roles);

    /**
     * Check if a role has a specific permission
     */
    @Query("SELECT COUNT(rp) > 0 FROM RolePermission rp WHERE rp.role = :role AND rp.permission = :permission AND rp.isActive = true")
    boolean hasPermission(@Param("role") GymRole role, @Param("permission") Permission permission);

    /**
     * Get all role permissions for management
     */
    List<RolePermission> findByIsActiveTrue();

    /**
     * Find permissions by role and scope
     */
    @Query("SELECT rp.permission FROM RolePermission rp WHERE rp.role = :role AND rp.scope = :scope AND rp.isActive = true")
    Set<Permission> findPermissionsByRoleAndScope(@Param("role") GymRole role, @Param("scope") String scope);
}
