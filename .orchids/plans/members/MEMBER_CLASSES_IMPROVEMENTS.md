# Member Available Classes — Improvement Plan

## Current State Analysis

**File:** `AvailableClasses.tsx` (625 lines)  
**Current features:** Weekly calendar view with day navigation, class cards with booking button, search, view toggle (list/grid), class type icons with color coding, difficulty color coding, time formatting, week offset navigation.

**Problems:**
- No class detail view/modal (member has to decide from minimal card info)
- No waitlist functionality (class full → member stuck)
- No "favorite classes" or "recurring booking"
- Filter by class type exists via search only — no dropdown/chip filters
- No trainer profile preview from class card
- No class ratings/reviews
- No location/room map
- Week navigation doesn't highlight booked classes vs. available
- No calendar integration (add to Google Calendar / iCal)
- `formatTime`, `formatDate`, `isToday` are utility functions duplicated here

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Class detail modal | Full description, trainer bio, capacity, prerequisites, reviews |
| **P0** | Waitlist | Auto-join waitlist when class is full, notify when spot opens |
| **P0** | Class type filters | Filter chips: Yoga, HIIT, Strength, Cardio, etc. |
| **P0** | Monthly calendar view | Alternative to weekly — see entire month at a glance |
| **P1** | Favorite/save classes | Heart icon to save classes, "My Favorites" filter |
| **P1** | Class recommendations | "Recommended for you" based on goals and history |
| **P1** | Recurring booking | "Book every Tuesday Yoga" auto-booking feature |
| **P1** | Trainer preview | Click trainer name → mini profile popup with photo, rating, specialization |
| **P1** | Calendar export | "Add to Google Calendar" / "Download .ics" button per class |
| **P2** | Class ratings/reviews | Rate a class after attending (1-5 stars + comment) |
| **P2** | Room/location map | Visual gym floor map showing class location |
| **P2** | Class history | "Previously attended" section for rebooking |
| **P2** | Capacity visualization | Show "12/20 spots filled" as a progress bar on card |
| **P3** | Social booking | "X friends also booked" social proof |
| **P3** | Cancellation policy display | "Free cancellation until 2 hours before class" on card |

---

## UI/UX Improvements

### Layout Changes
- **Top filter bar:** Type chips (All, Yoga, HIIT, Strength) + difficulty filter + time-of-day filter (Morning/Afternoon/Evening)
- **View modes:** Weekly (current) + Monthly Calendar + List view
- **Class card redesign:**
  - Larger card with hero gradient based on class type
  - Trainer avatar + name
  - Capacity bar (e.g., "15/20 spots left")
  - Difficulty badge
  - Duration icon
  - Quick book button with hover animation
  - Favorite (heart) toggle
- **Monthly view:** Calendar grid with dots for available classes, click date to expand

### Visual Enhancements
- Class type gradient backgrounds (Yoga = green gradient, HIIT = red gradient, etc.)
- Booked classes shown with checkmark overlay and different border
- Full classes shown with "Waitlist" button instead of "Book"
- "Starting soon" badge for classes within 30 minutes
- Animated transition between day columns
- Loading skeleton matching card layout

### Interactions
- Click class card → open detail modal/drawer (not navigate away)
- Double-tap to quick-book (mobile)
- Swipe between days on mobile
- "Undo booking" toast after booking confirmation

---

## Things to Remove
- **Duplicate date/time utilities** — move `formatTime`, `formatDate`, `isToday` to `utils/dateUtils.ts`
- **View mode toggle** — if only 2 modes with no visual difference, simplify

## Things Wasting Resources
- `classTypeConfig` object recreated on every render — move outside component or to constants file

---

## Performance Improvements
- Memoize filtered class list with `useMemo` (already partially done)
- Lazy load class detail modal content
- Prefetch next week's classes on arrow hover
- Image lazy loading for trainer avatars in cards

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Class detail modal, type filter chips, capacity visualization, favorites |
| **Phase 2** | Waitlist, recurring booking, calendar export, monthly view |
| **Phase 3** | Trainer preview, class recommendations, class history |
| **Phase 4** | Ratings/reviews, room map, social booking |
