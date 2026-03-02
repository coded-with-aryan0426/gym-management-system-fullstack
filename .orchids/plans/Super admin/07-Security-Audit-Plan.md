# 07: Super Admin Security & Audit Plan

## 1. Ultimate Goal
Convert `SASecurity.tsx` into a high-fidelity digital forensic feed. It must track every action initiated by anyone holding the `MASTER_PASSPHRASE` and actively protect the endpoint against brute force attacks using real-time IP blacklisting.

## 2. UI/UX Interactive Micro-Details
*   **Chronological Immutable Feed:**
    *   **Visual Structure:** A vertical timeline line (`border-left: 2px solid #333`) running down the left side. Each event is a dot on this timeline.
    *   **Event Badges:** 
        *   `GET` (Read) = Subtle Gray `#6B7280`.
        *   `POST` (Create) = Solid Blue `#3B82F6`.
        *   `PUT`/`PATCH` (Update) = Amber `#F59E0B`.
        *   `DELETE` (Destroy) = Bold Red `#EF4444`.
    *   **Hover State:** Hovering over an event reveals a tiny `<Code2 />` icon. Clicking it expands a `<motion.div>` showing the exact JSON payload the admin sent to the server.
*   **Failed Login Map (React Simple Maps):**
    *   **Gap:** IP strings are hard to visualize.
    *   **UX:** Integate a D3.js or `react-simple-maps` world globe. When a failed password guess occurs, drop a red ping `<circle stroke="#EF4444" strokeWidth={2}>` on the latitude/longitude coordinates of the IP.
*   **"Block IP" Action:**
    *   Icon: `ShieldBan`. Click opens a modal to add `192.168.1.xxx` to the permanent Redis blacklist. 

## 3. Frontend Gaps & Implementation
*   **Live Event Ticker:** The frontend should poll `/api/v1/superadmin/security/audit-logs?since={timestamp}` every 10 seconds. New events slide down seamlessly from the top using Framer Motion `LayoutGroup` animations so the feed feels "alive".

## 4. Backend Architectural Gaps & Implementation
*   **X-Forwarded-For Trust Setup (The IP Gap):**
    *   If deployed on Vercel/Render behind Cloudflare or an API Gateway, `request.getRemoteAddr()` will constantly return the Load Balancer's IP (e.g., 10.0.0.1), completely breaking brute-force protection.
    *   **Fix:** The backend MUST be configured to read the `X-Forwarded-For` header. In Spring Boot, add `server.forward-headers-strategy=FRAMEWORK` to `application.properties`.
*   **AOP Audit Implementation:**
    *   Create `@SuperAdminAudit` annotation. Attach it to all Super Admin controllers. Provide an Aspect that executes `@AfterReturning` and `@AfterThrowing` to log the Method, URI, User Agent, IP, and sanitized payload to the database.

## 5. Database Strategy & Gaps
*   **The BRIN Index (Crucial for Logs):**
    *   An audit log table will quickly reach hundreds of thousands of rows. B-Tree indices on timestamps are large and slow to write.
    *   **Fix:** In PostgreSQL, create a Block Range Index (BRIN) on the `created_at` column: `CREATE INDEX idx_audit_created_at_brin ON super_admin_audit_logs USING BRIN (created_at);`. This takes 1/100th the storage space and makes chronological queries lightning fast.
    *   Make the table append-only (revoke `UPDATE` and `DELETE` grants for standard DB roles).
