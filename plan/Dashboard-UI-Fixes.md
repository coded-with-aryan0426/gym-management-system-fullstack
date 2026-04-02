# Dashboard Pages UI Fixes — Comprehensive Priority Plan

**Goal:** Polish and fix all dashboard/overview pages across all portals to be active, well-designed, and consistent with the app's unified design system.

---

# ═══════════════════════════════════════════════════════════════
# SECTION 1 — OWNER DASHBOARD
# `frontend/src/pages/Dashboard/Dashboard.tsx` + `Dashboard.css`
# ═══════════════════════════════════════════════════════════════

## OWNER-P1 — CRITICAL (Broken / Blocking)

### O-1. Skeleton Layout Completely Mismatched with Real Page
**Severity:** CRITICAL — skeleton renders but looks wrong/broken

**Skeleton HTML** (lines 333–447) renders:
```
.dash__header--skeleton + .dash__kpi-row--skeleton
.dash__metrics--skeleton + .dash-metric-skeleton (6 cards)
.dash__charts-row--skeleton + .dash-chart-skeleton
.dash__lists-row--skeleton + .dash-list-skeleton (2 columns)
```

**Real page** renders:
```
.dash__header + inline .dash__kpi-row
.dash__grid + 12-column cards
```

**Missing CSS classes** (in skeleton HTML, no CSS definition):
`.dash__kpi-row--skeleton`, `.dash__header--skeleton`, `.dash__metrics--skeleton`, `.dash-metric-skeleton`, `.dash-metric-skeleton__top`, `.dash__charts-row--skeleton`, `.dash-chart-skeleton`, `.dash-chart-skeleton__header`, `.dash-chart-skeleton__body`, `.dash-chart-skeleton--sm`, `.dash-chart-skeleton__body .skeleton-bar`, `.dash-chart-skeleton .dash-pie-container`, `.dash-chart-skeleton .skeleton-pie`, `.dash__lists-row--skeleton`, `.dash-list-skeleton`, `.dash-list-skeleton__item`, `.dash-list-skeleton__content`, `.skeleton-icon-circle`, `.skeleton-avatar`, `.skeleton-icon-box`, `.skeleton-icon-box--sm`

**Fix:** Replace skeleton with one matching the real layout: header (greeting block) + `.dash__kpi-row` (4 skeleton KPI chips) + `.dash__grid` (3 skeleton cards).

---

### O-2. Dead CSS Classes — ~20 Classes Never Used in JSX
**Severity:** MEDIUM — dead code, maintenance burden

CSS classes defined in `Dashboard.css` but never referenced in `Dashboard.tsx` JSX:
- `.dash__charts-row` and ALL `.dash__charts-row *` variants
- `.dash__lists-row` and ALL `.dash__lists-row *` variants
- `.dash__card--span12`
- `.dash__count-badge`, `.dash__count-badge--amber`, `.dash__count-badge--rose`
- `.dash__class-row`, `.dash__class-row--*`, `.dash__class-time`, `.dash__class-info`, `.dash__class-name`, `.dash__class-meta`, `.dash__class-badge`, `.dash__class-badge--*`

**Fix:** Remove orphaned CSS blocks. These are the remnants of a previous layout system that no longer exists.

---

## OWNER-P2 — HIGH (Visual Polish)

### O-3. Hardcoded Fixed Card Heights — Will Overflow
**Severity:** HIGH — content inside fixed-height cards may be clipped

Fixed heights that should be `min-height` instead:
- `.dash__card--revenue`, `.dash__card--breakdown`: `height: 320px`
- `.dash__card--membership`, `.dash__card--expiring`, `.dash__card--overdue`, `.dash__card--activity`: `height: 280px`
- `.dash__card--trainers`, `.dash__card--top-trainers`, `.dash__card--schedule`: `height: 260px`
- `.dash__card--equip-status`, `.dash__card--equip-maintenance`, `.dash__card--equip-util`: `height: 260px`
- `.dash__card--metrics`, `.dash__card--attendance`: `height: 300px`
- `.dash__card--birthdays`, `.dash__card--actions`: `height: 240px`

Cards with static content (no scroll) will overflow. Cards with `.dash__list-scroll` are safe.

**Fix:** Replace `height: Npx` with `min-height: Npx` + `max-height: Npx` on all card types.

---

### O-4. Demo Sparklines Mislead Users
**Severity:** MEDIUM — fake trend lines shown as real data

```tsx
// On Floor, Members, Sessions KPIs all pass DEMO_SPARK when data isn't real:
spark: DEMO_SPARK,
spark: DEMO_SPARK.map(d => ({ v: d.v * 1.2 })),
spark: DEMO_SPARK.map(d => ({ v: d.v * 0.8 })),
```

**Fix:** Pass `spark: null` when no real sparkline data exists. The sparkline area renders empty with `null`.

---

## OWNER-P3 — MEDIUM (Consistency)

### O-5. Equipment Stat Boxes Inconsistent with Card System
**Severity:** MEDIUM — 2×2 grid of `.dash__equip-stat-box` has no hover, no glow, no border-radius matching `.dash__card`

The 4 equipment stat boxes (Active, Maintenance, Out of Order, Total) don't share the card's ambient glow, hover transform, or border system.

**Fix:** Either (a) wrap each in a `.dash__card`, or (b) add all card-like properties (hover transform, glow, consistent border) to `.dash__equip-stat-box`.

---

### O-6. Finance Card Header Crowded on Medium Screens
**Severity:** MEDIUM — 8 elements in one flex row overlap below 1400px

Elements in `.dash__mf-header`: icon, title, 5 period tabs, income stat, expenses stat, profit stat, margin stat, change badge — all in one line.

**Fix:** Break into two rows on medium screens (≤1200px): title+stats on row 1, period tabs on row 2.

---

### O-7. Dark Theme Tokens Are App-Isoland — Not Unified
**Severity:** MEDIUM — `var(--bg)` etc. differ from `unified-design-system.css`

```css
.dash { --bg: #060609; --s1: #0f0f18; --border: rgba(255,255,255,0.07); ... }
```

**Fix:** Map `--bg`, `--s1`, `--border`, `--text`, `--t2`, `--t3` to unified design system CSS variables. Use the dashboard tokens as an override layer scoped to `.dash`.

---

### O-8. KPI Chip Icon Sizes Inconsistent (18px vs 28px)
**Severity:** LOW — `.dash__kpi-icon` (header) is 18×18px vs `.dash__card-icon` (card header) is 28×28px.

**Fix:** Standardize on 16px icons for KPI chips and 20px for card headers.

---

### O-9. Quick Actions `color` Prop Not Validated
**Severity:** LOW — `.dash__action-btn--${a.color}` could break with invalid color

**Fix:** Use a `Record<string, CSSProperties>` for color values, or validate against an allowlist.

---

### O-10. `KPICard` Renders Empty When `value` is Undefined
**Severity:** LOW — blank chip when value is missing

```tsx
<span className="dash__kpi-value">{value}</span>  // empty when undefined
```

**Fix:** `{value || '—'}` or similar guard in KPICard.

---

### O-11. Row Labels Use Inline `style` Instead of CSS Class
**Severity:** LOW — inconsistent with grid span pattern

```tsx
<div className="dash__row-label" style={{ gridColumn: 'span 12' }}>
```

CSS already defines `.dash__row-label { grid-column: span 12; }`.

**Fix:** Remove inline `style` from all `.dash__row-label` divs.

---

### O-12. Equipment Row Label Tag is a Dead-End
**Severity:** LOW — `Go to Equipment page to manage` tells users to leave the current page

```tsx
<span className="dash__row-label-tag">Go to Equipment page to manage</span>
```

**Fix:** Either make it a link to `/equipment` or remove it.

---

### O-13. Empty State Fonts Too Small — Readability
**Severity:** MEDIUM — `.dash__empty-label` (12px) and `.dash__empty-hint` (~10px) are hard to read

**Fix:** Increase to minimum 14px label, 12px hint.

---

# ═══════════════════════════════════════════════════════════════
# SECTION 2 — TRAINER DASHBOARD
# `frontend/src/pages/trainer/TrainerDashboard.tsx`
# CSS: `frontend/src/styles/dashboard/dashboard-trainers.css`
# ═══════════════════════════════════════════════════════════════

**Architecture note:** Trainer dashboard uses shared skeleton components (`SkeletonPageHeader`, `SkeletonKPIGrid`, `SkeletonChart`, `SkeletonCard`, `SkeletonActivityFeed`) from `src/components/ui/Skeleton.tsx` — these are well-implemented and DO match the real layout. This is the correct approach that OWNER dashboard should adopt.

## TRAINER-P1 — CRITICAL

### T-1. `getMockData()` Returns Hardcoded Fake Data on API Failure
**Severity:** CRITICAL — user sees stale fake data with no indication of failure

```tsx
} catch (err) {
    console.error("Failed to fetch dashboard data", err);
    setData(getMockData());  // ← silently replaces with fake data
    setError("Syncing...");
}
```

The `catch` block silently falls back to hardcoded mock data (Emma Wilson, Sarah Johnson, Mike Davis sessions with fake data). User sees a "Syncing..." error badge but also completely wrong real data overlaid.

**Problems:**
1. Hardcoded fake names (`Emma Wilson`, `Sarah Johnson`) are obviously wrong
2. `setError("Syncing...")` is misleading — the error says "Syncing" but data loaded fine on previous runs
3. On subsequent renders, `data` is set to mock data, so the error badge may not even show
4. User navigates away thinking their dashboard is real

**Fix:** Remove `getMockData()` fallback entirely. Show a proper inline error state (`setError("Failed to load dashboard — retrying...")`), keep previous real data visible, and don't overwrite with fake data.

---

### T-2. Demo Sparklines in KPI Chips — Same Issue as Owner
**Severity:** HIGH — 4 fake trend lines shown as real data

The 4 KPI chips (Earnings, Sessions, Active Clients, Rating) always show sparklines with `DEMO_SPARK` or static values — none are computed from real data. The `monthlyEarningsHistory` is the only real chart data.

```tsx
// KPI chips always show static values, no real sparklines:
{ icon: <IndianRupee size={13} />, label: "Earnings",
  value: formatPrice(data.todayEarnings),  color: "emerald", },
// No spark prop at all — GOOD (spark is null)
```

**Actually:** KPI chips DON'T pass a `spark` prop at all — they just show value + label. This is BETTER than Owner dashboard. No fix needed for sparklines.

---

## TRAINER-P2 — HIGH

### T-3. Trainer Dashboard Uses Own Design Tokens — Not Unified
**Severity:** HIGH — duplicates OWNER dashboard's tokens in `dashboard-trainers.css`

```css
.dash--trainer {
  --bg: #060609;   /* duplicated from Dashboard.css */
  --s1: #0f0f18;  /* duplicated */
  --border: rgba(255,255,255,0.07);  /* duplicated */
  --text: #f0f0f8;  /* duplicated */
  ...
}
```

Both OWNER and TRAINER dashboards define the same token system independently. If the design system tokens change, both need manual updates.

**Fix:** Extract shared tokens into `dashboard-core.css` and have both `.dash` and `.dash--trainer` import from it. Use CSS custom property inheritance: `.dash { all: initial; }` then redefine only portal-specific tokens.

---

### T-4. Shared Skeleton Component CSS Not in `Skeleton.css`
**Severity:** MEDIUM — `SkeletonChart`, `SkeletonKPIGrid` CSS classes referenced but may not exist

`Skeleton.tsx` defines components using CSS classes like `.skeleton-kpi-grid`, `.skeleton-chart`, `.skeleton-chart__header`, `.skeleton-chart__body`, `.skeleton-metric-card`, etc. These must be defined in `Skeleton.css`.

**Fix:** Verify `src/components/ui/Skeleton.css` exists and contains all skeleton component styles. If missing, create it.

---

## TRAINER-P3 — MEDIUM (Consistency)

### T-5. KPI Chips Missing `sub` and `spark` Labels — Hard to Read at Glance
**Severity:** MEDIUM — KPI chips only show value + label, no trend context

```tsx
{ icon: <IndianRupee size={13} />, label: "Earnings",
  value: formatPrice(data.todayEarnings),  color: "emerald", },
// No `sub` prop, no change badge, no sparkline
```

Owner dashboard's KPI chips show `sub` text (e.g., "+12% vs last mo") and trend badges. Trainer chips are more minimal.

**Fix:** Add `sub` and `change` props to trainer KPI chips where data exists (e.g., "vs ₹1,200 yesterday" for earnings, "+1 vs yesterday" for sessions).

---

### T-6. Inline `style={{ gridColumn: 'span N' }}` on Skeleton Grid Items
**Severity:** LOW — skeleton grid uses inline styles instead of CSS classes

```tsx
<div style={{ gridColumn: 'span 8' }}>  {/* should be className="dash__card--span8" */}
```

Skeleton grid in Trainer dashboard uses inline `style` for column spans. Should use CSS classes for consistency and maintainability.

**Fix:** Add CSS classes (`.skeleton-chart-card`, `.skeleton-list-card`) or use existing `.dash__card--span8` classes.

---

### T-7. Rating KPI Chip is Hardcoded "4.9" — Not Real Data
**Severity:** LOW — trainer rating is always 4.9 regardless of real data

```tsx
{ icon: <Star size={13} />, label: "Rating",
  value: "4.9",  color: "amber", alert: false, },
```

No real API call fetches trainer rating. It's hardcoded.

**Fix:** Either fetch real rating from `api.getTrainerDashboard()` or remove this KPI chip until real data is available.

---

# ═══════════════════════════════════════════════════════════════
# SECTION 3 — MEMBER DASHBOARD
# `frontend/src/pages/member/MemberDashboard.tsx`
# CSS: `frontend/src/styles/dashboard/dashboard-members.css`
# ═══════════════════════════════════════════════════════════════

**Architecture note:** Member dashboard uses the same shared skeleton components (`SkeletonPageHeader`, `SkeletonKPIGrid`, `SkeletonChart`, `SkeletonCard`) from `src/components/ui/Skeleton.tsx` — same quality as Trainer. Uses `MemberDashboard.css` for overrides.

## MEMBER-P1 — CRITICAL

### M-1. Error State Shows "Failed to Load" Without Recovering
**Severity:** HIGH — API failure leaves user with FALLBACK_DASHBOARD (all zeros) permanently

```tsx
} catch (err) {
    console.warn("[MemberDashboard]", err)
    setError("Failed to load")
    setDashboard(prev => ({
        ...prev,
        memberName: user?.fullName || "Member",
        memberId: user?.userId || (user?.id ? Number(user.id) : 0)
    }))
}
```

The catch block:
1. Does NOT set `data` to valid content (FALLBACK_DASHBOARD stays)
2. Shows "Failed to load" but does NOT attempt retry
3. Does NOT show previous valid data
4. FALLBACK_DASHBOARD has all-zero values (`workoutsThisMonth: 0`, `streakDays: 0`, etc.) — user sees a broken-looking dashboard

**Compare with Trainer dashboard:** Trainer falls back to `getMockData()` with fake but realistic-looking data, so the dashboard still looks functional.

**Fix:** On API failure: (a) keep previous valid `dashboard` state visible, (b) show inline error with retry, (c) after 30s auto-retry. Don't overwrite dashboard with all-zero fallback.

---

### M-2. FALLBACK_DASHBOARD All-Zeros is Misleading
**Severity:** MEDIUM — showing 0 workouts, 0 streak, 0 calories looks like the app is broken

```tsx
const FALLBACK_DASHBOARD: DashboardData = {
    workoutsThisMonth: 0,
    streakDays: 0,
    caloriesBurned: 0,
    ...
}
```

When API fails (or before first load completes), the user sees 0s across all KPIs — indistinguishable from a real "no activity yet" state. There's no visual distinction between "loading" and "no data yet."

**Fix:** Use a `status: 'loading' | 'error' | 'success'` state, and render different UIs for each. Don't show FALLBACK_DASHBOARD's zeros during initial loading.

---

### M-3. Demo Sparklines in KPI Chips — Same Issue
**Severity:** MEDIUM — 4 fake sparklines shown for Workouts, Streak, Calories, Booked

```tsx
{ icon: <Dumbbell size={13} />, label: "Workouts",
  value: dashboard.workoutsThisMonth,
  sub: "This month", color: "blue",
  spark: DEMO_SPARK,  // ← fake, shown as if real
},
```

**Fix:** Only render sparkline when real historical data exists. Pass `spark: null` otherwise.

---

## MEMBER-P2 — HIGH

### M-4. Member Dashboard Uses Own Design Tokens — Same Token Duplication
**Severity:** HIGH — same issue as Trainer dashboard

`dashboard-members.css` re-defines the same tokens (`--bg`, `--text`, `--t2`, etc.) independently. Same fix approach as T-3.

---

### M-5. Shared Skeleton CSS Likely Missing
**Severity:** MEDIUM — same as T-4

Verify `src/components/ui/Skeleton.css` exists and covers all skeleton components used by Member dashboard.

---

### M-6. Skeleton Grid Uses Inline `style` for Column Spans
**Severity:** LOW — skeleton uses `style={{ gridColumn: 'span 8' }}` instead of CSS classes

Same issue as T-6. Should use CSS classes for skeleton grid items.

---

### M-7. `PremiumTooltip` and `premium-*` CSS Classes Not Scoped
**Severity:** MEDIUM — many `.premium-*` classes used in JSX but may not be defined

Member dashboard uses classes like `.premium-tooltip`, `.premium-tooltip-date`, `.premium-period-toggle`, `.premium-period-btn`, `.premium-radar-chart`, `.premium-empty-state`, etc. These are likely defined in `MemberDashboard.css` or `dashboard-members.css`.

**Fix:** Verify all `.premium-*` classes referenced in JSX are defined in CSS files.

---

### M-8. Avatar Component Import Inconsistency
**Severity:** LOW — `TrainerDashboard` imports `Avatar` from `../../components/shared/UnifiedComponents`, but `MemberDashboard` imports from `../../components/ui/Avatar`

Two different Avatar components used across dashboards.

**Fix:** Standardize on one Avatar component (preferably the shared one).

---

# ═══════════════════════════════════════════════════════════════
# CROSS-CUTTING ISSUES (Affect All Dashboards)
# ═══════════════════════════════════════════════════════════════

### X-1. All Three Dashboards Share Same Token Duplication Problem
**Severity:** HIGH — OWNER, TRAINER, and MEMBER all define identical CSS token systems independently

**Fix:** Extract shared tokens into `frontend/src/styles/dashboard/_tokens.css`:
```css
/* Shared dark tokens */
:root[data-theme="dark"],
.dark {
  --dash-bg:     #060609;
  --dash-surface: #0f0f18;
  --dash-border: rgba(255,255,255,0.07);
  --dash-text:   #f0f0f8;
  --dash-text-2: #a8a8c8;
  --dash-text-3: #7070a0;
  /* Accent colors */
  --dash-green:  #10b981;
  --dash-blue:  #3b82f6;
  ...
}
```
Then each portal's CSS imports this and overrides only portal-specific values.

---

### X-2. All Skeleton Grids Use Inline `style` Instead of CSS Classes
**Severity:** LOW — inline styles for grid spans are harder to maintain

Both Trainer and Member skeleton sections use `style={{ gridColumn: 'span N' }}` instead of CSS classes like `.dash__card--span8`.

**Fix:** Add `.skeleton-card--span8 { grid-column: span 8; }` etc. to `Skeleton.css`.

---

### X-3. Unified `Skeleton` Component CSS Missing
**Severity:** MEDIUM — `Skeleton.tsx` defines components but their CSS classes may not be in `Skeleton.css`

All three dashboards import `SkeletonPageHeader`, `SkeletonKPIGrid`, `SkeletonChart`, etc. from `src/components/ui/Skeleton.tsx`. The CSS for these components should be in `src/components/ui/Skeleton.css`. **Verify this file exists and covers all component styles.**

---

### X-4. All Three Dashboards Have Fixed Card Heights (Same Issue)
**Severity:** HIGH — same as O-3, likely replicated in all three

Check each portal's CSS for `height: Npx` on `.dash__card` and variants.

**Fix:** Replace with `min-height` / `max-height`.

---

# ═══════════════════════════════════════════════════════════════
# COMPREHENSIVE SUMMARY TABLE
# ═══════════════════════════════════════════════════════════════

| ID | Issue | Portal | Severity | Fix Effort |
|----|-------|--------|----------|-----------|
| O-1 | Skeleton completely mismatched with real layout | OWNER | CRITICAL | High |
| O-2 | ~20 dead CSS classes | OWNER | MEDIUM | Low |
| O-3 | Fixed card heights cause overflow | ALL | HIGH | Medium |
| O-4 | Demo sparklines misleading | OWNER | MEDIUM | Low |
| O-5 | Equipment stat boxes inconsistent | OWNER | MEDIUM | Medium |
| O-6 | Finance header crowded on medium screens | OWNER | MEDIUM | Low |
| O-7 | Dark theme not unified with app design system | ALL | MEDIUM | High |
| O-8 | KPI chip icon sizes inconsistent | OWNER | LOW | Low |
| O-9 | Quick Actions color prop not validated | OWNER | LOW | Low |
| O-10 | KPICard renders blank when value missing | OWNER | LOW | Low |
| O-11 | Row labels use inline style instead of CSS | OWNER | LOW | Low |
| O-12 | Equipment row label has unhelpful tag | OWNER | LOW | Low |
| O-13 | Empty state fonts too small (10-12px) | OWNER | MEDIUM | Low |
| T-1 | getMockData() silently falls back to fake data | TRAINER | CRITICAL | Medium |
| T-2 | Demo sparklines (already mitigated — no spark prop) | TRAINER | MEDIUM | N/A |
| T-3 | Own design tokens (not unified with OWNER) | TRAINER | HIGH | High |
| T-4 | Skeleton CSS classes may be missing | TRAINER | MEDIUM | Medium |
| T-5 | KPI chips missing sub/change context | TRAINER | MEDIUM | Low |
| T-6 | Skeleton grid uses inline style | TRAINER | LOW | Low |
| T-7 | Rating KPI hardcoded to "4.9" | TRAINER | LOW | Low |
| M-1 | Error state shows zeros permanently without retry | MEMBER | HIGH | Medium |
| M-2 | FALLBACK_DASHBOARD all-zeros indistinguishable from real | MEMBER | MEDIUM | Low |
| M-3 | Demo sparklines in KPI chips | MEMBER | MEDIUM | Low |
| M-4 | Own design tokens (not unified) | MEMBER | HIGH | High |
| M-5 | Skeleton CSS classes may be missing | MEMBER | MEDIUM | Medium |
| M-6 | Skeleton grid uses inline style | MEMBER | LOW | Low |
| M-7 | premium-* CSS classes may not be defined | MEMBER | MEDIUM | Medium |
| M-8 | Two different Avatar components across portals | TRAINER/MEMBER | LOW | Low |
| X-1 | Shared token duplication across all portals | ALL | HIGH | High |
| X-2 | Skeleton grids use inline style across all | ALL | LOW | Low |
| X-3 | Skeleton CSS file needs verification | ALL | MEDIUM | Medium |
| X-4 | Fixed heights likely in all portals | ALL | HIGH | Medium |

---

# RECOMMENDED EXECUTION ORDER

## Phase 1 — Critical Fixes (Do First)
1. **T-1** (Trainer) — Remove silent mock data fallback, fix error state
2. **M-1** (Member) — Fix permanent zero-state on API failure, add retry
3. **O-1** (Owner) — Rewrite skeleton to match real layout + shared skeleton
4. **X-3** — Verify/create `Skeleton.css` covering all shared components

## Phase 2 — Token Unification (High Impact)
5. **X-1** — Extract shared `_tokens.css` and unify all three dashboards
6. **T-3** (Trainer) — Remove duplicate tokens after X-1
7. **M-4** (Member) — Remove duplicate tokens after X-1
8. **O-7** (Owner) — Replace tokens after X-1

## Phase 3 — Visual Polish (Quick Wins)
9. **O-4** (Owner) — Fix demo sparklines
10. **M-3** (Member) — Fix demo sparklines
11. **O-13** (Owner) — Increase empty state fonts
12. **T-7** (Trainer) — Replace hardcoded "4.9" rating with real data or remove
13. **T-5** (Trainer) — Add sub/change context to KPI chips
14. **O-10** (Owner) — Fix KPICard empty value
15. **O-8, O-9, O-11, O-12** (Owner) — Small consistency fixes

## Phase 4 — Layout & Structure
16. **O-3** (Owner) — Replace fixed heights with min-height
17. **X-4** — Check and fix fixed heights in Trainer + Member
18. **O-5** (Owner) — Make equipment stat boxes consistent
19. **O-6** (Owner) — Break finance header into 2 rows on medium screens
20. **T-6, M-6** — Replace skeleton inline styles with CSS classes
21. **M-7** — Verify all premium-* CSS classes exist
22. **M-8** — Standardize on single Avatar component
23. **O-2** (Owner) — Remove dead CSS classes

---

# ═══════════════════════════════════════════════════════════════
# SECTION 4 — DESIGN SYSTEM UNIFICATION
# ═══════════════════════════════════════════════════════════════

## ARCHITECTURE: EXISTING UNIFIED DESIGN SYSTEM

The app **already has** a comprehensive `unified-design-system.css` at `frontend/src/styles/unified-design-system.css` with full dark/light mode tokens:

```css
/* Dark mode (default) */
:root {
  --bg-primary:    #0D0D12;
  --bg-secondary: #17171E;
  --bg-tertiary:  #20202A;
  --bg-glass:     rgba(255, 255, 255, 0.05);
  --accent-blue:  #3B9EFF;
  --accent-green: #2ECC72;
  --accent-red:   #FF4F44;
  --accent-purple:#BF6FEF;
  --accent-orange:#FF9A00;
  --text-primary: #F0F0F5;
  --text-secondary:rgba(240, 240, 245, 0.72);
  --text-tertiary:rgba(240, 240, 245, 0.45);
  --border-main:  rgba(255, 255, 255, 0.14);
  --shadow-md:    0 8px 24px rgba(0, 0, 0, 0.5);
  --radius-lg:    16px;
}

/* Light mode — activated via .theme-light class */
:root.theme-light {
  --bg-primary:    #F0F2F5;
  --bg-secondary: #FFFFFF;
  --bg-tertiary:  #E4E7ED;
  --accent-blue:  #0A6EE8;
  --accent-green: #12A550;
  --text-primary: #111827;
  --text-secondary:#374151;
  --text-tertiary:#6B7280;
  --border-main:  #D1D5DB;
  --shadow-md:    0 4px 16px rgba(0, 0, 0, 0.12);
}
```

**The problem:** Owner dashboard (Dashboard.css) defines its own completely separate token set using different names (`--bg`, `--bg2`, `--text`) instead of using the unified system tokens (`--bg-primary`, `--bg-secondary`, `--text-primary`). This means:
1. Two separate dark/light mode systems exist
2. Changes to the unified design system won't affect the Dashboard
3. Light mode is incomplete in the Owner dashboard

---

## DS-1. Owner Dashboard Uses Siloed Dark Theme Only — Not Unified
**Severity:** CRITICAL — two separate token systems, no light mode

The Owner dashboard (`Dashboard.css`) defines its own tokens that do NOT map to `unified-design-system.css`:

```css
/* Owner dashboard's own isolated tokens */
.dash {
  --bg:      #060609;   /* NOT --bg-primary */
  --bg2:     #0a0a10;   /* NOT --bg-secondary */
  --s1:      #0f0f18;  /* NOT --bg-tertiary */
  --text:    #f0f0f8;   /* NOT --text-primary */
  --t2:      #b0b0c8;   /* NOT --text-secondary */
  --t3:      #7070a0;  /* NOT --text-tertiary */
  --border:  rgba(255,255,255,0.07); /* NOT --border-main */
  ...
}
```

These map to the unified design system as:

| Dashboard token | Unified token | Light mode value needed |
|---|---|---|
| `--bg` | `--bg-primary` | `#F0F2F5` |
| `--bg2` | `--bg-secondary` | `#FFFFFF` |
| `--s1` | `--bg-tertiary` | `#E4E7ED` |
| `--text` | `--text-primary` | `#111827` |
| `--t2` | `--text-secondary` | `#374151` |
| `--t3` | `--text-tertiary` | `#6B7280` |
| `--border` | `--border-main` | `#D1D5DB` |

**Fix:** Replace all `.dash { --bg: #060609; ... }` with unified tokens. Add light mode via `.theme-light .dash { ... }` using the light mode values above. The unified system already defines both.

---

## DS-2. Owner Dashboard Has No Light Mode Implementation
**Severity:** CRITICAL — only dark mode works

The Owner dashboard CSS defines dark mode at `.dash { ... }` but has NO `.theme-light` override block. The light mode comment block at line 1241 (`--bg: #f0f2f7`) exists but is NOT scoped to `.theme-light` — it's just dead code.

**Fix:** Wrap the light mode overrides in `.theme-light .dash { ... }` block and use the unified system light mode tokens.

---

## DS-3. Owner Dashboard `--s1` Surface Color Inconsistent
**Severity:** MEDIUM — `--s1` (#0f0f18) is used for card backgrounds but unified system uses `--bg-tertiary` (#20202A)

The Owner dashboard mixes `--bg2` (#0a0a10) and `--s1` (#0f0f18) for different surfaces without clear hierarchy. Unified system uses 4 levels: `--bg-primary` → `--bg-secondary` → `--bg-tertiary` → `--bg-elevated`.

**Fix:** Map `--bg2` → `--bg-secondary`, `--s1` → `--bg-tertiary` to match unified system hierarchy.

---

## DS-4. Trainer Dashboard Uses Partial Light Mode But Own Tokens
**Severity:** MEDIUM — Trainer has `.theme-light .dash--trainer { ... }` but uses own tokens

The Trainer dashboard correctly scopes light mode with `.theme-light .dash--trainer { ... }`, but uses its own tokens (`--bg`, `--bg2`, `--text`) instead of unified system tokens.

**Fix:** Same as DS-1 — replace Trainer's `.dash--trainer { --bg: #060609; }` with unified tokens, keep the existing `.theme-light` scoping.

---

## DS-5. Member Dashboard Token Scope Unknown — Needs Verification
**Severity:** MEDIUM — check if Member dashboard uses `.theme-light` or its own tokens

**Fix:** Verify `dashboard-members.css` uses unified tokens. If it uses its own tokens, apply the same fix as DS-1.

---

## DS-6. Accent Color Palette — Dashboard Uses Different Brand Names
**Severity:** MEDIUM — inconsistent color naming across portals

| Portal | Blue | Green | Red | Purple |
|---|---|---|---|---|
| Unified system | `--accent-blue` (#3B9EFF) | `--accent-green` (#2ECC72) | `--accent-red` (#FF4F44) | `--accent-purple` (#BF6FEF) |
| Owner dashboard | `--blue` (#2563eb) | `--green` (#16a34a) | `--red` (#dc2626) | `--violet` (#7c3aed) |

Each portal uses slightly different accent shades. When unified, all dashboards should use the unified accent tokens.

**Fix:** Replace portal-specific color values with unified system tokens. For gradient backgrounds that use hardcoded colors, extract to CSS custom properties.

---

# ═══════════════════════════════════════════════════════════════
# SECTION 5 — VISUAL POLISH: MAKING DASHBOARDS ACTIVE & COLORFUL
# ═══════════════════════════════════════════════════════════════

**Goal:** Transform the dashboards from flat, dark, static pages into dynamic, vibrant, engaging experiences that work beautifully in both dark and light modes.

---

## VP-1. Add Ambient Gradient Backgrounds to Cards
**Severity:** MEDIUM — cards are flat solid surfaces, no depth or energy

**Current state:** Cards use solid `--bg2` or `--s1` backgrounds with no gradient overlays.

**Proposed fix:** Add subtle gradient overlays to card headers and hover states:

```css
/* Dark mode — subtle inner glow on card top */
.dash__card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: linear-gradient(
    180deg,
    rgba(var(--accent-blue-rgb), 0.08) 0%,
    transparent 100%
  );
  border-radius: inherit;
  pointer-events: none;
}

/* Light mode — warm subtle tint */
.theme-light .dash__card::before {
  background: linear-gradient(
    180deg,
    rgba(var(--accent-blue-rgb), 0.06) 0%,
    transparent 100%
  );
}
```

**Effort:** Low — add ~10 lines of CSS per portal.

---

## VP-2. KPI Chips Need Micro-Animations on Value Change
**Severity:** MEDIUM — static KPI values feel dead

**Current state:** KPI values update without any animation — jarring, no sense of change.

**Proposed fix:** Add CSS counter animation when values change:

```css
.dash__kpi-value {
  transition: color 0.3s ease;
}
.dash__kpi-value.updating {
  animation: kpiPulse 0.4s ease-out;
}
@keyframes kpiPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); color: var(--accent-green); }
  100% { transform: scale(1); }
}
```

Add a `useEffect` in the dashboard component that adds `.updating` class when KPI values change.

**Effort:** Low — CSS + small JS change.

---

## VP-3. Add Sparkline Animations on Data Load
**Severity:** MEDIUM — sparklines appear instantly with no drawing animation

**Current state:** Sparklines render instantly, feeling static.

**Proposed fix:** Add SVG stroke-dashoffset animation:

```css
.dash__sparkline-path {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawSparkline 1s ease-out forwards;
}
@keyframes drawSparkline {
  to { stroke-dashoffset: 0; }
}
```

**Effort:** Low — CSS only.

---

## VP-4. Card Hover States Need More Energy
**Severity:** MEDIUM — current hover is subtle, should feel responsive

**Current state:** Cards have `transform: translateY(-2px)` on hover — barely noticeable.

**Proposed fix:** Add glow + lift + border color shift:

```css
/* Dark mode */
.dash__card {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.2s ease,
              box-shadow 0.25s ease;
}
.dash__card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(var(--accent-blue-rgb), 0.5);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4),
              0 0 20px rgba(var(--accent-blue-rgb), 0.15);
}

/* Light mode */
.theme-light .dash__card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12),
              0 0 15px rgba(var(--accent-blue-rgb), 0.1);
}
```

**Effort:** Low — CSS only.

---

## VP-5. Add Entrance Animations for Cards on Page Load
**Severity:** MEDIUM — all cards appear simultaneously, no sense of choreography

**Current state:** Dashboard renders all cards at once with no stagger.

**Proposed fix:** Use CSS `animation-delay` with `nth-child` for stagger effect:

```css
.dash__card {
  opacity: 0;
  transform: translateY(16px);
  animation: cardEntrance 0.4s ease-out forwards;
}
/* Stagger each card by 50ms */
.dash__card:nth-child(1)  { animation-delay: 0ms; }
.dash__card:nth-child(2)  { animation-delay: 50ms; }
.dash__card:nth-child(3)  { animation-delay: 100ms; }
.dash__card:nth-child(4)  { animation-delay: 150ms; }
/* ... continue for all cards */

@keyframes cardEntrance {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Effort:** Low — CSS only.

---

## VP-6. Status Badges Need More Visual Identity
**Severity:** MEDIUM — status badges (active, pending, overdue) use same style

**Current state:** All badges use same color. "Active" and "Overdue" should be instantly distinguishable.

**Proposed fix:** Add icon + stronger color to status badges:

```css
.dash__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.dash__badge--active {
  background: rgba(var(--accent-green-rgb), 0.18);
  color: var(--accent-green);
  border: 1px solid rgba(var(--accent-green-rgb), 0.3);
}
.dash__badge--overdue {
  background: rgba(var(--accent-red-rgb), 0.18);
  color: var(--accent-red);
  border: 1px solid rgba(var(--accent-red-rgb), 0.3);
}
```

**Effort:** Low — CSS + check JSX badge classes.

---

## VP-7. Error States Need to Be More Visible and Recoverable
**Severity:** HIGH — error messages are subtle, easy to miss

**Current state:** Trainer and Member dashboards show minimal error states ("Syncing..." or "Failed to load").

**Proposed fix:** Replace subtle error states with inline banner that auto-retries:

```css
.dash__error-banner {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: rgba(var(--accent-red-rgb), 0.12);
  border: 1px solid rgba(var(--accent-red-rgb), 0.3);
  border-radius: var(--radius-md);
  color: var(--accent-red);
  font-size: 13px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}
.dash__error-banner__icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(var(--accent-red-rgb), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dash__error-banner__retry {
  margin-left: auto;
  padding: 4px 12px;
  background: rgba(var(--accent-red-rgb), 0.15);
  border: 1px solid rgba(var(--accent-red-rgb), 0.4);
  border-radius: 6px;
  color: var(--accent-red);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.dash__error-banner__retry:hover {
  background: rgba(var(--accent-red-rgb), 0.25);
}
```

**Effort:** Medium — CSS + JSX error banner component.

---

## VP-8. Loading States Should Be Skeleton Screens, Not Spinners
**Severity:** MEDIUM — existing skeleton is mismatched (see O-1, T-1, M-1)

This was covered in O-1 (Owner skeleton mismatch) but the fix should be extended to Trainer and Member as well.

**Proposed fix (cross-portal):** Replace skeleton return with `SkeletonPage` component from `src/components/ui/Skeleton.tsx` which is already well-implemented.

**Effort:** Low — replace JSX skeleton return with `SkeletonPage` component.

---

## VP-9. Tables and Lists Need Row Hover Highlighting
**Severity:** LOW — table rows have no hover feedback

**Current state:** Tables show no highlight when hovering over rows.

**Proposed fix:**

```css
.dash__table tr {
  transition: background 0.15s ease;
}
.dash__table tr:hover td {
  background: rgba(var(--accent-blue-rgb), 0.06);
}
/* Light mode */
.theme-light .dash__table tr:hover td {
  background: rgba(var(--accent-blue-rgb), 0.05);
}
```

**Effort:** Low — CSS only.

---

## VP-10. Empty States Should Be Illustrated and Engaging
**Severity:** MEDIUM — empty states are just small text

**Current state:** Empty lists show tiny 10-12px text ("No active sessions", "No upcoming classes").

**Proposed fix:** Create reusable `EmptyState` component:

```tsx
// components/ui/EmptyState.tsx
const EmptyState: FC<{ icon: ReactNode; title: string; hint?: string }> = ({ icon, title, hint }) => (
  <div className="empty-state">
    <div className="empty-state__icon">{icon}</div>
    <div className="empty-state__title">{title}</div>
    {hint && <div className="empty-state__hint">{hint}</div>}
  </div>
);

.css:
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-8);
  text-align: center;
}
.empty-state__icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(var(--accent-blue-rgb), 0.1);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent-blue);
  font-size: 24px;
}
.empty-state__title {
  font-size: 15px; font-weight: 600;
  color: var(--text-primary);
}
.empty-state__hint {
  font-size: 13px;
  color: var(--text-tertiary);
}
```

**Effort:** Low — one reusable component.

---

## VP-11. Finance Card — Period Tabs Need Active State Glow
**Severity:** LOW — active period tab has no visual distinction beyond color

**Current state:** Active tab uses `.tab--active` class but only changes background.

**Proposed fix:** Add accent border-bottom + subtle glow to active tab:

```css
.dash__mf-tab {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--t2);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.dash__mf-tab:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,0.06);
}
.dash__mf-tab--active {
  color: var(--accent-blue);
  background: rgba(var(--accent-blue-rgb), 0.12);
  border-color: rgba(var(--accent-blue-rgb), 0.3);
  box-shadow: 0 0 12px rgba(var(--accent-blue-rgb), 0.2);
}
```

**Effort:** Low — CSS only.

---

## VP-12. Add Subtle Background Gradient Orbs (Like Unified System)
**Severity:** LOW — dashboard lacks the premium ambient backgrounds of other pages

The unified design system adds radial gradient orbs behind page content (`::before` and `::after` on `.unified-page`). Owner dashboard should add the same:

```css
.dash::before {
  content: '';
  position: fixed;
  top: -20%;
  right: -15%;
  width: 70%;
  height: 70%;
  background: radial-gradient(
    circle,
    rgba(var(--accent-blue-rgb), 0.06) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 0;
}
.dash::after {
  content: '';
  position: fixed;
  bottom: -15%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(
    circle,
    rgba(var(--accent-purple-rgb), 0.04) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 0;
}
```

Add light mode equivalents that use softer, warmer tones.

**Effort:** Low — CSS only.

---

## VP-13. Quick Actions Buttons Need Hover Ripple Effect
**Severity:** LOW — action buttons feel flat on hover

**Current state:** Action buttons change color on hover but have no depth.

**Proposed fix:** Add scale + shadow on hover:

```css
.dash__action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--s1);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}
.dash__action-btn:hover {
  transform: translateY(-2px) scale(1.02);
  border-color: rgba(var(--accent-blue-rgb), 0.4);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3),
              0 0 15px rgba(var(--accent-blue-rgb), 0.1);
}
```

**Effort:** Low — CSS only.

---

# ═══════════════════════════════════════════════════════════════
# SECTION 6 — ACCESSIBILITY (WCAG 2.2 AA)
# ═══════════════════════════════════════════════════════════════

## A11Y-1. Color Contrast — Multiple Elements Fail WCAG AA
**Severity:** HIGH — many text/bg combinations don't meet 4.5:1 ratio

**Check required:** Run `axe` or WebAIM Contrast Checker on each dashboard in both dark and light modes. Priority fixes:

| Element | Current | Needed (AA) |
|---|---|---|
| `.dash__kpi-label` on `--bg2` | Unknown | 4.5:1 |
| `.dash__empty-label` (#7070a0 on #0a0a10) | ~3.0:1 FAIL | 4.5:1 |
| `.dash__badge` on card bg | Unknown | 4.5:1 |
| Secondary text on light mode bg | Unknown | 4.5:1 |

**Fix:** After unifying tokens (DS-1), test all combinations. The unified design system was likely built to WCAG AA standards, but custom overrides may have broken ratios.

---

## A11Y-2. All Interactive Elements Need Visible Focus Indicators
**Severity:** HIGH — keyboard-only users can't see where they are

**Check required:** Tab through each dashboard and verify every interactive element has a visible focus ring.

Common missing focus states in dashboards:
- Period tabs (`.dash__mf-tab`)
- Quick action buttons (`.dash__action-btn`)
- Pagination buttons (`.dash__page-btn`)
- Sort headers (`.dash__table__sortable`)

**Fix:** Add to CSS:
```css
.dash__mf-tab:focus-visible,
.dash__action-btn:focus-visible,
.dash__page-btn:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
}
```

---

## A11Y-3. Loading States Must Announce to Screen Readers
**Severity:** MEDIUM — skeleton screens need `aria-busy="true"` and `role="status"`

**Check required:** Verify skeleton sections have `aria-busy="true"` on the container and `aria-live="polite"` region for screen reader announcements.

**Fix:** Ensure skeleton JSX:
```tsx
<div aria-busy="true" aria-label="Loading dashboard">
  <SkeletonPage ... />
</div>
```

---

## A11Y-4. Charts and Visual Data Need Text Alternatives
**Severity:** MEDIUM — sparklines, pie charts, and bar charts have no text alternatives

**Current state:** Charts render SVG elements with no `aria-label` or `aria-describedby`.

**Fix:** Add `aria-label` to all SVG/chart elements:
```tsx
<SparklineChart
  data={sparkData}
  aria-label={`Trend for ${label}: ${trend}% change`}
/>
```

The KPI chip's text content (`value + label`) already serves as the accessible name for the sparkline if the sparkline is decorative (`aria-hidden="true"`).

---

## A11Y-5. Page Title Must Be Unique and Descriptive
**Severity:** LOW — dashboards may all use same `<title>` or no `<title>`

**Fix:** Ensure each dashboard sets a unique title:
```tsx
useEffect(() => {
  document.title = 'Trainer Dashboard | GymPro';
}, []);
```

---

# ═══════════════════════════════════════════════════════════════
# UPDATED SUMMARY TABLE (All Sections)
# ═══════════════════════════════════════════════════════════════

| ID | Issue | Portal | Severity | Fix Effort |
|----|-------|--------|----------|-----------|
| O-1 | Skeleton completely mismatched with real layout | OWNER | CRITICAL | High |
| O-2 | ~20 dead CSS classes | OWNER | MEDIUM | Low |
| O-3 | Fixed card heights cause overflow | ALL | HIGH | Medium |
| O-4 | Demo sparklines misleading | OWNER | MEDIUM | Low |
| O-5 | Equipment stat boxes inconsistent | OWNER | MEDIUM | Medium |
| O-6 | Finance header crowded on medium screens | OWNER | MEDIUM | Low |
| O-7 | Dark theme not unified (see DS-1) | ALL | MEDIUM | High |
| O-8 | KPI chip icon sizes inconsistent | OWNER | LOW | Low |
| O-9 | Quick Actions color prop not validated | OWNER | LOW | Low |
| O-10 | KPICard renders blank when value missing | OWNER | LOW | Low |
| O-11 | Row labels use inline style instead of CSS | OWNER | LOW | Low |
| O-12 | Equipment row label has unhelpful tag | OWNER | LOW | Low |
| O-13 | Empty state fonts too small (10-12px) | OWNER | MEDIUM | Low |
| T-1 | getMockData() silently falls back to fake data | TRAINER | CRITICAL | Medium |
| T-2 | Demo sparklines (already mitigated) | TRAINER | MEDIUM | N/A |
| T-3 | Own design tokens (see DS-4) | TRAINER | HIGH | High |
| T-4 | Skeleton CSS classes may be missing | TRAINER | MEDIUM | Medium |
| T-5 | KPI chips missing sub/change context | TRAINER | MEDIUM | Low |
| T-6 | Skeleton grid uses inline style | TRAINER | LOW | Low |
| T-7 | Rating KPI hardcoded to "4.9" | TRAINER | LOW | Low |
| M-1 | Error state shows zeros permanently without retry | MEMBER | HIGH | Medium |
| M-2 | FALLBACK_DASHBOARD all-zeros indistinguishable | MEMBER | MEDIUM | Low |
| M-3 | Demo sparklines in KPI chips | MEMBER | MEDIUM | Low |
| M-4 | Own design tokens (see DS-5) | MEMBER | HIGH | High |
| M-5 | Skeleton CSS classes may be missing | MEMBER | MEDIUM | Medium |
| M-6 | Skeleton grid uses inline style | MEMBER | LOW | Low |
| M-7 | premium-* CSS classes may not be defined | MEMBER | MEDIUM | Medium |
| M-8 | Two different Avatar components across portals | TRAINER/MEMBER | LOW | Low |
| X-1 | Shared token duplication across all portals | ALL | HIGH | High |
| X-2 | Skeleton grids use inline style across all | ALL | LOW | Low |
| X-3 | Skeleton CSS file needs verification | ALL | MEDIUM | Medium |
| X-4 | Fixed heights likely in all portals | ALL | HIGH | Medium |
| DS-1 | Owner uses isolated tokens, no light mode | OWNER | CRITICAL | Medium |
| DS-2 | Owner has no `.theme-light` override block | OWNER | CRITICAL | Low |
| DS-3 | Owner `--s1` surface color inconsistent | OWNER | MEDIUM | Low |
| DS-4 | Trainer uses partial light mode but own tokens | TRAINER | MEDIUM | Medium |
| DS-5 | Member token scope needs verification | MEMBER | MEDIUM | Low |
| DS-6 | Accent color palette different across portals | ALL | MEDIUM | Medium |
| VP-1 | Cards need ambient gradient overlays | ALL | MEDIUM | Low |
| VP-2 | KPI values need micro-animation on change | ALL | MEDIUM | Low |
| VP-3 | Sparklines need draw animation | ALL | MEDIUM | Low |
| VP-4 | Card hover states need more energy | ALL | MEDIUM | Low |
| VP-5 | Cards need staggered entrance animation | ALL | MEDIUM | Low |
| VP-6 | Status badges need more visual identity | ALL | MEDIUM | Low |
| VP-7 | Error states need to be more visible + recoverable | ALL | HIGH | Medium |
| VP-8 | Loading states should use SkeletonPage (O-1 ref) | ALL | MEDIUM | Low |
| VP-9 | Tables need row hover highlighting | ALL | LOW | Low |
| VP-10 | Empty states need illustrated component | ALL | MEDIUM | Low |
| VP-11 | Finance period tabs need active glow | OWNER | LOW | Low |
| VP-12 | Dashboard needs ambient gradient orbs | OWNER | LOW | Low |
| VP-13 | Quick action buttons need hover ripple | OWNER | LOW | Low |
| A11Y-1 | Color contrast fails WCAG AA | ALL | HIGH | Medium |
| A11Y-2 | Missing visible focus indicators | ALL | HIGH | Low |
| A11Y-3 | Loading states need ARIA announcements | ALL | MEDIUM | Low |
| A11Y-4 | Charts need text alternatives | ALL | MEDIUM | Low |
| A11Y-5 | Page titles not unique | ALL | LOW | Low |

**Total: 56 issues across 6 sections**

---

# FINAL RECOMMENDED EXECUTION ORDER

## Phase 1 — Critical Fixes (Highest Impact, Do First)
1. **DS-1 + DS-2** (Owner) — Replace isolated tokens with unified system + add light mode
2. **DS-4** (Trainer) — Replace Trainer's tokens with unified system
3. **DS-5** (Member) — Verify and unify Member tokens
4. **T-1** (Trainer) — Remove silent mock data fallback
5. **M-1** (Member) — Fix permanent zero-state + add retry
6. **O-1** (Owner) — Rewrite skeleton to match real layout

## Phase 2 — Visual Polish & Animation
7. **VP-7** (All) — Make error states visible and recoverable
8. **VP-4** (All) — Add energetic card hover states
9. **VP-5** (All) — Add staggered card entrance animations
10. **VP-2** (All) — Add KPI value change micro-animations
11. **VP-1** (All) — Add ambient gradient overlays to cards
12. **VP-6** (All) — Strengthen status badge visual identity
13. **VP-12** (Owner) — Add ambient gradient orbs behind content

## Phase 3 — Quick Wins
14. **VP-8** (All) — Replace skeleton JSX with SkeletonPage component
15. **VP-10** (All) — Create and use EmptyState component
16. **VP-3** (All) — Add sparkline draw animations
17. **VP-9** (All) — Add table row hover highlighting
18. **VP-11** (Owner) — Add active glow to finance period tabs
19. **VP-13** (Owner) — Add hover effects to quick action buttons
20. **O-3** (All) — Replace fixed heights with min-height
21. **O-4** (Owner) — Fix demo sparklines
22. **M-3** (Member) — Fix demo sparklines

## Phase 4 — Token & Structure Cleanup
23. **X-1** — Extract shared `_tokens.css` as source of truth
24. **DS-3** (Owner) — Fix `--s1` surface color mapping
25. **DS-6** — Standardize accent color names across portals
26. **O-2** (Owner) — Remove dead CSS classes
27. **T-6, M-6** — Replace skeleton inline styles with CSS classes
28. **T-5** (Trainer) — Add sub/change context to KPI chips

## Phase 5 — Accessibility
29. **A11Y-1** (All) — Run axe audit and fix all contrast failures
30. **A11Y-2** (All) — Add visible focus indicators to all interactive elements
31. **A11Y-3** (All) — Add ARIA live regions to skeleton/loading states
32. **A11Y-4** (All) — Add aria-label to all chart/visual elements
33. **A11Y-5** (All) — Set unique page titles per dashboard

## Phase 6 — Polish & Review
34. **M-7** — Verify all premium-* CSS classes exist
35. **M-8** — Standardize on single Avatar component
36. **O-5** (Owner) — Make equipment stat boxes consistent
37. **O-6** (Owner) — Break finance header into 2 rows on medium screens
38. **X-3** — Verify/create Skeleton.css covering all components
39. **X-4** — Check Trainer + Member for fixed card heights
