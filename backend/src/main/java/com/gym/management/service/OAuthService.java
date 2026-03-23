package com.gym.management.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.gym.management.model.AuthProvider;
import com.gym.management.model.User;
import com.gym.management.repository.UserRepository;
import com.gym.management.security.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for handling OAuth2 social login flows.
 * Supports Google authentication only.
 */
@Service
public class OAuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${google.client.id:}")
    private String googleClientId;

    private GoogleIdTokenVerifier googleVerifier;

    @PostConstruct
    public void init() {
        if (googleClientId != null && !googleClientId.isEmpty()) {
            this.googleVerifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            System.out.println("Google OAuth initialized");
        } else {
            System.out.println("Google OAuth not configured - client ID missing");
        }
    }

    /**
     * Authenticate user with Google ID token.
     */
    @Transactional
    public AuthResult authenticateWithGoogle(String idTokenString) {
        if (googleVerifier == null) {
            return new AuthResult(false, null, "Google OAuth not configured");
        }

        try {
            GoogleIdToken idToken = googleVerifier.verify(idTokenString);
            if (idToken == null) {
                return new AuthResult(false, null, "Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            // Profile picture URL available if needed: payload.get("picture")

            // Find or create user
            FindResult findResult = findOrCreateUser(email, googleId, AuthProvider.GOOGLE, name);
            User user = findResult.user();
            boolean isNewUser = findResult.isNew();

            // Update Google ID if not set
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userRepository.save(user);
            }

            // Generate JWT
            String token = jwtTokenProvider.generateTokenFromUser(user, "google_auth", null, null, null, null, null,
                    null);

            return new AuthResult(true, token, "Success", user, isNewUser);

        } catch (Exception e) {
            System.err.println("Google auth error: " + e.getMessage());
            return new AuthResult(false, null, "Google authentication failed: " + e.getMessage());
        }
    }

    private record FindResult(User user, boolean isNew) {
    }

    /**
     * Find existing user or create new one for social login.
     * If user's Google email matches their registered email, they get easy login.
     * Otherwise, they need to use username/mobile and password.
     */
    private FindResult findOrCreateUser(String email, String googleId,
            AuthProvider provider, String name) {
        // Try to find by Google ID first
        Optional<User> existing = Optional.empty();

        if (googleId != null) {
            existing = userRepository.findByGoogleId(googleId);
        }

        // If found by Google ID, return (easy login)
        if (existing.isPresent()) {
            return new FindResult(existing.get(), false);
        }

        // Try to find by email - this enables easy login if emails match
        if (email != null) {
            existing = userRepository.findByEmail(email);
            if (existing.isPresent()) {
                // Link Google account to existing user (email match = easy login)
                User user = existing.get();
                if (googleId != null && user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                }
                return new FindResult(userRepository.save(user), false);
            }
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(generateUsername(name, email));
        newUser.setFullName(name);
        newUser.setGoogleId(googleId);
        newUser.setAuthProvider(provider);
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
        newUser.setStatus("ACTIVE");
        newUser.setAccountNonLocked(true);

        return new FindResult(userRepository.save(newUser), true);
    }

    private String generateUsername(String name, String email) {
        if (email != null && !email.isEmpty()) {
            String base = email.split("@")[0];
            // Check if username exists, if so add random suffix
            if (userRepository.findByUsername(base).isPresent()) {
                return base + "_" + new Random().nextInt(1000);
            }
            return base;
        }
        if (name != null) {
            String base = name.toLowerCase().replaceAll("\\s+", "_");
            return base + "_" + new Random().nextInt(1000);
        }
        return "user_" + System.currentTimeMillis();
    }

    /**
     * Result record for OAuth authentication.
     */
    public record AuthResult(boolean success, String token, String message, User user, boolean isNewUser) {
        public AuthResult(boolean success, String token, String message) {
            this(success, token, message, null, false);
        }

        public AuthResult(boolean success, String token, String message, User user) {
            this(success, token, message, user, false);
        }
    }
}
