# 08: Super Admin Database Health Plan

## 1. Ultimate Goal
Turn `SADatabase.tsx` into a window mimicking AWS RDS or Neon's management console. Give the Super Admin real-time gauges of HikariCP Connection limits, query bottlenecks, and trigger manual structural backups without leaving the app.

## 2. UI/UX Interactive Micro-Details
*   **Diagnostic Gauges (Recharts/SVG):**
    *   **Visuals:** Three semi-circle radial charts mapping `Active Connections`, `CPU Usage`, and `Memory`.
    *   **Animation:** Use SVG `stroke-dashoffset` to elegantly sweep the gauge from 0 to the target percentage over 1 second on mount.
    *   **Threshold Alerts:** If `Active Connections` > 80% of max pool size, the gauge stroke color transitions from `#00FF41` (Green) to `#EF4444` (Red) and a subtle box-shadow pulse begins.
*   **Table Size Explorer:**
    *   A grid showing `table_name`, `row_count`, and `total_bytes`.
    *   **Interaction:** Clicking column headers toggles sort (`ChevronUp`/`ChevronDown` icons). Sizes format dynamically (`1048576` bytes -> `1 MB`).
*   **"Trigger Snapshot Backup" Button:**
    *   **Icon:** `DatabaseBackup` + `CloudArrowUp`.
    *   **Click State:** Fires request, button text changes to `Dumping Schemas...`, locking the UI to prevent double clicks.
    *   **Feedback:** Toast "Database successfully backed up to S3 bucket [filename.sql.gz]".

## 3. Frontend Gaps & Implementation
*   **Polling Heavy Endpoints:** Asking the DB to calculate table sizes every 500ms via frontend polling will crash the DB itself.
    *   **Fix:** The frontend must strictly limit health polling to 10-second intervals (`refetchInterval: 10000`).
    *   **Graceful Degradation:** If the DB is actually dying and the diagnostics API returns a 504 Gateway Timeout, render a skeleton with a big red "CONNECTION LOST" warning overlay.

## 4. Backend Architectural Gaps & Implementation
*   **Spring Boot Actuator Integration (The Gap):**
    *   Building completely custom SQL to track connection pools is reinventing the wheel.
    *   **Fix:** Ensure `spring-boot-starter-actuator` is in `pom.xml`. Expose Prometheus/Metrics. The backend controller maps a GET endpoint that internally reads `MetricsEndpoint` to get `hikaricp.connections.active`, `jvm.memory.used`, etc., repackaging it securely for the frontend.
*   **PostgreSQL Native Queries:**
    *   To get exact table sizes, execute native JDBC raw queries: `SELECT relname, pg_size_pretty(pg_total_relation_size(C.oid)) FROM pg_class C LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace) WHERE nspname NOT IN ('pg_catalog', 'information_schema') AND C.relkind <> 'i' AND nspname !~ '^pg_toast';`

## 5. Database Strategy & Gaps
*   **Security Hazard of Super Admin Snapshots:**
    *   Running a backup command `pg_dump` from Java using `Runtime.getRuntime().exec()` is a massive vulnerability if not parameterized exactly.
    *   **Fix:** Never pass UI variables to the DB dump command. Hardcode the shell execution path.
    *   **Connection Pool Sizing:** Ensure `spring.datasource.hikari.maximum-pool-size` in `application.properties` is configured identically to the maximum connections allowed by Neon/Postgres (typically ~50-100) to prevent `HikariPool-1 - Connection is not available` errors under load.
