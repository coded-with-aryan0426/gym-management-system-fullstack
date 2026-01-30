package com.gym.management.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Secure JWT Token Provider for Development
 * 
 * This implementation provides:
 * - Environment-based secret configuration
 * - Cryptographically secure key generation
 * - Access and refresh token support
 * - Enhanced token validation
 * - Development-friendly error handling
 */
@Component
public class SecureJwtTokenProvider {

    @Value("${jwt.secret:${JWT_SECRET:your-secure-development-secret-key-must-be-at-least-256-bits}}")
    private String jwtSecret;

    @Value("${jwt.expiration:${JWT_EXPIRATION:86400}}")
    private int jwtExpiration;

    @Value("${jwt.refresh-expiration:${JWT_REFRESH_EXPIRATION:604800}}")
    private int jwtRefreshExpiration;

    /**
     * Generate cryptographically secure key from secret
     */
    private SecretKey getSigningKey() {
        // Ensure secret is at least 256 bits (32 bytes) for HS512
        String paddedSecret = String.format("%-32s", jwtSecret).replace(' ', '0');
        return Keys.hmacShaKeyFor(paddedSecret.getBytes());
    }

    /**
     * Generate JWT token from username
     */
    public String generateTokenFromUsername(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        claims.put("created", new Date());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Generate refresh token
     */
    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        claims.put("created", new Date());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtRefreshExpiration * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extract username from JWT token
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * Extract expiration date from JWT token
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * Extract token type (access/refresh)
     */
    public String getTokenType(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("type", String.class);
    }

    /**
     * Generic method to extract claims
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from token
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Check if token is expired
     */
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * Validate JWT token
     */
    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (MalformedJwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("JWT validation error: " + e.getMessage());
        }
        return false;
    }

    /**
     * Validate refresh token
     */
    public Boolean validateRefreshToken(String refreshToken) {
        if (!getTokenType(refreshToken).equals("refresh")) {
            return false;
        }
        return validateToken(refreshToken);
    }

    /**
     * Generate new access token from refresh token
     */
    public String generateAccessTokenFromRefreshToken(String refreshToken) {
        if (validateRefreshToken(refreshToken)) {
            String username = getUsernameFromToken(refreshToken);
            return generateTokenFromUsername(username);
        }
        return null;
    }

    /**
     * Get token expiration time in seconds
     */
    public int getTokenExpiration() {
        return jwtExpiration;
    }

    /**
     * Get refresh token expiration time in seconds
     */
    public int getRefreshTokenExpiration() {
        return jwtRefreshExpiration;
    }
}