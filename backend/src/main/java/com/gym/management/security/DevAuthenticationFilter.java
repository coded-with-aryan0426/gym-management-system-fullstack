package com.gym.management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.gym.management.model.GymRole;
import com.gym.management.model.RoleStatus;
import com.gym.management.model.UserGymRole;
import com.gym.management.repository.UserGymRoleRepository;
import com.gym.management.repository.UserRepository;
import java.io.IOException;
import java.util.List;

/**
 * Dev mode authentication filter.
 * Maps dev tokens to REAL database users based on their gym role assignments.
 * This allows full functionality testing with real user data.
 */
@Component
@Profile("dev")
public class DevAuthenticationFilter extends OncePerRequestFilter {

    private static final String DEV_TOKEN_PREFIX = "DEV_TOKEN_";
    private static final List<String> ALLOWED_ROLES = List.of("ADMIN", "OWNER", "TRAINER", "MEMBER", "CUSTOMER");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    @Autowired
    private UserGymRoleRepository userGymRoleRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer " + DEV_TOKEN_PREFIX)) {
            String tokenRole = authHeader.substring(7 + DEV_TOKEN_PREFIX.length());

            // Validate role
            final String role = ALLOWED_ROLES.contains(tokenRole) ? tokenRole : null;

            if (role != null) {
                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role),
                        new SimpleGrantedAuthority("ROLE_DEV"));

                // Find a REAL user based on their gym role assignment
                // Wrap in transaction to avoid LazyInitializationException when accessing
                // user.getFullName() later
                com.gym.management.model.User realUser = new org.springframework.transaction.support.TransactionTemplate(
                        transactionManager)
                        .execute(status -> findUserByGymRole(role));

                if (realUser != null) {
                    Object principal = new CustomUserDetails(realUser);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            principal, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info("DEV Auth: Using real user [" + realUser.getUserId() + "] " +
                            realUser.getFullName() + " for role " + role);
                } else {
                    logger.warn("DEV Auth: No user found with role " + role + " in database. Skipping auth.");
                }
            } else {
                logger.warn("Invalid DEV role attempted: " + tokenRole);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Find a real user from the database based on their gym role assignment.
     * Priority: Find users with active gym role assignments for the requested role.
     */
    private com.gym.management.model.User findUserByGymRole(String role) {
        try {
            // 1. Try to find the specific "Dev" user for this role first
            // This ensures we get the user seeded by DevDataSeeder who has the correct data
            String targetEmail = null;
            if ("TRAINER".equalsIgnoreCase(role))
                targetEmail = "trainer@dev.com";
            else if ("OWNER".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role))
                targetEmail = "owner@dev.com";
            else if ("MEMBER".equalsIgnoreCase(role))
                targetEmail = "member1@dev.com";

            if (targetEmail != null) {
                com.gym.management.model.User devUser = userRepository.findByEmail(targetEmail).orElse(null);
                if (devUser != null) {
                    devUser.getFullName(); // Trigger load
                    return devUser;
                }
            }

            // 2. Fallback: Find ANY user with this gym role
            GymRole gymRole = mapToGymRole(role);

            if (gymRole != null) {
                List<UserGymRole> userRoles = userGymRoleRepository.findAll().stream()
                        .filter(ugr -> ugr.getRole() == gymRole && ugr.getStatus() == RoleStatus.ACTIVE)
                        .limit(1)
                        .toList();

                if (!userRoles.isEmpty()) {
                    com.gym.management.model.User user = userRoles.get(0).getUser();
                    if (user != null) {
                        user.getFullName(); // Trigger load
                    }
                    return user;
                }
            }

            // 3. Final Fallback: Just get first user in database
            com.gym.management.model.User fallback = userRepository.findAll().stream().findFirst().orElse(null);
            if (fallback != null)
                fallback.getFullName();
            return fallback;

        } catch (Exception e) {
            logger.error("Error finding user by gym role: " + e.getMessage());
            return null;
        }
    }

    /**
     * Map dev token role string to GymRole enum.
     */
    private GymRole mapToGymRole(String role) {
        switch (role.toUpperCase()) {
            case "TRAINER":
                return GymRole.TRAINER;
            case "OWNER":
            case "ADMIN": // ADMIN maps to OWNER for gym context
                return GymRole.OWNER;
            case "MEMBER":
            case "CUSTOMER":
                return GymRole.MEMBER;
            default:
                return null;
        }
    }
}
