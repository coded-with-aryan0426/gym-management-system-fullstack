# Member My Bookings — Improvement Plan

## Current State Analysis

**File:** `MyBookings.tsx` (344 lines)  
**Current features:** Unified booking list (classes + PT sessions), tab filter (Upcoming/Past), booking cards with type icon, cancel booking, animation variants.

**Problems:**
- Very basic — only shows a flat list with cancel
- No calendar view of bookings
- No booking details/receipt
- No reschedule option (only cancel)
- No booking confirmation flow (single-click cancel is dangerous)
- `getClassIcon` function maps class type to emoji icons — fragile
- No differentiation between class booking and PT session visually
- Past bookings have no review/rate option
- No check-in history
- Tab type uses simple string literals without clear types

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Cancel confirmation | Modal saying "Are you sure? Cancellation policy: free until 2hrs before" |
| **P0** | Booking details drawer | Click booking → show full details (trainer, location, duration, notes, receipt) |
| **P0** | Reschedule option | Move a PT session to another available slot |
| **P0** | Calendar view | Toggle between list view and calendar view of bookings |
| **P1** | Check-in status | Show if member checked in or was marked absent |
| **P1** | Rate & review | Rate past classes and PT sessions (1-5 stars + comment) |
| **P1** | Booking receipt | Downloadable PDF receipt for paid sessions |
| **P1** | Recurring bookings | Section for auto-booked recurring classes |
| **P2** | Waitlist bookings | Separate section for classes the member is waitlisted for |
| **P2** | Calendar sync | "Sync all bookings to Google Calendar" button |
| **P2** | Booking reminders | "Remind me 30 min before" toggle per booking |
| **P3** | Late cancellation tracking | Show how many late cancellations this month (policy enforcement) |

---

## UI/UX Improvements

### Layout Changes
- **View mode toggle:** List (current) ↔ Calendar (monthly grid with booking dots)
- **Tab redesign:** Upcoming | In Progress | Past | Waitlist (add more states)
- **Booking card redesign:**
  - Color-coded left border: Blue = Class, Purple = PT Session
  - Trainer avatar + name
  - Location with map pin icon
  - Time with relative indicator ("In 2 hours" vs. just "10:00 AM")
  - Status badge: Confirmed, Checked In, Completed, Cancelled, No Show
  - Action buttons: Reschedule, Cancel, Add to Calendar

### Visual Enhancements
- Empty state: "No upcoming bookings — Browse classes →" with CTA button
- Past booking cards slightly muted (opacity 0.8) with rating prompt
- "Next Up" highlight card for the very next booking (larger, prominent)
- Animated counter: "You have 3 upcoming sessions this week"
- Cancelled bookings shown with strikethrough effect

### Interactions
- Swipe to cancel (mobile) with confirmation
- Pull-to-refresh
- Click booking → slide-in detail drawer (not separate page)
- Long press for multi-select (cancel multiple)

---

## Things to Remove
- **`getClassIcon` emoji mapping** — use a shared icon component based on class type
- **Flat `type` string** — use a proper enum for booking types

## Things Showing Same Content
- Upcoming bookings shown here AND in Dashboard → Dashboard should show "Today's bookings" only, this page shows all
- Class info duplicated from AvailableClasses — share class card component

---

## Performance Improvements
- Paginate past bookings (can grow large over months)
- Memoize filtered/sorted booking lists
- Lazy load calendar view component
- Cache booking data

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Cancel confirmation, booking details drawer, card redesign |
| **Phase 2** | Calendar view, reschedule, check-in status, "Next Up" card |
| **Phase 3** | Rate & review, receipt download, waitlist section |
| **Phase 4** | Calendar sync, booking reminders, late cancellation tracking |
