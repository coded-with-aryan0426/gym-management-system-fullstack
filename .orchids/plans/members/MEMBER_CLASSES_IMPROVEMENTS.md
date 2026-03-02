# Available Classes — Improvement Plan

## Current State (Actual — verified March 2026)

**File:** `AvailableClasses.tsx` (1013 lines) + `AvailableClasses.css`

**What exists:**
- 3 parallel API calls on mount: `getAvailableClasses(memberId)`, `getTodaysClasses(memberId)`, `getMemberBookingsCount(memberId)`
- Header: 3 stat counters — Available / Booked / Today
- "Today's Classes" horizontal strip: up to 5 compact class items
- Toolbar: search input, class type chips (dynamic from data), difficulty pills, time-of-day filter (Morning/Afternoon/Evening), Favorites toggle, Clear All, view toggle
- 3 view modes: List (card grid) / Weekly (7-day column) / Monthly (mini calendar)
- `class-card`: gradient strip, icon, title, trainer click preview, date/time, location, capacity bar, Book/Waitlist/Booked CTA, ICS export button
- `ClassDetailModal`: gradient hero, detail grid, trainer section, difficulty badge, description, capacity bar, ICS download, Book/Waitlist/Booked CTA
- `TrainerPreview` popup: mini-card on trainer name click with raw `getBoundingClientRect` positioning
- `CapacityBar`: fill track + spots label + color indicators (low/full)
- Favorites: localStorage persistence with key `gym_class_favorites` (NOT user-scoped)
- Waitlist: local `Set<number>` state only — never calls any API; lost on refresh
- ICS export: real `.ics` file download — ✅ works
- Booking animation: `showBookingSuccess` state triggers 3000ms overlay; setTimeout NOT cleaned on unmount

**Verified API calls:**
```
GET /api/classes?memberId=                        → getAvailableClasses   ✅
GET /api/classes/today?memberId=                  → getTodaysClasses      ✅
GET /api/classes/member/{id}/bookings/count       → getMemberBookingsCount ✅ (redundant)
POST /api/classes/{classId}/book?memberId=        → bookClass             ✅
DELETE /api/classes/bookings/{bookingId}?memberId= → cancelBooking        ✅ (not yet used on this page)
```

---

## Issues Found (Verified in Code)

### P0 — Broken / Data Loss

| # | Line | Issue | Impact |
|---|---|---|---|
| 1 | 473–476 | `handleWaitlist` adds to local `Set` — never calls any API | Waitlist lost on refresh; backend never knows |
| 2 | 95–98 | `FAVORITES_KEY = 'gym_class_favorites'` — not user-scoped | User A's favorites show for User B on same browser |
| 3 | 462 | `successTimer` `setTimeout` not stored / not cleared on unmount | Memory leak; potential setState-after-unmount warning |
| 4 | 425–429 | `getMemberBookingsCount` is a separate API call just for the header counter | Redundant; `bookedCount` can be derived from `classes.filter(c => c.isBooked).length` after `getAvailableClasses` resolves |

### P1 — Missing and Useful

| # | Issue | Impact |
|---|---|---|
| 1 | `TrainerPreview` positioned raw with `getBoundingClientRect` — no edge clamping | Popup clips off screen right/bottom edges |
| 2 | `getWeekDays(offset)` defined inside render, not memoized | Recalculated on every state change |
| 3 | No "Cancel Booking" on already-booked class cards | Member cannot cancel from this page; must navigate to MyBookings |
| 4 | No empty state when `filteredTodaysClasses.length === 0` | Section silently disappears, no context |
| 5 | Weekly view empty column: `<span>No classes</span>` with no CSS class | Unstyled, looks broken |
| 6 | `filteredTodaysClasses` re-applies `filterFn` to `todaysClasses` — same filter applied twice | Minor performance: combine into one pass |
| 7 | Monthly calendar: all dots same color — no distinction between booked vs available | Member can't tell which classes they're already in |
| 8 | `CLASS_TYPE_CONFIG` hardcoded — if backend adds new types, they fall back to generic default | No indication of unsupported types |
| 9 | `waitlist` Set initialized empty — doesn't load member's existing waitlisted classes on mount | After page reload, "Join Waitlist" re-shows instead of "On Waitlist" |
| 10 | `fetchClasses` not wrapped in `useCallback` | Recreated on every render (low impact, but worth fixing) |

---

## Backend Analysis (Verified from GymClassController.java)

### What EXISTS:
```
GET  /api/classes?memberId=                        → getAvailableClasses    ✅
GET  /api/classes/today?memberId=                  → getTodaysClasses       ✅
GET  /api/classes/member/{memberId}/bookings       → getMemberBookings      ✅
GET  /api/classes/member/{memberId}/bookings/count → getMemberBookingsCount ✅
POST /api/classes/{classId}/book?memberId=         → bookClass              ✅
DELETE /api/classes/bookings/{bookingId}?memberId= → cancelBooking          ✅
POST /api/classes                                  → createClass (owner)    ✅
```

### What is MISSING:

| Endpoint | Purpose | Priority |
|---|---|---|
| `POST /api/classes/{classId}/waitlist?memberId=` | Explicit waitlist join — saves to DB | **P0** — but see workaround below |
| `DELETE /api/classes/{classId}/waitlist?memberId=` | Remove from waitlist | **P1** |
| `GET /api/classes/{classId}/waitlist/position?memberId=` | Return queue position | **P2** |

### Key discovery — waitlist via existing book endpoint:
`GymClassController.bookClass()` calls `gymClassService.bookClass()`. If `GymClassService` already handles full capacity by returning a `WAITLISTED` booking status instead of throwing, **then calling `bookClass` on a full class is sufficient** — no new endpoint needed. The frontend's `handleWaitlist` just needs to call `gymClassApi.bookClass(classId, memberId)` and handle the WAITLISTED response.

**Verify:** Check `GymClassService.bookClass()` to confirm it creates a WAITLISTED booking when class is at capacity, not throw an error.

### GymClassDTO — missing field:
`GymClassDTO` currently has `isBooked: boolean` but lacks `isWaitlisted: boolean`. Without it, on page load a member who IS waitlisted sees "Join Waitlist" again instead of "On Waitlist".

### Database — no schema changes needed for waitlist:
`class_bookings` already has `BookingStatus.WAITLISTED`. Once `GymClassService.bookClass()` and `GymClassDTO.isWaitlisted` are confirmed/fixed, no new DB columns needed.

---

## Improvements: Frontend

### Fix 1: Waitlist via real API (P0)
```tsx
const handleWaitlist = useCallback(async (classItem: GymClassDTO) => {
  if (!memberId) { toast.error('Please log in'); return; }
  setBooking(classItem.classId);  // reuse booking loading state
  try {
    const booking = await gymClassApi.bookClass(classItem.classId, memberId);
    if (booking.status === 'WAITLISTED') {
      setWaitlist(prev => new Set([...prev, classItem.classId]));
      const update = (list: GymClassDTO[]) =>
        list.map(c => c.classId === classItem.classId
          ? { ...c, isWaitlisted: true }
          : c
        );
      setClasses(update);
      setTodaysClasses(update);
      toast.success("Added to waitlist! You'll be notified when a spot opens.", { duration: 4000 });
    } else {
      // Spot opened — got a confirmed booking
      toast.success('Class booked!');
      fetchClasses();
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to join waitlist');
  } finally {
    setBooking(null);
  }
}, [memberId, fetchClasses]);
```

### Fix 2: User-scoped favorites (P0)
```tsx
// Replace constant:
const FAVORITES_KEY = (id: number | string) => `gym_class_favorites_${id}`;

// Update loadFavorites:
const loadFavorites = (uid: number): Set<number> => {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY(uid)) || '[]')); }
  catch { return new Set(); }
};
const saveFavorites = (uid: number, favs: Set<number>) => {
  localStorage.setItem(FAVORITES_KEY(uid), JSON.stringify([...favs]));
};

// In useState initialization:
const [favorites, setFavorites] = useState<Set<number>>(() => loadFavorites(memberId));
```

### Fix 3: setTimeout cleanup (P0)
```tsx
const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// In handleBook, replace setTimeout:
if (successTimerRef.current) clearTimeout(successTimerRef.current);
successTimerRef.current = setTimeout(() => setShowBookingSuccess(null), 3000);

// Add cleanup effect:
useEffect(() => {
  return () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); };
}, []);
```

### Fix 4: Remove redundant getMemberBookingsCount call (P0)
```tsx
// Replace:
const [availableClasses, todayClasses, bookingsCount] = await Promise.all([
  gymClassApi.getAvailableClasses(memberId),
  gymClassApi.getTodaysClasses(memberId),
  memberId ? gymClassApi.getMemberBookingsCount(memberId) : Promise.resolve(0)
]);
setBookedCount(bookingsCount);

// With:
const [availableClasses, todayClasses] = await Promise.all([
  gymClassApi.getAvailableClasses(memberId),
  gymClassApi.getTodaysClasses(memberId),
]);
setBookedCount(availableClasses.filter(c => c.isBooked).length);
```

### Fix 5: TrainerPreview edge clamping (P1)
```tsx
const handleTrainerClick = useCallback((name: string, e: React.MouseEvent) => {
  e.stopPropagation();
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const POPUP_W = 220, POPUP_H = 150;
  const x = Math.min(rect.left, window.innerWidth - POPUP_W - 16);
  const y = Math.min(rect.bottom + 8, window.innerHeight - POPUP_H - 16);
  setTrainerPreview({ name, x, y });
}, []);
```

### Fix 6: Memoize getWeekDays (P1)
```tsx
const weekDays = useMemo(() => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + selectedWeek * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}, [selectedWeek]);
```

### Add: Cancel Booking from class card (P1)
```tsx
// In class-card footer, when isBooked is true, show cancel option on hover:
{isBooked ? (
  <div className="class-card__booked-actions">
    <button className="class-card__btn class-card__btn--booked" disabled>
      <CheckCircle2 size={12} /> Booked
    </button>
    <button
      className="class-card__btn class-card__btn--cancel"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await gymClassApi.cancelBooking(classItem.bookingId!, memberId);
          const update = (list: GymClassDTO[]) =>
            list.map(c => c.classId === classItem.classId
              ? { ...c, isBooked: false, spotsLeft: c.spotsLeft + 1, currentBookings: c.currentBookings - 1 }
              : c
            );
          setClasses(update); setTodaysClasses(update);
          setBookedCount(prev => prev - 1);
          toast.success('Booking cancelled');
        } catch {
          toast.error('Failed to cancel booking');
        }
      }}
    >
      <X size={12} /> Cancel
    </button>
  </div>
) : ...}
```

### Add: Empty state for Today's Classes (P1)
```tsx
// In the Today's Classes section, after the strip renders:
{filteredTodaysClasses.length === 0 && !loading && (
  <div className="todays-empty">
    <Calendar size={18} />
    <span>No classes today — <button onClick={() => setView('list')}>browse all classes</button></span>
  </div>
)}
```

### Add: Initialize waitlist from API data on mount (P1)
```tsx
// In fetchClasses, after classes load:
const waitlistedIds = new Set(
  availableClasses.filter(c => c.isWaitlisted).map(c => c.classId)
);
setWaitlist(waitlistedIds);
```

### Add: Monthly calendar dot distinction (P1)
```tsx
// In MonthlyCalendar, for each dot:
<button
  key={c.classId}
  className={`monthly-cal__dot ${c.isBooked ? 'monthly-cal__dot--booked' : 'monthly-cal__dot--available'}`}
  style={c.isBooked ? undefined : { background: cfg.color }}
  title={`${c.classType} ${formatTime(c.startTime)} - ${c.isBooked ? 'Booked' : 'Available'}`}
  onClick={() => onSelectClass(c)}
/>
```

---

## Improvements: Backend

### Add `isWaitlisted` to GymClassDTO
```java
// In GymClassDTO.java:
private boolean isWaitlisted;

// In GymClassService.getAvailableClasses():
dto.setWaitlisted(
  memberId != null && classBookingRepository
    .existsByGymClassIdAndMemberUserIdAndStatus(
      cls.getId(), memberId, BookingStatus.WAITLISTED
    )
);
```

### Verify GymClassService.bookClass() handles full capacity
```java
// In GymClassService.bookClass(), when spotsLeft <= 0:
// SHOULD create booking with status = WAITLISTED (not throw IllegalArgumentException)
// Check the current implementation and fix if it throws instead:
if (gymClass.getCurrentBookings() >= gymClass.getMaxCapacity()) {
    // Create WAITLISTED booking instead of throwing:
    ClassBooking waitlistBooking = new ClassBooking();
    waitlistBooking.setStatus(BookingStatus.WAITLISTED);
    waitlistBooking.setGymClass(gymClass);
    waitlistBooking.setMember(member);
    waitlistBooking.setBookedAt(LocalDateTime.now());
    return classBookingRepository.save(waitlistBooking);
}
```

### Add explicit waitlist endpoint (optional, P2)
```java
// If the book-endpoint approach is insufficient, add:
@PostMapping("/{classId}/waitlist")
public ResponseEntity<?> joinWaitlist(
    @PathVariable Long classId,
    @RequestParam Long memberId) {
  try {
    ClassBookingDTO booking = gymClassService.joinWaitlist(classId, memberId);
    return ResponseEntity.status(HttpStatus.CREATED).body(booking);
  } catch (IllegalArgumentException e) {
    return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
  }
}

@DeleteMapping("/{classId}/waitlist")
public ResponseEntity<?> leaveWaitlist(
    @PathVariable Long classId,
    @RequestParam Long memberId) {
  gymClassService.leaveWaitlist(classId, memberId);
  return ResponseEntity.ok(Map.of("message", "Removed from waitlist"));
}
```

---

## Database — No New Tables Needed

The existing `class_bookings.status` enum with `WAITLISTED` value is sufficient. Add indexes for performance:

```sql
-- Speed up "is member waitlisted for class" lookups
CREATE INDEX IF NOT EXISTS idx_class_bookings_class_member_status
  ON class_bookings(gym_class_id, member_user_id, status);

-- Speed up "today's classes" query
CREATE INDEX IF NOT EXISTS idx_gym_classes_start_time
  ON gym_classes(start_time);
```

---

## CSS Specifics
```css
/* Monthly calendar — booked vs available dots */
.monthly-cal__dot--booked {
  background: var(--accent-blue);
  border: 2px solid var(--accent-blue);
}
.monthly-cal__dot--available {
  background: transparent;
  border: 2px solid currentColor;
  opacity: 0.7;
}

/* Weekly empty column */
.classes-calendar__empty {
  color: var(--text-tertiary);
  font-size: 12px;
  text-align: center;
  padding: 16px 0;
  font-style: italic;
}

/* Today's classes empty state */
.todays-empty {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  color: var(--text-secondary); font-size: 13px;
}
.todays-empty button {
  color: var(--accent-blue); text-decoration: underline; background: none; border: none;
  cursor: pointer; font-size: 13px;
}

/* Cancel button on booked card (shows on hover) */
.class-card__booked-actions {
  display: flex; gap: 6px; align-items: center;
}
.class-card__btn--cancel {
  background: transparent; border: 1px solid var(--accent-red);
  color: var(--accent-red); font-size: 11px; padding: 4px 8px;
  border-radius: 6px; display: flex; align-items: center; gap: 4px;
  opacity: 0; transition: opacity 0.2s;
}
.class-card:hover .class-card__btn--cancel { opacity: 1; }
```

---

## What to Remove / Not Add
- Remove `gymClassApi.getMemberBookingsCount` call after deriving count from class list
- Remove `ChevronDown` icon import if confirmed unused after audit
- Do NOT add "Recommended for you" AI section — out of scope
- Do NOT add per-class pricing — covered by membership
- Do NOT add inline video preview — performance concern
- Do NOT add social "who else is going" — privacy concern

---

## File Scope
- `AvailableClasses.tsx`: fix waitlist API, scope favorites by user, fix timeout cleanup, remove redundant API call, fix TrainerPreview clamping, memoize getWeekDays, add cancel-booked, add today's empty state, init waitlist from data, monthly dot distinction — stay under 1050 lines
- `AvailableClasses.css`: update monthly dots, empty week column, today's empty, cancel hover button
- `api.ts`: ensure `gymClassApi.cancelBooking` accepts `bookingId` (already exists) — confirm `GymClassDTO` type includes `isWaitlisted?: boolean`
- Backend `GymClassService.java`: verify/fix full-capacity → WAITLISTED booking; add `isWaitlisted` to DTO
- Database: add 2 performance indexes (no table changes needed)
