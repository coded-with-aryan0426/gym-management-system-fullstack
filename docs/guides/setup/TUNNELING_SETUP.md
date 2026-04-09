# Cloudflare Tunnel Setup - Problems & Solutions

## Overview

This document records all the problems we faced and solutions we found while setting up Cloudflare Tunnel to make the Gym Management app publicly accessible for beta testing.

---

## Problems Encountered

### 1. CORS Policy Blocking Requests to localhost

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:8081/api/auth/login'
from origin 'https://xxx.trycloudflare.com' has been blocked by CORS policy:
Permission was denied for this request to access the loopback address space.
```

**Root Cause:**
- When users access the app via HTTPS Cloudflare Tunnel
- Browser security policy blocks HTTP requests to localhost from HTTPS pages
- This is NOT a normal CORS error - it's a browser security mechanism

**Failed Solutions Attempted:**

| Solution | Result |
|---------|--------|
| Modified SecurityConfig to add *.trycloudflare.com to allowedOrigins | Still failed |
| Used wildcard "*" to allow all origins | Still failed |
| Created separate backend tunnel | Complex and unstable |

---

### 2. Session Conflicts When Multiple Beta Testers Access Simultaneously

**Problem:**
- Multiple testers using the same URL to log in with different accounts
- Later logins overwrite earlier users' sessions
- Causes data interference during testing

**Requirement:**
- Each tester needs their own isolated portal
- Own unique URL
- Own session
- No conflicts

---

### 3. Vite Dev Server Environment Variable Passing Issues

**Problem:**
```bash
# Using backticks (WRONG)
VITE_API_URL=`https://abc.trycloudflare.com` npm run dev

# Backticks execute command substitution, not a string!
```

**Cause:**
- Shell backticks have special meaning (command substitution)
- The URL was executed as a command instead of being treated as a string

---

### 4. Lazy Loading Causing 500 Errors on Role Permissions

**Problem:**
- Login succeeds but protected API endpoints return 500 errors
- User entity's roles use FetchType.LAZY

**Cause:**
- Hibernate lazy loading can't access unloaded associations after session closes
- JWT authentication loads user info but roles weren't pre-loaded

**Solution:**
```java
// User.java
@ManyToMany(fetch = FetchType.EAGER)  // Changed from LAZY
private Set<Role> roles = new HashSet<>();
```

---

### 5. Slow Page Navigation (3 seconds)

**Problem:**
- 72 lazy-loaded page components
- Each new page visit requires downloading code
- Users see blank screens or loading spinners

**Impact:**
- Page navigation delayed up to 3 seconds
- Multiple clicks needed for navigation
- Poor user experience

---

### 6. Chat Feature Causing Performance Issues

**Error:**
```
Uncaught (in promise) Error: SecurityError:
An insecure SockJS connection may not be initiated from a page loaded over HTTPS
```

**Cause:**
- ChatContext loads on every page
- WebSocket connection attempts from HTTPS page to non-secure connection
- Even when chat feature isn't being used

---

### 7. .env File Being Tracked by Git

**Problem:**
- Locally created .env file contains sensitive URLs
- Could be accidentally committed to version control

---

## Final Solutions

### Solution 1: Simplified Architecture - Frontend Proxy (Recommended)

**Architecture:**
```
User → Frontend Tunnel (5173) → Frontend Dev Server (5173) → Vite Proxy → Backend (8081)
```

**Benefits:**
- Only one Frontend Tunnel needed
- Vite proxy automatically handles API request forwarding
- Simple and stable

**Configuration:**
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
    },
  },
}
```

---

### Solution 2: Multi-Portal Beta Testing (For 25 Concurrent Users)

**Architecture:**
```
User 1 → Owner Tunnel (5173) → Frontend (5173) → Backend
User 2 → TrainerA Tunnel (5174) → Frontend (5174) → Backend
User 3 → TrainerB Tunnel (5175) → Frontend (5175) → Backend
...
```

**Benefits:**
- Each tester has their own isolated URL and session
- Completely separate, no interference
- Can test different roles simultaneously

**Scripts:**
- `start-multi-portal.sh` - Automatically starts all portals and tunnels

---

## Startup Commands Summary

### Single Portal Mode (Simple)

```bash
# Terminal 1: Backend
cd backend && mvn spring-boot:run

# Terminal 2: Frontend (automatically proxies /api requests)
cd frontend && npm run dev

# Terminal 3: Frontend Tunnel
cloudflared tunnel --url http://localhost:5173
```

### Multi-Portal Mode (25 Beta Testers)

```bash
./start-multi-portal.sh
```

Script automatically starts:
- Backend (port 8081)
- 5 Frontend instances (ports 5173-5177)
- 5 Tunnel URLs

---

## Performance Optimizations (Implemented)

### 1. Skeleton Loading
- Created complete skeleton component library
- Dashboard, MemberList, TrainerList pages use skeletons
- Users see loading animation instead of blank screens

### 2. Chat Feature Toggle
- Can be disabled via Settings → Appearance → Chat Feature
- When disabled, ChatProvider doesn't load at all
- Saves WebSocket connection overhead

### 3. Code Splitting
```typescript
// vite.config.ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router'],
  'vendor-ui': ['framer-motion', 'react-hot-toast', 'lucide-react'],
  'vendor-query': ['@tanstack/react-query'],
  'vendor-websocket': ['stompjs', 'sockjs-client'],
}
```

### 4. React Query Optimization
- staleTime: 3 minutes
- gcTime: 15 minutes
- Reduces unnecessary API requests

---

## Troubleshooting Common Errors

### Error 1: Login Failed - CORS Error

**Cause:** Frontend not properly proxying to Backend

**Fix:**
1. Make sure Frontend is started with `npm run dev` (not build)
2. Check vite.config.ts proxy configuration
3. Don't set VITE_API_URL environment variable

### Error 2: Backend Returns 403

**Cause:** SecurityConfig or Lazy Loading issue

**Fix:**
1. Restart Backend
2. Check User.java roles are EAGER fetch
3. Check JWT token is being passed correctly

### Error 3: Tunnel URL Not Accessible

**Cause:** Cloudflare quick tunnel temporary URLs are unstable

**Fix:**
1. Restart tunnel
2. Wait a few seconds for DNS propagation
3. Use `start-tunnels.sh` for automatic management

---

## File Changes Record

### Modified Files

| File | Change |
|------|--------|
| `vite.config.ts` | Added proxy config, allowedHosts: true |
| `SecurityConfig.java` | CORS allowedOriginPatterns set to "*" |
| `User.java` | roles changed to EAGER fetch |
| `CustomUserDetailsService.java` | Uses findByIdWithRoles query |
| `UserRepository.java` | Added findByIdWithRoles method |
| `FeatureContext.tsx` | Added local chat toggle |
| `AppProvider.tsx` | Conditional ChatProvider rendering |
| `CommandRail.tsx` | Hides messages icon based on chat toggle |

### Created Files

| File | Purpose |
|------|---------|
| `start-tunnels.sh` | Single portal auto-startup script |
| `start-multi-portal.sh` | Multi-portal beta testing script |
| `TUNNELING_SETUP.md` | This documentation |

---

## Credentials

| Role | Username | Password |
|------|----------|----------|
| Owner | owner | pass2233 |
| Trainer | john.smith | password12 |
| Trainer | sarah.jones | Sarah@fit123 |
| Member | member1 | password123 |
| Member | jane.doe | password123 |
| Admin | admin | Aryan@194 |

---

## Important Notes

1. **Cloudflare Quick Tunnel is a Temporary Solution**
   - URL changes every restart
   - No 99.9% uptime guarantee
   - Only for development and testing

2. **Production Recommendations**
   - Use Cloudflare Named Tunnel (requires domain)
   - Or deploy to Vercel/Railway/Render

3. **Security**
   - Don't expose sensitive data on public URLs
   - Production must use HTTPS
   - Consider adding rate limiting

---

## Quick Reference

```bash
# Start single portal
./start-tunnels.sh

# Start multi-portal (beta testing)
./start-multi-portal.sh

# Stop all processes
pkill -f "cloudflared tunnel"
pkill -f "vite"
pkill -f "spring-boot"
```

---

*Last updated: 2026-03-27*
