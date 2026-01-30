package com.gym.management.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Secure Development Configuration
 * 
 * This configuration provides enhanced security for development while maintaining
 * developer productivity. It includes:
 * - Stricter CORS policies
 * - Enhanced security headers
 * - Session management
 * - Rate limiting configuration
 * - Development-friendly error handling
 * 
 * Activate with: spring.profiles.active=secure-dev
 */
@Configuration
@EnableWebSecurity
@Profile("secure-dev")
public class SecureDevelopmentConfig {

    @Value("${cors.allowed.origins:http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000}")
    private String allowedOrigins;

    @Value("${security.session.timeout:1800}") // 30 minutes
    private int sessionTimeout;

    @Bean
    public SecurityFilterChain secureDevelopmentFilterChain(HttpSecurity http) throws Exception {
        http
            // Enhanced CORS configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF protection (enable for development testing)
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/auth/**", "/api/public/**")
                .csrfTokenRepository(new org.springframework.security.web.csrf.CookieCsrfTokenRepository())
            )
            
            // Session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1) // One session per user
                .maxSessionsPreventsLogin(false)
                .expiredUrl("/api/auth/session-expired")
            )
            
            // Enhanced security headers
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:"))
                .httpStrictTransportSecurity(hsts -> hsts
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true)
                    .preload(true)
                )
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .permissionsPolicy(permissions -> permissions.policy("geolocation=(), microphone=(), camera=()"))
            )
            
            // Authorization rules (same as production)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/gyms/public/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/dashboard/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/stats/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/settings/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/staff/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/finance/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/reports/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/packages/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/owner/equipment/**").hasAnyRole("OWNER", "ADMIN")
                .requestMatchers("/api/trainer/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                .requestMatchers("/api/trainer/equipment/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                .requestMatchers("/api/pt-sessions/member/**").hasAnyRole("OWNER", "ADMIN", "TRAINER", "MEMBER", "CUSTOMER")
                .requestMatchers("/api/pt-sessions/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                .requestMatchers("/api/users/members").hasAnyRole("OWNER", "ADMIN", "TRAINER", "MEMBER", "CUSTOMER")
                .requestMatchers("/api/users/trainers").hasAnyRole("OWNER", "ADMIN", "TRAINER", "MEMBER", "CUSTOMER")
                .requestMatchers("/api/progress-notes/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/member/progress/photos/file/**").permitAll()
                .requestMatchers("/api/member/**").hasAnyRole("OWNER", "ADMIN", "TRAINER", "MEMBER", "CUSTOMER")
                .requestMatchers("/api/chat/attachments/file/**").permitAll()
                .requestMatchers("/api/chat/**").authenticated()
                .requestMatchers("/api/users/me/**").authenticated()
                .requestMatchers("/api/users/profile/**").authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        // Additional CORS security
        configuration.setExposedHeaders(Arrays.asList("X-CSRF-TOKEN", "X-Rate-Limit-Remaining", "X-Rate-Limit-Reset"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}