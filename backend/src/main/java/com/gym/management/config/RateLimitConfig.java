package com.gym.management.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bucket;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Configuration for rate limiting using Bucket4j with Caffeine cache.
 * Provides separate rate limit buckets for login attempts and general API
 * calls. Optimized for 1000+ concurrent users.
 */
@Configuration
public class RateLimitConfig {

    /**
     * Cache for login attempt rate limiting.
     * Key: IP address, Value: Bucket
     * Limit: 30 login attempts per minute per IP (increased for concurrent testing)
     */
    @Bean
    public Cache<String, Bucket> loginRateLimitCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .maximumSize(100_000)
                .build();
    }

    /**
     * Cache for general API rate limiting.
     * Key: User ID or IP, Value: Bucket
     * Limit: 500 API calls per minute per user/IP (production capacity)
     */
    @Bean
    public Cache<String, Bucket> apiRateLimitCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .maximumSize(500_000)
                .build();
    }

    /**
     * Creates a login rate limit bucket.
     * 30 attempts per minute with gradual refill (increased for concurrent logins).
     */

    public static Bucket createLoginBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(30).refillGreedy(30, Duration.ofMinutes(1)))
                .build();
    }

    /**
     * Creates a general API rate limit bucket.
     * 500 requests per minute with gradual refill (production capacity).
     */

    public static Bucket createApiBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(500).refillGreedy(500, Duration.ofMinutes(1)))
                .build();
    }

    /**
     * Creates a strict bucket for sensitive operations (password reset, etc).
     * 10 attempts per 10 minutes (increased for usability).
     */

    public static Bucket createStrictBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(10).refillGreedy(10, Duration.ofMinutes(10)))
                .build();
    }
}
