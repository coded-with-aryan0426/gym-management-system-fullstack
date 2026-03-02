# 01: Super Admin Dashboard Enhancement Plan (Developer Edition)

## 1. Ultimate Goal
The Super Admin Dashboard must transcend basic metrics to become a **God-Mode Command Center** for the developer/founder. It should instantaneously reveal the pulse of the business (revenue/users) AND the live health of the infrastructure (DB, API latency, critical exceptions), enabling rapid triage and intervention without leaving the React app.

## 2. Advanced Developer & Business Insights (What's Missing & Must Be Added)
*   **Live Infrastructure Telemetry (APM Lite):**
    *   **P95 API Latency:** A real-time sparkline showing API response times. If average latency breaches 800ms, the card glows red.
    *   **Active DB Connections:** Watch the HikariCP pool live. Know instantly if a bad query is leaking connections before the app crashes.
    *   **Redis Hit/Miss Ratio:** A gauge showing if caching is actually working to protect the database.
*   **The Global Activity Stream (Terminal View):**
    *   A constantly scrolling (but pauseable) feed of critical system events:
        *   `[10:42:01] $ PAYMENT_SUCCESS: Gym "Iron Forge" - $99.00`
        *   `[10:41:15] ! ERROR_500: NullPointerException in WorkoutGenerator`
        *   `[10:40:02] * USER_REGISTERED: new.user@email.com (Gym #44)`
*   **Churn Risk & AI Anomaly Detection:**
    *   Highlight gyms whose daily active members (DAU) dropped by >30% this week. These are "Flight Risks" that support should contact immediately.
*   **Globally Active Feature Flags Overview:**
    *   A compact pill-list of what major features are currently forced ON or OFF globally to provide instant context if bugs are reported.
*   **Super Admin Command Palette (Cmd + K):**
    *   A globally accessible spotlight search triggered by `Cmd+K`.
    *   Type `> clear-cache` to instantly flush Redis.
    *   Type `@username` to instantly jump to a user's admin profile.
    *   Type `#gymname` to jump to a gym's controls.

## 3. UI/UX Interactive Micro-Details & Layout
*   **Grid Layout Strategy:**
    *   **Top Row (The 4 Pillars):** Active Gyms, MRR (Live Stripe Sync), Platform DAU/MAU, System Health Score (0-100 based on error rates).
    *   **Middle Left (System Health):** Real-time line charts for API Latency and DB CPU/Load. (Using Recharts `LineChart` with `isAnimationActive={false}` for high-frequency updates to prevent React jank).
    *   **Middle Right (Live Event Console):** A dark, terminal-styled `window` with a typing cursor. Items fade in from the bottom. Clickable hashes jump straight to the relevant DB record.
    *   **Bottom Row:** Top 3 Unresolved Critical Backend Exceptions (Actionable: "Mark Resolved" or "View Stacktrace") & Churn Risk Gyms.
*   **"Refresh Dashboard" Action:**
    *   **Icon:** `RefreshCw` (lucide-react).
    *   **Hover/Click:** Rotates `360deg`, locks for 3 seconds to prevent spam.
    *   **Data Fetching:** Triggers parallel React Query Refetches across all dashboard widget queries.

## 4. Frontend Implementation & State Gaps
*   **Widget-Based React Query:** Do NOT fetch the entire dashboard in one massive API call.
    *   **Fix:** Break the dashboard into micro-components (`<RevenueWidget />`, `<TelemetryWidget />`, `<ErrorFeedWidget />`). Each uses its own `useQuery`. If the `Telemetry` API is slow, it won't block the `Revenue` numbers from rendering instantly.
*   **Server-Sent Events (SSE) for the Live Console:**
    *   The Global Activity Stream cannot be efficiently polled.
    *   **Fix:** The frontend opens a resilient `EventSource` connection to `/api/v1/superadmin/stream`. The Spring Boot backend emits JSON strings of critical events as they happen via `SseEmitter`.

## 5. Backend Architectural Gaps & Implementation
*   **Spring Boot Actuator Integration:**
    *   To get latency and DB metrics, the backend must expose internal JVM metrics. Add `spring-boot-starter-actuator` and `micrometer-registry-prometheus`.
    *   The `DashboardMetricsService` aggregates data from `MetricsEndpoint` (e.g., `http.server.requests` metric for P95 latency).
*   **The Global Event Broadcaster (`ApplicationEventPublisher`):**
    *   How does the live console get its data?
    *   **Fix:** Throughout the backend, whenever a major action occurs (Payment, Registration, Unhandled Exception), publish a Spring Event: `eventPublisher.publishEvent(new SystemActivityEvent(type, message))`. An `@EventListener` asynchronously formats this and pumps it to all active Super Admin SSE connections.

## 6. Database Strategy & Extreme Performance
*   **Avoiding the Dashboard "Query of Death":**
    *   A naive dashboard query calculating MRR, counting all users, and finding churn risks will join 10 tables and take 5 seconds, locking the database.
    *   **Fix 1: Redis Caching:** All heavy counts (Total Users, MRR) MUST be cached in Redis with a TTL of 5-15 minutes (`@Cacheable(value = "dashboard:mrr", key="'current'")`).
    *   **Fix 2: Nightly Pre-aggregation:** The "Churn Risk" and "DAU drops" are calculated once per night at 2:00 AM via a Quartz/Spring Scheduled job, saving the results to a small `dashboard_insights` table. The dashboard simply reads this pre-computed snapshot in 1ms.
