package com.gym.management.repository;

import com.gym.management.model.GymRole;
import com.gym.management.model.RoleStatus;
import com.gym.management.model.UserGymRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserGymRoleRepository extends JpaRepository<UserGymRole, Long> {

    /**
     * Find all roles for a user across all gyms.
     */
    List<UserGymRole> findByUserUserId(Long userId);

    /**
     * Find all active roles for a user.
     */
    List<UserGymRole> findByUserUserIdAndStatus(Long userId, RoleStatus status);

    /**
     * Find all roles for a user at a specific gym.
     */
    List<UserGymRole> findByUserUserIdAndGymGymId(Long userId, Long gymId);

    /**
     * Find active roles for a user at a specific gym.
     */
    List<UserGymRole> findByUserUserIdAndGymGymIdAndStatus(Long userId, Long gymId, RoleStatus status);

    /**
     * Find a specific role assignment.
     */
    Optional<UserGymRole> findByUserUserIdAndGymGymIdAndRole(Long userId, Long gymId, GymRole role);

    /**
     * Check if user has a specific role at a gym.
     */
    boolean existsByUserUserIdAndGymGymIdAndRoleAndStatus(Long userId, Long gymId, GymRole role, RoleStatus status);

    /**
     * Find all users with a specific role at a gym.
     */
    List<UserGymRole> findByGymGymIdAndRoleAndStatus(Long gymId, GymRole role, RoleStatus status);

    /**
     * Find all staff (non-member) at a gym.
     */
    @Query("SELECT ugr FROM UserGymRole ugr WHERE ugr.gym.gymId = :gymId AND ugr.role != 'MEMBER' AND ugr.status = 'ACTIVE'")
    List<UserGymRole> findActiveStaffByGym(@Param("gymId") Long gymId);

    /**
     * Find all members at a gym.
     */
    List<UserGymRole> findByGymGymIdAndRoleAndStatus(Long gymId, RoleStatus status, GymRole role);

    /**
     * Count active roles for a user.
     */
    long countByUserUserIdAndStatus(Long userId, RoleStatus status);
}
