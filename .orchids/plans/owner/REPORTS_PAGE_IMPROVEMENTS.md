# Reports & Analytics Page - Improvement Plan

## Current State Analysis

**What exists:**
- 4 tabs: Overview, PT Revenue, Staff Attendance, Insights
- Date range selector: 7D, 30D, 90D, 1Y
- **Overview:** Retention Rate, Class Utilization, Trainer NPS, Net Member Growth, Membership Movement bars, Trainer Business Impact, Traffic Heatmap (24h x 7days), Quick Insights
- **PT Revenue:** Total PT Revenue, Avg per Member, PT Members, Renewal Rate, Product Revenue donut, Top Spending Members, Monthly Trends, Age Group Analysis
- **Staff Attendance:** Present/Late/Absent/Overtime stats, Monthly attendance grid, Top Late Arrivals, Attendance Summary
- **Insights:** Critical/Warning/Opportunity categories with action items

---

## Issues Found

### Critical
1. **No export/download** - Can't export any report to PDF/CSV/Excel
2. **No custom date range** - Only presets (7D/30D/90D/1Y), can't pick specific dates
3. **No financial reports** - No P&L statement, no revenue vs expenses breakdown
4. **Currency hardcoded to INR** - `formatCurrency` uses `en-IN` / `INR` instead of using the app's CurrencyContext
5. **No comparison periods** - Can't compare "this month vs last month"
6. **All data is from single API** - `getFullDashboard(dateRange)` loads everything at once, slow for large gyms

### Missing Real-World Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Export reports (PDF/CSV/Excel) | Download any report for accounting, tax filing, investors |
| **P0** | Financial P&L report | Revenue - Expenses = Profit by month, quarter, year |
| **P0** | Custom date range picker | Select exact start/end dates |
| **P0** | Member retention cohort analysis | "Of members who joined in Jan, how many are still active in Jun?" |
| **P0** | Revenue report by source | Membership, PT, classes, supplements, locker, others |
| **P1** | Comparison mode | "Feb vs Jan", "This quarter vs last quarter" |
| **P1** | Member churn analysis | Why members leave - reasons, patterns, at-risk prediction |
| **P1** | Trainer utilization report | % of trainer hours booked vs available |
| **P1** | Class performance report | Attendance rate per class type, instructor, time slot |
| **P1** | Payment collection report | Collected vs pending vs overdue by period |
| **P1** | Tax report | GST/tax collected, deductible expenses, net taxable |
| **P2** | Scheduled/automated reports | "Email me weekly revenue summary every Monday 9am" |
| **P2** | KPI goal tracking | Set targets → track actuals vs goals with variance |
| **P2** | Equipment ROI report | Revenue generated per equipment vs maintenance cost |
| **P2** | Member lifetime value (LTV) | Average revenue per member over their tenure |
| **P2** | Marketing channel ROI | Track where new members come from (walk-in, social, referral) |
| **P3** | Custom report builder | Drag-drop fields to build custom reports |
| **P3** | Dashboard sharing | Share specific reports with managers/partners via link |
| **P3** | Benchmark comparison | Compare your gym's metrics with industry averages |

---

## Detailed Feature Specifications

### 1. Export Reports (P0)

**UI:** "Export" button on each report section header.
- Dropdown: PDF, CSV, Excel
- PDF: Styled report with gym logo, date range, charts as images
- CSV/Excel: Raw data tables

**Backend:**
```
GET /api/reports/export?type=revenue&format=pdf&from=2026-01-01&to=2026-02-13
GET /api/reports/export?type=attendance&format=csv&month=2026-02
GET /api/reports/export?type=members&format=xlsx&range=90d
```

**Frontend:** Use `jsPDF` for PDF generation or server-side PDF with `Puppeteer/wkhtmltopdf`.

### 2. Financial P&L Report (P0)

**New tab: "Financial"**

```
Revenue:
  Membership Fees        ₹3,50,000
  PT Sessions            ₹1,20,000
  Group Classes          ₹45,000
  Supplement Sales       ₹80,000
  Locker Rentals         ₹15,000
  Other Income           ₹10,000
  ─────────────────────────────────
  Total Revenue          ₹6,20,000

Expenses:
  Staff Salaries         ₹2,50,000
  Rent                   ₹1,00,000
  Equipment Maintenance  ₹25,000
  Utilities              ₹35,000
  Marketing              ₹20,000
  Software/Subscriptions ₹8,000
  Other Expenses         ₹12,000
  ─────────────────────────────────
  Total Expenses         ₹4,50,000

  ═════════════════════════════════
  NET PROFIT             ₹1,70,000
  Profit Margin          27.4%
```

**Backend:**
```sql
CREATE TABLE expense_categories (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) DEFAULT 'RECURRING', -- RECURRING, ONE_TIME
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  category_id INTEGER REFERENCES expense_categories(id),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  vendor VARCHAR(200),
  receipt_url VARCHAR(500),
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(20), -- MONTHLY, QUARTERLY, ANNUAL
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Member Retention Cohort Analysis (P0)

**Visual:** Matrix showing retention by join month.

```
Join Month  | M1   | M2   | M3   | M4   | M5   | M6
Jan 2026    | 100% | 92%  | 85%  | 78%  | 72%  | 68%
Feb 2026    | 100% | 88%  | 80%  | --   | --   | --
```

**Backend:**
```
GET /api/analytics/cohort-retention?startMonth=2025-07&endMonth=2026-02
Response: [{
  cohortMonth: "2026-01",
  startingMembers: 45,
  retentionByMonth: [100, 92, 85, 78, 72, 68]
}]
```

### 4. Revenue by Source Report (P0)

**Visual:** Stacked area chart showing revenue composition over time.

**Backend:**
```
GET /api/analytics/revenue-by-source?from=2025-08-01&to=2026-02-13&granularity=monthly
Response: [{
  period: "2026-01",
  membership: 350000,
  ptSessions: 120000,
  classes: 45000,
  supplements: 80000,
  lockers: 15000,
  other: 10000,
  total: 620000
}]
```

### 5. Comparison Mode (P1)

**UI:** Toggle "Compare" → select comparison period.
- Side-by-side cards: "Current Period" vs "Previous Period"
- Delta indicators: +12.5% or -3.2%
- Overlay charts: current period solid line, comparison period dashed line

### 6. Scheduled Reports (P2)

```sql
CREATE TABLE scheduled_reports (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  created_by INTEGER REFERENCES users(id),
  report_type VARCHAR(50) NOT NULL, -- REVENUE, ATTENDANCE, MEMBERS, P&L, CUSTOM
  frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY
  day_of_week INTEGER, -- for WEEKLY
  day_of_month INTEGER, -- for MONTHLY
  time_of_day TIME DEFAULT '09:00',
  recipients TEXT[] NOT NULL, -- email addresses
  format VARCHAR(10) DEFAULT 'PDF', -- PDF, CSV, XLSX
  filters JSONB, -- saved filter configuration
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Backend API Design

```
-- Exports
GET /api/reports/export                            -- Export report

-- Financial
GET /api/analytics/profit-loss?from=&to=           -- P&L report
GET /api/analytics/revenue-by-source?from=&to=     -- Revenue breakdown
GET /api/expenses?from=&to=                        -- List expenses
POST /api/expenses                                 -- Add expense

-- Retention
GET /api/analytics/cohort-retention                -- Cohort analysis
GET /api/analytics/churn-analysis                  -- Churn reasons/patterns
GET /api/analytics/member-ltv                      -- Lifetime value

-- Comparison
GET /api/analytics/compare?current=&previous=      -- Side-by-side comparison

-- Scheduled
GET /api/reports/scheduled                         -- List scheduled reports
POST /api/reports/scheduled                        -- Create scheduled report
PUT /api/reports/scheduled/{id}                    -- Update
DELETE /api/reports/scheduled/{id}                 -- Delete

-- Custom
POST /api/reports/custom                           -- Custom report query
```

---

## Fix: Currency Hardcoding

**Current:**
```typescript
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
```

**Fix:** Use `useCurrency()` from `CurrencyContext` (already used in Dashboard):
```typescript
const { formatPrice } = useCurrency()
```

---

## Implementation Priority

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase 1** | Fix currency hardcoding, custom date range picker | Frontend-only |
| **Phase 2** | Export to PDF/CSV/Excel | jsPDF or backend PDF service |
| **Phase 3** | Financial P&L, expense tracking | Expense tables + API |
| **Phase 4** | Revenue by source, cohort retention | Analytics queries |
| **Phase 5** | Comparison mode, churn analysis | Phase 4 |
| **Phase 6** | Trainer utilization, class performance | Session & class data |
| **Phase 7** | Scheduled reports, custom report builder | Email service + Phase 2 |
