# Member Dashboard Improvements Plan

**File:** `frontend/src/pages/member/MemberDashboard.tsx`  
**Backend:** `MemberDashboardController.java` (`GET /api/member/dashboard`)  
**Lines:** ~261 (frontend) | ~220 (backend)  
**Last Reviewed:** 2026-03-02 (against actual source)

---

## Current State (Verified)

The dashboard fetches `/api/member/dashboard?memberId=X` and renders:
- Greeting + date/time header
- 3 header stat cards: Days Left, Bookings Count, Activity (hardcoded `streakDays: 7`)
- "NEXT SESSION" banner (fully hardcoded dummy data)
- My Schedule list (fully hardcoded 3 classes)
- Sidebar: Quick Actions, My Trainer, Membership Status, Progress Snapshot

**All schedule/progress data is hardcoded.** Only membership, trainer, and booking count come from the API.

---

## Confirmed Gaps & Improvements

### P0 — Data Hardcoding (Critical)

| # | Gap | Location | Fix |
|---|-----|----------|-----|
| D1 | `streakDays: 7` is hardcoded | line 85 | Backend: add `currentStreak` to `/api/member/dashboard` response (query from `workout_log` or `progress_metrics` table) |
| D2 | `upcomingClasses` list is 3 fake entries | lines 87-91 | Backend: add `upcomingClasses` array to dashboard response from `class_booking` + `gym_class` JOIN; frontend replace dummy |
| D3 | Progress Snapshot widget: `weight: 78kg`, `goal: 75kg`, `workouts: 18`, `accuracy: 92%` — all hardcoded | lines 236-252 | Backend: add `progressSnapshot: { currentWeight, goalWeight, totalWorkouts }` from `progress_metrics` table to dashboard response |
| D4 | `membership.endDate` shows `'Jan 26, 2026'` fallback string, but real API returns ISO date | line 86 | Frontend: parse `membership.endDate` correctly and format it |

### P1 — Backend Dashboard Endpoint Missing Fields

The current `/api/member/dashboard` response returns:
```
memberId, memberName, email, membership{}, assignedTrainer{}, bookedClassesCount, unreadNotificationsCount
```
**Missing from response that frontend needs:**
- `currentStreak` — query `workout_log` for consecutive days with entries
- `upcomingClasses[]` — top 3 upcoming class bookings with class title, time, location, trainer
- `progressSnapshot: { currentWeight, goalWeight, totalWorkouts }` — from `progress_metrics` latest entry
- `assignedTrainer.specialization` — trainer's specialization field (exists in User entity?)
- `assignedTrainer.nextSession` — next PT session date from `pt_session` table

### P2 — Frontend UX Gaps

| # | Gap | Fix |
|---|-----|-----|
| F1 | Loading state shows plain text "Loading..." | Replace with skeleton cards matching the actual layout |
| F2 | No empty state when `upcomingClasses` is empty (currently just falls through) | Add an empty state CTA: "No upcoming sessions — Book a class!" with button |
| F3 | "Check In" button on next session banner does nothing (navigates to /member/classes but doesn't pre-select the class) | Pass classId as query param: `navigate('/member/classes?classId=X')` |
| F4 | Progress Snapshot sidebar widget shows hardcoded goal progress bar | Connect to real API data; hide widget if no data |
| F5 | Notification bell icon in quick actions has no badge for unread count | Use `dashboard.unreadNotificationsCount` to render a badge on the Notifications quick action |
| F6 | Streak count uses dummy `stats.streakDays = 7` | Connect to real `currentStreak` from API |

### P3 — Database / Backend

| # | Gap | Fix |
|---|-----|-----|
| DB1 | No streak calculation exists | Add `streakCalculationService` or SQL: count consecutive days where member has a workout_log or class checkin |
| DB2 | `upcomingClasses` query is missing from dashboard endpoint | Add `classBookingRepository.findTop3UpcomingByMemberId(memberId, now)` with a JOIN on `gym_class` |
| DB3 | `progressSnapshot` needs latest `progress_metrics` row | Add `progressMetricRepository.findTopByMemberIdOrderByRecordDateDesc(memberId)` |
| DB4 | No index on `class_booking(member_id, status, class_start_time)` | Add composite index for the upcoming classes query |

### P4 — Nice to Have

| # | Improvement |
|---|------------|
| N1 | Add a "Today's Focus" card showing today's class/PT session if any |
| N2 | Show membership expiry warning banner when `daysRemaining < 7` |
| N3 | Add pull-to-refresh / manual refresh button |
| N4 | Animate stat card numbers counting up on load |

---

## Implementation Order

1. **DB1+DB2+DB3** — Update `getDashboard()` in `MemberDashboardController` to include `upcomingClasses`, `currentStreak`, `progressSnapshot`
2. **D1+D2+D3** — Remove all hardcoded data from `MemberDashboard.tsx`, connect to API
3. **F1** — Replace loading text with skeletons
4. **F2+F3+F5** — Empty state, check-in nav, notification badge
5. **N2** — Membership expiry warning

---

## API Response Shape (Target)

```json
{
  "memberId": 42,
  "memberName": "John Doe",
  "membership": {
    "status": "ACTIVE",
    "packageName": "Premium Monthly",
    "daysRemaining": 25,
    "endDate": "2026-01-26",
    "isExpired": false
  },
  "assignedTrainer": {
    "id": 5,
    "fullName": "Sarah Johnson",
    "specialization": "Strength & Conditioning",
    "nextSession": "2026-03-05T10:00:00"
  },
  "bookedClassesCount": 3,
  "unreadNotificationsCount": 2,
  "currentStreak": 7,
  "upcomingClasses": [
    { "classId": 10, "title": "Morning Yoga", "type": "Yoga", "startTime": "2026-03-03T09:00:00", "location": "Studio A", "trainerName": "Sarah J.", "bookingId": 55 }
  ],
  "progressSnapshot": {
    "currentWeight": 78.5,
    "goalWeight": 75.0,
    "totalWorkouts": 18
  }
}
```
