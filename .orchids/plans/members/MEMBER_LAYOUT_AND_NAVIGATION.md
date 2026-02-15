# Member Layout & Navigation — Improvement Plan

## Current State Analysis

**File:** `MemberLayout.tsx` (39 lines)  
**Current nav items (8):** Dashboard, My Profile, My Membership, My Progress, Available Classes, My Trainer, My Bookings, Messages.

**Problems:**
- **Notifications page exists but is NOT in the navigation** — member can't navigate to it
- **Settings page exists but is NOT in the navigation** — member can't navigate to it
- Both Notifications and Settings icons are imported in the file but NOT used in `navItems`!
- No notification badge count on nav items
- No grouping/sections in navigation (all 8 items in flat list)
- No bottom tab bar for mobile
- No breadcrumbs
- No search/command palette (Cmd+K pattern)

---

## Missing Navigation Items

| Page | Route | Status |
|------|-------|--------|
| Notifications | `/member/notifications` | **EXISTS but NOT in nav** |
| Settings | `/member/settings` | **EXISTS but NOT in nav** |

---

## Proposed Navigation Structure

### Desktop (Sidebar)
```
─── Dashboard          (Home icon, red)
─── My Profile         (User icon, blue)

── MEMBERSHIP ──
─── My Membership      (CreditCard icon, purple)
─── My Bookings        (Calendar icon, pink)

── FITNESS ──
─── My Progress        (Activity icon, green)
─── Available Classes  (BookOpen icon, yellow)
─── My Trainer         (UserCheck icon, cyan)

── COMMUNICATION ──
─── Messages           (MessageSquare icon, indigo)  [badge: unread count]
─── Notifications      (Bell icon, orange)            [badge: unread count]

── SYSTEM ──
─── Settings           (Settings icon, gray)
```

### Mobile (Bottom Tab Bar — 5 items max)
```
Dashboard | Classes | Progress | Messages | More (→ expands to full nav)
```

---

## UI/UX Improvements

### Navigation Enhancements
- **Add Notifications and Settings** to navItems array (they are imported but unused!)
- **Section headers:** Group nav items under "Membership", "Fitness", "Communication", "System" labels
- **Badge counts:** Show unread count badges on Messages and Notifications icons
- **Active indicator:** Animated left border + icon color change (like macOS sidebar)
- **Collapsed mode:** Allow sidebar to collapse to icon-only view on smaller screens

### New Pages to Add

| Page | Purpose | Priority |
|------|---------|----------|
| **Gym Info** | Gym address, hours, contact, announcements, gym rules | P1 |
| **Help & Support** | FAQ, contact support, report issue, feedback | P1 |
| **QR Check-in** | QR code for gym entry / self check-in | P2 |
| **Achievements** | Dedicated page for all badges, milestones, streaks | P2 |
| **Workout Plans** | Saved workout routines / trainer-assigned plans | P1 |
| **Diet/Nutrition** | Meal plans from trainer, nutrition tips | P3 |

### Pages to Consider Removing or Merging

| Current Page | Action | Reason |
|--------------|--------|--------|
| My Profile | Keep but slim down | Remove settings-like functionality, keep display + edit |
| My Trainer | Keep | Useful for trainer discovery and management |
| My Bookings | Keep | Essential for booking management |
| Available Classes | Keep | Core feature |

---

## Performance Improvements
- Prefetch adjacent routes on hover
- Cache notification/message counts in context
- Memoize `navItems` array (currently recreated on every render)

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | **Add Notifications and Settings to nav** (critical — pages exist but are unreachable!) |
| **Phase 2** | Section headers, badge counts, mobile bottom tab |
| **Phase 3** | Gym Info page, Help & Support, sidebar collapse |
| **Phase 4** | QR Check-in, Achievements, Workout Plans pages |
