# Dashboard Design Plan — Gym Management Owner Dashboard

## Layout Philosophy
Each row = one business category. Owner sees everything at a glance, grouped by domain.
Grid: 12-column. Cards use `span 3`, `span 4`, `span 6`, `span 8`, `span 12` as needed.

---

## Row Structure

### ROW 0 — Header Bar (full width, single line)
| Element | Status | Notes |
|---|---|---|
| Greeting + date | ✅ EXISTS | Keep |
| KPI chips (Revenue, On Floor, Members, Sessions, Dues) | ✅ EXISTS | Keep |
| Refresh + LIVE pill | ✅ EXISTS | Keep |

---

### ROW 1 — Finance / Money Flow (full width insight)
| Card | Span | Status | Priority |
|---|---|---|---|
| **Money Flow Overview** (AreaChart: Income/Expenses/Profit, 1D/1W/1M/6M/1Y) | 8 | ✅ EXISTS | — |
| **Revenue Sources** breakdown bars (income by category) | 4 | ✅ EXISTS | — |

> Missing from this row:
> - **Expense Breakdown** (expenses by category — data already fetched, not displayed) → add as tab toggle inside Revenue Sources card

---

### ROW 2 — Members Row
| Card | Span | Status | Priority |
|---|---|---|---|
| **Membership Status** donut (Active/Expiring/Frozen/Expired) | 3 | ✅ EXISTS | — |
| **Expiring Soon** list (next 7 days) | 3 | ✅ EXISTS | — |
| **Overdue Payments** list | 3 | ✅ EXISTS (conditional) | Make always visible, show empty state |
| **New Signups Today** mini list | 3 | ❌ MISSING | Medium — pull from `data.newSignups` + recent signups |

> Currently these are scattered across rows 2, 3, 4. Consolidate all member cards here.

---

### ROW 3 — Trainers Row
| Card | Span | Status | Priority |
|---|---|---|---|
| **Trainer Schedule** (today's sessions) | 4 | ✅ EXISTS | — |
| **Top Trainers** performance (sessions + revenue) | 4 | ✅ EXISTS (conditional) | Make always visible |
| **Today's Classes** (upcoming/live/done) | 4 | ✅ EXISTS | — |

> Currently Today's Classes is mixed with member/finance cards. Move here as it is trainer-related content.

---

### ROW 4 — Equipment Row
| Card | Span | Status | Priority |
|---|---|---|---|
| **Equipment Status** overview (working/maintenance/broken counts) | 4 | ❌ MISSING | **HIGH** — Equipment page exists, API likely has data |
| **Maintenance Due** list (equipment needing service) | 4 | ❌ MISSING | **HIGH** — Pull from Equipment API |
| **Equipment Utilization** (which equipment used most) | 4 | ❌ MISSING | Medium — needs usage tracking |

> Equipment page (`/Equipment/Equipment.tsx`) exists. Dashboard shows zero equipment context.
> This entire row needs to be built.

---

### ROW 5 — Operations / Gym Health Row
| Card | Span | Status | Priority |
|---|---|---|---|
| **Occupancy Gauge** (current capacity %) | 3 | ✅ EXISTS | Move here from Row 2 |
| **Monthly Revenue Goal** progress bar | 3 | ✅ EXISTS | Move here from Row 2 |
| **Attendance Chart** (7-day bar chart) | 3 | ✅ EXISTS | Move here |
| **Quick Actions** (Add Member, Check-in, Payments, Classes, Trainers, Reports) | 3 | ✅ EXISTS | Move here |

---

### ROW 6 — Alerts / Activity Row
| Card | Span | Status | Priority |
|---|---|---|---|
| **Recent Activity** (latest check-ins & signups) | 4 | ✅ EXISTS (conditional) | Make always visible |
| **Birthdays Today** | 4 | ✅ EXISTS (conditional) | Make always visible (empty state if none) |
| **System Alerts** (low capacity warning, payment alerts, equipment alerts) | 4 | ❌ MISSING | Medium |

---

## Complete Section Audit

### ✅ PRESENT — Works fine
1. Money Flow Overview chart (Income/Expenses/Net Profit, period tabs)
2. Revenue Sources breakdown bars
3. Membership Status donut + legend
4. Expiring Soon list
5. Overdue Payments list
6. Trainer Schedule
7. Today's Classes
8. Occupancy gauge
9. Monthly Goal progress
10. Attendance bar chart
11. Quick Actions grid
12. Recent Activity feed
13. Top Trainers performance
14. Birthdays Today
15. KPI header strip (Revenue, On Floor, Members, Sessions, Dues)

### ❌ MISSING — Needs to be created
| # | Section | Row | Priority | Notes |
|---|---|---|---|---|
| 1 | **Equipment Status Overview** | Equipment Row | 🔴 HIGH | Cards: Working / Maintenance / Broken counts + % |
| 2 | **Maintenance Due List** | Equipment Row | 🔴 HIGH | Equipment items needing service, overdue maintenance |
| 3 | **Expense Breakdown** | Finance Row | 🟡 MEDIUM | Already fetched (`expenseStats`), needs a UI toggle in Revenue Sources |
| 4 | **New Signups Mini List** | Members Row | 🟡 MEDIUM | Recent 5 new members with photo/name/plan |
| 5 | **System Alerts Panel** | Alerts Row | 🟡 MEDIUM | Aggregated: expiring soon count, overdue count, equipment alerts |
| 6 | **Staff Overview Card** | Could be Row 3 | 🟡 MEDIUM | Staff page exists — show active staff count, on-duty today |

### ⚠️ PRESENT BUT CONDITIONAL (show even when empty)
| Section | Current Behavior | Fix |
|---|---|---|
| Overdue Payments | Hidden when 0 records | Show with empty state |
| Recent Activity | Hidden when 0 records | Show with empty state |
| Top Trainers | Hidden when 0 records | Show with empty state |
| Birthdays | Hidden when 0 records | Show with empty state |

---

## Final Target Grid Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ROW 0: HEADER (greeting + KPI chips + refresh + LIVE)      │
└─────────────────────────────────────────────────────────────┘
┌───────────────────────────────┬─────────────────────────────┐
│  Money Flow Overview    (8)   │  Revenue Sources        (4) │
│  AreaChart + period tabs      │  Income/Expense toggle bars │
└───────────────────────────────┴─────────────────────────────┘
┌───────────┬───────────┬───────────┬───────────────────────┐
│ Membership│ Expiring  │ Overdue   │  New Signups Today    │
│ Donut (3) │ Soon  (3) │ Payments  │  Mini List        (3) │
│           │           │    (3)    │                       │
└───────────┴───────────┴───────────┴───────────────────────┘
┌───────────────┬──────────────────┬─────────────────────────┐
│ Trainer       │ Top Trainers     │ Today's Classes         │
│ Schedule  (4) │ Performance  (4) │ Upcoming/Live/Done  (4) │
└───────────────┴──────────────────┴─────────────────────────┘
┌───────────────┬──────────────────┬─────────────────────────┐
│ Equipment     │ Maintenance Due  │ Equipment Utilization   │
│ Status    (4) │ List         (4) │ (or Staff Overview) (4) │
│ ❌ MISSING    │ ❌ MISSING       │ ❌ MISSING              │
└───────────────┴──────────────────┴─────────────────────────┘
┌───────────┬───────────┬───────────┬───────────────────────┐
│ Occupancy │ Monthly   │ Attendance│  Quick Actions        │
│ Gauge (3) │ Goal  (3) │ Chart (3) │  Grid          (3)    │
└───────────┴───────────┴───────────┴───────────────────────┘
┌───────────────┬──────────────────┬─────────────────────────┐
│ Recent        │ Birthdays        │ System Alerts           │
│ Activity  (4) │ Today        (4) │ Panel           (4)     │
│               │                  │ ❌ MISSING              │
└───────────────┴──────────────────┴─────────────────────────┘
```

---

## Implementation Priority

### Phase 1 — Restructure ✅ DONE
- [x] Fix Money Flow header to single row (compress)
- [x] Reorganize grid into 6 categorical rows (Finance, Members, Trainers, Equipment, Gym Ops, Alerts)
- [x] Make conditional cards always visible with empty states (Overdue, Recent Activity, Top Trainers, Birthdays)

### Phase 2 — Equipment Row ✅ DONE
- [x] Equipment Status card — 2×2 grid showing Active / Maintenance / Out of Order / Total counts (real API data)
- [x] Maintenance Due list — filters equipment with status MAINTENANCE, OUT_OF_ORDER, or nextMaintenanceDueDate within 7 days
- [x] Equipment by Category card — bar breakdown of inventory by STRENGTH / CARDIO / FUNCTIONAL / etc.
- [x] Wired to `equipmentApi.getStats()` + `equipmentApi.getAll()` — same API used by Equipment page

### Phase 3 — Enhancements (REMAINING)
- [ ] Add Expense Breakdown toggle in Revenue Sources card
- [ ] Add New Signups mini list in Members row
- [ ] Add System Alerts aggregated panel
- [ ] Add Staff Overview card (Staff page already exists)

---

## API Endpoints Used

| Section | Endpoint | Status |
|---|---|---|
| Equipment Status | `GET /owner/equipment/stats` | ✅ Working |
| Maintenance Due | `GET /owner/equipment` (filtered client-side) | ✅ Working |
| Equipment by Category | `GET /owner/equipment` (grouped client-side) | ✅ Working |
| New Signups | `GET /api/members?sort=createdAt&limit=5` | ❓ Phase 3 |
| Staff Overview | `GET /api/staff/summary` | ❓ Phase 3 |
| System Alerts | Aggregate from existing endpoints | ❓ Phase 3 |
