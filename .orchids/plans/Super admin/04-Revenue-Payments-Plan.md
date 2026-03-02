# 04: Super Admin Revenue & Payments Plan (Creator Edition)

## 1. Ultimate Goal
Convert `SARevenue.tsx` into a bulletproof financial dashboard. As the platform creator, you need absolute certainty that every cent processed through Stripe matches your local database. You need to instantly identify failed payouts to gyms before they email support complaining they haven't been paid.

## 2. Advanced Creator & Business Insights (What's Missing)
*   **The "Unreconciled" Alert:**
    *   A massive red banner that only appears if `Stripe Total Balance != Local DB Expected Balance`. This immediately tells you a webhook failed or a transaction was missed.
*   **Gym Payout Ledger (The Split):**
    *   A dedicated view showing exactly how much money is sitting in the platform's pending Stripe account waiting to be paid out to Gym Owners (assuming standard Connect flows).
    *   *UI Execution:* A bold split-number widget: `$45,000 (Titan Revenue)` vs `$120,000 (Pending Gym Payouts)`.
*   **Failed Transaction "Retry/Rescue" Flow:**
    *   When a gym member's card fails (e.g., Insufficient Funds), the Super Admin shouldn't just *see* it. You need a "Trigger Dunning Email" button to manually fire an alert to the member to update their card, helping the gym recover lost revenue.

## 3. UI/UX Interactive Micro-Details & Layout
*   **MRR AreaChart Graphing (`Recharts`):**
    *   *Interaction:* AreaChart with a gradient fill (`#10B981` transitioning to transparent at the bottom).
    *   *Hover State:* Custom `<Tooltip />` that overlays a thin vertical slice line. Pops up a dark minimalist box indicating the exact Day MRR vs Platform Cut comparing it to the *Previous Month* (e.g., "+12% vs Nov 14th").
*   **"Sync/Reconcile Gateway" Action:**
    *   *Icon:* `CreditCard` + `RefreshCw`.
    *   *Click State:* Disables for 5+ seconds. Loads a mini horizontal progress bar indicating it is physically iterating through the last 500 Stripe events.
    *   *Feedback Toast:* "Ledger Synced. 3 discrepancies auto-corrected."
*   **Transaction Forensic Drawer:**
    *   Clicking any transaction row slides open a drawer revealing the RAW Stripe JSON payload (`stripe_payment_intent_id`, `receipt_url`, `risk_level`) for deep financial debugging.

## 4. Frontend Implementation & State Management Gaps
*   **Formatting Precision:** 
    *   Never format money manually on the frontend via strings.
    *   *Fix:* Use `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)` specifically wrapped in a React `useMemo` so it doesn't recalculate 1,000 times on scroll.

## 5. Backend Architectural Gaps & Implementation
*   **Endpoints Required:**
    *   `GET /api/v1/superadmin/revenue/overview`
    *   `GET /api/v1/superadmin/revenue/ledger?page=0&size=100`
    *   `POST /api/v1/superadmin/revenue/sync-gateway` (The heavy manual sync).
    *   `POST /api/v1/superadmin/revenue/{transactionId}/rescue` (Fires the dunning email).
*   **The Reconciliation Service (Crucial Gap):**
    *   Webhooks fail. The Internet drops.
    *   *Fix:* The `sync-gateway` endpoint manually queries `Stripe.PaymentIntents.list()` for the last 24 hours. It compares every Stripe `status` against the `payments` table. If Stripe says `succeeded` but the DB says `pending`, the backend forcefully patches the local DB and logs a warning to the Audit Log.
*   **BigDecimal Precision Mandate:**
    *   Using `Double` or `Float` in Java/Node for currency calculates $99.99 as $99.99000001.
    *   *Fix:* All DTOs, Entities, and math operations must use `java.math.BigDecimal` rounding to `RoundingMode.HALF_UP`.

## 6. Database Strategy & Extreme Performance
*   **The Re-calculation Bottleneck:**
    *   Doing `SUM(amount) FROM payments` across millions of rows locks the database and spikes CPU.
    *   *Fix:* Trigger-based summary table. Create `daily_revenue_summaries` (date, total_gross, platform_cut, currency, is_reconciled). 
    *   Whenever a payment row is updated to `SUCCESS`, a Postgres Trigger (`AFTER UPDATE ON payments`) increments the daily summary row instantly. The Dashboard reads this 365-row table in ~1ms instead of scanning physical payment records.
