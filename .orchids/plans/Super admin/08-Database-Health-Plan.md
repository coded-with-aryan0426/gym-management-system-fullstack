# 08: Super Admin Database Health Plan

## 1. Ultimate Goal

Transform database health monitoring from cryptic SQL queries into a visual **Database Telescope** that makes you feel like you have x-ray vision into PostgreSQL. Every slow query, every locked table, and every storage anomaly should scream for attention before it becomes a production outage.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SADatabase.tsx`

### 2.2 Current Implementation
- Basic database connection status
- Simple table count displays
- No real-time monitoring
- No query performance tracking

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| No slow query visualization | High | Can't find bottlenecks |
| No table size monitoring | Medium | Storage surprises |
| No connection pool tracking | Critical | Connection exhaustion |
| No index hit ratio | High | Performance degradation |
| No dead tuple monitoring | Medium | Bloat accumulation |

---

## 3. Enhanced Features Specification

### 3.1 Real-Time Query Performance Monitor

#### Live Query Stream
- **Display:** Terminal-style scrolling feed
- **Color Coding:**
  - Green (`< 100ms`): Healthy
  - Amber (`100-500ms`): Slow
  - Red (`> 500ms`): Critical
- **Columns:** Duration | Query | Tables | User | Timestamp

#### Slow Query Panel
- Top 10 slowest queries (last 24 hours)
- Execution plan preview (simplified)
- "Explain Analyze" button for full plan

### 3.2 Connection Pool Health (HikariCP)

#### Live Metrics Dashboard
| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Active Connections | < 80% | 80-95% | > 95% |
| Idle Connections | > 5 | 1-5 | 0 |
| Connection Wait Time | < 1s | 1-5s | > 5s |
| Connection Timeout | 0 | 1-2 | > 2 |

#### Visual Gauge
```
┌──────────────────────────────────────┐
│  Connection Pool          [●●○○]   │
│  ████████████░░░░░░░  67/100      │
│  Active: 67  Idle: 28  Waiting: 0  │
└──────────────────────────────────────┘
```

### 3.3 Table Size & Growth Tracker

#### Storage Heatmap
- Grid view of all tables
- Color by size (green → yellow → red)
- Click to see table details

#### Growth Rate Indicators
```
┌────────────────────────────────────────────────────────────┐
│ users               │ 2.4 GB  │ [+12MB/day]  ▲ Healthy    │
│ member_checkins     │ 8.7 GB  │ [+145MB/day] ▲ WARNING    │
│ audit_logs          │ 4.1 GB  │ [+89MB/day]  ▲ CRITICAL!  │
└────────────────────────────────────────────────────────────┘
```

### 3.4 Index Health Monitor

#### Missing Index Alerts
- Auto-detected missing foreign key indexes
- Recommendation with `CREATE INDEX` SQL

#### Index Usage Stats
```
┌────────────────────────────────────────────────────────────┐
│ idx_users_gym_id   │ 98.5%   │ ✓ Healthy                   │
│ idx_checkins_date  │ 0.2%    │ ⚠ Rarely used (consider drop)│
│ idx_sessions_token │ 99.1%   │ ✓ Healthy                   │
└────────────────────────────────────────────────────────────┘
```

---

## 4. UI/UX Layout Specification

### 4.1 Database Health Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🗄️ Database Health                     [Run Diagnostics] [Export] [Settings ⚙️] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ SLOW QUERY SPIKE: 23 queries > 1s in last 5 minutes         [Investigate] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────┬─────────────────┬─────────────────────┐ │
│ │ DB Status       │ Connection Pool │ Storage Used    │ Slow Queries        │ │
│ │ ● Healthy       │ [●●●○] 89%      │ 67/100 GB      │ 12 (24h)           │ │
│ └─────────────────┴─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ LIVE QUERIES                                    │ TABLE GROWTH                      │
│ [Scrolling terminal with live queries]           │ [Storage heatmap grid]          │
├─────────────────────────────────────────────────┴────────────────────────────────┤
│ INDEX HEALTH                                    │ VACUUM STATUS                     │
│ [Index hit ratio table]                          │ [Last vacuum, dead tuples]        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### 5.1 Polling Hook for DB Metrics

```typescript
// hooks/useDatabaseHealth.ts
export const useDatabaseHealth = () => {
  return useQuery({
    queryKey: ['superadmin', 'database', 'health'],
    queryFn: () => superAdminApi.getDatabaseHealth(),
    refetchInterval: 10000, // 10 second refresh
    staleTime: 5000,
  });
};
```

### 5.2 Slow Query Terminal

```typescript
// Infinite scroll for query history
const {
  data: queries,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ['superadmin', 'database', 'slow-queries'],
  queryFn: ({ pageParam }) => superAdminApi.getSlowQueries({ cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/database/health` | Overall health status |
| GET | `/api/superadmin/database/pool` | HikariCP metrics |
| GET | `/api/superadmin/database/queries/live` | Live query stream |
| GET | `/api/superadmin/database/queries/slow` | Slow query history |
| GET | `/api/superadmin/database/tables` | Table sizes |
| GET | `/api/superadmin/database/indexes` | Index health |
| GET | `/api/superadmin/database/vacuum` | Vacuum status |
| POST | `/api/superadmin/database/vacuum/run` | Trigger vacuum |

### 6.2 Actuator Metrics Integration

```java
@Configuration
public class DatabaseMetricsConfig {
    @Bean
    public MeterRegistry meterRegistry(ComboPooledDataSource dataSource) {
        MeterRegistry registry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);

        // HikariCP metrics
        HikariPool hikariPool = dataSource.getHikariPoolMXBean();
        registry.gauge("hikaricp.connections.active",
            Tags.of("pool", "primary"), hikariPool, HikariPoolMXBean::getActiveConnections);
        registry.gauge("hikaricp.connections.idle",
            Tags.of("pool", "primary"), hikariPool, HikariPoolMXBean::getIdleConnections);
        registry.gauge("hikaricp.connections.pending",
            Tags.of("pool", "primary"), hikariPool, HikariPoolMXBean::getThreadsAwaitingConnection);

        return registry;
    }
}
```

### 6.3 Slow Query Detection

```java
@Service
public class QueryMonitorService {

    @Async
    public void recordQueryExecution(QueryExecution execution) {
        // Save to ring buffer (last 1000 queries)
        queryRingBuffer.put(execution);

        // Alert if slow
        if (execution.getDurationMs() > 500) {
            alertService.sendSlowQueryAlert(execution);
        }
    }
}
```

---

## 7. Database Strategy

### 7.1 Monitoring Views

```sql
-- Table size monitoring view
CREATE VIEW v_table_sizes AS
SELECT
    schemaname,
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||relname)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - pg_relation_size(schemaname||'.'||relname)) AS indexes_size,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;
```

### 7.2 Vacuum Job

```sql
-- pg_cron job for nightly vacuum
SELECT cron.schedule('0 3 * * *', $$
    VACUUM (ANALYZE, VERBOSE) pg_catalog.pg_class
$$);
```

---

## 8. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Health refresh | < 2s | Performance test |
| Query monitoring overhead | < 1% | DB load test |
| Alert latency | < 5s | Automated test |
| Storage forecast | ±5% accuracy | Historical comparison |

---

## 9. Deliverables Checklist

- [ ] `SADatabase.tsx` with live monitoring
- [ ] Connection pool gauge
- [ ] Slow query terminal
- [ ] Table growth heatmap
- [ ] Index health table
- [ ] Vacuum status panel
- [ ] Actuator metrics integration
- [ ] Slow query alerting
- [ ] pg_cron vacuum jobs
- [ ] Unit tests
