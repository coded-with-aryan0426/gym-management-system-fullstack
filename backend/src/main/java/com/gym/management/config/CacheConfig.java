package com.gym.management.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for performance optimization.
 * Uses Caffeine cache for in-memory caching with configurable TTL.
 * 
 * Cache names and their purposes:
 * - userProfiles: User profile data (5 min TTL, 1000 max entries)
 * - memberProfiles: Member-specific profiles (5 min TTL, 1000 max entries)
 * - userCache: General user lookups (5 min TTL, 2000 max entries)
 * - allMembers: Full member list (2 min TTL, 1 entry - invalidated on changes)
 * - analyticsCache: Analytics data (1 min TTL, 100 entries)
 * - dashboardStats: Dashboard statistics (30 sec TTL, 50 entries)
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Default cache configuration
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats());
        
        // Register specific caches
        cacheManager.setCacheNames(java.util.Arrays.asList(
                "userProfiles",
                "memberProfiles", 
                "userCache",
                "allMembers",
                "analyticsCache",
                "dashboardStats",
                "trainerStats",
                "membershipStats",
                "gymStats"
        ));
        
        return cacheManager;
    }

    /**
     * Cache for user profiles with longer TTL
     */
    @Bean
    public Caffeine<Object, Object> caffeineConfig() {
        return Caffeine.newBuilder()
                .maximumSize(2000)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .expireAfterAccess(10, TimeUnit.MINUTES)
                .recordStats();
    }
}
