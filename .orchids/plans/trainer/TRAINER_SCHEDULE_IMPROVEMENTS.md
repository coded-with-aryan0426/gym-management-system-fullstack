# Trainer My Schedule — Improvement Plan

## Current State Analysis

**File:** `MySchedule.tsx` (724 lines)  
**Current features:** Weekly grid calendar (7 days × hourly slots), event rendering with color-coding by type (PT, class, meeting, break, blocked), status-based styling, day/week navigation, type filters, slot-click to create session, event detail popover on click, "today" button.

**Problems:**
- No monthly view
- No daily detail view (zoomed in)
- No drag-to-resize events (real calendar pattern)
- No drag-to-move events (reschedule)
- No recurring event indicators (just `recurring: boolean` flag)
- No conflict detection (overlapping events)
- No break/buffer time auto-insertion between sessions
- Events from backend may not include all types (meeting, blocked, break are likely mock)
- No calendar export (iCal)
- No availability management (mark available vs. unavailable hours)

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Daily/Monthly views | Toggle between Day, Week, Month views |
| **P0** | Drag-and-drop rescheduling | Drag event to new time slot to reschedule |
| **P0** | Conflict detection | Highlight overlapping events, prevent double-booking |
| **P0** | Availability management | Set recurring available hours, mark holidays/time off |
| **P1** | Drag-to-resize | Adjust event duration by dragging edge |
| **P1** | Auto buffer time | Configurable gap between back-to-back sessions |
| **P1** | Recurring events | Create recurring weekly events with edit-one/edit-all option |
| **P1** | Calendar export/sync | Export to Google Calendar, Apple Calendar, .ics download |
| **P2** | Mini month navigator | Small month calendar in the sidebar for quick date jumping |
| **P2** | Group class auto-populate | Class schedule auto-imported from gym timetable |
| **P2** | Agenda view | Text-based list of upcoming events (alternative to grid) |
| **P2** | Color-coding customization | Let trainer choose colors per event type |
| **P3** | Time zone support | For trainers with remote/online clients |
| **P3** | Shared calendar view | See other trainers' schedules for coordination |

---

## UI/UX Improvements

### Layout Changes
- **View toggle toolbar:** Day | Week | Month | Agenda — with animated transition
- **Left sidebar:** Mini month calendar + upcoming events list + filter panel
- **Hour column:** Wider, with half-hour marks and current-time indicator line
- **Mobile:** Switch to agenda view (list) by default, swipe for day view

### Visual Enhancements
- Current time indicator: Red horizontal line across the grid
- Event cards with gradient based on type (PT=blue gradient, class=green, break=gray)
- "Now" badge on current event
- Ghost preview when dragging event to new slot
- Availability shading (available hours = normal, unavailable = hatched/darker)
- Loading skeleton matching grid layout

### Interactions
- Drag event → move to new time (with snapping to 15-min increments)
- Drag event edge → resize duration
- Double-click empty slot → quick create
- Click event → popover with details, edit, cancel, mark complete
- Keyboard navigation (arrow keys to move between slots)

---

## Things to Remove
- **Hardcoded `STATUS_UI` config** — should support dynamic status types from backend

---

## Performance Improvements
- Virtualize non-visible rows (users rarely scroll to 6AM or 11PM)
- Debounce drag-and-drop API calls
- Cache weekly data and prefetch adjacent weeks
- Use CSS Grid over absolute positioning for events

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Day/Month views, conflict detection, current time indicator |
| **Phase 2** | Drag-to-move, availability management, mini month navigator |
| **Phase 3** | Drag-to-resize, recurring events, calendar export |
| **Phase 4** | Agenda view, shared calendar, time zone support |
