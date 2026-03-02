# My Bookings — Improvement Plan

## Current State (Actual — verified March 2026)

**File:** `MyBookings.tsx` (1093 lines) + `MyBookings.css`

**What exists:**
- Unified booking list: class bookings + PT sessions merged into `UnifiedBooking[]`
- 5 tabs: Upcoming / In Progress / Past / Waitlist / Cancelled
- Stats row: Upcoming / Completed / PT Sessions / Classes (all computed from real data)
- "Next Up" highlighted card for nearest upcoming booking
- Weekly summary banner ("You have X sessions this week")
- `BookingCard`: date column, type icon, title+status+meta, inline cancel/reschedule/details buttons
- `BookingDrawer`: right slide-in panel, full details + cancel/reschedule/rate actions
- `CancelModal`: free/late cancellation policy (2h cutoff) — correctly computed
- `RescheduleModal`: date picker + real slot grid (calls `ptSessionApi.getAvailableSlots`)
- `RateModal`: 5-star + optional review text
- `CalendarView`: mini calendar with booking dots by date, click-to-open drawer
- List ↔ Calendar view toggle

**Real API calls verified:**
- `gymClassApi.getMemberBookings(memberId)` → `GET /api/classes/member/{memberId}/bookings` ✅
- `ptSessionApi.getMemberSessions(memberId)` → `GET /api/pt-sessions/member/{memberId}` ✅
- `gymClassApi.cancelBooking(bookingId, memberId)` → `DELETE /api/classes/bookings/{bookingId}?memberId=` ✅
- `ptSessionApi.cancelSession(sessionId)` → `DELETE /api/pt-sessions/{id}` ✅
- `ptSessionApi.updateSession(id, data)` → `PUT /api/pt-sessions/{id}` ✅ (reused for reschedule)
- `ptSessionApi.getAvailableSlots(trainerId, date)` → `GET /api/pt-sessions/available-slots` ✅

---

## Issues Found (Verified in Code)

### P0 — Broken / Misleading

| # | Line | Issue | Impact |
|---|---|---|---|
| 1 | 859–873 | `handleRateSubmit` stores rating in local state ONLY — `gymClassApi.rateBooking` does not exist, no backend call | Ratings silently lost on refresh |
| 2 | 734 | PT session IDs offset by `+10000` to avoid collision: `id: (pt.sessionId || 0) + 10000` | Breaks if member has >9999 class bookings; fragile |
| 3 | 769 | `IN_PROGRESS` tab: `bDate >= new Date(now - 2h)` — shows past sessions started within last 2h regardless of actual duration or completion | Wrong sessions shown as "in progress" |
| 4 | 997 | `<CalendarView bookings={bookings} ...>` passes ALL bookings — ignores active tab filter | Calendar shows cancelled/waitlisted sessions |
| 5 | 836–857 | `handleRescheduleConfirm` uses `{} as any` spread + `ptSessionApi.updateSession` (full update) — no dedicated reschedule endpoint | Type-unsafe; overwrites all fields |
| 6 | 9 | `ExternalLink` imported but never used | Unused import warning |

### P1 — Missing and Useful

| # | Missing | Notes |
|---|---|---|
| 1 | No search / text filter | With 50+ bookings, navigating by tab only is insufficient |
| 2 | No attendance rate stat | `attended / (completed + noShow) * 100` — motivating metric |
| 3 | ICS export from BookingDrawer | Code exists in `AvailableClasses.tsx` — reuse the `generateICS` pattern |
| 4 | Booking reminder toggle | Bell icon on upcoming card → localStorage or browser `Notification` API |
| 5 | PT session title is hardcoded "Personal Training" | Should show trainer's specialty or session notes summary when available |
| 6 | No "Book PT Session" CTA | Header only has "Book Class" — should also offer PT booking navigation |
| 7 | `actionLoading` single boolean | Parallel rapid actions would conflict; should be per-booking-id map |

---

## Backend Analysis (Verified from GymClassController.java + PTSessionController.java)

### GymClassController endpoints (all verified):
```
GET  /api/classes?memberId=                             ✅
GET  /api/classes/today?memberId=                       ✅
GET  /api/classes/member/{memberId}/bookings            ✅
GET  /api/classes/member/{memberId}/bookings/count      ✅
POST /api/classes/{classId}/book?memberId=              ✅
DELETE /api/classes/bookings/{bookingId}?memberId=      ✅
```

### Missing backend endpoints:

| Endpoint | Purpose | Priority |
|---|---|---|
| `POST /api/classes/bookings/{bookingId}/rate` | Save session rating + review to DB | **P0** — rating currently local-only |
| `POST /api/pt-sessions/{id}/reschedule` | Dedicated reschedule with `{ newDate, newTime }` body | **P1** — currently reuses full update |
| `GET /api/member/booking-stats?memberId=` | Pre-aggregated stats (total, attended, noShow, cancelled) | **P2** — avoids client-side computation |

### Database changes required:

```sql
-- class_bookings: add rating columns
ALTER TABLE class_bookings
  ADD COLUMN rating TINYINT,
  ADD COLUMN review TEXT;

-- pt_sessions: change DELETE to soft-delete (update status)
-- The current PTSessionController.cancelSession does DELETE (hard delete)
-- This loses history. Change to:
-- UPDATE pt_sessions SET status = 'CANCELLED', cancelled_at = NOW() WHERE id = ?
-- Requires: ADD COLUMN cancelled_at TIMESTAMP NULL to pt_sessions table

ALTER TABLE pt_sessions
  ADD COLUMN cancelled_at TIMESTAMP NULL;
```

### BookingStatus enum mismatch (verified):
`ClassBooking.BookingStatus` enum values: `CONFIRMED`, `CANCELLED`, `WAITLISTED`, `ATTENDED`, `NO_SHOW`
Frontend expects: `BOOKED`, `SCHEDULED`, `CHECKED_IN`, `COMPLETED`

The `GymClassService.getMemberBookings()` DTO mapping **must** normalize:
- `CONFIRMED` → `BOOKED`
- `ATTENDED` → `COMPLETED`
- `WAITLISTED` → `WAITLISTED` (same ✅)
- `NO_SHOW` → `NO_SHOW` (same ✅)

Verify this mapping exists in `GymClassService.java` — if it maps incorrectly, status pills will show wrong state.

---

## Improvements: Frontend

### Fix 1: String-prefixed PT IDs (removes +10000 hack)
```tsx
// In fetchAllBookings, replace the numeric offset:
const unifiedPT: UnifiedBooking[] = ptSessions.map(pt => ({
  id: `pt-${pt.sessionId}` as any,   // string prevents collision with any number of class bookings
  originalId: pt.sessionId || 0,
  // ...rest unchanged; originalId is used for all API calls
}));
```

### Fix 2: IN_PROGRESS tab correct logic
```tsx
// Replace line 769 logic:
case 'IN_PROGRESS': {
  const sessionEndMs = bDate.getTime() + (b.duration || 60) * 60 * 1000;
  return !isCancelled && !isCompleted && !isWaitlisted
    && bDate.getTime() <= now.getTime()
    && now.getTime() <= sessionEndMs;
}
```

### Fix 3: Calendar receives filtered bookings
```tsx
// Line 997, change:
<CalendarView bookings={bookings} onSelectBooking={b => setDrawerTarget(b)} />
// To:
<CalendarView bookings={filteredBookings} onSelectBooking={b => setDrawerTarget(b)} />
```

### Fix 4: Wire rating to backend
```tsx
const handleRateSubmit = async (rating: number, review: string) => {
  if (!rateTarget) return;
  setActionLoading(true);
  try {
    if (rateTarget.type === BookingType.CLASS) {
      await gymClassApi.rateBooking(rateTarget.originalId, { rating, review });
    }
    // PT rating: add when backend endpoint ready
    setBookings(prev => prev.map(b =>
      b.id === rateTarget.id ? { ...b, rating, review } : b
    ));
    toast.success('Thanks for your review!');
    setRateTarget(null);
    setDrawerTarget(null);
  } catch {
    toast.error('Failed to submit rating');
  } finally {
    setActionLoading(false);
  }
};
```

### Fix 5: Remove unused import
```tsx
// Line 9: remove ExternalLink from lucide-react import
```

### Add: Search filter
```tsx
const [searchTerm, setSearchTerm] = useState('');

// In filteredBookings useMemo, add before tab switch:
.filter(b => {
  if (!searchTerm) return true;
  const q = searchTerm.toLowerCase();
  return b.title.toLowerCase().includes(q)
    || b.trainerName.toLowerCase().includes(q);
})
```

### Add: Attendance rate stat card
```tsx
// In stats row, add after PT Sessions / Classes:
const attendanceRate = useMemo(() => {
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const noShow = bookings.filter(b => b.status === 'NO_SHOW').length;
  const denom = completed + noShow;
  return denom > 0 ? Math.round((completed / denom) * 100) : null;
}, [bookings]);

// Add stat card:
{attendanceRate !== null && (
  <div className="bk-stat" style={{ '--stat-accent': '#FF9500' } as any}>
    <span className="bk-stat__value">{attendanceRate}%</span>
    <span className="bk-stat__label">Attendance</span>
  </div>
)}
```

### Add: ICS export in BookingDrawer footer
```tsx
// In BookingDrawer footer, after existing buttons:
<button className="bk-btn bk-btn--ghost bk-btn--full" onClick={() => {
  const start = new Date(booking.date);
  const end = new Date(start.getTime() + booking.duration * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${booking.title}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `LOCATION:${booking.location}`,
    `DESCRIPTION:Trainer: ${booking.trainerName}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${booking.title}.ics`; a.click();
  URL.revokeObjectURL(url);
}}>
  <Download size={16} /> Add to Calendar
</button>
```

### Add: "Book PT Session" CTA in header
```tsx
// In bk-header__actions, alongside existing "Book Class" button:
<button className="bk-btn bk-btn--secondary" onClick={() => navigate('/member/trainer')}>
  <UserIcon size={16} />
  <span>Book PT</span>
</button>
```

### Add: Per-booking action loading (replaces single boolean)
```tsx
// Replace:
const [actionLoading, setActionLoading] = useState(false);
// With:
const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
const setLoading = (id: string | number, val: boolean) =>
  setActionLoading(prev => ({ ...prev, [String(id)]: val }));
const isLoading = (id: string | number) => actionLoading[String(id)] === true;
```

---

## Improvements: Backend

### Add rating endpoint to GymClassController.java
```java
@PostMapping("/bookings/{bookingId}/rate")
public ResponseEntity<?> rateBooking(
    @PathVariable Long bookingId,
    @RequestBody Map<String, Object> body) {
  try {
    Integer rating = (Integer) body.get("rating");
    String review = (String) body.get("review");
    if (rating == null || rating < 1 || rating > 5) {
      return ResponseEntity.badRequest().body(Map.of("message", "Rating must be 1-5"));
    }
    ClassBooking booking = classBookingRepository.findById(bookingId)
        .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    booking.setRating(rating.byteValue());
    booking.setReview(review);
    classBookingRepository.save(booking);
    return ResponseEntity.ok(Map.of("message", "Rating submitted"));
  } catch (IllegalArgumentException e) {
    return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
  } catch (Exception e) {
    return ResponseEntity.status(500).body(Map.of("message", "Failed to save rating"));
  }
}
```

### Fix PTSessionController.cancelSession — soft delete instead of hard delete
```java
// Current (bad — deletes row permanently):
@DeleteMapping("/{id}")
public ResponseEntity<Void> cancelSession(@PathVariable Long id) {
  ptSessionService.deleteSession(id);
  return ResponseEntity.noContent().build();
}

// Replace with:
@PutMapping("/{id}/cancel")
public ResponseEntity<?> cancelSession(@PathVariable Long id) {
  try {
    ptSessionService.cancelSession(id);  // service sets status=CANCELLED, cancelled_at=now()
    return ResponseEntity.ok(Map.of("message", "Session cancelled"));
  } catch (Exception e) {
    return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
  }
}
// Also keep DELETE for actual admin deletion if needed
```

### Add dedicated reschedule endpoint to PTSessionController.java
```java
@PostMapping("/{id}/reschedule")
public ResponseEntity<?> rescheduleSession(
    @PathVariable Long id,
    @RequestBody Map<String, String> body) {
  try {
    String newDateTime = body.get("sessionDate");  // ISO datetime string
    PTSessionDTO updated = ptSessionService.rescheduleSession(id, newDateTime);
    return ResponseEntity.ok(updated);
  } catch (Exception e) {
    return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
  }
}
```

---

## Database Changes Summary

```sql
-- 1. Add rating columns to class_bookings
ALTER TABLE class_bookings
  ADD COLUMN IF NOT EXISTS rating TINYINT,
  ADD COLUMN IF NOT EXISTS review TEXT;

-- 2. Add soft-delete support to pt_sessions
ALTER TABLE pt_sessions
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL;

-- Index for faster member booking queries
CREATE INDEX IF NOT EXISTS idx_class_bookings_member_status
  ON class_bookings(member_user_id, status);

CREATE INDEX IF NOT EXISTS idx_pt_sessions_member_date
  ON pt_sessions(member_user_id, session_date);
```

---

## Architecture Notes

- The `drawerTarget` + `cancelTarget` interaction (line 1060: clears drawer then sets cancel) is correct. Do not change.
- `fetchAllBookings` is called directly after mutations — fine for current scale. When bookings grow >500 rows, consider a `lastModified`-based cache.
- Do NOT add server-side pagination yet — wait until list renders slowly (>200 items).
- Do NOT move `UnifiedBooking` type to a shared types file yet — it's only used here.

---

## CSS Specifics
```css
/* Search bar in header actions */
.bk-search {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px; background: var(--surface-2);
  border-radius: 8px; border: 1px solid var(--border);
}
.bk-search input { background: none; border: none; outline: none; font-size: 13px; }

/* Attendance stat */
.bk-stat { padding: 12px 16px; flex: 1; min-width: 80px; }

/* Calendar dots */
.bk-calendar__cell { min-height: 48px; }
.bk-calendar__dot { width: 8px; height: 8px; border-radius: 50%; cursor: pointer; }
.bk-calendar__dot--class { background: var(--accent-blue); }
.bk-calendar__dot--pt { background: var(--accent-purple); }
```

---

## What to Remove / Not Add
- Remove `ExternalLink` unused import (line 9)
- Do NOT add recurring booking creation — managed trainer/owner-side
- Do NOT add a payment section — belongs in `MyMembership`
- Do NOT add pagination until list performance degrades
- Do NOT add "share booking" feature — privacy concern

---

## File Scope
- `MyBookings.tsx`: fix PT ID hack, fix IN_PROGRESS logic, fix calendar filter, add search, add ICS export, wire rating API, add PT Book CTA, replace `actionLoading` with per-ID map — target ~1050 lines
- `MyBookings.css`: add search bar styles, attendance stat, calendar dot colors
- `api.ts`: add `gymClassApi.rateBooking(bookingId, { rating, review })` method
- Backend `GymClassController.java`: add `POST /api/classes/bookings/{id}/rate`
- Backend `PTSessionController.java`: add `PUT /{id}/cancel` (soft delete) + `POST /{id}/reschedule`
- Database: `ALTER TABLE class_bookings` add `rating`, `review`; `ALTER TABLE pt_sessions` add `cancelled_at`
