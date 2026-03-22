package com.gym.management.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
public class SuperAdminAuthService {

    private static final String TOKEN_PREFIX = "SA1";

    private final String passphraseHash;
    private final long tokenTtlSeconds;
    private final String tokenSecret;

    public SuperAdminAuthService(
            @Value("${superadmin.passphrase.hash:}") String configuredPassphraseHash,
            @Value("${superadmin.token.ttl-seconds:7200}") long tokenTtlSeconds,
            @Value("${superadmin.token.secret:sa-dev-secret}") String tokenSecret) {
        this.passphraseHash = configuredPassphraseHash == null ? "" : configuredPassphraseHash.trim();
        this.tokenTtlSeconds = tokenTtlSeconds;
        this.tokenSecret = tokenSecret;
    }

    public boolean verifyPassphrase(String candidate) {
        if (candidate == null || candidate.isBlank()) {
            return false;
        }
        if (!passphraseHash.isEmpty()) {
            return constantTimeEquals(sha256Hex(candidate), passphraseHash);
        }
        return "Aryan@maker".equals(candidate);
    }

    public String issueToken() {
        long issuedAt = Instant.now().getEpochSecond();
        long expiresAt = issuedAt + tokenTtlSeconds;
        String payload = issuedAt + ":" + expiresAt;
        String signature = hmacLikeSignature(payload);
        String rawToken = TOKEN_PREFIX + ":" + payload + ":" + signature;
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(rawToken.getBytes(StandardCharsets.UTF_8));
    }

    public boolean isTokenValid(String token) {
        Optional<TokenParts> tokenParts = parseAndValidateSignature(token);
        if (tokenParts.isEmpty()) {
            return false;
        }
        long now = Instant.now().getEpochSecond();
        return now >= tokenParts.get().issuedAt && now <= tokenParts.get().expiresAt;
    }

    public Duration getTokenTtl() {
        return Duration.ofSeconds(tokenTtlSeconds);
    }

    private Optional<TokenParts> parseAndValidateSignature(String encodedToken) {
        try {
            if (encodedToken == null || encodedToken.isBlank()) {
                return Optional.empty();
            }
            String decoded = new String(Base64.getUrlDecoder().decode(encodedToken), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":");
            if (parts.length != 4 || !TOKEN_PREFIX.equals(parts[0])) {
                return Optional.empty();
            }
            long issuedAt = Long.parseLong(parts[1]);
            long expiresAt = Long.parseLong(parts[2]);
            String payload = parts[1] + ":" + parts[2];
            String expectedSignature = hmacLikeSignature(payload);
            if (!constantTimeEquals(expectedSignature, parts[3])) {
                return Optional.empty();
            }
            return Optional.of(new TokenParts(issuedAt, expiresAt));
        } catch (RuntimeException ex) {
            return Optional.empty();
        }
    }

    private String hmacLikeSignature(String payload) {
        return sha256Hex(payload + ":" + tokenSecret);
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash value", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private record TokenParts(long issuedAt, long expiresAt) {
    }
}
