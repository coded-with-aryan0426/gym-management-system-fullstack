# 00: Super Admin Architecture & Implementation Protocol

## 1. Ultimate Goal

Transform the standalone, hardcoded React Super Admin interface (e.g., `SuperAdminPortal.tsx`, `SADashboard.tsx`) into a fully integrated, high-performance, and hyper-secure command center. Every visual element must map to a robust backend API and structurally sound database schema, leaving zero gaps in performance, state management, or security.

---

## 2. Frontend Architectural Gaps & Solutions

### 2.1 State Management
**Current Issue:** The current fake UI relies on local component state with no centralized cache.

**Solution:** Implement `@tanstack/react-query` with the following staleTime configurations:
- Dashboard metrics: `staleTime: 60000` (1 minute) to prevent API spam
- Direct mutation lists (Gym/User tables): `staleTime: 0` for real-time accuracy
- Feature flags: `staleTime: 300000` (5 minutes) with background refetch

```typescript
// Implementation Pattern
const { data, isLoading, refetch } = useQuery({
  queryKey: ['superadmin', 'dashboard'],
  queryFn: () => superAdminApi.getDashboard(),
  staleTime: 60000,
  refetchInterval: 60000,
});
```

### 2.2 Error Boundaries
**Current Issue:** If a specific Super Admin section crashes due to malformed data, it white-screens the entire app.

**Solution:** Wrap `SuperAdminLayout.tsx` in a strict React ErrorBoundary:
```typescript
// Implementation
class SuperAdminErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Fire telemetry to backend
    apiClient.post('/api/superadmin/telemetry/client-error', {
      error: error.message,
      componentStack: info.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 2.3 Real-time Synchronization
**Current Issue:** Super Admin needs live updates for critical errors and new gym registrations but currently relies on manual refresh.

**Solution:** Integrate Server-Sent Events (SSE) using `EventSource`:
- Frontend connects to `/api/superadmin/stream`
- Backend uses Spring's `SseEmitter` for push notifications
- Topbar badge pulses red when critical events arrive
- Automatic reconnection with exponential backoff

### 2.4 Component Architecture
**Required Shared Components:**
| Component | Purpose | File Location |
|-----------|---------|---------------|
| `MetricCard` | Reusable KPI display with trend | `shared/MetricCard.tsx` |
| `StatusIndicator` | Live status dot (operational/degraded/down) | `shared/StatusIndicator.tsx` |
| `DataTable` | Virtualized table for large datasets | `shared/DataTable.tsx` |
| `DetailDrawer` | Slide-over panel for deep dives | `shared/DetailDrawer.tsx` |
| `ToastProvider` | Global notification system | `shared/ToastProvider.tsx` |
| `ConfirmModal` | Destructive action confirmation | `shared/ConfirmModal.tsx` |

---

## 3. Backend Architectural Gaps & Solutions

### 3.1 Strict Segregation & Authorization
**Current Issue:** Normal users must never infer or access Super Admin routes.

**Solution:** Introduce `SuperAdminSecurityFilter` in Spring Boot:
```java
// Security Filter Pattern
@Component
public class SuperAdminSecurityFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                      HttpServletResponse response,
                                      FilterChain chain) {
        if (!requiresSuperAdminAuth(request.getRequestURI())) {
            chain.doFilter(request, response);
            return;
        }
        // Validate JWT contains ROLE_SUPER_ADMIN claim
        // or validate short-lived session token tied to MASTER_PASSPHRASE
    }
}
```

### 3.2 Audit Logging (Critical Gap)
**Current Issue:** The Super Admin has infinite power; every state-mutating action must be tracked.

**Solution:** Implement Spring AOP with custom annotation:
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SuperAdminAudit {
    String type(); // e.g., "REVENUE_ADJUSTMENT", "GYM_SUSPENSION"
}
```

### 3.3 Rate Limiting & DDoS Protection
**Solution:** Implement Bucket4j with Redis:
- Super Admin login endpoint: 5 attempts per 15 minutes per IP
- Data fetching API routes: 100 req/min
- Write operations: 20 req/min with burst capacity

---

## 4. Database Architectural Gaps & Solutions

### 4.1 Analytic Query Overload
**Current Issue:** Running `COUNT(*)` on multimillion-row tables synchronously degrades performance.

**Solution:** Use PostgreSQL Materialized Views:
```sql
CREATE MATERIALIZED VIEW mv_platform_metrics AS
SELECT
    date_trunc('day', created_at) as metric_date,
    COUNT(DISTINCT user_id) as dau,
    COUNT(*) as total_checkins,
    SUM(amount) as daily_revenue
FROM member_checkins
GROUP BY date_trunc('day', created_at);

-- Refresh asynchronously via pg_cron
SELECT cron.schedule('*/10 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_platform_metrics');
```

### 4.2 Audit Schema Creation
```sql
CREATE TABLE super_admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id VARCHAR(255),
    action_enum VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100),
    target_entity_id VARCHAR(255),
    payload_snapshot JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- BRIN index for lightning-fast chronological searching
CREATE INDEX idx_audit_created_at_brin ON super_admin_audit_logs
USING BRIN (created_at);

-- Partial index for old resolved records
CREATE INDEX idx_errors_resolved_old ON system_error_logs (created_at)
WHERE status = 'RESOLVED';
```

---

## 5. Global UI/UX Interactive Standards

### 5.1 Button Feedback Standards
| State | Visual Behavior |
|-------|----------------|
| **Rest** | Opacity 1, Base distinct color |
| **Hover** | Brightness 1.1x, transition 200ms ease-in-out, cursor pointer |
| **Active** | Scale 0.97, simulate physical depth |
| **Loading** | Disabled (cursor: not-allowed, opacity 0.6), icon swaps to rotating Loader2 |
| **Disabled** | Reduced opacity 0.5, no pointer events |

### 5.2 Toast Notifications
**Implementation:** Global Toast Provider in SuperAdminLayout:
```typescript
// Toast Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

// Success: Green border, auto-dismiss 3s
// Error: Red border, requires manual dismiss, shows backend message
// Warning: Amber border, auto-dismiss 5s
// Info: Blue border, auto-dismiss 3s
```

### 5.3 Animation Standards
| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Micro-interactions (button press) | 150ms | ease-out |
| Drawer slide | 300ms | spring(0.6, 0.8, 0) |
| Page transitions | 250ms | ease-in-out |
| Skeleton shimmer | 1500ms | linear (loop) |

---

## 6. Testing Procedures

### 6.1 Frontend Testing
| Test | Tool | Coverage Target |
|------|------|----------------|
| Unit Tests | Vitest + React Testing Library | 80% components |
| Integration Tests | MSW (Mock Service Worker) | All API endpoints |
| E2E Tests | Playwright | Critical user flows |
| Visual Regression | Chromatic | All pages |

### 6.2 Backend Testing
| Test | Tool | Coverage Target |
|------|------|----------------|
| Unit Tests | JUnit 5 + Mockito | 80% services |
| Integration Tests | Spring Boot Test | All controllers |
| Security Tests | OWASP ZAP | Auth, RBAC |
| Load Tests | k6 | 100 concurrent users |

---

## 7. Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load Time | < 1s | Lighthouse Performance Score > 90 |
| API Response Time (P95) | < 500ms | APM monitoring |
| Error Rate | < 0.1% | Production monitoring |
| Accessibility | WCAG 2.1 AA | axe-core audit |
| Mobile Usability | Pass | Google Mobile-Friendly Test |
| Bundle Size | < 500KB (initial) | Webpack bundle analyzer |
| Time to Interactive | < 2s | Lighthouse TTI |

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up React Query with proper configuration
- [ ] Implement Error Boundary system
- [ ] Create shared component library
- [ ] Set up Toast notification system
- [ ] Configure backend security filter

### Phase 2: Core Pages (Week 3-4)
- [ ] Dashboard with live telemetry
- [ ] Users management with infinite scroll
- [ ] Gyms management with deep-dive drawer

### Phase 3: Advanced Features (Week 5-6)
- [ ] Revenue reconciliation engine
- [ ] Real-time error feed with SSE
- [ ] Feature flags with canary releases

### Phase 4: Polish (Week 7-8)
- [ ] Performance optimization
- [ ] Accessibility audit fixes
- [ ] E2E test coverage
- [ ] Documentation
