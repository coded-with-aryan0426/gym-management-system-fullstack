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
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service for handling OAuth2 social login flows.
 * Supports Google and Facebook authentication.
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

    @Value("${facebook.app.id:}")
    private String facebookAppId;

    @Value("${facebook.app.secret:}")
    private String facebookAppSecret;

    private GoogleIdTokenVerifier googleVerifier;
    private final RestTemplate restTemplate = new RestTemplate();

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
            FindResult findResult = findOrCreateUser(email, googleId, null, AuthProvider.GOOGLE, name);
            User user = findResult.user();
            boolean isNewUser = findResult.isNew();

            // Update Google ID if not set
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userRepository.save(user);
            }

            // Generate JWT
            String token = jwtTokenProvider.generateTokenFromUser(user, "google_auth", null, null, null);

            return new AuthResult(true, token, "Success", user, isNewUser);

        } catch (Exception e) {
            System.err.println("Google auth error: " + e.getMessage());
            return new AuthResult(false, null, "Google authentication failed: " + e.getMessage());
        }
    }

    /**
     * Authenticate user with Facebook access token.
     */
    @Transactional
    public AuthResult authenticateWithFacebook(String accessToken) {
        try {
            // Verify token and get user info from Facebook
            String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + accessToken;

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(url,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                return new AuthResult(false, null, "Invalid Facebook token");
            }

            Map<String, Object> fbUser = response.getBody();
            String facebookId = (String) fbUser.get("id");
            String email = (String) fbUser.get("email");
            String name = (String) fbUser.get("name");

            if (facebookId == null) {
                return new AuthResult(false, null, "Could not get Facebook user ID");
            }

            // Find or create user
            FindResult findResult = findOrCreateUser(email, null, facebookId, AuthProvider.FACEBOOK, name);
            User user = findResult.user();
            boolean isNewUser = findResult.isNew();

            // Update Facebook ID if not set
            if (user.getFacebookId() == null) {
                user.setFacebookId(facebookId);
                userRepository.save(user);
            }

            // Generate JWT
            String token = jwtTokenProvider.generateTokenFromUser(user, "facebook_auth", null, null, null);

            return new AuthResult(true, token, "Success", user, isNewUser);

        } catch (Exception e) {
            System.err.println("Facebook auth error: " + e.getMessage());
            return new AuthResult(false, null, "Facebook authentication failed: " + e.getMessage());
        }
    }

    private record FindResult(User user, boolean isNew) {
    }

    /**
     * Find existing user or create new one for social login.
     */
    private FindResult findOrCreateUser(String email, String googleId, String facebookId,
            AuthProvider provider, String name) {
        // Try to find by social ID first
        Optional<User> existing = Optional.empty();

        if (googleId != null) {
            existing = userRepository.findByGoogleId(googleId);
        } else if (facebookId != null) {
            existing = userRepository.findByFacebookId(facebookId);
        }

        // If found by social ID, return
        if (existing.isPresent()) {
            return new FindResult(existing.get(), false);
        }

        // Try to find by email
        if (email != null) {
            existing = userRepository.findByEmail(email);
            if (existing.isPresent()) {
                // Link social account to existing user
                User user = existing.get();
                if (googleId != null && user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                }
                if (facebookId != null && user.getFacebookId() == null) {
                    user.setFacebookId(facebookId);
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
        newUser.setFacebookId(facebookId);
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
