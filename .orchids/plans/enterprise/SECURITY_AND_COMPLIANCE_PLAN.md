# Security & Compliance Plan
## Enterprise-Grade Security for Multi-Tenant Gym Platform

---

## Current Security Audit

### What Exists ✅
- JWT authentication (`JwtTokenProvider`, `SecureJwtTokenProvider`)
- Role-based access control (OWNER, TRAINER, MEMBER, STAFF)
- Security config with endpoint-level role restrictions
- XSS filter (`XSSFilter.java`)
- Rate limiting (`RateLimitFilter.java`, `RateLimitConfig.java`)
- BCrypt password encoder (in SecurityConfig)
- CORS configuration
- Non-root Docker user
- SQL injection prevention via JPA parameterized queries
- `@SQLRestriction` for soft deletes

### What's MISSING 🔴

| Gap | Severity | Description |
|-----|----------|-------------|
| **Plaintext passwords in seed data** | 🔴 CRITICAL | `schema.sql` has `'pass123'` in plain text |
| **Hardcoded credentials** | 🔴 CRITICAL | `application.properties`: `Oracle123`, `user@example.com` |
| **No 2FA** | 🟡 HIGH | No two-factor authentication for any role |
| **No CSRF protection** | 🟡 HIGH | CSRF disabled in SecurityConfig (common for API-only) |
| **No API key validation** | 🟡 HIGH | No API keys for external integrations |
| **No OAuth2 token rotation** | 🟡 HIGH | JWT tokens likely don't refresh properly |
| **No data encryption at rest** | 🟡 HIGH | Sensitive fields (email, phone, medical) stored as plain text |
| **No audit trail for data access** | 🟡 HIGH | Audit logs exist but don't track who VIEWED data |
| **No tenant isolation at security layer** | 🔴 CRITICAL | No middleware ensuring gym_id matches JWT |
| **No HTTPS enforcement** | 🟡 HIGH | HTTP allowed in development (expected), but no HSTS headers |
| **No Content Security Policy** | 🟠 MEDIUM | No CSP headers for frontend |
| **No rate limiting per tenant** | 🟠 MEDIUM | Global rate limiting, not per-gym |
| **No IP-based blocking** | 🟠 MEDIUM | No ability to block suspicious IPs |
| **No data residency controls** | 🟠 MEDIUM | For gyms in different countries |
| **No vulnerability scanning** | 🟠 MEDIUM | No automated dependency scanning |
| **No penetration testing** | 🟠 MEDIUM | No security testing setup |

---

## Security Improvements Plan

### Phase 1: Critical Fixes (MUST DO BEFORE GO-LIVE)

#### 1. Remove Hardcoded Credentials
```properties
# application-prod.properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.mail.username=${SMTP_USERNAME}
spring.mail.password=${SMTP_PASSWORD}

jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

#### 2. Hash Seed Passwords
```sql
-- Replace all 'pass123' with BCrypt hashed values
-- In production, seed data should not exist at all
-- For development, use pre-hashed values
```

#### 3. Tenant Security Middleware
```java
// TenantSecurityFilter.java
@Component
public class TenantSecurityFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(request, response, chain) {
        Long jwtGymId = extractGymIdFromJwt(request);
        Long requestGymId = extractGymIdFromRequest(request);
        
        if (requestGymId != null && !requestGymId.equals(jwtGymId)) {
            response.sendError(403, "Gym access denied");
            return;
        }
        TenantContext.set(jwtGymId);
        chain.doFilter(request, response);
    }
}
```

### Phase 2: Authentication Hardening

#### Two-Factor Authentication
```
Backend:
├── service/TwoFactorService.java       — TOTP generation, verification
├── controller/TwoFactorController.java — Enable/disable 2FA endpoints
├── model/TwoFactorSecret.java          — Store encrypted secrets
├── dto/TwoFactorSetupDTO.java          — QR code + backup codes

Frontend:
├── pages/Settings/sections/TwoFactorSetup.tsx — QR scanner, code input
└── components/TwoFactorModal.tsx              — Login 2FA prompt
```

#### JWT Security Enhancement
- Access token: 15-minute expiry
- Refresh token: 7-day expiry, stored in httpOnly cookie
- Token rotation on every refresh
- Revocation list in Redis for forced logout

### Phase 3: Data Protection

#### Field-Level Encryption
```java
// Encrypt sensitive fields before storing
@Convert(converter = AesEncryptor.class)
@Column(name = "phone_number")
private String phoneNumber;

@Convert(converter = AesEncryptor.class)
@Column(name = "medical_info")
private String medicalInfo;
```

#### HTTPS & Headers
```java
// SecurityConfig additions
http.headers(headers -> headers
    .httpStrictTransportSecurity(hsts -> hsts.maxAgeInSeconds(31536000))
    .contentSecurityPolicy(csp -> csp.policyDirectives(
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
    ))
    .frameOptions(frame -> frame.deny())
    .permissionsPolicy(policy -> policy.policy(
        "camera=(), microphone=(), geolocation=()"
    ))
);
```

### Phase 4: Compliance

#### GDPR/Data Privacy
- Right to data export (download all personal data as JSON/PDF)
- Right to deletion (anonymize or delete account)
- Consent management (what data is collected and why)
- Data processing agreements for each gym

#### Audit Enhancement
- Track data ACCESS (not just changes)
- IP address logging on all admin actions
- Failed login attempt logging with lockout
- Session recording for admin actions

---

## Security Checklist for Go-Live

```
[ ] All hardcoded credentials removed
[ ] Passwords hashed with BCrypt (cost factor 12+)
[ ] JWT secret is 256-bit random string
[ ] CORS restricted to production domains
[ ] Rate limiting per IP and per user
[ ] SQL injection: all queries parameterized
[ ] XSS: input sanitization + output encoding
[ ] HTTPS enforced with HSTS
[ ] Cookies: httpOnly, secure, SameSite=Strict
[ ] File upload: type validation, size limits, malware scanning
[ ] Admin endpoints require 2FA
[ ] Tenant isolation verified (can't access other gym's data)
[ ] Dependency vulnerabilities scanned (npm audit, mvn dependency-check)
[ ] Error messages don't leak stack traces in production
[ ] Session timeout configured (30 min)
[ ] Account lockout after 5 failed login attempts
```

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Remove hardcoded secrets, tenant security filter, hash seeds |
| **Phase 2** | 2FA for owner accounts, JWT refresh tokens |
| **Phase 3** | Field encryption, security headers, CSP |
| **Phase 4** | GDPR tools, audit enhancement, vulnerability scanning |
