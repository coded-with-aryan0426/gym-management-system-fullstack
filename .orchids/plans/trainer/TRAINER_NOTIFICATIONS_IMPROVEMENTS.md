# Trainer Notifications — Improvement Plan

## Current State Analysis

**File:** `TrainerNotifications.tsx` (412 lines)  
**Current features:** Notification list with type-based filtering (All, Sessions, Members, System), date grouping, mark as read, star, archive, delete, batch mark-all-read, notification actions with primary/secondary/danger types, online API integration.

**Problems:**
- Very similar to MemberNotifications (393 lines) — much code duplication that could be shared
- No real-time updates (no WebSocket/SSE)
- No push notifications
- Notification actions are defined but action handler just logs to console
- No swipe gestures for mobile
- Archive/delete have no undo

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Action handler implementation | Actually handle action button clicks (navigate to session, reply to member) |
| **P0** | Real-time notifications | WebSocket/SSE for instant delivery |
| **P1** | Push notifications | Browser push with service worker |
| **P1** | Undo archive/delete | Snackbar with 5-second undo |
| **P1** | Notification sound/vibration | Optional per notification type |
| **P2** | Snooze notifications | "Remind me in 1 hour" option |
| **P2** | Bulk select & action | Select multiple → delete/archive/mark read |
| **P2** | Filter by priority | Show only high/medium/low priority |
| **P3** | Smart notification digests | Group similar notifications into daily summary |

---

## UI/UX Improvements

### Architecture Change
- **Create shared `NotificationList` component** used by both Member and Trainer notifications to eliminate code duplication
- Pass role-specific configuration (types, icons, actions) as props

### Visual Enhancements
- Swipe gestures for mobile (left=archive, right=mark read)
- Priority-based accent border (red=high, amber=medium, gray=low)
- Animated entry for new notifications
- Empty state illustration
- Today/Yesterday/This Week group headers

---

## Things to Remove
- **Code duplication with MemberNotifications** — extract to shared `NotificationList` component

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Action handler implementation, shared NotificationList component |
| **Phase 2** | Real-time updates, push notifications, undo |
| **Phase 3** | Snooze, bulk actions, priority filter |
| **Phase 4** | Smart digests, sound settings |
