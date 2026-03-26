# 01: Super Admin Dashboard Enhancement Plan

## 1. Ultimate Goal

The Super Admin Dashboard must transcend basic metrics to become a **God-Mode Command Center** for the platform operator. It should instantaneously reveal the pulse of the business (revenue/users) AND the live health of the infrastructure (DB, API latency, critical exceptions), enabling rapid triage and intervention without leaving the React app.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SADashboard.tsx`

### 2.2 Current Implementation
- Uses local component state with mock data
- No real-time updates
- Basic KPI cards without drill-down
- No infrastructure telemetry
- Single API call for dashboard data

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| No live telemetry | High | Can't see real-time API/DB health |
| No command palette | Medium | Slow navigation for power users |
| No activity stream | Medium | Missing real-time event feed |
| No churn risk detection | Low | Business blind spot |
| Hardcoded fallback data | Medium | No error handling for API failures |

---

## 3. Enhanced Features Specification

### 3.1 Live Infrastructure Telemetry (APM Lite)

#### P95 API Latency Widget
- **Metric:** Real-time sparkline showing API response times
- **Threshold Alert:** If average latency breaches 800ms, card glows red with `box-shadow: 0 0 20px rgba(239,68,68,0.5)`
- **Chart Type:** Recharts `LineChart` with `isAnimationActive={false}` for high-frequency updates
- **Data Source:** Spring Boot Actuator metrics endpoint

```typescript
// Frontend Implementation
interface TelemetryWidgetProps {
  metricName: string;
  threshold: number;
  unit: 'ms' | 'count' | 'percent';
}
```

#### Active DB Connections Gauge
- **Metric:** Watch HikariCP pool live connection count
- **Visual:** Semi-circle radial chart (0-100%)
- **Threshold:** >80% turns red with pulsing animation
- **Data Source:** `hikaricp.connections.active` from Actuator

#### Redis Hit/Miss Ratio
- **Metric:** Cache efficiency percentage
- **Visual:** Progress bar with percentage label
- **Threshold:** <80% shows amber warning

### 3.2 Global Activity Stream (Terminal View)

#### Terminal Console Component
- **Container:** Dark themed window (`bg: #0a0a0f`, `border: 1px solid #333`)
- **Cursor:** Blinking typing cursor animation
- **Event Types:**
  - `[PAYMENT_SUCCESS]` - Green text
  - `[ERROR_500]` - Red text with pulsing badge
  - `[USER_REGISTERED]` - Blue text
  - `[SYSTEM_ALERT]` - Amber text

```typescript
// Event Format
interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'payment' | 'error' | 'registration' | 'system';
  message: string;
  metadata?: Record<string, unknown>;
  gymId?: number;
  userId?: string;
}
```

#### Interaction Behavior
- Scrollable but pauseable feed
- Clickable entity hashes jump to relevant DB record
- Max 100 events in memory, older events paginated
- Click "Export" to download full log as JSON

### 3.3 Churn Risk Detection

#### Flight Risk Gyms Widget
- **Criteria:** Gyms whose DAU dropped >30% this week
- **Visual:** Table with gym name, DAU change %, last owner login
- **Action:** "Contact Owner" button triggers email compose

```typescript
interface ChurnRiskGym {
  gymId: number;
  gymName: string;
  previousWeekDau: number;
  currentWeekDau: number;
  dropPercent: number;
  lastOwnerLogin: string;
  ownerEmail: string;
}
```

### 3.4 Global Feature Flags Overview

#### Compact Pill List
- **Display:** Horizontal scrollable list of flag pills
- **Flag States:**
  - `ENABLED` - Green pill with checkmark
  - `DISABLED` - Gray pill with X
  - `CANARY` - Amber pill with percentage
- **Interaction:** Click pill to navigate to Features page with that flag selected

### 3.5 Super Admin Command Palette (Cmd+K)

#### Trigger & Appearance
- **Trigger:** `Cmd+K` (Mac) / `Ctrl+K` (Windows)
- **Modal:** Centered overlay with dark backdrop (opacity 0.8)
- **Input:** Large search input with icon

#### Command Types
| Command | Action | Icon |
|---------|--------|------|
| `> clear-cache` | Flush Redis cache | `Zap` |
| `@username` | Jump to user profile | `User` |
| `#gymname` | Jump to gym controls | `Building2` |
| `> sync-stripe` | Trigger Stripe reconciliation | `RefreshCw` |
| `> show-errors` | Navigate to errors page | `AlertTriangle` |

#### Implementation
```typescript
interface Command {
  id: string;
  type: 'action' | 'navigation' | 'search';
  label: string;
  icon: LucideIcon;
  action: () => void | string;
  keywords: string[];
}
```

---

## 4. UI/UX Layout Specification

### 4.1 Grid Layout Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Title + Action Buttons (Refresh, Settings, Command)     │
├───────────────┬───────────────┬───────────────┬─────────────────┤
│ Active Gyms   │ MRR (Live)    │ Platform DAU  │ System Health   │
│ KPI Card      │ KPI Card      │ KPI Card      │ Score KPI Card  │
├───────────────┴───────────────┴───────────────┴─────────────────┤
│ SYSTEM TELEMETRY          │ LIVE EVENT CONSOLE                 │
│ - API Latency Sparkline   │ - Scrolling activity feed          │
│ - DB Connections Gauge    │ - Color-coded by type              │
│ - Redis Hit Ratio         │ - Clickable entity links           │
├───────────────────────────┴────────────────────────────────────┤
│ CRITICAL EXCEPTIONS (3 max)    │ CHURN RISK GYMS (3 max)       │
│ - Stack trace preview          │ - DAU drop %                   │
│ - "Mark Resolved" action       │ - Contact Owner action          │
└────────────────────────────────┴────────────────────────────────┘
```

### 4.2 Widget Refresh Behavior

#### "Refresh Dashboard" Button
- **Icon:** `RefreshCw` from lucide-react
- **Hover:** Rotate 180deg over 0.5s
- **Click:** Lock for 3 seconds, disable multiple clicks
- **Animation:** Icon spins 360deg while locked
- **Behavior:** Triggers parallel React Query refetches across all widgets

#### Auto-Refresh Strategy
| Widget | Interval | Reason |
|--------|----------|--------|
| Activity Stream | SSE (real-time) | Critical events must be instant |
| KPI Cards | 60s | Prevent API spam |
| Telemetry | 10s | Real-time infrastructure view |
| Top Gyms | 5min | Changes infrequently |

---

## 5. Frontend Implementation

### 5.1 Widget-Based React Query Architecture

**Anti-Pattern:** Fetching entire dashboard in one massive API call.

**Solution:** Micro-component architecture:
```typescript
// Each widget fetches independently
const RevenueWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['superadmin', 'revenue', 'mrr'],
    queryFn: () => superAdminApi.getMRR(),
    staleTime: 60000,
  });
  return <KpiCard value={data?.value} change={data?.change} />;
};
```

### 5.2 SSE Integration for Live Console

```typescript
// hooks/useSuperAdminStream.ts
export const useSuperAdminStream = (onEvent: (event: ActivityEvent) => void) => {
  useEffect(() => {
    const eventSource = new EventSource('/api/superadmin/stream');
    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data);
      onEvent(event);
    };
    eventSource.onerror = () => {
      // Exponential backoff reconnection
      eventSource.close();
    };
    return () => eventSource.close();
  }, [onEvent]);
};
```

### 5.3 Error Handling

| Scenario | UI Response |
|----------|-------------|
| API timeout | Show cached data with "Stale data" badge |
| Auth error | Redirect to login with toast |
| Partial failure | Show available widgets, gray out failed ones |
| Network offline | Full-page overlay with retry button |

---

## 6. Backend Implementation

### 6.1 Spring Boot Actuator Integration

**Required Dependencies:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**Exposed Endpoints:**
- `/actuator/metrics/http.server.requests` - API latency
- `/actuator/metrics/hikaricp.connections.active` - DB connections
- `/actuator/metrics/cache.hit.ratio` - Redis efficiency

### 6.2 Dashboard Metrics Service

```java
@Service
public class DashboardMetricsService {
    public DashboardMetrics getMetrics() {
        return DashboardMetrics.builder()
            .apiLatencyP95(getP95Latency())
            .activeDbConnections(getActiveConnections())
            .redisHitRatio(getCacheEfficiency())
            .systemHealthScore(calculateHealthScore())
            .build();
    }
}
```

### 6.3 SSE Event Broadcaster

```java
@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminStreamController {
    @GetMapping("/stream")
    public SseEmitter stream() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        applicationEventPublisher.subscribe(event -> {
            emitter.send(SseEmitter.event()
                .name("activity")
                .data(event.toJson()));
        });
        return emitter;
    }
}
```

---

## 7. Database Strategy

### 7.1 Redis Caching

```java
@Cacheable(value = "dashboard:mrr", key = "'current'", cacheManager = "redisCacheManager")
public BigDecimal getCurrentMRR() {
    return paymentRepository.sumSuccessfulPaymentsLast30Days();
}
```

**TTL Configuration:**
| Cache Key | TTL | Reason |
|----------|-----|--------|
| `dashboard:mrr` | 5min | MRR changes slowly |
| `dashboard:user-count` | 5min | User growth is gradual |
| `dashboard:gym-count` | 5min | Gym count changes infrequently |
| `telemetry:*` | 10s | Real-time but not critical |

### 7.2 Pre-aggregation Strategy

**Nightly Job (2:00 AM UTC):**
- Calculate churn risks
- Compute DAU trends
- Update `dashboard_insights` table

```sql
CREATE TABLE dashboard_insights (
    insight_date DATE PRIMARY KEY,
    churn_risk_gyms JSONB,
    dau_trends JSONB,
    computed_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Testing Procedures

### 8.1 Unit Tests
```typescript
// SADashboard.test.tsx
describe('RevenueWidget', () => {
  it('displays formatted currency', () => {
    render(<RevenueWidget />);
    expect(screen.getByText('₹1,00,000')).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    render(<RevenueWidget />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### 8.2 Integration Tests
- Mock API responses with MSW
- Test SSE connection establishment
- Verify widget parallel loading

### 8.3 E2E Tests (Playwright)
1. Navigate to dashboard
2. Verify all 4 KPI cards render
3. Click refresh button
4. Verify loading state
5. Wait for data reload
6. Verify no console errors

---

## 9. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Initial load | < 1.5s | Lighthouse Performance |
| KPI refresh | < 500ms | Network tab |
| SSE latency | < 100ms | Event timestamp delta |
| Activity stream | Real-time | Visual verification |
| Telemetry accuracy | Matches Actuator | Manual comparison |
| Accessibility | WCAG 2.1 AA | axe-core scan |
| Bundle size | < 100KB additional | Bundle analyzer |

---

## 10. Deliverables Checklist

- [ ] `SADashboard.tsx` refactored with micro-widgets
- [ ] `DashboardMetricsService` in backend
- [ ] SSE endpoint `/api/superadmin/stream`
- [ ] Telemetry widgets (API latency, DB connections, Redis)
- [ ] Activity stream terminal component
- [ ] Command palette (Cmd+K)
- [ ] Churn risk detection integration
- [ ] Feature flags overview pills
- [ ] Unit tests with >80% coverage
- [ ] E2E tests for critical paths
