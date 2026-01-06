package com.gym.management.repository;

import com.gym.management.model.ApplicationStatus;
import com.gym.management.model.GymRole;
import com.gym.management.model.RoleApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleApplicationRepository extends JpaRepository<RoleApplication, Long> {

    /**
     * Find all applications for a user.
     */
    List<RoleApplication> findByUserUserId(Long userId);

    /**
     * Find pending applications at a gym.
     */
    List<RoleApplication> findByGymGymIdAndStatus(Long gymId, ApplicationStatus status);

    /**
     * Find pending applications for a specific role at a gym.
     */
    List<RoleApplication> findByGymGymIdAndRequestedRoleAndStatus(Long gymId, GymRole role, ApplicationStatus status);

    /**
     * Check for existing pending application.
     */
    Optional<RoleApplication> findByUserUserIdAndGymGymIdAndRequestedRoleAndStatus(
            Long userId, Long gymId, GymRole requestedRole, ApplicationStatus status);

    /**
     * Check if user has a pending application.
     */
    boolean existsByUserUserIdAndGymGymIdAndRequestedRoleAndStatus(
            Long userId, Long gymId, GymRole requestedRole, ApplicationStatus status);

    /**
     * Count pending applications at a gym.
     */
    long countByGymGymIdAndStatus(Long gymId, ApplicationStatus status);
}
