package com.gym.management.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

/**
 * Security Configuration for Production-Grade Authentication
 * 
 * Implements strict role-based access control:
 * - OWNER/ADMIN: Full access to all endpoints
 * - TRAINER: Access to trainer and member endpoints
 * - MEMBER: Access to member endpoints only
 * 
 * All endpoints require authentication except explicitly public ones.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration corsConfig = new CorsConfiguration();
                    // Allow all frontend ports for multi-role testing
                    corsConfig.setAllowedOrigins(List.of(
                            "http://localhost:5173", // Owner
                            "http://localhost:5174", // Trainer
                            "http://localhost:5175", // Member
                            "http://localhost:3000" // Legacy/alternative
                    ));
                    corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                    corsConfig.setAllowedHeaders(List.of("*"));
                    corsConfig.setAllowCredentials(true);
                    corsConfig.setMaxAge(3600L);
                    return corsConfig;
                }))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ==================== PREFLIGHT ====================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ==================== PUBLIC ENDPOINTS ====================
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/gyms/public/**").permitAll()

                        .requestMatchers("/ws/**").permitAll() // WebSocket handshake
                        .requestMatchers("/error").permitAll()

                        // ==================== OWNER/ADMIN ONLY ====================
                        // These endpoints manage the entire gym operation
                        .requestMatchers("/api/dashboard/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/stats/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/settings/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/staff/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/finance/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/reports/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/packages/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/owner/equipment/**").hasAnyRole("OWNER", "ADMIN")

                        // ==================== OWNER OR TRAINER ====================
                        // Trainers need access to manage their assigned members and sessions
                        .requestMatchers("/api/trainer/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                        .requestMatchers("/api/trainer/equipment/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                        .requestMatchers("/api/pt-sessions/member/**").hasAnyRole("OWNER", "ADMIN", "TRAINER", "MEMBER", "CUSTOMER")
                        .requestMatchers("/api/pt-sessions/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                        .requestMatchers("/api/users/members").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                        .requestMatchers("/api/users/trainers").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                        .requestMatchers("/api/progress-notes/**").hasAnyRole("OWNER", "ADMIN", "TRAINER")
                        .requestMatchers("/api/notifications/**").authenticated() // All users get notifications

                        // ==================== MEMBER ENDPOINTS ====================
                        // Members can access their own data, trainers/owners can also access
                        .requestMatchers("/api/member/progress/photos/file/**").permitAll() // Public access for progress photos
                        .requestMatchers("/api/member/**").hasAnyRole("OWNER", "ADMIN", "TRAINER", "MEMBER", "CUSTOMER")

                        // ==================== CHAT (All authenticated users) ====================
                        .requestMatchers("/api/chat/attachments/file/**").permitAll() // Public access for images
                        .requestMatchers("/api/chat/**").authenticated()

                        // ==================== USER PROFILE (Self-access) ====================
                        // General user endpoints - authenticated users can access their own
                        .requestMatchers("/api/users/me/**").authenticated()
                        .requestMatchers("/api/users/profile/**").authenticated()

                        // ==================== PROTECTED BY DEFAULT ====================
                        // Everything else requires authentication
                        .anyRequest().authenticated())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        // Add authentication provider
        http.authenticationProvider(authenticationProvider());

        // Rate limiting filter runs first
        http.addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class);

        // JWT filter for production authentication
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
