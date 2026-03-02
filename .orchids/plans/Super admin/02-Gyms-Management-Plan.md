# 02: Super Admin Gyms Management Plan (Creator Edition)

## 1. Ultimate Goal
Transform `SAGyms.tsx` from a simple address book of gyms into a **Deep-Diagnostic Surveillance Tool**. As the creator of Titan, you shouldn't just see a list of names; you need instant visual queues on financial leakage, user churn, feature adoption, and technical errors happening *per specific gym*, all packaged in a buttery-smooth UI.

## 2. Advanced Creator & Business Insights (What's Missing & Must Be Added)
*   **The "Gym Health Score" (0-100):**
    *   A composite score calculated dynamically based on MRR growth, member retention over 30 days, and active owner logins. 
    *   *UI Execution:* A circular progress ring next to the gym name. Green (>80), Yellow (50-79), Red (<50 = Churn Risk).
*   **Revenue Leakage Alert Badge:**
    *   If a gym has > 5 failed member payments this week, flag the row with an animated `Warning` icon indicating "Revenue Leakage." You can proactively contact the owner to help them fix their billing.
*   **7-Day Check-in Sparkline:**
    *   Inline micro-charts! Instead of opening a new page to see if a gym is dead, render a tiny 7-day `Recharts` LineChart or `visx/sparkline` directly inside the table row. A flat line means the gym is a ghost town.
*   **Recent Owner Activity Tag:**
    *   "Owner Last Logged In: 4 hours ago" vs "Owner Last Logged In: 14 Days Ago" (Highlight in red to indicate abandonment).

## 3. UI/UX Interactive Micro-Details & Layout
*   **The "Deep Dive" Right Drawer (Slide-Over):**
    *   *Interaction:* Clicking a gym row does NOT take you to a new page. It slides out a massive 600px wide right-side drawer (using `framer-motion` for spring physics).
    *   *Drawer Content Tabs:* 
        *   **Overview:** MRR, Total Members, Plan Tier (Pro vs Basic).
        *   **Platform Telemetry:** Raw API 500 error logs specific *only* to this `gym_id` so you can debug what their members are experiencing.
        *   **Billing/Ledger:** Their Stripe Connect payout status.
        *   **Quick Actions:** A sticky footer inside the drawer.
*   **Quick Actions (Creator God-Mode):**
    *   **"Force Sync Billing" Button:** Bypasses webhooks and manually asks Stripe for this gym's true financial status.
    *   **"Broadcast System Message" Button:** Pushes a red alert banner to all active members of *just this gym* (e.g., "Titan System Maintenance for your Gym at 2AM").
    *   **"Impersonate Owner":** The `LogIn` icon. Immediately generates an auth token and opens a new tab logged in exactly as them to see their exact UI bugs.
    *   **"Nuclear Suspend":** Requires typing the `gym_name`. Red button with a `ShieldAlert`. Fades the gym out of the active list instantly, cutting all backend JWT tokens.

## 4. Frontend Implementation & State Management Gaps
*   **Table Infinite Virtualization:** 
    *   If Titan has 500 gyms, a normal `<table>` will lag when scrolling.
    *   *Fix:* Implement `@tanstack/react-virtual` for the rows. The DOM only renders the 15 gyms visible on your screen, but you can scroll through 10,000 gyms at 60fps.
*   **Drawer Lazy Loading strategy:**
    *   Do NOT fetch the "Deep Dive Telemetry" for all gyms on initial load.
    *   *Fix:* Implement `useQuery(['gymTelemetry', selectedGymId], ...)` inside the Drawer component. When the drawer slides open, it renders a skeleton loader for 0.2s while it fetches that specific gym's logs and revenue deep-dive.

## 5. Backend Architectural Gaps & Implementation
*   **Endpoints Required:**
    *   `GET /api/v1/superadmin/gyms` (Returns lightweight DTO: ID, Name, Health Score, Sparkline Data [7 ints], Last Owner Login Date).
    *   `GET /api/v1/superadmin/gyms/{gymId}/deep-dive` (Returns heavy data: Full owner details, recent 500 errors, pending payouts, exact member counts).
    *   `POST /api/v1/superadmin/gyms/{gymId}/broadcast` (Fires an SSE event or WebSocket message targeted by `gymId` to show banners to active users).
*   **The Impersonation Flow (Security Risk Mitigation):**
    *   When you click "Impersonate", the backend MUST generate a short-lived (5 min) standard JWT that possesses the `ROLE_OWNER` authority *but* also contains a custom claim `"is_impersonated_by_admin": true`. This ensures if you do something stupid while impersonating, the Audit Log knows it was YOU, not the real owner.

## 6. Database Strategy & Extreme Performance
*   **The Sparkline Query Killer:**
    *   To render the 7-day sparkline for 50 gyms on a page, the DB would have to do 50 `GROUP BY day` aggregations across millions of check-ins.
    *   *Fix:* Nightly Rollup Table. Create `gym_daily_stats` (gym_id, stat_date, total_checkins, total_revenue). The `GET /gyms` endpoint queries this small table using `WHERE stat_date > CURRENT_DATE - 7`, pulling the array of 7 integers in ~3ms.
    *   *Index Requirement:* `CREATE INDEX idx_gym_daily_stats ON gym_daily_stats (gym_id, stat_date DESC);`
