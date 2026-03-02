# My Progress — Improvement Plan

## Current State (Actual — verified March 2026)

**File:** `MyProgress.tsx` (\~1400+ lines) + `MyProgress.css`

**What exists right now:**

- 7 parallel API calls on mount (all real via `memberProgressApi`):
  - `getSummary(memberId)` → `GET /api/member/progress/summary?memberId=`
  - `getMetrics(memberId, timeRange)` → `GET /api/member/progress/metrics?memberId=&timeRange=`
  - `getGoals(memberId)` → `GET /api/member/progress/goals?memberId=`
  - `getPersonalBests(memberId)` → `GET /api/member/progress/personal-bests?memberId=`
  - `getWorkouts(memberId, '30D')` → `GET /api/member/progress/workouts?memberId=&timeRange=`
  - `getMeasurements(memberId, timeRange)` → `GET /api/member/progress/measurements?memberId=&timeRange=`
  - `getPhotos(memberId)` → `GET /api/member/progress/photos?memberId=`
- Quick Actions bar: 6 buttons (Log Progress / Log PR / New Goal / Add Photo / View Gallery / History)
- Summary banner with adaptive text based on weight/muscle change + streak stat chips
- Top Stats row: 4 metric cards (Current Weight / Body Fat / Muscle Mass / BMI) with trend badges
- Chart section: 5 tabs (Weight / Body Composition / Measurements / Strength / Activity) × 5 time filters
- Chart stats summary row (6 mini-stats per tab, scrollable)
- Goals section: expandable goal cards with progress rings + projected completion date
- Personal Bests grid: category-grouped PRs with improvement badges
- Progress Notes: from trainer (fetched from `GET /api/member/progress-notes?memberId=` BUT set to `[]` hardcoded)
- All 6 modals: Log Progress, Log Workout (PR), Create Goal, Photo Upload, Photo Gallery, History — inline in JSX

**Issues found (verified in code):**

 1. `alert()` used in 6+ places: `handlePhotoUpload`, `handleDeletePhoto`, `handleDeleteEntry`, `handleLogProgress`, `handleLogWorkout`, `handleCreateGoal` — should use `toast.error()`
 2. `window.confirm()` used for delete confirmations — should be inline confirmation row
 3. `fetchProgressData` has a duplicate `memberId` validity check — minor code smell
 4. `measurementComparison` uses hardcoded "ideal" ranges (e.g., `'Chest: 104-110'`) — male-only, not configurable
 5. Weight chart stats (lines \~930–966): references `goals[0]` with hardcoded fallback `{ targetValue: 75, currentValue: 78, weeklyTarget: 0.5 }` — shows wrong data when user has no goals
 6. Measurements tab always visible even when no measurement data exists
 7. `isLightTheme` detection via `MutationObserver` on `documentElement` is correct but `chartColors` recomputed on every render
 8. `WeightIcon` defined as inline component inside `MyProgress` function — re-creates on every render
 9. Photo upload uses `alert('Please select a photo')` / `alert('Failed to upload photo')` — bad UX
10. `setNotes([])` hardcoded at line \~288 — trainer notes API call is made (`GET /api/member/progress-notes`) but result is overwritten with `[]`
11. `getWorkouts` only fetched with `'30D'` hardcoded regardless of selected `timeRange`

---

## Backend Analysis (Verified)

### All progress endpoints EXIST in `MemberProgressController.java`:

```plaintext
GET  /api/member/progress/summary?memberId=            ✅
GET  /api/member/progress/metrics?memberId=&timeRange= ✅
POST /api/member/progress/metrics?memberId=            ✅
PUT  /api/member/progress/metrics/{id}?memberId=       ✅
DELETE /api/member/progress/metrics/{id}?memberId=     ✅
GET  /api/member/progress/measurements?memberId=       ✅
POST /api/member/progress/measurements?memberId=       ✅
PUT  /api/member/progress/measurements/{id}?memberId=  ✅
DELETE /api/member/progress/measurements/{id}?memberId=✅
GET  /api/member/progress/goals?memberId=              ✅
POST /api/member/progress/goals?memberId=              ✅
PUT  /api/member/progress/goals/{id}?memberId=         ✅
DELETE /api/member/progress/goals/{id}?memberId=       ✅
GET  /api/member/progress/personal-bests?memberId=     ✅
POST /api/member/progress/personal-bests?memberId=     ✅
DELETE /api/member/progress/personal-bests/{id}?memberId= ✅
GET  /api/member/progress/workouts?memberId=&timeRange=✅ (accepts timeRange!)
POST /api/member/progress/workouts?memberId=           ✅
DELETE /api/member/progress/workouts/{id}?memberId=    ✅
GET  /api/member/progress/photos?memberId=             ✅
POST /api/member/progress/photos?memberId=             ✅ (JSON body, not multipart)
POST /api/member/progress/photos/upload?memberId=      ✅ (multipart — the real upload)
DELETE /api/member/progress/photos/{id}?memberId=      ✅
GET  /api/member/progress/photos/file/{filename}       ✅ (serves photo file)
PUT  /api/member/progress/recalculate-bmi?memberId=    ✅
```

**Critical discovery:** `GET /api/member/progress/workouts` DOES accept `timeRange` parameter (line 237 of `MemberProgressController.java`). The frontend hardcodes `'30D'` — this is a frontend bug, not a backend limitation.

### What is MISSING from backend:

MissingNotes`GET /api/member/progress-notes?memberId=`EXISTS in `MemberDashboardController` line 215! Frontend calls it but then overwrites result with `[]` — frontend bugExport progress as PDF/CSVNo export endpoint — would need to be addedBatch delete for progress entriesOnly single delete available — minor`isActive` filter on goals API`GET /api/member/progress/goals` returns ALL goals; frontend should filter client-side to `isActive === true`

### Database entities for progress (inferred from controller):

- `progress_metrics` table — weight, bodyFat, muscleMass, BMI entries
- `body_measurements` table — chest, waist, arms, legs measurements
- `member_goals` table — targetValue, currentValue, goalType, isActive, targetDate
- `personal_bests` table — exercise, weight/reps PR entries
- `workout_logs` table — exercise name, sets, reps, weight, date
- `progress_photos` table — photoUrl, description, recordDate

---

## What Needs to Be Fixed (Functional)

### P0 — Broken/Misleading

IssueFix`alert()` calls everywhere (6+ instances)Replace ALL with `toast.error()` / `toast.success()window.confirm()` for deleteReplace with inline confirmation row: `{ deleteTarget === entry.id ? <ConfirmRow> : <DeleteBtn> }setNotes([])` overwrites API resultRemove line \~288; let the `progressNoteRepository` response set `notes` state: \`setNotes(notesData`getWorkouts` hardcoded `'30D'`Pass `timeRange` to `memberProgressApi.getWorkouts(memberId, timeRange)WeightIcon` recreated on renderMove outside `MyProgress` component function, before component definitionHardcoded goal fallback in chart statsGuard: `goals.length > 0 ? goals[0] : null`; when null, skip projected date displayHardcoded male measurement idealsRemove `ideal` field from `measurementComparison` array entirely — do not show misleading "ideal" ranges

### P1 — Missing and Useful

FeatureNotesEmpty state per chart tabWhen no data for a tab: show "Log your first \[weight/measurement/PR\] to see this chart" with CTA buttonFilter inactive goals`goals.filter(g => g.isActive !== false)` — hide completed/archived goals from main displaySelective refetch on timeRangeOnly refetch metrics + measurements when `timeRange` changes (not all 7 API calls)Trainer notes real dataAlready fixed by removing `setNotes([])` — notes will come from `GET /api/member/progress-notes`

---

## Architecture Issues

### Frontend

- 7 concurrent API calls on mount — if any fail (`.catch(() => [])`) user gets silent empty sections with no error indication. Add a per-section error state
- `fetchProgressData` re-fetches ALL 7 endpoints on any change including `timeRange` change — only 2 are time-sensitive
- Component is \~1400 lines — needs modal extraction
- All 6 modals rendered inline — extract to `LogProgressModal.tsx`, `CreateGoalModal.tsx` (optional but recommended for readability)
- `chartData` `useMemo` recalculates `height` from `user?.height` on every render without proper memoization dependency

### Backend

- `MemberProgressController.getWorkoutLogs()` has `timeRange` param but `MemberProgressService.getWorkoutLogs()` — verify the service actually filters by time range (or just returns all and ignores the param)
- `progress_metrics` vs `body_measurements`: separate tables for weight/bodyFat vs chest/waist — this is correct architecture
- Photo upload uses `MultipartFile` — ensure `MAX_FILE_SIZE` is configured in `application.properties`

---

## Micro Implementation Details

### Replace all alert() calls

```tsx
// Search pattern: alert(
// Replace with appropriate toast:
// alert('msg') → toast.error('msg') or toast.success('msg')
// alert('Please ...') → toast.error('Please ...')
// alert('Failed ...') → toast.error('Failed ...')
// alert('Successfully ...') → toast.success('Successfully ...')
```

### Move WeightIcon outside component

```tsx
// BEFORE MyProgress component definition, add:
const WeightIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="3" />
    <path d="M6.5 8a6.5 6.5 0 1 0 11 0Z" />
  </svg>
);
```

### Fix trainer notes

```tsx
// In fetchProgressData, replace:
setNotes([]);
// With:
setNotes(notesData || []);
// (notesData is the result of memberProgressApi call or direct fetch to /api/member/progress-notes)
```

### Fix workouts timeRange

```tsx
// In fetchProgressData, change:
memberProgressApi.getWorkouts(memberId, '30D')
// To:
memberProgressApi.getWorkouts(memberId, timeRange)
```

### Selective refetch on timeRange change

```tsx
// Add a separate useEffect that ONLY runs when timeRange changes (not on mount):
const isFirstRender = useRef(true);
useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return; }
  if (!memberId || loading) return;
  const refetchTimeData = async () => {
    const [metricsData, measurementsData, workoutsData] = await Promise.allSettled([
      memberProgressApi.getMetrics(memberId, timeRange === 'ALL' ? undefined : timeRange),
      memberProgressApi.getMeasurements(memberId, timeRange === 'ALL' ? undefined : timeRange),
      memberProgressApi.getWorkouts(memberId, timeRange)
    ]);
    // Update only the time-sensitive state
  };
  refetchTimeData();
}, [timeRange]);
```

### Inline delete confirmation

```tsx
const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

// In history list item:
{deleteTarget === entry.id ? (
  <div className="inline-confirm">
    <span>Delete?</span>
    <button className="btn-danger-sm" onClick={() => { handleDeleteEntry(entry.id); setDeleteTarget(null); }}>Delete</button>
    <button className="btn-ghost-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
  </div>
) : (
  <button className="btn-ghost-sm" onClick={() => setDeleteTarget(entry.id)}>
    <Trash2 size={14} />
  </button>
)}
```

### Goal completion celebration

```tsx
// When a goal reaches 100%:
useEffect(() => {
  const newlyCompleted = goals.find(g =>
    g.isActive && g.currentValue >= g.targetValue && !prevCompletedGoals.includes(g.id)
  );
  if (newlyCompleted) {
    toast.success(`Goal achieved: ${newlyCompleted.name}! 🎉`);
    // Optional: trigger a confetti animation
  }
}, [goals]);
```

### CSS specifics

```css
.quick-actions-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.quick-action-btn { padding: 7px 14px; font-size: 13px; border-radius: 8px; display: flex; align-items: center; gap: 6px; }
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px; }
.stat-card { padding: 14px 16px; }
.stat-card__value { font-size: 24px; font-weight: 700; }
.heatmap-cell { width: 12px; height: 12px; border-radius: 2px; }
.inline-confirm { display: flex; align-items: center; gap: 8px; }
.chart-tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  text-align: center;
  gap: 12px;
}
```

---

## What to Remove / Not Add

- Do not add a workout plan builder (sets/reps/exercises per session) — tracked on trainer side
- Do not add social sharing of progress — privacy concern, out of scope
- Remove or isolate the `measurementComparison` ideal ranges — do not show potentially wrong gender-specific ideals
- Do not add a `bmi` chart tab — BMI is already in stats row cards
- Remove unused `ChevronDown` / `ChevronUp` if not used for goal expand (verify before removing)

---

## File Scope

- `MyProgress.tsx`: fix all `alert()` calls, fix `setNotes([])`, fix workouts timeRange, move `WeightIcon`, add empty states per chart tab, guard goal projections, add selective refetch — target \~1100 lines (extract modals to bring it down further)
- New files (optional): `LogProgressModal.tsx`, `CreateGoalModal.tsx` — each \~120 lines
- `MyProgress.css`: adjust quick actions bar, stats row grid, heatmap cell sizes, modal layout, inline-confirm row
- Backend: all endpoints already exist — only fix frontend bugs; verify `MemberProgressService.getWorkoutLogs` respects `timeRange` parameter