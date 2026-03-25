package com.gym.management.security;

import com.gym.management.service.SuperAdminAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
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
        if (!requiresSuperAdminToken(request, path)) {
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

        String token = extractSuperAdminToken(request);
        if (superAdminAuthService.isTokenValid(token)) {
            setSuperAdminAuthentication();
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Super Admin authentication required\"}");
    }

    private boolean requiresSuperAdminToken(HttpServletRequest request, String path) {
        if (path.startsWith("/api/superadmin/")) {
            return true;
        }
        if (path.startsWith("/api/beta/feedback/")) {
            return true;
        }
        return path.equals("/api/beta/feedback/filter") || path.equals("/api/beta/feedback/stats")
                || path.equals("/api/beta/feedback/export");
    }

    private String extractSuperAdminToken(HttpServletRequest request) {
        String headerToken = request.getHeader("X-Superadmin-Token");
        if (StringUtils.hasText(headerToken)) {
            return headerToken;
        }
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private void setSuperAdminAuthentication() {
        Authentication existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing != null && existing.isAuthenticated()) {
            return;
        }
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"),
                new SimpleGrantedAuthority("ROLE_ADMIN"));
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                "superadmin", null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
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
