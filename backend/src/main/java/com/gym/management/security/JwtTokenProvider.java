package com.gym.management.security;

import com.gym.management.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Set;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final long JWT_EXPIRATION_MS = 86400000; // 24 hours

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication, String context, Long gymId, String staffRole) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        // The generateTokenFromUser method now expects membershipStatus.
        // Assuming membershipStatus can be retrieved from userDetails or user object,
        // or passed as null if not applicable at this call site.
        // For this specific change, we'll assume it's not directly available here
        // and will need to be handled by the caller or default to null.
        // However, the instruction only modifies generateTokenFromUser, not
        // generateToken.
        // To make it compile, we need to pass a value for membershipStatus.
        // Let's assume it's null for this call, or needs to be fetched.
        // For the purpose of this edit, we'll pass a placeholder or null.
        // Given the instruction, the change is focused on generateTokenFromUser.
        // If generateToken needs to be updated, it would be a separate instruction.
        // For now, I'll make a reasonable assumption to make it compile.
        // Let's assume membershipStatus is part of the User object or can be derived.
        // Since the instruction doesn't specify how to get it here, I'll pass null.
        return generateTokenFromUser(userDetails.getUser(), context, gymId, staffRole, null, null, null, null);
    }

    public String generateTokenFromUser(User user, String context, Long activeGymId, String staffRole,
            String membershipStatus, Set<String> permissions, Set<String> userRoles, String primaryRole) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION_MS);

        JwtBuilder builder = Jwts.builder()
                .setSubject(Long.toString(user.getUserId()))
                .claim("username", user.getUsername())
                .claim("context", context)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512);

        if (activeGymId != null) {
            builder.claim("activeGymId", activeGymId);
        }

        if (staffRole != null) {
            builder.claim("staffRole", staffRole);
        }

        if (membershipStatus != null) {
            builder.claim("membershipStatus", membershipStatus);
        }

        if (permissions != null && !permissions.isEmpty()) {
            builder.claim("permissions", permissions);
        }

        if (userRoles != null && !userRoles.isEmpty()) {
            builder.claim("roles", userRoles);
        }

        if (primaryRole != null) {
            builder.claim("primaryRole", primaryRole);
        }

        return builder.compact();
    }

    public Long getUserIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Long.parseLong(claims.getSubject());
    }

    public String getContextFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("context", String.class);
    }

    public Long getGymIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("activeGymId", Long.class);
    }

    @SuppressWarnings("unchecked")
    public Set<String> getPermissionsFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("permissions", Set.class);
    }

    @SuppressWarnings("unchecked")
    public Set<String> getRolesFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("roles", Set.class);
    }

    public String getPrimaryRoleFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("primaryRole", String.class);
    }

    public String getStaffRoleFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("staffRole", String.class);
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException ex) {
            System.err.println("Invalid JWT signature");
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty");
        }
        return false;
    }
}
