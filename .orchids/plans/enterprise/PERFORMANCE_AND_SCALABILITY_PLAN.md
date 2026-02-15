# Performance & Scalability Plan
## Handling 500 Gyms, 100K Members, Millions of Rows

---

## Current Performance Profile

### Backend
- Spring Boot with HikariCP pool: 50 max, 10 idle
- Oracle DB on localhost — single instance
- No caching layer (no Redis)
- No connection pooling beyond HikariCP
- `spring.jpa.show-sql=true` — SQL logging in ALL environments (performance hit)
- `spring.jpa.hibernate.ddl-auto=update` — schema validation on every startup
- WebSocket for real-time (good foundation)
- Rate limiting exists (global, not per-tenant)

### Frontend
- Vite + React — fast dev, good production builds
- No code splitting beyond route-level
- Several monolithic components (2415 lines, 1121 lines, 911 lines)
- No service worker (no offline capability)
- No image optimization pipeline
- No CDN configuration
- Large CSS files (Settings.css = 121KB, OwnerNotifications.css = 36KB)

---

## Scaling Targets

| Metric | Current | Target (500 gyms) |
|--------|---------|-------------------|
| Concurrent users | ~10 | ~5,000 |
| API requests/second | ~5 | ~500 |
| Database rows | ~1,000 | ~90,000,000/year |
| WebSocket connections | ~5 | ~2,000 simultaneous |
| File storage | ~100MB | ~500GB |
| Response time (p95) | Unknown | <200ms |
| Uptime | Dev only | 99.9% |

---

## Backend Performance Improvements

### 1. Caching Strategy (Redis)

```java
// Cache frequently accessed data
@Cacheable(value = "gym-settings", key = "#gymId")
public GymSettings getGymSettings(Long gymId) { ... }

@Cacheable(value = "user-profile", key = "#userId")
public UserProfile getUserProfile(Long userId) { ... }

@Cacheable(value = "dashboard-stats", key = "#gymId", ttl = 60)
public DashboardStats getDashboardStats(Long gymId) { ... }
```

| Cache Key | TTL | Invalidation |
|-----------|-----|-------------|
| `gym-settings:{gymId}` | 5 min | On settings update |
| `user-profile:{userId}` | 10 min | On profile update |
| `dashboard-stats:{gymId}` | 60 sec | Auto-expire |
| `notification-count:{userId}` | 30 sec | On new notification |
| `class-schedule:{gymId}:{weekKey}` | 2 min | On schedule change |
| `member-list:{gymId}` | 3 min | On member join/leave |

### 2. Database Query Optimization

```sql
-- Problem: N+1 queries for member list with memberships
-- Current: SELECT * FROM users; then 200x SELECT * FROM memberships WHERE user_id=?

-- Solution: JOIN fetch with pagination
SELECT u.*, m.status, m.end_date 
FROM users u 
LEFT JOIN memberships m ON u.user_id = m.user_id AND m.gym_id = ?
WHERE u.gym_id = ? 
ORDER BY u.full_name 
LIMIT 20 OFFSET 0;
```

```java
// JPA: Use @EntityGraph to prevent N+1
@EntityGraph(attributePaths = {"membership", "roles"})
List<User> findByGymId(Long gymId, Pageable pageable);
```

### 3. Async Processing

```java
// Long-running tasks should be async
@Async
public CompletableFuture<ReportData> generateMonthlyReport(Long gymId) { ... }

@Async
public void sendBulkEmail(List<Long> memberIds, String template) { ... }

@Async
public void processFileUpload(MultipartFile file, Long gymId) { ... }
```

### 4. API Response Optimization

```java
// Pagination for ALL list endpoints
@GetMapping("/api/members")
public Page<MemberDTO> getMembers(
    @RequestParam Long gymId,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "fullName") String sortBy
) { ... }

// DTO projection (don't return full entities)
public interface MemberSummaryProjection {
    Long getUserId();
    String getFullName();
    String getMembershipStatus();
    LocalDate getExpiryDate();
    // Only fields needed for the list view
}
```

### 5. WebSocket Scaling

```
Current:  All WebSocket connections to single server
Scaled:   Redis Pub/Sub for cross-instance message routing

Server 1 ─┐
Server 2 ─┼── Redis Pub/Sub ── broadcast to all connected clients
Server 3 ─┘
```

---

## Frontend Performance Improvements

### 1. Code Splitting

```tsx
// Route-level lazy loading
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));
const MemberProgress = lazy(() => import('./pages/member/MyProgress'));
const TrainerSchedule = lazy(() => import('./pages/trainer/MySchedule'));

// Tab-level lazy loading (for MyProgress 2415-line monolith)
const MetricsTab = lazy(() => import('./pages/member/progress/MetricsTab'));
const WorkoutsTab = lazy(() => import('./pages/member/progress/WorkoutsTab'));
```

### 2. Bundle Size Reduction

| Current Issue | Solution | Estimated Savings |
|---------------|----------|-------------------|
| Full Recharts import | Tree-shake: import only used chart types | ~80KB |
| Full Lucide import | Import individual icons only | ~30KB |
| Full framer-motion | Import `motion` and `AnimatePresence` only | ~40KB |
| Monolithic CSS files | CSS modules or component-level CSS | ~50KB |
| **Total** | | **~200KB reduction** |

### 3. Image Optimization
- Lazy load all images below the fold
- Use WebP format with JPEG fallback
- Resize images client-side before upload (max 1200px width)
- Use Cloudinary auto-optimization (if using Cloudinary)

### 4. Service Worker & Offline
```javascript
// sw.js — Cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('gym-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/assets/main.js',
                '/assets/main.css',
            ]);
        })
    );
});
```

### 5. Virtual Scrolling for Large Lists
- Member lists (200+ members)
- Notification lists (500+ notifications)
- Message history (1000+ messages)
- Workout logs (100+ entries)
- Use `react-window` or `@tanstack/react-virtual`

---

## Infrastructure Scaling

### Horizontal Scaling Path
```
Phase 1: Single instance (0-50 gyms)
├── 1 backend instance
├── 1 PostgreSQL instance
└── No Redis

Phase 2: Basic scaling (50-200 gyms)
├── 2 backend instances behind load balancer
├── 1 PostgreSQL with read replica
└── 1 Redis instance (cache + sessions)

Phase 3: Full scale (200-500+ gyms)
├── 3-5 backend instances (auto-scaled)
├── PostgreSQL primary + 2 read replicas
├── Redis cluster (3 nodes)
├── CDN for static assets
└── Object storage (S3/Cloudinary) for files
```

### Monitoring Stack (Free)
```
├── Sentry      — Error tracking (5K events free)
├── UptimeRobot — Uptime monitoring (50 monitors free)
├── Grafana Cloud — Metrics dashboard (10K series free)
├── Spring Actuator — JVM metrics, health checks
└── PostgreSQL pg_stat_statements — Slow query detection
```

---

## Performance Testing Plan

```bash
# Load testing with k6 (free, open-source)
k6 run --vus 100 --duration 5m load-test.js

# Test scenarios:
# 1. 100 concurrent API calls to /api/dashboard
# 2. 50 concurrent WebSocket connections
# 3. 200 sequential database writes (booking creation)
# 4. Full page load time measurement
# 5. Database query time under load
```

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Disable show-sql, set ddl-auto=validate, add pagination to all endpoints |
| **Phase 2** | Add Redis caching, implement DTO projections |
| **Phase 3** | Frontend code splitting, bundle optimization, component decomposition |
| **Phase 4** | Load testing, query profiling, connection pool tuning |
| **Phase 5** | Service worker, virtual scrolling, image optimization |
| **Phase 6** | Horizontal scaling config, monitoring stack |
