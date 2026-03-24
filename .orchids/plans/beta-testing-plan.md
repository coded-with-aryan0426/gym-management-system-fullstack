# Beta Testing Strategy — Gym Management Platform
> Version 2.0 | Date: 2026-03-24 | Stack: React 19 + Vite / Spring Boot / MySQL

---

## Table of Contents
1. [Context & Goals](#1-context--goals)
2. [Application Architecture Summary](#2-application-architecture-summary)
3. [Phase 1: Development & Beta Preparation](#3-phase-1--development--beta-preparation)
   - [1A: Global Feedback System with Toggle](#1a-global-feedback-system-with-toggle)
   - [1B: Multi-Stage Beta Testing Strategy](#1b-multi-stage-beta-testing-strategy)
   - [1C: Development Improvements Before Beta](#1c-development-improvements-before-beta)
4. [Phase 2: Deployment & Release](#4-phase-2--deployment--release)
   - [2A: Staging Environment Setup](#2a-staging-environment-setup)
   - [2B: Deployment Improvements](#2b-deployment-improvements)
   - [2C: Rollback Strategy](#2c-rollback-strategy)
5. [Public Hosting Options — Detailed Comparison](#5-public-hosting-options--detailed-comparison)
6. [Access Control Strategy](#6-access-control-strategy)
7. [Problems You WILL Face & Their Solutions](#7-problems-you-will-face--their-solutions)
8. [Integrated Feedback System Architecture](#8-integrated-feedback-system-architecture)
9. [Feedback System Implementation Plan](#9-feedback-system-implementation-plan)
10. [Beta Testing Session Protocol](#10-beta-testing-session-protocol)
11. [Tester Onboarding Checklist](#11-tester-onboarding-checklist)
12. [Feedback Workflow & Triage Process](#12-feedback-workflow--triage-process)
13. [Export & Reporting](#13-export--reporting)
14. [Post-Beta Cleanup Checklist](#14-post-beta-cleanup-checklist)
15. [Security Testing Strategy](#15-security-testing-strategy)
16. [Performance Testing Baseline](#16-performance-testing-baseline)
17. [Risk Register](#17-risk-register)
18. [Emergency Runbook](#18-emergency-runbook)

---

## 1. Context & Goals

### Application
- **Frontend**: React 19 + Vite, running on `localhost:5173` (owner), `5174` (trainer), `5175` (member)
- **Backend**: Spring Boot REST API, running on `localhost:8080`
- **Database**: MySQL (local or hosted)
- **Roles**: SuperAdmin, Owner/Admin, Trainer, Member/Customer

### Beta Testing Goals
| Goal | Success Metric |
|------|----------------|
| All core flows tested by real users | Every route in App.tsx exercised |
| Bugs surfaced before production | All P0/P1 bugs filed within 48h of session |
| UX friction identified | Every tester submits ≥3 feedback items |
| Trainer-request flow validated end-to-end | Accept/Decline cycle completed by 5+ tester pairs |
| Feedback collected in structured, searchable format | Zero feedback lost in chat/email |
| Global feature toggle works correctly | Feedback widget toggles on/off without redeployment |

### Testers
- ~10 concurrent users
- Mix of roles: 2-3 Owner/Admin, 3-4 Trainers, 3-4 Members
- Duration: 2-4 hour live sessions, optionally async over 1 week

---

## 2. Application Architecture Summary

```
[Tester Browser]
      |
      | HTTPS (tunnel or cloud)
      v
[Frontend: Vite Dev Server :5173]
      |
      | HTTP :8080
      v
[Backend: Spring Boot]
      |
      | JDBC
      v
[MySQL Database]
```

Both frontend AND backend must be publicly reachable.
The frontend calls the backend at a configured API base URL (`VITE_API_BASE_URL`).
This is the most commonly overlooked problem in local beta testing setups.

---

## 3. Phase 1: Development & Beta Preparation

### 1A: Global Feedback System with Toggle

#### Overview
The feedback system MUST have a global toggle that can enable/disable it without code changes or redeployment. This allows:
- **Production**: Keep feedback widget hidden but functional
- **Beta**: Enable for testers only
- **Development**: Enable for internal testing

#### Feature Toggle Architecture

```
┌─────────────────────────────────────────────┐
│         Backend: Feature Flag Service        │
├─────────────────────────────────────────────┤
│  GET /api/features/feedback                 │
│  Response: { enabled: boolean, version: "2.0" } │
└─────────────────────────────────────────────┘
                    │
                    │ JWT-protected endpoint
                    ▼
┌─────────────────────────────────────────────┐
│      Frontend: FeedbackWidgetProvider        │
├─────────────────────────────────────────────┤
│  1. Check feature flag on app mount         │
│  2. Store in React Context / Zustand        │
│  3. Conditionally render widget             │
│  4. Poll every 5 minutes for updates        │
└─────────────────────────────────────────────┘
```

#### Backend Implementation

**New Entity: FeatureFlag.java**
```java
@Entity
@Table(name = "feature_flags")
public class FeatureFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String featureKey;  // e.g., "feedback_widget", "beta_mode"

    @Column(nullable = false)
    private Boolean enabled;

    private String description;
    private String allowedRoles;  // comma-separated: "ADMIN,OWNER,TRAINER,MEMBER"

    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;

    // Only ADMIN can toggle these
}
```

**New Endpoint: FeatureFlagController.java**
```java
@RestController
@RequestMapping("/api/features")
public class FeatureFlagController {

    @GetMapping("/{featureKey}")
    public ResponseEntity<FeatureFlagDTO> getFeatureFlag(
            @PathVariable String featureKey,
            @AuthenticationPrincipal UserDetails user) {

        FeatureFlag flag = featureFlagService.getByKey(featureKey);

        // Check role permission
        if (!featureFlagService.isAllowedForUser(flag, user)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(new FeatureFlagDTO(flag));
    }

    // Only ADMIN can update
    @PutMapping("/{featureKey}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeatureFlagDTO> updateFeatureFlag(
            @PathVariable String featureKey,
            @RequestBody UpdateFeatureFlagRequest request) {

        FeatureFlag flag = featureFlagService.update(featureKey, request);
        return ResponseEntity.ok(new FeatureFlagDTO(flag));
    }

    @GetMapping("/all")
    public ResponseEntity<List<FeatureFlagDTO>> getAllFlags(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(
            featureFlagService.getAllFlagsForUser(user).stream()
                .map(FeatureFlagDTO::new)
                .collect(Collectors.toList())
        );
    }
}
```

**Database Migration**
```sql
CREATE TABLE feature_flags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    feature_key VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(500),
    allowed_roles VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial values
INSERT INTO feature_flags (feature_key, enabled, description, allowed_roles) VALUES
('feedback_widget', FALSE, 'Global feedback widget toggle', 'ADMIN,OWNER,TRAINER,MEMBER'),
('beta_mode', FALSE, 'Enable beta-specific features', 'ADMIN,OWNER'),
('new_ui', FALSE, 'New UI/UX improvements', 'ADMIN'),
('debug_mode', FALSE, 'Developer debug information', 'ADMIN');
```

#### Frontend Implementation

**FeedbackWidgetProvider.tsx**
```typescript
interface FeatureContextType {
  features: Record<string, boolean>;
  isLoading: boolean;
  refetchFeatures: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType | null>(null);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refetchFeatures = useCallback(async () => {
    try {
      const response = await api.get('/features/all');
      const featureMap = response.data.reduce((acc: Record<string, boolean>, flag: any) => {
        acc[flag.featureKey] = flag.enabled;
        return acc;
      }, {});
      setFeatures(featureMap);
      localStorage.setItem('features', JSON.stringify(featureMap));
    } catch (error) {
      console.error('Failed to fetch features, using cached:', error);
      const cached = localStorage.getItem('features');
      if (cached) setFeatures(JSON.parse(cached));
    }
  }, []);

  useEffect(() => {
    // Load cached features immediately
    const cached = localStorage.getItem('features');
    if (cached) setFeatures(JSON.parse(cached));

    // Then fetch fresh
    refetchFeatures().finally(() => setIsLoading(false));

    // Poll every 5 minutes
    const interval = setInterval(refetchFeatures, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refetchFeatures]);

  return (
    <FeatureContext.Provider value={{ features, isLoading, refetchFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeature = (featureKey: string): boolean => {
  const { features } = useContext(FeatureContext) || { features: {} };
  return features[featureKey] ?? false;
};
```

**Enhanced FeedbackWidget.tsx**
```typescript
export const FeedbackWidget: React.FC = () => {
  const isFeedbackEnabled = useFeature('feedback_widget');
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if feature is disabled
  if (!isFeedbackEnabled) return null;

  return (
    <>
      <FloatingButton onClick={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <FeedbackForm />
      </Modal>
    </>
  );
};
```

**SuperAdmin Feature Management Page: /superadmin/features**
```typescript
// Features management page
export const SAFeaturesPage: React.FC = () => {
  const { features, refetchFeatures } = useFeatures();
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleFeature = async (key: string, enabled: boolean) => {
    setUpdating(key);
    try {
      await api.put(`/features/${key}`, { enabled });
      await refetchFeatures();
      toast.success(`Feature "${key}" ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update feature');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="sa-features">
      <h1>Feature Toggles</h1>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Status</th>
            <th>Allowed Roles</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {features.map((flag) => (
            <tr key={flag.featureKey}>
              <td>
                <strong>{flag.featureKey}</strong>
                <p>{flag.description}</p>
              </td>
              <td>
                <Badge type={flag.enabled ? 'success' : 'neutral'}>
                  {flag.enabled ? 'ENABLED' : 'DISABLED'}
                </Badge>
              </td>
              <td>{flag.allowedRoles}</td>
              <td>
                <Switch
                  checked={flag.enabled}
                  onChange={(checked) => toggleFeature(flag.featureKey, checked)}
                  disabled={updating === flag.featureKey}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### Admin Toggle Instructions
1. Go to `/superadmin/features`
2. Find `feedback_widget` in the list
3. Toggle switch to **ENABLED**
4. Widget appears on all pages within 5 minutes (or immediately on next page refresh)
5. To disable: toggle back to **DISABLED**

---

### 1B: Multi-Stage Beta Testing Strategy

#### Beta Stages Overview

| Stage | Focus | Testers | Duration | Goals |
|-------|-------|---------|----------|-------|
| **Alpha** | Core flows, critical bugs | Internal (you + 1-2 devs) | 1-2 days | Find P0/P1 bugs before external testers |
| **Private Beta** | All features, UX feedback | 3-5 trusted users | 3-5 days | Validate all flows, gather UX feedback |
| **Public Beta** | Scale testing, edge cases | 10+ external users | 1 week | Stress test, find edge cases, polish |

#### Stage 1: Alpha Testing (Internal)

**Timeline**: Day -7 to Day -6 (before private beta)

**Testers**: You + 1-2 developers

**Test Focus**:
- [ ] All authentication flows (login, logout, password reset)
- [ ] JWT token handling (expiry, refresh)
- [ ] Basic CRUD operations for each role
- [ ] API error handling (400, 401, 403, 404, 500)
- [ ] CORS configuration validation
- [ ] Database connection stability

**Success Criteria**:
- Zero P0 bugs (app-breaking)
- Maximum 3 P1 bugs (core flow broken but workaround exists)
- All API endpoints return appropriate error messages

**Exit Gate**: Must pass 100% of P0 test cases before proceeding

#### Stage 2: Private Beta (Trusted Users)

**Timeline**: Day -5 to Day -1 (before public beta)

**Testers**: 3-5 trusted users (friends, colleagues, early adopters)

**Test Focus**:
- [ ] All user flows from Section 9 of this document
- [ ] Trainer request end-to-end (Flow 1)
- [ ] Member registration and membership (Flow 2)
- [ ] Class booking (Flow 3)
- [ ] Financial flows (Flow 4)
- [ ] Feedback widget functionality
- [ ] Real-time notifications via WebSocket

**Success Criteria**:
- All flows completed successfully by at least 2 testers
- Feedback widget receives ≥10 submissions
- Zero P0 bugs, maximum 5 P1 bugs
- No security vulnerabilities found

**Exit Gate**: Must have 3+ testers confirm core flows work without P0 issues

#### Stage 3: Public Beta (External Users)

**Timeline**: Day 0 to Day 7

**Testers**: 10+ external users via Cloudflare invitations

**Test Focus**:
- [ ] All flows from Section 9 with broader user base
- [ ] Edge cases (concurrent users, large data sets)
- [ ] Mobile responsiveness
- [ ] Performance under load
- [ ] User experience feedback
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

**Success Criteria**:
- All flows validated by multiple testers
- Feedback widget receives ≥30 submissions
- Performance metrics within acceptable range (see Section 16)
- No critical security issues

#### Beta Phase Gate Review

Before moving from each stage to the next:

| Stage Transition | Gate Criteria |
|------------------|---------------|
| Alpha → Private Beta | 0 P0 bugs, <3 P1 bugs, all core APIs validated |
| Private Beta → Public Beta | <5 P1 bugs, 3+ testers completed all flows, no security issues |

---

### 1C: Development Improvements Before Beta

#### Required Fixes Before Alpha

1. **CORS Configuration** (P0 - Will break all testing)
```java
// Must use allowedOriginPatterns for tunnel URLs
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(Arrays.asList(
        "http://localhost:*",
        "https://*.trycloudflare.com",
        "https://*.vercel.app",
        "https://*.railway.app",
        "https://*.up.railway.app"
    ));
    config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    // ...
}
```

2. **JWT Expiration for Beta** (P1 - Will annoy testers)
```properties
# application-beta.properties
jwt.expiration=28800000  # 8 hours in milliseconds
```

3. **WebSocket Heartbeat Configuration** (P1 - Will lose real-time updates)
```typescript
// In your STOMP client config
client.heartbeatIncoming = 10000;  // 10s
client.heartbeatOutgoing = 10000;
client.reconnectDelay = 5000;
```

4. **Feature Toggle Entity & Controller** (P0 - Required for feedback widget toggle)

5. **localStorage Write-Ahead Log for Feedback** (P1 - Prevents feedback loss)
```typescript
// See Section 9 for implementation
```

6. **Error Handler for OptimisticLockException** (P1 - Shows ugly errors)
```java
@ExceptionHandler(OptimisticLockException.class)
public ResponseEntity<ErrorResponse> handleOptimisticLock(OptimisticLockException ex) {
    return ResponseEntity.status(409)
        .body(new ErrorResponse("Data was modified by another user. Please refresh and try again."));
}
```

7. **Health Check Endpoint** (P1 - Required for monitoring)
```java
@GetMapping("/api/health")
public ResponseEntity<Map<String, String>> health() {
    return ResponseEntity.ok(Map.of(
        "status", "UP",
        "timestamp", Instant.now().toString()
    ));
}
```

#### Required Fixes Before Private Beta

8. **Separate Beta Database Schema**
```sql
CREATE DATABASE gym_beta;
-- All beta testing uses this schema
```

9. **Beta Seed Data Script**
```sql
-- scripts/seed-beta.sql
-- See Section 10 for tester account creation
```

10. **Feedback Widget Fully Functional** with:
    - [ ] localStorage WAL
    - [ ] Auto-capture page context
    - [ ] Screenshot capture
    - [ ] SuperAdmin dashboard

11. **Uptime Monitoring Setup** (UptimeRobot or similar)

#### Required Fixes Before Public Beta

12. **All P0/P1 bugs from Alpha & Private Beta resolved**

13. **Performance baseline established** (see Section 16)

14. **Security scan completed** (basic OWASP checklist)

15. **Rollback procedure documented and tested**

---

## 4. Phase 2: Deployment & Release

### 2A: Staging Environment Setup

#### Environment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                                │
│  localhost:5173 (frontend)                                   │
│  localhost:8080 (backend)                                     │
│  Local MySQL                                                 │
│  - Used by developers daily                                  │
│  - Auto-deploy on git push to develop branch                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Pull Request Merge
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    STAGING                                    │
│  staging.gym.yourdomain.com (or Railway staging)           │
│  Separate MySQL instance (staging_db)                        │
│  - Mirror of production configuration                         │
│  - Beta testers use this during Private Beta                 │
│  - Manual deploy from main branch                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Release tag + manual approval
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION                                │
│  gym.yourdomain.com                                         │
│  Production MySQL                                            │
│  - Zero downtime deployment strategy                          │
│  - Feature flags control rollout                              │
│  - Immediate rollback capability                              │
└─────────────────────────────────────────────────────────────┘
```

#### Staging Environment Setup Steps

**Option 1: Railway Staging** (Recommended)
```bash
# Create staging environment on Railway
railway environment create staging
railway up --environment staging

# Set environment variables
railway variables set SPRING_PROFILES_ACTIVE=staging
railway variables set DATABASE_URL=$MYSQL_URL_STAGING
railway variables set JWT_EXPIRATION=28800000

# Get staging URL
railway domain
# → https://gym-backend.staging.railway.app
```

**Option 2: Local Staging with Tunnels**
```bash
# Use separate ports for staging
cloudflared tunnel create gym-staging-frontend --port 5183
cloudflared tunnel create gym-staging-backend --port 8081

# Start backend on port 8081
./mvnw spring-boot:run -Dspring-boot.run.profiles=staging
```

#### Staging Configuration

**application-staging.properties**
```properties
# Server
server.port=8080

# Database
spring.datasource.url=${STAGING_DB_URL}
spring.datasource.username=${STAGING_DB_USER}
spring.datasource.password=${STAGING_DB_PASSWORD}

# JWT - 8 hours for beta testing
jwt.expiration=28800000

# Feature Flags - Beta mode ON
feature.feedback.default=true
feature.beta.mode=true

# Logging
logging.level.root=INFO
logging.level.com.gym=DEBUG

# CORS
cors.allowed-origins=${STAGING_FRONTEND_URL}
```

---

### 2B: Deployment Improvements

#### Pre-Deployment Checklist

- [ ] All tests passing locally (`npm test` and `./mvnw test`)
- [ ] No P0/P1 bugs in feedback tracker
- [ ] Staging environment fully tested
- [ ] Production database backup completed
- [ ] Rollback procedure tested on staging
- [ ] Feature toggle states verified for production
- [ ] Communication plan sent to stakeholders
- [ ] Monitoring dashboards configured

#### Zero-Downtime Deployment Strategy

**Blue-Green Deployment Pattern**
```
┌──────────────────────────────────────────────────────────────┐
│                     LOAD BALANCER                             │
│              (Cloudflare, Railway, or AWS ALB)               │
└──────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│     BLUE ENVIRONMENT     │  │    GREEN ENVIRONMENT    │
│   Current Production    │  │   New Version (Deploy)  │
│                         │  │                        │
│  gym-backend-v1.2.3     │  │   gym-backend-v1.2.4   │
│  healthy ✓              │  │   healthy ✓            │
└─────────────────────────┘  └─────────────────────────┘
         │                              │
         │                              │ Test green
         │                              │ Health checks pass
         │                              ▼
         │                    ┌─────────────────────────┐
         │                    │  Switch traffic 10%   │
         │                    │  Monitor error rates    │
         │                    └─────────────────────────┘
         │                              │
         │              ┌───────────────┴───────────────┐
         │              │                               │
         │              ▼                               ▼
         │    If errors < 1%:              If errors > 1%:
         │    Continue rollout             Automatic rollback
         │    25% → 50% → 100%            to blue
         │              │
         └──────────────┴──────────────────────────────┘
                          │
                          ▼
               ┌─────────────────────────┐
               │    BLUE = GREEN         │
               │  Old version stopped    │
               │  Deployment complete    │
               └─────────────────────────┘
```

#### Railway Deployment Steps

```bash
# 1. Ensure you're on main branch with clean state
git checkout main
git pull origin main

# 2. Create production release tag
git tag -a v1.2.4 -m "Beta release with feedback system"
git push origin v1.2.4

# 3. Deploy backend to Railway
cd backend
railway login
railway init --environment production
railway up

# 4. Set production environment variables
railway variables set SPRING_PROFILES_ACTIVE=production
railway variables set JWT_EXPIRATION=86400000  # 24 hours for production
railway variables set DATABASE_URL=$MYSQL_URL_PROD

# 5. Deploy frontend to Vercel
cd ../frontend
vercel --prod

# 6. Configure custom domain
vercel domains add gym.yourdomain.com
# Or via Cloudflare DNS

# 7. Verify deployment
curl https://gym-backend.yourdomain.com/api/health
# Expected: {"status":"UP","timestamp":"..."}

# 8. Enable feature flags for production
# Go to /superadmin/features and enable desired features
```

---

### 2C: Rollback Strategy

#### Automatic Rollback Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | > 1% over 5 minutes | Auto-rollback |
| Latency | p99 > 3000ms | Alert, manual decision |
| Health check failures | 3 consecutive failures | Auto-rollback |
| Database connection failures | Any | Auto-rollback |

#### Rollback Procedures

**Railway Rollback**
```bash
# List recent deployments
railway deployments list

# Get specific deployment ID to rollback to
railway rollback [DEPLOYMENT_ID]

# Verify rollback
curl https://gym-backend.yourdomain.com/api/health
```

**Manual Emergency Rollback**
```bash
# If Railway console is down, use CLI
railway rollback [LAST_STABLE_DEPLOYMENT_ID]

# Check logs during rollback
railway logs --deployment [DEPLOYMENT_ID]
```

**Frontend Rollback**
```bash
# List recent deployments
vercel ls

# Rollback to specific version
vercel rollback [DEPLOYMENT_URL]

# Or redeploy previous production deployment
vercel --prod --force
```

#### Feature Flag Emergency Disable

If a feature causes issues in production:

1. Go to `/superadmin/features`
2. Toggle the problematic feature to **DISABLED**
3. Changes take effect within 5 minutes (polling interval)
4. Or force refresh: clear localStorage `features` key

**No redeployment needed** — feature flags work without restart.

---

## 5. Public Hosting Options — Detailed Comparison

### Option A — Tunneling (Recommended for Speed)

**What it is**: A process runs on your machine, opens an outbound connection to a relay server, which assigns you a public HTTPS URL that forwards traffic to your localhost.

| Tool | Free Tier | Custom Domain | Persistent URL | Max Connections | Auth Built-in | Best For |
|------|-----------|--------------|----------------|-----------------|---------------|----------|
| **ngrok** | 1 tunnel, random URL, 40 conn/min | Paid | Paid ($8/mo) | ~40/min free | Paid (IP allow-list) | Quick demos |
| **Cloudflare Tunnel** | Free, persistent | Free | Yes (free) | Unlimited | Zero Trust (free) | Best free option |
| **localtunnel** | Free, random URL | None | No | ~10 | None | Quick tests |
| **bore.pub** | Free, self-host | No | No | Low | None | Dev only |
| **Serveo** | Free | No | Session-only | Low | None | Minimal |
| **Tailscale** | Free for <20 devices | No | Yes | 20 devices | Built-in (invite only) | Private team access |

**Recommendation**: **Cloudflare Tunnel** for production-grade beta testing.
- Free, HTTPS by default, persistent subdomain, built-in Zero Trust access (email-based invites = perfect for 10 testers)
- No bandwidth limits that matter for 10 users

### Option B — Minimal Cloud Deployment (Recommended if sessions span >3 days)

**What it is**: Deploy to a cheap cloud VM or PaaS. Not "production" but stable.

| Platform | Cost | Setup Time | Suits |
|----------|------|-----------|-------|
| **Railway** | ~$5/mo | 30 min | Full-stack (frontend + backend + MySQL) |
| **Render** | Free tier + $7/mo | 45 min | Backend on free, frontend on CDN |
| **Fly.io** | Free tier (3 VMs) | 1 hr | Docker-based, most control |
| **Oracle Cloud Always Free** | $0 forever | 2 hr | Full VM, Spring Boot + MySQL |
| **Vercel (frontend only)** | Free | 10 min | Only frontend — needs separate backend |

**Recommendation for your stack**:
- **Railway** = fastest full-stack deploy. MySQL included. Spring Boot Dockerfile auto-detected.
- Use **Vercel** for frontend (already configured — `.vercelignore` and `vercel.json` exist in your repo) + **Railway** for backend.

### Option C — Local Machine as Server (Fallback Only)

Run your laptop as the server. Share your home/office IP.

**Problems**:
- Your ISP may block inbound port 80/443/8080
- Dynamic IP changes between sessions
- WiFi goes down = everyone disconnected
- Firewall configuration risk (exposing your dev machine to the internet)
- Battery/sleep interrupts the session

**Verdict**: Only for 1-2 hour demos with you present. Never for async testing.

---

## 6. Access Control Strategy

### Problem
Your app has JWT-based auth but once the URL is public, ANYONE with the link can hit `/login` or `/portal`.

### Solution Layers (Defense in Depth)

**Layer 1 — Network (Cloudflare Zero Trust)**
- Only the 10 invited email addresses can even reach the URL
- All others get a 403 before touching your app

**Layer 2 — Application (Beta Invite Codes)**
- Add a `betaInviteCode` check on your `/auth/login` endpoint
- Each tester gets a unique code (e.g., `BETA-ARYAN-2026-T01`)
- Server validates code before issuing JWT
- Simple: one extra column `beta_code` in the `users` table for beta users

**Layer 3 — Rate Limiting**
- Add Spring Boot rate limiting (Bucket4j or simple in-memory) on `/api/auth/login`
- Max 10 requests/minute per IP → prevents brute force during beta

**Layer 4 — Data Isolation**
- Create a separate MySQL database/schema named `gym_beta`
- Point backend to `gym_beta` during beta period
- Pre-seed with realistic dummy data
- This means a tester can't accidentally corrupt production data

**Layer 5 — Monitoring**
- Enable Spring Boot Actuator `/health` and `/metrics`
- Point to a free UptimeRobot monitor → you get SMS/email if backend goes down

---

## 7. Problems You WILL Face & Their Solutions

### P1 — CORS Errors (WILL HAPPEN)

**Problem**: Frontend tunnel URL (`https://xyz.trycloudflare.com`) tries to call backend. Browser blocks it: `Access-Control-Allow-Origin` missing.

**Root Cause**: Your Spring Boot CORS config only has `localhost:5173` in allowed origins.

**Solution**:
```java
// Add to your WebMvcConfigurer or @CrossOrigin config
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(Arrays.asList(
        "http://localhost:*",
        "https://*.trycloudflare.com",
        "https://*.vercel.app",
        "https://*.up.railway.app"
    ));
    config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    // ...
}
```

**Prevention**: Use `setAllowedOriginPatterns` (not `setAllowedOrigins`) with wildcards for tunnels.

---

### P2 — Frontend Calls Wrong API URL (VERY COMMON)

**Problem**: You give testers the frontend URL. They log in. Everything calls `localhost:8080` (hardcoded) instead of the tunnel backend URL. All API calls fail silently or with network errors.

**Root Cause**: `VITE_API_BASE_URL` is baked in at build time. If you didn't set it before starting Vite, all calls go to localhost.

**Solution**:
```bash
# Always start frontend with explicit env:
VITE_API_BASE_URL=https://your-backend-tunnel.trycloudflare.com npm run dev -- --host 0.0.0.0

# Or create .env.beta:
echo "VITE_API_BASE_URL=https://your-backend-tunnel.trycloudflare.com" > frontend/.env.beta
# Then: vite --mode beta
```

**Check**: Before starting the session, open browser DevTools → Network → look at any login request. The URL should be `https://your-tunnel.trycloudflare.com/api/...`, not `localhost:8080`.

---

### P3 — Hibernate DDL Creates Tables on Beta DB, Breaks Schema

**Problem**: `spring.jpa.hibernate.ddl-auto=update` or `create-drop` is set. When backend starts against your beta DB, Hibernate auto-alters tables. If your entities have `@Column(unique=true)` changes, it may fail on existing data.

**Solution**:
- Set `ddl-auto=validate` for beta (not `update`)
- Run migrations manually with a SQL script first
- Or use `ddl-auto=update` only on first run, then switch to `validate`

---

### P4 — Your Laptop Goes to Sleep Mid-Session

**Problem**: macOS auto-sleep disconnects all tunnels. Testers get `502 Bad Gateway`. All lose their work.

**Solution**:
```bash
# Prevent sleep during beta session:
caffeinate -i -s &    # macOS: keep system+disk awake indefinitely
# Kill after session: kill %1
```

Also: plug in power, disable screensaver, set display sleep to "Never" in System Preferences during beta.

---

### P5 — JWT Tokens Expire During Testing

**Problem**: Testers are mid-flow, JWT expires (e.g., 15-minute expiry during development). They get auto-logged out. They lose context and get confused thinking it's a bug.

**Solution**:
- Set JWT expiry to 8-12 hours for beta period only
- In `application-beta.properties`: `jwt.expiration=28800000` (8 hours)
- Alternatively, enable refresh token flow if not already implemented

---

### P6 — Multiple Testers Hit Race Conditions / Data Conflicts

**Problem**: Two testers try to assign the same trainer simultaneously. Or two Owner accounts edit the same member. You get `OptimisticLockException` (your `User.java` has `@Version` — good, this will throw errors).

**Solution**:
- Pre-assign tester accounts to non-overlapping test data sets
  - Tester group A uses members 1-10, trainers 1-3
  - Tester group B uses members 11-20, trainers 4-6
- Add a global error handler that returns a user-friendly message for `409 Conflict` instead of a stack trace
- Your `User.java` already has `@Version` — make sure frontend handles `409` gracefully

---

### P7 — WebSocket (STOMP) Disconnects Through Tunnel

**Problem**: Your app uses `@stomp/stompjs` + SockJS for real-time features. Tunnels often have 30-60 second timeout on idle WebSocket connections. Testers will see notification badges stop updating.

**Solution**:
- Add heartbeat to STOMP client config:
```typescript
client.heartbeatIncoming = 10000;  // 10s
client.heartbeatOutgoing = 10000;
client.reconnectDelay = 5000;      // auto-reconnect
```
- Cloudflare Tunnel supports WebSockets natively — better than ngrok free tier
- Add a visible "Reconnecting..." indicator in your notification bell

---

### P8 — Feedback Submitted but Lost (No Backend Running)

**Problem**: Tester submits feedback. Backend is temporarily down (restart, crash). Feedback POST returns 503. Tester sees no error. Feedback is lost forever.

**Solution** (implemented in this plan):
- Frontend feedback widget uses `localStorage` as a write-ahead log
- On submit: save to localStorage first, then POST to backend
- On success: clear from localStorage
- On failure: show "Saved locally — will retry" toast
- On next app load: check localStorage for unsent feedback, retry automatically

---

### P9 — Testers Don't Know What to Test

**Problem**: You give 10 people access. They click around randomly. You get vague feedback like "it looks good" or "seems slow". Zero actionable data.

**Solution**:
- Create a structured test script (included in Section 10)
- Assign each tester a specific role AND a specific flow to test
- Use the in-app feedback widget with **pre-filled section context** — when they're on `/trainer/members`, the widget auto-sets section to "MyMembers"

---

### P10 — Database Size / Performance Degrades Mid-Session

**Problem**: MySQL running on your laptop with 10 users inserting data, running reports, generating notifications. After 2 hours, queries slow down. Testers report "the app feels slow".

**Solution**:
- Pre-tune MySQL for dev: increase `innodb_buffer_pool_size` to 512MB
- Add indexes on `NOTIFICATIONS.user_id`, `trainer_requests.trainer_id`, `trainer_requests.status`
- If using Railway/cloud: use at least the $5/mo plan (512MB RAM minimum)
- Add Spring Boot caching (`@Cacheable`) on frequently-read endpoints like trainer lists

---

### P11 — Cloudflare Tunnel URL Changes Between Restarts

**Problem**: You restart cloudflared. The random `.trycloudflare.com` URL changes. All 10 testers have the old URL bookmarked. You need to re-send links.

**Solution**:
- Use a **named tunnel** with a fixed subdomain (requires Cloudflare account + domain)
- Or use **ngrok paid** for a stable URL
- Or use the **Vercel+Railway** cloud deploy approach — URLs never change

---

### P12 — Testers on Mobile Browsers

**Problem**: Some testers may try the app on mobile. Your CSS is desktop-first. They report layout bugs that aren't real bugs — they're just missing responsive styles.

**Solution**:
- Explicitly tell testers: "Desktop Chrome/Firefox only for this beta"
- Add a `<meta name="mobile-redirect">` or a mobile-detection banner: "Best viewed on desktop"

---

### P13 — Feature Toggle Not Propagating Immediately

**Problem**: You disable the feedback widget, but some users still see it for several minutes.

**Solution**:
- Implement polling with 5-minute intervals (as described in Section 3A)
- Add manual "Check for updates" button in the widget
- Clear localStorage to force immediate refresh
- Document the delay in admin UI: "Changes take up to 5 minutes"

---

### P14 — Beta Data Contaminates Production

**Problem**: After beta, someone accidentally points production to the beta database, losing all production data.

**Solution**:
- Use completely separate database schemas (gym_prod vs gym_beta)
- Environment variables stored in separate secret managers
- No code changes between environments — only env vars differ
- Add deployment checklist verification step

---

## 8. Integrated Feedback System Architecture

### Overview

```
[Tester on any page]
        |
        | clicks floating "Feedback" button (bottom-right, every page)
        v
[FeedbackWidget Modal]
  - Auto-filled: page route, section name, timestamp, user info
  - Manual: severity tag, subject, description, optional screenshot
        |
        | POST /api/beta/feedback
        v
[Spring Boot FeedbackController]
        |
        | saves to beta_feedback table
        v
[MySQL: beta_feedback table]
        |
        | (SuperAdmin reads)
        v
[/superadmin/feedback dashboard]
  - Filter by severity, page, tester, date
  - Export to CSV/JSON
  - Mark as resolved / in-progress
```

### Data Model

```sql
CREATE TABLE beta_feedback (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    -- Tester identity
    user_id       BIGINT,
    tester_name   VARCHAR(255),
    tester_email  VARCHAR(255),
    tester_role   VARCHAR(50),        -- OWNER, TRAINER, MEMBER, etc.
    -- Context (auto-captured)
    page_route    VARCHAR(500),       -- e.g. "/trainer/members"
    page_title    VARCHAR(255),       -- e.g. "My Members"
    section       VARCHAR(255),       -- e.g. "Pending Requests Panel"
    browser       VARCHAR(255),       -- user agent
    screen_size   VARCHAR(50),        -- "1440x900"
    -- Feedback content
    severity      VARCHAR(20),        -- BUG | UI_ISSUE | SUGGESTION | IMPROVEMENT | QUESTION
    category      VARCHAR(50),        -- UI | PERFORMANCE | LOGIC | FEATURE | SECURITY | DATA
    subject       VARCHAR(500),
    description   CLOB,
    steps_to_reproduce CLOB,
    -- Attachments
    screenshot_url VARCHAR(1000),     -- base64 or file path
    -- Status (for admin triage)
    status        VARCHAR(20) DEFAULT 'NEW',  -- NEW | ACKNOWLEDGED | IN_PROGRESS | RESOLVED | WONT_FIX
    admin_notes   CLOB,
    priority_score INT DEFAULT 0,     -- 0-10, set by admin
    -- Timing
    submitted_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at   DATETIME,
    -- Session tracking
    session_id    VARCHAR(100),       -- UUID for each browser session
    beta_version  VARCHAR(20) DEFAULT '1.0'
);
```

### Severity Tags
| Tag | Color | When to Use |
|-----|-------|-------------|
| BUG | Red | Something is broken / doesn't work |
| UI_ISSUE | Orange | Visual glitch, misalignment, wrong color |
| SUGGESTION | Blue | New feature idea |
| IMPROVEMENT | Green | Existing feature works but could be better |
| QUESTION | Gray | Tester is confused, needs clarification |

### Categories (for triage)
| Category | Examples |
|----------|---------|
| UI | Layout broken, text overflow, button missing |
| PERFORMANCE | Page loads slow, spinner doesn't stop |
| LOGIC | Wrong data shown, calculation error |
| FEATURE | Missing functionality |
| SECURITY | Unauthorized access, data visible to wrong user |
| DATA | Wrong data, stale data, missing records |

---

## 9. Feedback System Implementation Plan

### Frontend: FeedbackWidget Component

**Location**: `frontend/src/components/feedback/FeedbackWidget.tsx`

**Behavior**:
- Floating button: bottom-right, z-index: 9999, visible on all routes
- Opens a side-drawer or centered modal
- Auto-captures:
  - `window.location.pathname` → page_route
  - Page `<title>` → page_title
  - `navigator.userAgent` → browser
  - `${window.screen.width}x${window.screen.height}` → screen_size
  - `localStorage.getItem('sessionId')` → session_id (generated on first load)
  - JWT decoded user info → user_id, tester_name, tester_email, tester_role
- Manual fields:
  - Severity (radio/chip buttons — BUG, UI ISSUE, SUGGESTION, IMPROVEMENT, QUESTION)
  - Category (dropdown)
  - Subject (text input, max 200 chars)
  - Description (textarea, max 2000 chars)
  - Steps to Reproduce (textarea, shown only for BUG)
  - Screenshot (file input OR in-browser capture with `html2canvas`)

**Resilience (localStorage WAL)**:
```typescript
const submitFeedback = async (data: FeedbackPayload) => {
  // 1. Save to localStorage first
  const key = `feedback_pending_${Date.now()}`;
  localStorage.setItem(key, JSON.stringify(data));

  try {
    // 2. POST to backend
    await api.post('/beta/feedback', data);
    // 3. On success, remove from localStorage
    localStorage.removeItem(key);
    toast.success('Feedback submitted!');
  } catch (err) {
    // 4. On failure, keep in localStorage, show retry notice
    toast.error('Saved locally — will retry when connection is restored');
  }
};
```

**On app load, retry unsent feedback**:
```typescript
useEffect(() => {
  const pendingKeys = Object.keys(localStorage).filter(k => k.startsWith('feedback_pending_'));
  pendingKeys.forEach(async key => {
    const data = JSON.parse(localStorage.getItem(key)!);
    try {
      await api.post('/beta/feedback', data);
      localStorage.removeItem(key);
    } catch { /* will retry next load */ }
  });
}, []);
```

### Backend: Feedback Entity + Controller

**Files to create**:
- `model/BetaFeedback.java` — JPA entity matching the table above
- `repository/BetaFeedbackRepository.java` — JPA repository
- `controller/BetaFeedbackController.java` — REST endpoints

**Endpoints**:
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/beta/feedback` | Submit feedback (any authenticated user) |
| GET | `/api/beta/feedback` | List all feedback (SuperAdmin only) |
| GET | `/api/beta/feedback/{id}` | Get single item (SuperAdmin) |
| PATCH | `/api/beta/feedback/{id}/status` | Update status + admin notes (SuperAdmin) |
| GET | `/api/beta/feedback/export` | Export as CSV (SuperAdmin) |
| GET | `/api/beta/feedback/stats` | Aggregate stats by severity, page, category |

### SuperAdmin Dashboard: `/superadmin/feedback`

**File**: `frontend/src/pages/superadmin/SABetaFeedback.tsx`

**Features**:
- Stats bar: total, open bugs, UI issues, suggestions
- Filter bar: severity, category, tester, page_route, status, date range
- Table: tester name, role, page, severity chip, subject, submitted_at, status
- Row click → full detail drawer with description, steps, screenshot preview
- Admin notes field + status dropdown (NEW → ACKNOWLEDGED → IN_PROGRESS → RESOLVED)
- Export button → downloads CSV with all filtered rows
- Priority score input (0-10) per item

---

## 10. Beta Testing Session Protocol

### Pre-Session Checklist (You — 30 minutes before)
- [ ] `caffeinate -i -s &` running on your Mac
- [ ] Backend started: `./mvnw spring-boot:run -Dspring-boot.run.profiles=beta`
- [ ] Frontend started: `VITE_API_BASE_URL=https://backend-tunnel.cf.com npm run dev -- --host 0.0.0.0`
- [ ] Both tunnels running: `cloudflared tunnel run gym-frontend` + `cloudflared tunnel run gym-backend`
- [ ] Beta DB seeded with test data (script: `scripts/seed-beta.sql`)
- [ ] All 10 tester accounts created and verified (login tested manually)
- [ ] UptimeRobot monitor showing green
- [ ] Discord/WhatsApp group ready for real-time tester communication

### Tester Role Assignments
| Tester # | Role | Test Focus | Test Accounts |
|----------|------|-----------|---------------|
| T01 | Owner | Dashboard, Members, Financials | owner1@beta.test |
| T02 | Owner | Staff, Equipment, Classes | owner2@beta.test |
| T03 | Trainer | MyMembers, Schedule, Notifications | trainer1@beta.test |
| T04 | Trainer | TrainerRequest Accept flow, Progress Notes | trainer2@beta.test |
| T05 | Trainer | Messages, Reports, Profile | trainer3@beta.test |
| T06 | Member | MyTrainer (Send Request flow) | member1@beta.test |
| T07 | Member | MyMembership, MyProgress, Bookings | member2@beta.test |
| T08 | Member | Available Classes, Notifications | member3@beta.test |
| T09 | Member | Settings, Profile, Password change | member4@beta.test |
| T10 | Owner | Check-in, Attendance, Tasks | owner3@beta.test |

### Structured Test Flows (Give these to testers)

**Flow 1 — Trainer Request End-to-End** (T06 + T04)
1. T06 (Member) logs in → goes to `/member/trainer` → finds T04's trainer profile → clicks "Request Trainer" → fills in goal message → submits
2. T04 (Trainer) logs in → goes to `/trainer/notifications` → sees request notification → clicks → reviews member message → accepts
3. T06 refreshes → sees T04 as their assigned trainer
4. Expected: No errors, both sides update in real-time

**Flow 2 — Member Registration + Membership** (T01 + any Member)
1. T01 (Owner) creates a new member account
2. Assigns a membership plan
3. Member logs in with the new account, verifies membership is visible on `/member/membership`

**Flow 3 — Class Booking** (T07 + T02)
1. T02 (Owner) creates a new class from `/classes`
2. T07 (Member) goes to `/member/classes` → finds the class → books it
3. T02 verifies the booking appears in the class list

**Flow 4 — Financial Flow** (T01)
1. Navigate to `/financials`
2. Create an invoice for a member
3. Mark it as paid
4. Check revenue reflects correctly on `/dashboard`

**Flow 5 — Feedback Widget** (All testers)
- Every tester should submit at least 3 feedback items during their session
- At least 1 should be a "BUG" type with steps to reproduce

---

## 11. Tester Onboarding Checklist

### What to Send Each Tester

**Email Template**:
```
Subject: Gym App Beta Access — Your Credentials

Hi [Name],

You're invited to beta test our Gym Management App!

LOGIN URL: https://gym-beta.yourdomain.com
USERNAME: [their username]
TEMPORARY PASSWORD: [temp password]
YOUR ROLE: [Owner / Trainer / Member]

IMPORTANT:
- Use Chrome or Firefox on desktop only
- If you see a Cloudflare access screen, enter your email and check for a one-time code
- The app is a beta — bugs are expected, please use the feedback button (bottom-right) to report them
- Do NOT use real personal data

YOUR TASKS:
[Attach their specific test flow from Section 10]

FEEDBACK: Use the blue "Feedback" button on every page.
ISSUES DURING SESSION: Message me on WhatsApp: [your number]

Thank you!
```

### First-Login Flow
1. Tester hits URL → Cloudflare Zero Trust screen → enters email → gets OTP
2. Redirected to app → login page → enters credentials
3. Forced password change (your `isFirstLogin` flow)
4. Lands on their role dashboard
5. FeedbackWidget visible bottom-right (if feature enabled)

---

## 12. Feedback Workflow & Triage Process

### Daily Triage (During Beta Week)
Run this every morning:

1. Open `/superadmin/feedback` dashboard
2. Sort by `severity = BUG`, `status = NEW`
3. For each BUG:
   - Reproduce locally in <10 minutes
   - If reproducible: set status = IN_PROGRESS, assign priority score (1-10)
   - If not reproducible: set status = ACKNOWLEDGED, add admin note asking for more info
4. Review SUGGESTIONS: tag as WONT_FIX or add to backlog
5. Export daily CSV: `feedback_YYYY-MM-DD.csv`

### Priority Scoring Matrix
| Score | Meaning | SLA |
|-------|---------|-----|
| 9-10 | App-breaking, data loss, security issue | Fix same day |
| 7-8 | Core flow broken (can't login, can't submit) | Fix within 24h |
| 5-6 | Feature partially broken | Fix within 48h |
| 3-4 | UI glitch, cosmetic issue | Fix this week |
| 1-2 | Nice-to-have suggestion | Add to backlog |

### Issue Escalation
- Priority 9-10 → immediately message tester, ask for screen recording
- Priority 7-8 → fix and ask tester to re-test before end of beta
- Any SECURITY type → immediately revoke tester access to affected section while fixing

---

## 13. Export & Reporting

### CSV Export Format
```
id, submitted_at, tester_name, tester_role, page_route, section, severity, category, subject, description, steps_to_reproduce, status, priority_score, admin_notes, resolved_at
```

### End-of-Beta Report Structure
Generate this manually or via the dashboard export:

```markdown
# Beta Testing Report — [Date Range]

## Summary
- Total Feedback: X items
- Bugs: X (X resolved, X open)
- UI Issues: X
- Suggestions: X
- Improvements: X

## Top Issues by Page
| Page | Bug Count | Highest Priority |
|------|-----------|-----------------|
...

## Critical Bugs (Priority 8+)
1. [Bug title] — [Status] — [Tester]
...

## Top Suggestions
1. ...

## Beta Phase Results
| Phase | Testers | Duration | Bugs Found | Critical Issues |
|-------|---------|----------|------------|-----------------|
| Alpha | 2 | 2 days | X | X |
| Private Beta | 5 | 5 days | X | X |
| Public Beta | 10 | 7 days | X | X |

## Next Steps
- [ ] Fix all P8+ bugs before next release
- [ ] Review top 5 suggestions with team
- [ ] Schedule Beta Round 2 after fixes
```

---

## 14. Post-Beta Cleanup Checklist

### Data Management
- [ ] Export final feedback report (CSV + PDF summary)
- [ ] Backup beta database before cleanup: `mysqldump gym_beta > backup_gym_beta_$(date +%Y%m%d).sql`
- [ ] Archive feedback in long-term storage
- [ ] Delete beta database OR keep for future testing
- [ ] Notify testers of beta closure

### Access Revocation
- [ ] Disable all beta tester accounts (or delete if not needed in production)
- [ ] Revoke Cloudflare Zero Trust access for all testers
- [ ] Remove beta invite codes from authentication flow
- [ ] Disable beta feature flags (`feedback_widget = false`, `beta_mode = false`)

### Infrastructure Cleanup
- [ ] Stop tunnel processes on local machine
- [ ] Delete tunnel configurations: `cloudflared tunnel delete gym-frontend`
- [ ] Take down staging environment if separate
- [ ] Update production environment variables (remove beta-specific configs)
- [ ] Set JWT expiration back to production value (24h or appropriate)

### Documentation
- [ ] Update README with production URLs
- [ ] Document any bugs found that weren't fixed
- [ ] Create follow-up tickets for P3+ issues
- [ ] Update feature flag documentation
- [ ] Archive beta testing plan (create v2.0 for next beta)

### Retrospective
- [ ] Conduct beta retrospective meeting
- [ ] Document what went well and what to improve
- [ ] Update beta testing plan for next iteration
- [ ] Thank testers and share summary of changes made based on their feedback

---

## 15. Security Testing Strategy

### Pre-Beta Security Checklist

- [ ] **Authentication**
  - [ ] JWT secret is strong and not default
  - [ ] Password policy enforced (min length, complexity)
  - [ ] Account lockout after failed attempts
  - [ ] Session timeout working

- [ ] **Authorization**
  - [ ] Role-based access control tested for all roles
  - [ ] Trainers cannot access Owner features
  - [ ] Members cannot access Admin features
  - [ ] API endpoints protected by authentication

- [ ] **Input Validation**
  - [ ] SQL injection prevention (parameterized queries)
  - [ ] XSS prevention (input sanitization)
  - [ ] File upload validation (if applicable)

- [ ] **Data Protection**
  - [ ] Sensitive data not logged
  - [ ] Database connections encrypted (SSL/TLS in production)
  - [ ] Backup encryption

### Security Testing During Beta

**Basic OWASP Top 10 Check**:
1. **A01: Broken Access Control** — Test each role accessing their own data only
2. **A02: Cryptographic Failures** — Verify sensitive data in transit is encrypted
3. **A03: Injection** — Try SQL injection in feedback form, login fields
4. **A04: Insecure Design** — Document any security-related UX friction
5. **A05: Security Misconfiguration** — Verify debug mode is off in staging/prod

### Incident Response During Beta

If a security vulnerability is found:

1. **P0 Security Issue** (data breach, unauthorized access):
   - Immediately disable affected feature/user
   - Revoke all beta access
   - Assess scope of vulnerability
   - Fix before resuming beta
   - Notify affected testers

2. **P1 Security Issue** (potential vulnerability):
   - Document and assign priority
   - Fix within 24-48 hours
   - Resume beta after fix

---

## 16. Performance Testing Baseline

### Metrics to Capture Before Beta

Run these tests against your local or staging environment with representative data.

**Tool**: Use `k6` (free, open-source) or Apache Bench for simple tests.

### API Response Time Baselines

| Endpoint | p50 | p95 | p99 | Max Acceptable |
|----------|-----|-----|-----|----------------|
| `/api/auth/login` | <200ms | <500ms | <1s | 2s |
| `/api/members` | <150ms | <400ms | <800ms | 1.5s |
| `/api/trainers` | <100ms | <300ms | <600ms | 1s |
| `/api/notifications` | <100ms | <250ms | <500ms | 1s |
| `/api/feedback` (POST) | <200ms | <400ms | <800ms | 1.5s |

### Load Test Script (k6)

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up
    { duration: '1m', target: 10 },   // Steady state
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% under 1s
    errors: ['rate<0.1'],               // <10% error rate
  },
};

export default function () {
  const baseUrl = 'https://your-backend.railway.app';

  // Test public endpoints
  check(http.get(`${baseUrl}/api/health`), {
    'health check passed': (r) => r.status === 200,
  });

  // Auth flow
  const loginRes = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    username: 'test@test.com',
    password: 'testpassword'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has JWT token': (r) => r.json('token') !== undefined,
  });

  const token = loginRes.json('token');

  // Test authenticated endpoints
  check(http.get(`${baseUrl}/api/members`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }), {
    'members fetched': (r) => r.status === 200,
  });

  sleep(1);
}
```

Run with:
```bash
k6 run k6-load-test.js
```

### Performance Budget

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Page Load (LCP) | <2.5s | 2.5-4s | >4s |
| Time to Interactive | <3s | 3-5s | >5s |
| API p95 | <500ms | 500ms-1s | >1s |
| Error Rate | <1% | 1-5% | >5% |

### Performance Issues Found During Beta

If testers report slowness:
1. Check database query times with `EXPLAIN ANALYZE`
2. Add indexes on frequently queried columns
3. Implement caching for read-heavy endpoints
4. Consider lazy loading for large lists
5. Optimize images (WebP, lazy loading)

---

## 17. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Backend crashes mid-session | Medium | High | UptimeRobot alert, restart script ready |
| Tunnel URL changes | Medium | High | Named tunnel or cloud deploy |
| Feedback submitted, backend down | Medium | Medium | localStorage WAL in FeedbackWidget |
| CORS blocks all API calls | High | Critical | Use `allowedOriginPatterns` with wildcards |
| JWT expiry kicks testers out | Medium | Medium | Set 8h expiry for beta profile |
| Tester accidentally deletes data | Low | High | Separate beta DB schema |
| Race condition on shared data | Medium | Medium | Pre-assign tester data ranges |
| Laptop sleeps during session | High | Critical | `caffeinate` command + power plugged in |
| WebSocket disconnects | Medium | Medium | STOMP heartbeat + reconnect config |
| Tester gives vague feedback | High | Medium | Structured test flows + mandatory fields |
| Security: tunnel URL leaks | Low | High | Cloudflare Zero Trust email allowlist |
| MySQL query slowdown | Low | Medium | Index on feedback/notification tables |
| Feature toggle not propagating | Medium | Low | 5-min polling, document delay |
| Beta data contaminates production | Low | Critical | Separate schemas, strict env management |
| Performance degradation under load | Medium | Medium | Pre-baseline, caching, optimization |

---

## 18. Emergency Runbook

### "All testers can't reach the app"
```bash
# Check tunnel status
cloudflared tunnel list
# Restart frontend tunnel
cloudflared tunnel run gym-frontend
# Check backend is running
curl http://localhost:8080/api/health
# Check CORS isn't blocking
curl -H "Origin: https://your-tunnel.cf.com" http://localhost:8080/api/health
```

### "Backend is returning 500 errors"
```bash
# Check Spring Boot logs
tail -f backend/logs/application.log
# Check MySQL connection
mysql -u root -p gym_beta -e "SELECT 1"
# Restart backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=beta
```

### "Tester can't log in"
```bash
# Check user exists in DB
SELECT username, status, is_deleted, account_non_locked FROM users WHERE username = 'tester@beta.test';
# Unlock if locked
UPDATE users SET account_non_locked = 1, is_deleted = 0 WHERE username = 'tester@beta.test';
# Reset password if needed
UPDATE users SET password = '[bcrypt hash]', is_first_login = 1 WHERE username = 'tester@beta.test';
```

### "WebSockets disconnected for everyone"
```bash
# This usually means the tunnel is down or overloaded
# Restart both tunnels
pkill cloudflared
cloudflared tunnel run gym-frontend &
cloudflared tunnel run gym-backend &
```

### "Feedback widget is not submitting"
1. Check browser console for CORS or 401 errors
2. If 401: tester's JWT expired — ask them to log out and log back in
3. If CORS: check backend allowed origins includes current frontend URL
4. Feedback is saved in localStorage — it will auto-retry next session

### "Performance has degraded significantly"
1. Check database query performance: `SHOW PROCESSLIST;`
2. Check application logs for slow queries
3. Verify no unusual traffic patterns (DDoS)
4. Scale up Railway instance if needed
5. Enable caching if not already

### "Security incident detected"
1. Immediately disable affected feature via `/superadmin/features`
2. Revoke all beta access temporarily
3. Assess scope of vulnerability
4. Do NOT notify testers until scope is understood
5. Fix and security-test before resuming beta

---

## Implementation Steps (In Order)

### Phase 1: Development (Week -2 to Week -1)

#### Day 1-2: Feature Toggle Implementation
- [ ] Create `feature_flags` table and entity
- [ ] Implement `FeatureFlagController` with role-based access
- [ ] Add `FeatureProvider` and `useFeature` hook to frontend
- [ ] Create `/superadmin/features` page
- [ ] Test toggle on/off without redeployment

#### Day 3-4: Feedback System Implementation
- [ ] Create `BetaFeedback` entity and repository
- [ ] Implement `BetaFeedbackController`
- [ ] Build `FeedbackWidget.tsx` with localStorage WAL
- [ ] Wire widget into App.tsx (respects feature toggle)
- [ ] Create `/superadmin/feedback` dashboard
- [ ] Test full flow: submit → dashboard appears

#### Day 5: Pre-Beta Fixes
- [ ] Fix CORS configuration (use `allowedOriginPatterns`)
- [ ] Set JWT expiration to 8h for beta
- [ ] Add WebSocket heartbeat configuration
- [ ] Add `OptimisticLockException` handler
- [ ] Create beta database schema
- [ ] Create seed script with test data

### Phase 2: Alpha Testing (Week -1, Days 1-2)

#### Day 1: Internal Testing
- [ ] Run `k6` load test against local environment
- [ ] Document performance baselines
- [ ] Test all authentication flows
- [ ] Verify feature toggle works correctly

#### Day 2: Bug Fixes
- [ ] Fix all P0 bugs found in alpha
- [ ] Fix P1 bugs if time permits
- [ ] Update CORS if needed for staging URLs
- [ ] Verify feedback widget auto-retries on failure

### Phase 3: Private Beta (Week -1, Days 3-5)

#### Day 3: Private Beta Launch
- [ ] Deploy to staging (Railway or tunnel)
- [ ] Invite 3-5 trusted testers
- [ ] Monitor feedback dashboard in real-time
- [ ] Run structured test flows

#### Day 4-5: Private Beta Monitoring
- [ ] Daily triage at 9am and 5pm
- [ ] Fix P0 bugs immediately
- [ ] Collect UX feedback from testers
- [ ] Document all issues found

### Phase 4: Public Beta (Week 0, Days 1-7)

#### Day 1: Public Beta Launch
- [ ] Deploy latest build to production URLs
- [ ] Enable all feature flags
- [ ] Invite all 10+ testers via Cloudflare
- [ ] Monitor error rates and performance

#### Days 2-7: Continuous Monitoring
- [ ] Daily triage process
- [ ] Fix bugs with <24h SLA for P7+
- [ ] Weekly performance baseline comparison
- [ ] Respond to tester questions within 2 hours

### Phase 5: Post-Beta (Week 1+)

#### Cleanup (Week 1, Days 1-2)
- [ ] Execute post-beta cleanup checklist (Section 14)
- [ ] Export and archive all feedback
- [ ] Conduct retrospective meeting

#### Next Iteration Planning (Week 1, Days 3-5)
- [ ] Prioritize bug backlog
- [ ] Review suggestions for next release
- [ ] Update beta testing plan with lessons learned
- [ ] Schedule Beta Round 2 if needed

---

*This plan is generated from the actual codebase. All file paths, entity names, and routes are accurate to the current project state. Version 2.0 adds Phase-based structure, global feature toggle, multi-stage beta testing, and comprehensive deployment strategy.*
