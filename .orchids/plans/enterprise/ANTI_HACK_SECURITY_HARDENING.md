# Anti-Hack & Production Security Hardening Plan
## Making the Application Non-Hackable When Live

---

## Threat Model: What Hackers WILL Try

```
┌──────────────────────────────────────────────────────────────┐
│                   ATTACK SURFACE MAP                          │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  FRONTEND (React)          │  BACKEND (Spring Boot)           │
│  ├── XSS attacks           │  ├── SQL injection               │
│  ├── CSRF attacks          │  ├── Authentication bypass       │
│  ├── DOM manipulation      │  ├── API abuse / rate limiting   │
│  ├── Token theft (JWT)     │  ├── Privilege escalation        │
│  ├── Dependency exploits   │  ├── File upload exploits        │
│  └── Clickjacking          │  ├── IDOR (tenant data leak)     │
│                             │  ├── Server-Side Request Forgery│
│  INFRASTRUCTURE             │  └── Dependency vulnerabilities │
│  ├── DDoS attacks          │                                   │
│  ├── DNS hijacking         │  DATABASE                         │
│  ├── SSL stripping         │  ├── Data exfiltration           │
│  ├── Server compromise     │  ├── Backup theft                │
│  └── Supply chain attack   │  └── Connection string exposure  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Network & Infrastructure Protection

### 1.1 Cloudflare (Free) — Your First Shield
```
ENABLE (all free):
✅ DDoS Protection          — Automatic, always-on
✅ Web Application Firewall — Block SQLi, XSS, bot attacks
✅ SSL/TLS (Full Strict)    — End-to-end encryption
✅ Bot Fight Mode           — Block automated attacks
✅ Rate Limiting            — 1 rule free (10 req/min per IP to /api/auth/*)
✅ Under Attack Mode        — One-click enable during attack
✅ Always Online            — Serve cached version if server is down
✅ Browser Integrity Check  — Block headless browsers
✅ DNSSEC                   — Prevent DNS hijacking

CONFIGURE:
├── SSL Mode: Full (Strict)
├── Minimum TLS Version: 1.2
├── Always Use HTTPS: ON
├── Automatic HTTPS Rewrites: ON
├── HSTS: max-age=31536000, includeSubDomains, preload
└── Firewall Rules:
    ├── Block countries you don't serve (if applicable)
    ├── Challenge requests with no User-Agent
    └── Block known bot IPs
```

### 1.2 Server Hardening
```bash
# If using VPS (Oracle Cloud, DigitalOcean, etc.)

# 1. SSH key-only login (no password)
PasswordAuthentication no
PermitRootLogin no

# 2. Firewall (ufw)
ufw default deny incoming
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP (redirect to HTTPS)
ufw allow 443/tcp  # HTTPS
ufw enable

# 3. Fail2Ban — auto-block brute force IPs
apt install fail2ban
# Config: ban after 5 failed SSH attempts for 24 hours

# 4. Automatic security updates
apt install unattended-upgrades
```

---

## Layer 2: Application Security (Backend)

### 2.1 Authentication Hardening

```java
// 1. JWT with short-lived access tokens
ACCESS_TOKEN_EXPIRY = 15 minutes
REFRESH_TOKEN_EXPIRY = 7 days (httpOnly cookie)

// 2. Refresh token rotation (one-time use)
@PostMapping("/api/auth/refresh")
public TokenResponse refreshToken(@CookieValue String refreshToken) {
    // Validate token
    // Issue NEW access + refresh token
    // INVALIDATE old refresh token (prevents replay)
    // If old token is reused → logout ALL sessions (token family compromise)
}

// 3. Password security
BCrypt cost factor = 12 (slower = harder to brute force)
Min password length = 8
Require: 1 uppercase + 1 number + 1 special char
Check against breached password database (HaveIBeenPwned API)

// 4. Account lockout
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION = 15 minutes
After 10 attempts → lock for 1 hour + email alert to user
After 20 attempts → permanent lock + admin notification

// 5. Login anomaly detection
if (loginFrom.country != lastLogin.country) {
    sendEmail("New login from unknown location");
    require2FA();
}
```

### 2.2 API Security

```java
// SecurityConfig.java — Production-grade

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // CORS — restrict to your domains ONLY
        .cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(List.of(
                "https://yourgymapp.com",
                "https://admin.yourgymapp.com"
            ));
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
            config.setAllowCredentials(true);
            return config;
        }))
        
        // Security headers
        .headers(headers -> headers
            .httpStrictTransportSecurity(hsts -> hsts
                .maxAgeInSeconds(31536000)
                .includeSubDomains(true)
                .preload(true)
            )
            .contentSecurityPolicy(csp -> csp
                .policyDirectives("default-src 'self'; " +
                    "script-src 'self'; " +
                    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
                    "font-src 'self' fonts.gstatic.com; " +
                    "img-src 'self' data: blob: res.cloudinary.com; " +
                    "connect-src 'self' https://api.yourgymapp.com wss://api.yourgymapp.com; " +
                    "frame-ancestors 'none'")
            )
            .frameOptions(frame -> frame.deny())
            .contentTypeOptions(Customizer.withDefaults()) // X-Content-Type-Options: nosniff
            .referrerPolicy(referrer -> referrer
                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            .permissionsPolicy(policy -> policy
                .policy("camera=(), microphone=(), geolocation=(), payment=()"))
        )
        
        // Rate limiting
        .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
        
        // JWT filter
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        
        // XSS filter
        .addFilterBefore(xssFilter, JwtAuthenticationFilter.class);
}
```

### 2.3 Input Validation (Prevent Injection)

```java
// EVERY endpoint must validate input

@PostMapping("/api/members")
public ResponseEntity<?> createMember(
    @Valid @RequestBody CreateMemberDTO dto  // @Valid enforces constraints
) { ... }

// DTO with constraints
public class CreateMemberDTO {
    @NotBlank @Size(max = 100)
    @Pattern(regexp = "^[a-zA-Z\\s]+$")  // Only letters and spaces
    private String fullName;
    
    @NotBlank @Email
    private String email;
    
    @Pattern(regexp = "^\\+?[0-9]{10,15}$")  // Valid phone numbers only
    private String phone;
    
    @Size(max = 500)  // Prevent massive input
    private String bio;
}
```

### 2.4 Tenant Data Isolation (IDOR Prevention)

```java
// CRITICAL: Every data access MUST check gym_id

// ❌ WRONG — any user can access any gym's data
@GetMapping("/api/members/{id}")
public Member getMember(@PathVariable Long id) {
    return memberRepo.findById(id);  // No gym check!
}

// ✅ CORRECT — enforces gym isolation
@GetMapping("/api/members/{id}")
public Member getMember(@PathVariable Long id) {
    Long gymId = TenantContext.getCurrentGymId();
    return memberRepo.findByIdAndGymId(id, gymId)
        .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
}
```

### 2.5 File Upload Security

```java
// File upload protection
public class FileUploadValidator {
    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "application/pdf"
    );
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB
    
    public void validate(MultipartFile file) {
        // 1. Check MIME type (don't trust file extension!)
        String mimeType = tika.detect(file.getInputStream());
        if (!ALLOWED_TYPES.contains(mimeType)) throw new BadRequestException("Invalid file type");
        
        // 2. Check file size
        if (file.getSize() > MAX_SIZE) throw new BadRequestException("File too large");
        
        // 3. Sanitize filename
        String safeName = UUID.randomUUID() + getExtension(file);
        
        // 4. Store OUTSIDE web-accessible directory
        // Serve via API endpoint with auth check, not direct URL
        
        // 5. Scan for malware (ClamAV or VirusTotal API)
        if (clamav.scan(file).isInfected()) throw new BadRequestException("Malware detected");
    }
}
```

---

## Layer 3: Frontend Security

### 3.1 XSS Prevention
```tsx
// React automatically escapes JSX output — but watch for:

// ❌ DANGEROUS — never use
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE — React escapes by default
<div>{userInput}</div>

// ❌ DANGEROUS — URL injection
<a href={userProvidedUrl}>Link</a>

// ✅ SAFE — validate URL scheme
const safeUrl = url.startsWith('https://') ? url : '#';
<a href={safeUrl}>Link</a>
```

### 3.2 Token Storage
```typescript
// ❌ WRONG — XSS can steal this
localStorage.setItem('token', jwt);

// ✅ CORRECT — httpOnly cookie (JavaScript can't access)
// Backend sets cookie:
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/api/auth

// Access token in memory only (React state)
// Lost on page refresh → use refresh token cookie to get new one
```

### 3.3 Dependency Security
```bash
# Weekly automated scan
npm audit
npm audit fix

# Use Snyk (free for open-source)
npx snyk test

# Lock dependencies (exact versions)
# package-lock.json MUST be committed

# GitHub Dependabot (free)
# Auto-creates PRs for vulnerable dependencies
```

---

## Layer 4: Database Security

### 4.1 Connection Security
```properties
# Production database config
spring.datasource.url=jdbc:postgresql://host:5432/gymdb?sslmode=verify-full
# ↑ sslmode=verify-full ensures encrypted connection + certificate verification
```

### 4.2 Least Privilege
```sql
-- Create app user with LIMITED permissions (not 'system' or 'postgres'!)
CREATE USER gymapp WITH PASSWORD '${STRONG_RANDOM_PASSWORD}';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gymapp;
-- NO CREATE, DROP, ALTER permissions → app can't modify schema
-- If schema changes needed → separate migration user with temporary access
```

### 4.3 Data Encryption at Rest
```java
// Encrypt sensitive columns
@Convert(converter = AesEncryptor.class)
private String phoneNumber;

@Convert(converter = AesEncryptor.class)
private String medicalInfo;

@Convert(converter = AesEncryptor.class)
private String emergencyContact;

// AES-256 encryption with key from environment variable
// Key rotated every 90 days
```

### 4.4 Automated Backups
```bash
# Daily automated backup (Railway/cloud provider handles this, but also:)

# Manual backup script for extra safety
pg_dump -h host -U gymapp gymdb | gzip > backup_$(date +%Y%m%d).sql.gz

# Upload to separate cloud storage (redundancy)
aws s3 cp backup_*.sql.gz s3://gymapp-backups/ --sse AES256

# Retention: 7 daily, 4 weekly, 12 monthly
# Test restore monthly → verify backup actually works
```

---

## Layer 5: Monitoring for Attacks

### 5.1 Real-Time Security Monitoring
```java
// Log all security events
@EventListener
public void onAuthenticationFailure(AuthenticationFailureBadCredentialsEvent event) {
    securityLog.warn("Failed login: user={}, ip={}, count={}", 
        event.getUsername(), request.getRemoteAddr(), failedAttempts);
    
    if (failedAttempts > 5) {
        alertService.send(CRITICAL, "Brute force detected from IP: " + ip);
        blockIP(ip, Duration.ofHours(1));
    }
}

// Log all admin actions
@Around("@annotation(AdminAction)")
public Object auditAdminAction(ProceedingJoinPoint joinPoint) {
    // Log: who, what, when, from where, result
    auditLog.save(new AuditEntry(
        user, action, target, ip, userAgent, timestamp, result
    ));
    return joinPoint.proceed();
}
```

### 5.2 Automated Alert Rules

| Alert | Trigger | Action |
|-------|---------|--------|
| **Brute Force** | >10 failed logins from same IP in 5 min | Block IP + notify |
| **Token Abuse** | Same JWT used from 2+ different IPs | Invalidate all user sessions |
| **Data Exfiltration** | >100 API calls/min from single user | Rate limit + alert |
| **SQL Injection Attempt** | Request contains SQL keywords in params | Block + log + alert |
| **Admin Escalation** | Non-admin accessing /api/superadmin/* | Block + alert + audit |
| **Mass Deletion** | >50 DELETE operations in 1 minute | Block + require 2FA re-auth |
| **New Country Login** | Login from country never seen before | Require 2FA + email alert |
| **After-Hours Access** | Admin access between 2 AM - 5 AM | Extra verification |

---

## Layer 6: Compliance & Legal

### Privacy
- Clear privacy policy page
- Cookie consent banner (GDPR)
- Data retention policy (auto-delete after X months)
- Right to export personal data
- Right to be forgotten (account deletion)

### Terms of Service
- Acceptable use policy
- Payment terms
- Liability limitations
- Data processing agreement (GDPR)

---

## Security Checklist Before Go-Live

```
NETWORK:
[x] Cloudflare enabled with WAF, DDoS, SSL
[ ] HSTS header with preload
[ ] All HTTP → HTTPS redirect
[ ] Firewall rules (ufw) — only ports 22, 80, 443

AUTHENTICATION:
[ ] BCrypt cost factor ≥ 12
[ ] JWT access token ≤ 15 min expiry
[ ] Refresh token in httpOnly cookie
[ ] Account lockout after 5 failed attempts
[ ] 2FA enabled for all owner/super-admin accounts
[ ] Password breach database check

API:
[ ] CORS restricted to production domains
[ ] Rate limiting per IP AND per user
[ ] All inputs validated with @Valid
[ ] All endpoints check gym_id (tenant isolation)
[ ] No stack traces in error responses
[ ] API versioning (v1, v2)

DATA:
[ ] Database user has minimal permissions
[ ] SSL connection to database
[ ] Sensitive fields encrypted (AES-256)
[ ] Automated daily backups
[ ] Backup restore tested

FRONTEND:
[ ] No localStorage for tokens
[ ] No dangerouslySetInnerHTML
[ ] CSP headers configured
[ ] Dependencies audited (npm audit)
[ ] Source maps disabled in production

MONITORING:
[ ] Sentry error tracking active
[ ] Failed login alerting enabled
[ ] Uptime monitoring active
[ ] Security event logging enabled
[ ] Audit trail for all admin actions

COMPLIANCE:
[ ] Privacy policy page
[ ] Cookie consent
[ ] Terms of service
[ ] Data export capability
[ ] Account deletion capability
```

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Cloudflare setup, remove hardcoded secrets, environment variables |
| **Phase 2** | JWT refresh tokens (httpOnly cookie), account lockout, input validation |
| **Phase 3** | Tenant isolation middleware, file upload validation, security headers |
| **Phase 4** | 2FA for owner/admin, security event logging, IP blocking |
| **Phase 5** | Data encryption, database least-privilege, automated backups |
| **Phase 6** | Monitoring alerts, compliance pages, penetration testing |
