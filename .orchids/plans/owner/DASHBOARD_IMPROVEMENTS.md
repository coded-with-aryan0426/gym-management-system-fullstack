# Dashboard Page - Improvement Plan

## Current State Analysis

**What exists:**
- Greeting header with live clock and refresh
- 5 KPI cards (Today's Revenue, Live on Floor, Total Members, Sessions Today, Pending Dues)
- Revenue area chart (weekly, mock data using `Math.random()`)
- Attendance bar chart (weekly, mock data using `Math.random()`)
- Membership donut chart (hardcoded percentages like `0.72`, `0.08`, `0.12`)
- Trainer schedule list (from API)
- Expiring memberships list (from API)
- Live activity feed (from API)
- Birthdays widget
- Quick actions grid (6 buttons)

---

## Issues Found

### Critical (Data Integrity)
1. **Revenue sparkline is fake** - Uses `Math.random()` to generate values: `Math.round(base / 7 * (0.6 + Math.random() * 0.8))`
2. **Attendance trend is fake** - Uses `Math.random()`: `Math.round(base * (0.5 + Math.random() * 1))`
3. **Membership donut uses hardcoded ratios** - `0.72` active, `0.08` frozen, `0.12` expired - not from backend
4. **No error state** - If API fails, dashboard shows stale data with no indication
5. **15-second polling** - `setInterval(loadDashboardData, 15000)` may overload backend

### Missing Real-World Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Real chart data from backend | Revenue/attendance charts should use actual daily/weekly data from API, not `Math.random()` |
| **P0** | Overdue payments list | Show members with overdue payments with amount, days overdue, last reminder date |
| **P0** | Today's class schedule | Show group classes happening today with time, trainer, enrollment count |
| **P0** | Revenue breakdown | Split by source: memberships, PT sessions, supplements, locker rentals |
| **P1** | Occupancy meter | Real-time gym floor occupancy as % of max capacity (fire code compliance) |
| **P1** | Month-to-date vs target | Show current month revenue vs monthly target with progress bar |
| **P1** | Renewal pipeline | Members due for renewal in 7/14/30 days with predicted renewal probability |
| **P1** | Staff attendance today | Which staff/trainers checked in, who's absent, who's late |
| **P1** | New member onboarding queue | Members who joined in last 7 days and haven't completed orientation |
| **P2** | Announcement/notice board | Pin important messages for staff (e.g., "Pool maintenance Saturday") |
| **P2** | Weather widget | Foot traffic correlates with weather - show today's weather |
| **P2** | Comparison period selector | Compare this week vs last week, this month vs last month |
| **P2** | Goal tracking widget | Monthly targets for signups, revenue, retention with progress |
| **P3** | Customizable widget layout | Let owner drag/drop to rearrange dashboard cards |
| **P3** | Dashboard presets | "Morning briefing" vs "End of day summary" vs "Weekly review" |

---

## Detailed Feature Specifications

### 1. Real Chart Data from Backend (P0)

**Current problem:** Charts use `Math.random()` - every refresh shows different data.

**Backend API needed:**
```
GET /api/analytics/revenue-daily?range=7d
Response: [{ date: "2026-02-07", revenue: 12500, source: "membership" | "pt" | "supplement" | "other" }]

GET /api/analytics/attendance-daily?range=7d
Response: [{ date: "2026-02-07", checkIns: 45, uniqueMembers: 38, peakHour: 18 }]

GET /api/analytics/membership-breakdown
Response: { active: 180, expiring: 12, frozen: 8, expired: 25, total: 225 }
```

**Frontend changes:**
- Remove all `Math.random()` usage
- Add proper loading/error states per chart
- Cache chart data separately from KPIs (charts don't need 15s refresh)

### 2. Overdue Payments Widget (P0)

```
GET /api/payments/overdue?limit=10
Response: [{
  memberId, memberName, amount, dueDate, daysOverdue,
  lastReminderSent, planName, phone
}]
```

**UI:** Red-tinted card showing top overdue members with:
- Amount owed
- Days overdue (color-coded: <7 yellow, 7-30 orange, 30+ red)
- "Send Reminder" quick action button
- "View All" link to Financials page filtered by overdue

### 3. Today's Class Schedule (P0)

```
GET /api/classes/today
Response: [{
  classId, name, type, trainer, startTime, endTime,
  enrolled, capacity, room, status: "upcoming" | "in_progress" | "completed"
}]
```

**UI:** Timeline-style card showing:
- Current class highlighted with "LIVE" badge
- Upcoming classes with enrollment bar (12/20)
- Completed classes grayed out

### 4. Revenue Breakdown (P0)

**UI:** Replace single revenue number with mini breakdown:
- Memberships: 65%
- PT Sessions: 20%
- Supplements: 10%
- Other: 5%
- Shown as horizontal stacked bar under the revenue KPI

### 5. Occupancy Meter (P1)

```
GET /api/gym/occupancy
Response: { currentCount: 45, maxCapacity: 100, percentage: 45, trend: "rising" | "falling" | "stable" }
```

**UI:** Circular gauge showing:
- Current occupancy percentage
- Color changes: green (<60%), yellow (60-80%), red (>80%)
- "Max capacity: 100" label
- Trend arrow

### 6. Month-to-Date Revenue vs Target (P1)

**Backend:** Owner sets monthly target in Settings.
```
GET /api/analytics/monthly-progress
Response: { target: 500000, current: 320000, daysElapsed: 13, daysInMonth: 28, projectedEnd: 490000 }
```

**UI:** Progress bar with:
- Current amount / Target amount
- Projected end-of-month amount
- On track / Behind / Ahead indicator
- Days remaining

---

## Data Model Changes

### New Backend Endpoints
```
GET /api/analytics/revenue-daily?range=7d|30d
GET /api/analytics/attendance-daily?range=7d|30d
GET /api/analytics/membership-breakdown
GET /api/payments/overdue?limit=10
GET /api/classes/today
GET /api/gym/occupancy
GET /api/analytics/monthly-progress
```

### New Database Tables
```sql
-- Gym capacity configuration
ALTER TABLE gyms ADD COLUMN max_capacity INTEGER DEFAULT 100;
ALTER TABLE gyms ADD COLUMN monthly_revenue_target DECIMAL(12,2);

-- Daily analytics cache (materialized for performance)
CREATE TABLE daily_analytics (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  date DATE NOT NULL,
  total_check_ins INTEGER DEFAULT 0,
  unique_members INTEGER DEFAULT 0,
  peak_hour INTEGER,
  revenue_membership DECIMAL(12,2) DEFAULT 0,
  revenue_pt DECIMAL(12,2) DEFAULT 0,
  revenue_supplement DECIMAL(12,2) DEFAULT 0,
  revenue_other DECIMAL(12,2) DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  UNIQUE(gym_id, date)
);
```

---

## Implementation Priority

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase 1** | Fix fake chart data, real membership breakdown | Backend analytics endpoints |
| **Phase 2** | Overdue payments widget, today's classes, revenue breakdown | Payment & class APIs |
| **Phase 3** | Occupancy meter, MTD vs target, staff attendance today | Gym config, check-in system |
| **Phase 4** | Renewal pipeline, onboarding queue, announcements | ML predictions, notification system |
| **Phase 5** | Customizable layout, presets, weather | Frontend-only |
