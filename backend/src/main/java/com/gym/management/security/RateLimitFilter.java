package com.gym.management.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.gym.management.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter for rate limiting API requests.
 * Uses Bucket4j with Caffeine cache for efficient token bucket algorithm.
 * 
 * - Login endpoints: 5 attempts per minute per IP
 * - General API: 100 requests per minute per user/IP
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Autowired
    private Cache<String, Bucket> loginRateLimitCache;

    @Autowired
    private Cache<String, Bucket> apiRateLimitCache;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientIP = getClientIP(request);

        // Skip rate limiting for static resources
        if (path.startsWith("/static/") || path.startsWith("/assets/")) {
            filterChain.doFilter(request, response);
            return;
        }

        Bucket bucket;
        String key;

        // Use stricter limits for login/auth endpoints
        if (path.contains("/auth/login") || path.contains("/auth/oauth/")) {
            key = "login:" + clientIP;
            bucket = loginRateLimitCache.get(key, k -> RateLimitConfig.createLoginBucket());
        } else if (path.contains("/auth/")) {
            // Other auth endpoints (signup, password reset) - moderate limit
            key = "auth:" + clientIP;
            bucket = loginRateLimitCache.get(key, k -> RateLimitConfig.createStrictBucket());
        } else {
            // General API - use user ID from JWT if available, else IP
            key = "api:" + getUserIdOrIP(request, clientIP);
            bucket = apiRateLimitCache.get(key, k -> RateLimitConfig.createApiBucket());
        }

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Add rate limit headers
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            // Rate limit exceeded - return 429
            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(waitSeconds));
            response.setHeader("X-Rate-Limit-Remaining", "0");
            response.getWriter().write(String.format(
                    "{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Please wait %d seconds.\",\"retryAfter\":%d}",
                    waitSeconds, waitSeconds));
        }
    }

    /**
     * Extract client IP, handling proxies.
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        return request.getRemoteAddr();
    }

    /**
     * Get user ID from JWT or fall back to IP.
     */
    private String getUserIdOrIP(HttpServletRequest request, String fallbackIP) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Use the token (or part of it) as identifier
            // Actual user ID extraction would require JWT parsing
            return "user:" + authHeader.substring(7, Math.min(authHeader.length(), 50));
        }
        return fallbackIP;
    }
}
