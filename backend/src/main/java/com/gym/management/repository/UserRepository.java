package com.gym.management.repository;

import com.gym.management.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
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

    java.util.Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    java.util.Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleName = :roleName AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsers(@Param("roleName") String roleName, @Param("query") String query);
}
