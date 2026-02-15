# Member Dashboard — Improvement Plan

## Current State Analysis

**File:** `MemberDashboard.tsx` (261 lines)  
**Current features:** Greeting, membership status card, booked classes count, unread notifications count, assigned trainer info, quick navigation links.

**Problems:**
- Very basic — only 261 lines for a dashboard (owner dashboard is 6x larger)
- No charts or visual analytics
- No real-time data (no workout streaks, attendance trends)
- No motivational/gamification elements
- No quick actions for the most common member tasks
- No skeleton loaders or empty-state illustrations

---

## Missing Functionality (Real-World Gym App)

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Attendance streak tracker | "You've been to the gym 12 days in a row!" visual streak counter |
| **P0** | Today's schedule | Show today's booked classes and PT sessions in a timeline |
| **P0** | Quick actions bar | Book class, log workout, message trainer, check-in (QR) |
| **P0** | Membership expiry alert | Prominent banner if membership expires within 7 days |
| **P1** | Weekly activity chart | Bar chart or heatmap of gym visits this week |
| **P1** | Progress snapshot | Mini weight/body-fat trend chart (last 30 days) |
| **P1** | Calorie/workout summary | "This week: 4 workouts, 1,200 cal burned" stat cards |
| **P1** | Achievements/badges carousel | Recent achievements with animation |
| **P1** | Upcoming renewals | Card showing next billing date and amount |
| **P2** | Personalized workout tip | AI-generated or template fitness tip of the day |
| **P2** | Trainer message preview | Show last message from trainer without navigating |
| **P2** | Class recommendations | "Based on your goals, try Yoga this week" |
| **P2** | Gym announcements feed | Owner broadcast messages (maintenance, events, offers) |
| **P3** | Leaderboard widget | Optional ranking among gym members (opt-in) |
| **P3** | Weather-based suggestion | "It's raining — perfect day for indoor HIIT!" |

---

## UI/UX Improvements

### Layout Changes
- **Grid layout:** Convert from vertical stack to a responsive bento grid (2-col on desktop, 1-col mobile)
- **Hero section:** Large greeting card with animated gradient background showing time-sensitive greeting + avatar + streak badge
- **Stat cards row:** 4 mini stat cards (Workouts This Week, Calories Burned, Current Streak, Days Until Renewal) with micro-animations
- **Today's timeline:** Vertical timeline of today's booked sessions with time indicators

### Visual Enhancements
- Add skeleton placeholders during loading (matches owner dashboard pattern)
- Empty state illustrations when no bookings or data
- Animated counter for streak and stats
- Color-coded membership status badge (green=active, amber=expiring, red=expired)
- Glassmorphism cards with subtle hover effects
- Progress ring for "weekly goal completion" (e.g., 4/5 gym visits)

### Interactions
- Pull-to-refresh pattern on mobile
- Click-through on every card leads to the relevant detail page
- Celebration animation on streak milestones (7, 30, 100 days)
- Quick check-in button (QR code modal or NFC trigger)

---

## Things to Remove
- **Nothing to remove** — the dashboard is too sparse. Only add.

## Things Wasting Resources
- No issues currently (the page is too simple to waste resources)

## Duplicate Content
- Greeting + name shown in both dashboard header AND sidebar — keep only one

---

## Performance Improvements
- Implement `React.lazy` for chart components (only load if visible)
- Use `useMemo` for derived data (already partially done)
- Add `staleTime` to react-query/SWR to avoid re-fetching on every navigation back
- Virtualize announcement feed if it grows

---

## New Components Needed

| Component | Purpose |
|-----------|---------|
| `AttendanceStreak` | Circular streak counter with fire animation |
| `TodayTimeline` | Vertical timeline of today's sessions |
| `WeeklyActivityChart` | Simple bar chart (recharts) |
| `ProgressSnapshot` | Mini line chart for weight trend |
| `QuickActionsBar` | 4 icon buttons for most common tasks |
| `MembershipAlert` | Warning banner for expiring memberships |
| `AchievementsCarousel` | Horizontal scroll of badge cards |
| `GymAnnouncements` | Feed of owner broadcasts |

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Stat cards row, today's timeline, quick actions bar, membership alert |
| **Phase 2** | Weekly activity chart, progress snapshot, attendance streak |
| **Phase 3** | Achievements carousel, trainer message preview, announcements |
| **Phase 4** | Personalized tips, leaderboard, recommendations |
