package com.gym.management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
@Profile("dev")
public class DevAuthenticationFilter extends OncePerRequestFilter {

    private static final String DEV_TOKEN_PREFIX = "DEV_TOKEN_";
    private static final List<String> ALLOWED_ROLES = List.of("ADMIN", "OWNER", "TRAINER", "MEMBER", "CUSTOMER");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer " + DEV_TOKEN_PREFIX)) {
            String tokenRole = authHeader.substring(7 + DEV_TOKEN_PREFIX.length()); // Extract role after prefix

            // Validate role
            final String role = ALLOWED_ROLES.contains(tokenRole) ? tokenRole : null;

            if (role != null) {
                // Determine authorities
                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role),
                        new SimpleGrantedAuthority("ROLE_DEV"));

                // Create standard Spring Security User or CustomUserDetails if possible
                Object principal;
                if ("TRAINER".equals(role)) {
                    com.gym.management.model.User mockUser = new com.gym.management.model.User();
                    mockUser.setUserId(1L); // Default dev trainer ID
                    mockUser.setFullName("Dev Trainer");
                    mockUser.setEmail("trainer@dev.com");
                    principal = new com.gym.management.security.CustomUserDetails(mockUser);
                } else {
                    principal = new org.springframework.security.core.userdetails.User(
                            "dev_" + role.toLowerCase(),
                            "N/A",
                            authorities);
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(principal,
                        null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Authenticated DEV user as: ROLE_" + role);
            } else {
                logger.warn("Invalid DEV role attempted: " + tokenRole);
            }
        }

        filterChain.doFilter(request, response);
    }
}
