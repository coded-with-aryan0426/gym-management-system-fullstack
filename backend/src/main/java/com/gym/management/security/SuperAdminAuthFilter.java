package com.gym.management.security;

import com.gym.management.service.SuperAdminAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class SuperAdminAuthFilter extends OncePerRequestFilter {

    private static final Set<String> ADMIN_AUTHORITIES = Set.of(
            "ROLE_SUPER_ADMIN",
            "ROLE_OWNER",
            "ROLE_ADMIN");

    private final SuperAdminAuthService superAdminAuthService;

    public SuperAdminAuthFilter(SuperAdminAuthService superAdminAuthService) {
        this.superAdminAuthService = superAdminAuthService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/superadmin/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (path.startsWith("/api/superadmin/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (hasAdminRoleAuthentication()) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = request.getHeader("X-Superadmin-Token");
        if (superAdminAuthService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Super Admin authentication required\"}");
    }

    private boolean hasAdminRoleAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (ADMIN_AUTHORITIES.contains(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
