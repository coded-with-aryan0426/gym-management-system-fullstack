# Beta Testing Strategy — Gym Management Platform
> Version 1.0 | Date: 2026-03-03 | Stack: React 19 + Vite / Spring Boot / MySQL

---

## Table of Contents
1. [Context & Goals](#1-context--goals)
2. [Application Architecture Summary](#2-application-architecture-summary)
3. [Public Hosting Options — Detailed Comparison](#3-public-hosting-options--detailed-comparison)
4. [Recommended Hosting Setup (Step-by-Step)](#4-recommended-hosting-setup-step-by-step)
5. [Access Control Strategy](#5-access-control-strategy)
6. [Problems You WILL Face & Their Solutions](#6-problems-you-will-face--their-solutions)
7. [Integrated Feedback System Architecture](#7-integrated-feedback-system-architecture)
8. [Feedback System Implementation Plan](#8-feedback-system-implementation-plan)
9. [Beta Testing Session Protocol](#9-beta-testing-session-protocol)
10. [Tester Onboarding Checklist](#10-tester-onboarding-checklist)
11. [Feedback Workflow & Triage Process](#11-feedback-workflow--triage-process)
12. [Export & Reporting](#12-export--reporting)
13. [Risk Register](#13-risk-register)
14. [Emergency Runbook](#14-emergency-runbook)

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

## 3. Public Hosting Options — Detailed Comparison

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

## 4. Recommended Hosting Setup (Step-by-Step)

### Phase 1: Same-Day (Tunneling) Setup — Cloudflare Tunnel

**Prerequisites**: Node.js, Java 21, MySQL running locally

**Step 1 — Install cloudflared**
```bash
# macOS
brew install cloudflared

# Or direct download
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz | tar xz
```

**Step 2 — Authenticate**
```bash
cloudflared tunnel login
# Opens browser → log in with your Cloudflare account (free account works)
```

**Step 3 — Create named tunnels (persistent URLs)**
```bash
cloudflared tunnel create gym-frontend
cloudflared tunnel create gym-backend
```

**Step 4 — Create DNS routes** (if you have a domain) OR use trycloudflare for zero-config:
```bash
# Zero-config, no account needed (random URL, good for 1-day sessions)
cloudflared tunnel --url http://localhost:5173
cloudflared tunnel --url http://localhost:8080
```

**Step 5 — Update frontend API base URL**

In `/frontend/.env.beta` (create this file):
```env
VITE_API_BASE_URL=https://YOUR-BACKEND-TUNNEL-URL.trycloudflare.com
```

Then build/start frontend with:
```bash
VITE_API_BASE_URL=https://gym-backend.yourdomain.com npm run dev -- --host 0.0.0.0
```

**Step 6 — Configure CORS on backend**

In your Spring Boot CORS config, add the tunnel URLs to allowed origins:
```java
// In your CORS configuration bean / WebMvcConfigurer
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "https://YOUR-FRONTEND-TUNNEL.trycloudflare.com",
    "https://YOUR-FRONTEND.vercel.app"
));
```

**Step 7 — Zero Trust Access (invite-only)**
1. Go to Cloudflare Zero Trust dashboard (free)
2. Create an Access Application pointing to your frontend tunnel URL
3. Add policy: "Allow emails" → add all 10 testers' email addresses
4. Testers get a one-time code in their email to access the app

### Phase 2: Multi-Day (Cloud Deploy) Setup — Vercel + Railway

**Frontend → Vercel** (already in your repo)
```bash
cd frontend
npm run build
vercel --prod
# Set env var: VITE_API_BASE_URL = https://your-railway-backend.up.railway.app
```

**Backend → Railway**
```bash
# Create Dockerfile in /backend if not exists, then:
railway login
railway init
railway up
# Railway auto-provisions MySQL, sets DATABASE_URL env var
```

**Update application.properties for Railway**:
```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${MYSQLUSER}
spring.datasource.password=${MYSQLPASSWORD}
```

---

## 5. Access Control Strategy

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

## 6. Problems You WILL Face & Their Solutions

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
- Create a structured test script (included in Section 9)
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

## 7. Integrated Feedback System Architecture

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

## 8. Feedback System Implementation Plan

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

## 9. Beta Testing Session Protocol

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

## 10. Tester Onboarding Checklist

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
[Attach their specific test flow from Section 9]

FEEDBACK: Use the blue "Feedback" button on every page.
ISSUES DURING SESSION: Message me on WhatsApp: [your number]

Thank you!
```

### First-Login Flow
1. Tester hits URL → Cloudflare Zero Trust screen → enters email → gets OTP
2. Redirected to app → login page → enters credentials
3. Forced password change (your `isFirstLogin` flow)
4. Lands on their role dashboard
5. FeedbackWidget visible bottom-right

---

## 11. Feedback Workflow & Triage Process

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

## 12. Export & Reporting

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

## Next Steps
- [ ] Fix all P8+ bugs before next release
- [ ] Review top 5 suggestions with team
- [ ] Schedule Beta Round 2 after fixes
```

---

## 13. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Backend crashes mid-session | Medium | High | UptimeRobot alert, restart script ready |
| Tunnel URL changes | Medium | High | Named tunnel or cloud deploy |
| Tester submits feedback, backend down | Medium | Medium | localStorage WAL in FeedbackWidget |
| CORS blocks all API calls | High | Critical | Use `allowedOriginPatterns` with wildcards |
| JWT expiry kicks testers out | Medium | Medium | Set 8h expiry for beta profile |
| Tester accidentally deletes data | Low | High | Separate beta DB schema |
| Race condition on shared data | Medium | Medium | Pre-assign tester data ranges |
| Laptop sleeps during session | High | Critical | `caffeinate` command + power plugged in |
| WebSocket disconnects | Medium | Medium | STOMP heartbeat + reconnect config |
| Tester gives vague feedback | High | Medium | Structured test flows + mandatory fields |
| Security: tunnel URL leaks | Low | High | Cloudflare Zero Trust email allowlist |
| MySQL query slowdown | Low | Medium | Index on feedback/notification tables |

---

## 14. Emergency Runbook

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

---

## Implementation Steps (In Order)

### Day 0 — Setup (Before inviting testers)
- [ ] Create `application-beta.properties` with 8h JWT, beta DB URL
- [ ] Create `gym_beta` schema in MySQL, run all migrations
- [ ] Seed beta DB with `scripts/seed-beta.sql` (10 members, 5 trainers, dummy classes/memberships)
- [ ] Add `BetaFeedback.java` entity and controller to backend
- [ ] Add `FeedbackWidget.tsx` to frontend
- [ ] Wire FeedbackWidget into `App.tsx` (renders on all routes)
- [ ] Add `/superadmin/feedback` route and `SABetaFeedback.tsx`
- [ ] Set up Cloudflare Tunnel (or Railway+Vercel deploy)
- [ ] Configure CORS allowed origin patterns
- [ ] Test full flow: submit feedback → appears in superadmin dashboard

### Day 1 — Soft Launch (2-3 testers)
- [ ] Invite T01 (Owner), T03 (Trainer), T06 (Member)
- [ ] Run Flow 1 (Trainer Request) and Flow 2 (Member Registration)
- [ ] Monitor feedback dashboard in real-time
- [ ] Fix any P8+ bugs immediately

### Day 2-3 — Full Beta
- [ ] Invite all 10 testers
- [ ] Daily triage at 9am
- [ ] Fix and re-deploy critical bugs
- [ ] Keep `debug.log` and `application.log` open in another terminal

### Day 4-5 — Wrap Up
- [ ] Export final feedback CSV
- [ ] Generate end-of-beta report
- [ ] Prioritize backlog
- [ ] Revoke Cloudflare Zero Trust access
- [ ] Archive beta DB

---

*This plan is generated from the actual codebase. All file paths, entity names, and routes are accurate to the current project state.*
