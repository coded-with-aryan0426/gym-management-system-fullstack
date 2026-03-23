package com.gym.management.repository;

import com.gym.management.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

        @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName")
        List<User> findByRoleName(@Param("roleName") String roleName);

        // Paginated version of findByRoleName
        @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName")
        Page<User> findByRoleNamePaginated(@Param("roleName") String roleName, Pageable pageable);

        // Paginated with search
        @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName AND " +
                        "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<User> findByRoleNameAndSearchPaginated(
                        @Param("roleName") String roleName,
                        @Param("search") String search,
                        Pageable pageable);

        // Count by role (for stats)
        @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.roleName = :roleName")
        long countByRoleName(@Param("roleName") String roleName);

        // Find staff by multiple role names (non-trainer staff) - uses subquery to
        // avoid DISTINCT + CLOB issues on Oracle
        @Query("SELECT u FROM User u WHERE u.userId IN (SELECT u2.userId FROM User u2 JOIN u2.roles r WHERE r.roleName IN :roleNames)")
        List<User> findByRoleNames(@Param("roleNames") java.util.Collection<String> roleNames);

        java.util.Optional<User> findByUsername(String username);

        boolean existsByUsername(String username);

        @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email)")
        boolean existsByEmailIgnoreCase(@Param("email") String email);

        java.util.Optional<User> findByEmail(String email);

        @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
        List<User> searchUsers(@Param("roleName") String roleName, @Param("query") String query);

        // Social auth finders
        java.util.Optional<User> findByGoogleId(String googleId);

        // Custom queries to avoid eager loading issues
        @Query("SELECT u.fullName FROM User u WHERE u.userId = :userId")
        String findFullNameByUserId(@Param("userId") Long userId);

        @Query("SELECT u.email FROM User u WHERE u.userId = :userId")
        String findEmailByUserId(@Param("userId") Long userId);

        @Query("SELECT u.phone FROM User u WHERE u.userId = :userId")
        String findPhoneByUserId(@Param("userId") Long userId);

        java.util.Optional<User> findByPhoneNumberPersisted(String phoneNumber);

        // Alias for backward compatibility
        default java.util.Optional<User> findByPhoneNumber(String phoneNumber) {
                return findByPhoneNumberPersisted(phoneNumber);
        }

        // Find trainers who have a specific member in their customers (owning side)
        @Query("SELECT t FROM User t JOIN t.customers c WHERE c.userId = :memberId")
        List<User> findTrainersByMemberId(@Param("memberId") Long memberId);

        // Find owners (for notifications)
        @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = 'OWNER'")
        List<User> findAllOwners();

        // ── Native DML for trainer_customer_map (bypasses Hibernate merge issues) ──

        /**
         * Directly insert a row into trainer_customer_map (Oracle-compatible).
         * INSERT only if the row does not already exist.
         */
        @Modifying
        @Transactional
        @Query(value = "INSERT INTO trainer_customer_map (trainer_user_id, customer_user_id) SELECT :trainerId, :memberId FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM trainer_customer_map WHERE trainer_user_id = :trainerId AND customer_user_id = :memberId)", nativeQuery = true)
        void assignMemberToTrainer(@Param("trainerId") Long trainerId, @Param("memberId") Long memberId);

        /**
         * Directly delete a row from trainer_customer_map.
         */
        @Modifying
        @Transactional
        @Query(value = "DELETE FROM trainer_customer_map WHERE trainer_user_id = :trainerId AND customer_user_id = :memberId", nativeQuery = true)
        void unassignMemberFromTrainer(@Param("trainerId") Long trainerId, @Param("memberId") Long memberId);

        /**
         * Check if assignment already exists.
         */
        @Query(value = "SELECT COUNT(*) FROM trainer_customer_map WHERE trainer_user_id = :trainerId AND customer_user_id = :memberId", nativeQuery = true)
        int countAssignment(@Param("trainerId") Long trainerId, @Param("memberId") Long memberId);

        /**
         * Check if ownerUserId is an OWNER in any gym where targetUserId is also a member/trainer.
         * Uses user_gym_roles table — avoids any lazy-load issues.
         */
        @Query(value = "SELECT COUNT(*) FROM user_gym_roles ugr1 JOIN user_gym_roles ugr2 ON ugr1.gym_id = ugr2.gym_id WHERE ugr1.user_id = :ownerId AND ugr1.role = 'OWNER' AND ugr1.status = 'ACTIVE' AND ugr2.user_id = :targetId AND ugr2.status = 'ACTIVE'", nativeQuery = true)
        int countOwnerOfTarget(@Param("ownerId") Long ownerId, @Param("targetId") Long targetId);
}
