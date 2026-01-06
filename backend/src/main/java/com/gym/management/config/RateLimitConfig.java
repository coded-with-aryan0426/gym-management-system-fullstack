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
 * calls.
 */
@Configuration
public class RateLimitConfig {

    /**
     * Cache for login attempt rate limiting.
     * Key: IP address, Value: Bucket
     * Limit: 5 login attempts per minute per IP
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
     * Limit: 100 API calls per minute per user/IP
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
     * 5 attempts per minute with gradual refill.
     */

    public static Bucket createLoginBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(5).refillGreedy(5, Duration.ofMinutes(1)))
                .build();
    }

    /**
     * Creates a general API rate limit bucket.
     * 100 requests per minute with gradual refill.
     */

    public static Bucket createApiBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(100).refillGreedy(100, Duration.ofMinutes(1)))
                .build();
    }

    /**
     * Creates a strict bucket for sensitive operations (password reset, etc).
     * 3 attempts per 10 minutes.
     */

    public static Bucket createStrictBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(3).refillGreedy(3, Duration.ofMinutes(10)))
                .build();
    }
}
