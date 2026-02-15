# Member Notifications — Improvement Plan

## Current State Analysis

**File:** `MemberNotifications.tsx` (393 lines)  
**Current features:** Notification list with filter tabs (All, Unread, Starred), mark as read, star, archive, delete, mark all as read, type-based icons and colors, relative date formatting.

**Problems:**
- Reasonably functional but missing real-time updates
- No push notification integration
- No notification preferences (can't choose which types to receive)
- No notification grouping (e.g., "3 class reminders")
- Archive and delete have no undo/recovery
- No sound/vibration settings
- Filter doesn't include type-based filtering (payment, class, trainer, system)

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Real-time updates | WebSocket/SSE for instant notification delivery |
| **P0** | Type-based filters | Filter by: Payment, Class, Trainer, System, Membership |
| **P0** | Push notifications | Browser push notification permission + service worker |
| **P1** | Notification grouping | Group similar notifications ("3 class reminders today") |
| **P1** | Undo delete/archive | Snackbar with "Undo" for 5 seconds after action |
| **P1** | Notification actions | Inline action buttons (e.g., "Pay Now", "View Class", "Reply") |
| **P1** | Badge count | Show unread count in nav sidebar badge (currently just a count in dashboard) |
| **P2** | Notification sound | Optional sound/vibration per type |
| **P2** | Do Not Disturb | Schedule quiet hours (e.g., 10PM - 7AM) |
| **P2** | Bulk actions | Select multiple → delete/archive/mark read |
| **P3** | Smart notifications | Priority-based: urgent (payment overdue) vs. informational (birthday wish) |

---

## UI/UX Improvements

### Layout Changes
- **Header toolbar:** Add type-based filter chips (Payment 💳, Class 📚, Trainer 🏋️, System ⚙️)
- **Swipe gestures (mobile):** Swipe left = archive, swipe right = mark read
- **Empty state:** Illustration when no notifications ("All caught up! 🎉")
- **Notification card redesign:** Add inline action buttons, sender avatar, and time-ago stamp

### Visual Enhancements
- Unread notifications with left accent border (not just bold text)
- Animated entry for new notifications (slide in from top)
- Priority-based coloring: red border for urgent, yellow for important, green for routine
- Group separator with date headers ("Today", "Yesterday", "This Week")
- Star animation (scale + color burst)

### Interactions
- Pull-to-refresh (mobile)
- Long press for multi-select mode
- Click notification → navigate to relevant page (class detail, payment page, etc.)
- Smooth archive/delete with slide-out animation

---

## Things to Remove
- Nothing to remove — the page is lean and functional

## Things Showing Same Content
- Notification count shown in dashboard AND potentially in sidebar badge — ensure single source via Context

---

## Performance Improvements
- Virtual scrolling for large notification lists (100+ items)
- Paginate notifications (fetch 20 at a time, load more on scroll)
- Cache notifications with SWR/react-query
- Debounce mark-as-read API calls when scrolling through list

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Type-based filters, inline action buttons, empty state, badge count |
| **Phase 2** | Real-time updates (WebSocket), push notifications, undo delete |
| **Phase 3** | Notification grouping, bulk actions, swipe gestures |
| **Phase 4** | DND schedule, smart notifications, sound settings |
