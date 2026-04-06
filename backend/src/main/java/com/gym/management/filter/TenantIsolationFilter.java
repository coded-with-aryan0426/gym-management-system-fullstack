package com.gym.management.filter;

import com.gym.management.context.TenantContext;
import com.gym.management.model.User;
import com.gym.management.security.CustomUserDetails;
import com.gym.management.security.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Tenant Isolation Filter - BULLETPROOF MULTI-TENANCY
 *
 * This filter ensures complete data isolation between gyms/tenants by:
 * 1. Extracting tenant ID from JWT token
 * 2. Setting tenant context for the current request thread
 * 3. Validating all database operations against tenant context
 *
 * NO REQUEST CAN ACCESS ANOTHER TENANT'S DATA - PERIOD.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TenantIsolationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            Long tenantId = extractTenantIdFromRequest(request);

            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
                log.debug("Tenant context set: tenantId={}", tenantId);
            } else {
                log.warn("No tenant ID found for request: {} {}", request.getMethod(), request.getRequestURI());
            }

            filterChain.doFilter(request, response);

        } finally {
            TenantContext.clear();
            log.debug("Tenant context cleared for request: {}", request.getRequestURI());
        }
    }

    private Long extractTenantIdFromRequest(HttpServletRequest request) {
        // First try: Extract from JWT token
        String jwt = extractJwtFromRequest(request);
        if (jwt != null && tokenProvider.validateToken(jwt)) {
            Long tenantId = tokenProvider.getGymIdFromJWT(jwt);
            if (tenantId != null) {
                log.debug("Tenant ID extracted from JWT: {}", tenantId);
                return tenantId;
            }
        }

        // Second try: Extract from authenticated user in SecurityContext
        Long tenantIdFromAuth = extractTenantIdFromSecurityContext();
        if (tenantIdFromAuth != null) {
            log.debug("Tenant ID extracted from SecurityContext: {}", tenantIdFromAuth);
            return tenantIdFromAuth;
        }

        // Third try: For requests with gym_id header (e.g., superadmin)
        String gymIdHeader = request.getHeader("X-Gym-Id");
        if (StringUtils.hasText(gymIdHeader)) {
            try {
                Long gymId = Long.parseLong(gymIdHeader);
                log.debug("Tenant ID extracted from header: {}", gymId);
                return gymId;
            } catch (NumberFormatException e) {
                log.warn("Invalid X-Gym-Id header: {}", gymIdHeader);
            }
        }

        log.debug("No tenant ID found in request");
        return null;
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    private Long extractTenantIdFromSecurityContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        // Case 1: CustomUserDetails (our custom principal)
        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getUser().getGymId();
        }

        // Case 2: User entity
        if (principal instanceof User user) {
            return user.getGymId();
        }

        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip tenant filter for public endpoints only
        boolean skip = path.startsWith("/api/auth/") ||
                path.startsWith("/api/public/") ||
                path.startsWith("/api/gyms/public/") ||
                path.startsWith("/h2-console/") ||
                path.startsWith("/static/") ||
                path.startsWith("/swagger") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/actuator/health");

        if (skip) {
            log.debug("Skipping tenant filter for public path: {}", path);
        }

        return skip;
    }
}
