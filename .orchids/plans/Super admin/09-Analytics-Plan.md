# 09: Super Admin Analytics Plan

## 1. Ultimate Goal
Transform `SAAnalytics.tsx` into a robust BI (Business Intelligence) dashboard. Produce long-term macro trend graphs (Churn, Feature Adoption, Signups) that don't crush the PostgreSQL database upon render.

## 2. UI/UX Interactive Micro-Details
*   **Time Range Pills (7D / 30D / 90D / YTD / ALL):**
    *   **Rest:** `<button>` with border radius `9999px`, transparent background, text `#A3A3A3`.
    *   **Hover:** Background `rgba(255,255,255,0.05)`, text `#FFFFFF`.
    *   **Active (Selected):** Background `#FFFFFF` (Solid White), text `#000000` (Black).
    *   **Click Transition:** Instantly updates the graph X-axis bounds. React Spring or Framer Motion rescales the `<AreaChart>` lines fluidly rather than causing a jarring, disjointed redraw.
*   **"Export CSV / PDF" Dropdown:**
    *   **Icon:** `DownloadCloud`.
    *   **Hover:** `box-shadow: 0 4px 12px rgba(0,0,0,0.4)`.
    *   **Interaction:** Clicking shows a sub-menu: `.CSV (Raw Data)`, `.PDF (Executive Summary)`. Selecting CSV triggers a Blob download and a Toast "Report generated in 1.4s". 
*   **Graph Tooltips:**
    *   When mousing over a specific day node on the graph, vertical guidelines render, and a tooltip displays multiple layers (e.g., "Jan 14th: +45 New Signups, -2 Churns, Net +43").

## 3. Frontend Gaps & Implementation
*   **Data Shape Overload:** If "All Time" is selected, the API might return 3,000 data points (one for each day over 10 years). Rendering 3,000 nodes in Recharts obliterates browser memory.
    *   **Fix:** The frontend must enforce data bucketing. If the `time_range` exceeds 90 days, the request dictates `&interval=monthly` or `&interval=weekly` so maximum nodes rendered never exceed ~100.

## 4. Backend Architectural Gaps & Implementation
*   **Calculation Engine (The Gap):** Asking the SQL database to calculate churning, signups, DAU/MAU over dynamic 5-year periods natively per request will cause HTTP timeouts.
    *   **Fix:** Instead of querying `users` and `gyms` tables, create an Analytics Controller that queries an exclusively dedicated `daily_platform_metrics` table. 
    *   **Endpoint:** `GET /api/v1/superadmin/analytics?range=30D&interval=DAILY`
*   **PDF Generation:** 
    *   If the UI requests a PDF, do not use frontend DOM-to-Image (bad resolution). Use `iText7` or `Apache PDFBox` in Spring Boot to generate a crisp A4 vector document directly from the cached Data layer.

## 5. Database Strategy & Gaps
*   **Cron-Triggered Metric Aggregation:**
    *   Implement a CRON job scheduled at exactly `23:55:00 UTC` daily.
    *   This job calculates exactly how many distinct users logged in that day (DAU), how many active gyms there are, MRR snapshot, and `INSERT INTO daily_platform_metrics (metric_date, new_users, churned_users, dau, mau_snapshot, revenue_snapshot) VALUES (...)`.
    *   This divorces complex timestamp mathematical group-by functions from the live web request entirely, ensuring the Super Admin analytics load in < 50ms forever.
