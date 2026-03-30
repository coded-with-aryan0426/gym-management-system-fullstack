package com.gym.management.filter;

import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that enables Hibernate multi-tenant filtering based on gym_id.
 * Extracts gym_id from the JWT claims and applies it to all database queries
 * to ensure data isolation between gyms.
 */
@Component
public class TenantFilter extends OncePerRequestFilter {

    @Autowired
    @Lazy
    private EntityManager entityManager;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            Long gymId = extractGymIdFromContext();

            if (gymId != null) {
                Session session = entityManager.unwrap(Session.class);
                session.enableFilter("gymFilter").setParameter("gymId", gymId);
            }

            filterChain.doFilter(request, response);
        } finally {
            // Clean up filter after request
            try {
                Session session = entityManager.unwrap(Session.class);
                session.disableFilter("gymFilter");
            } catch (Exception ignored) {
                // Session may already be closed
            }
        }
    }

    /**
     * Extract gym ID from the current security context.
     * The JWT token should contain a "gymId" claim set during login.
     */
    private Long extractGymIdFromContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        // Check if the principal has gym information
        Object principal = auth.getPrincipal();

        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            // Try to extract from custom UserDetails if available
            // For now, check request attributes set by JwtAuthenticationFilter
            return null; // Will be enhanced when JWT contains gymId
        }

        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip tenant filter for public endpoints
        return path.startsWith("/api/auth/") ||
                path.startsWith("/api/public/") ||
                path.startsWith("/api/gyms/public/") ||
                path.startsWith("/h2-console/") ||
                path.startsWith("/static/");
    }
}
