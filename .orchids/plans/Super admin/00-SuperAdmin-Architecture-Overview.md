# 00: Super Admin Architecture & Implementation Protocol

## 1. Ultimate Goal
Transform the standalone, hardcoded React Super Admin interface (e.g., `SuperAdminPortal.tsx`, `SADashboard.tsx`) into a fully integrated, high-performance, and hyper-secure command center. Every visual element must map to a robust backend API and structurally sound database schema, leaving zero gaps in performance, state management, or security.

## 2. Frontend Architectural Gaps & Solutions
*   **State Management:** The current fake UI relies on local component state. 
    *   **Solution:** Implement `@tanstack/react-query`. Use `staleTime: 60000` (1 minute) for dashboard metrics to prevent API spam, but keep `staleTime: 0` for direct mutation lists (like Gym/User tables).
*   **Error Boundaries:** If a specific Super Admin section crashes due to malformed data, it currently white-screens the app.
    *   **Solution:** Wrap `SuperAdminLayout.tsx` in a strict React `<ErrorBoundary>` that catches UI crashes, shows a "Module Failed to Load" fallback component, and fires a `POST /api/v1/superadmin/report-client-error` to the backend.
*   **Real-time Synchronization (Missing):** Super Admin needs live updates for critical errors and new gym registrations.
    *   **Solution:** Integrate Server-Sent Events (SSE) or WebSockets (`SockJS` / `STOMP`). The frontend will listen to `/topic/superadmin/alerts`. A badge notification will pulse red in the Topbar when a new critical event arrives.

## 3. Backend Architectural Gaps & Solutions
*   **Strict Segregation & Authorization:** Normal users must never infer or access Super Admin routes.
    *   **Solution:** Introduce `SuperAdminSecurityFilter` in Spring Boot. All paths matching `/api/v1/superadmin/**` MUST require a specific role claim inside the JWT (e.g., `ROLE_SUPER_ADMIN`) or a validated short-lived session token tied to `MASTER_PASSPHRASE`.
*   **Audit Logging (Critical Gap):** The Super Admin has infinite power; therefore, every state-mutating action (POST, PUT, DELETE) must be tracked.
    *   **Solution:** Implement Spring AOP (`@Aspect`). Any controller method annotated with `@SuperAdminAction(type="REVENUE_ADJUSTMENT")` will automatically intercept the request, extract the admin ID and payload, and save it to the PostgreSQL `super_admin_audit_logs` table.
*   **Rate Limiting & DDoS Protection:**
    *   **Solution:** Implement `Bucket4j` with Redis. Limit the Super Admin portal login endpoint to 5 attempts per 15 minutes per IP address. Limit data fetching API routes to 100 req/min to prevent database scraping.

## 4. Database Architectural Gaps & Solutions
*   **Analytic Query Overload:** Running `COUNT(*)` on multimillion-row tables (e.g., `member_checkins`, `users`) synchronously heavily degrades performance for end-users.
    *   **Solution:** Use PostgreSQL Materialized Views (e.g., `mv_platform_metrics`) refreshed asynchronously via `pg_cron` or a Spring `@Scheduled` task every 10 minutes.
*   **Audit Schema Creation:**
    *   **Solution:** Create table `super_admin_audit_logs` (id, admin_id or ip_address, action_enum, target_entity, target_entity_id, JSONB payload_snapshot, created_at). Add a BRIN index on `created_at` for lightning-fast chronological searching of massive audit histories.

## 5. Global UI/UX Interactive Standards
*   **Button Feedback:** EVERY button in the Super Admin layout must utilize:
    *   **Rest:** Opacity 1, Base distinct color (e.g., `#00FF41` for Success, `#EF4444` for Danger).
    *   **Hover:** Brightness filter `1.1x`, transition `all 0.2s ease-in-out`, cursor `pointer`. Target icons inside the button must translate `translateX(2px)` or rotate slightly.
    *   **Active/Click:** Scale down to `0.97` to simulate physical depth.
    *   **Loading:** The button disables (`cursor: not-allowed`, `opacity: 0.6`) and the internal icon swaps to a rotating `Loader2` lucide-react icon.
*   **Toast Notifications:** Create a global Toast provider in the Super Admin layout. Every successful backend mutation MUST trigger a green toast (e.g., "Gym 104 Suspended Successfully"). Every failure MUST trigger a red toast displaying the exact backend `message` string.
