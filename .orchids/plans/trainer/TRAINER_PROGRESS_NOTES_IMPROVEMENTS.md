# Trainer Progress Notes — Improvement Plan

## Current State Analysis

**File:** `ProgressNotes.tsx` (620 lines)  
**Current features:** Note list with search, member filter, mood/category tags, create/edit notes with rich form (mood selector, category, attachments, metrics), date-based sorting, member avatar display, API integration via `progressNoteApi`.

**Problems:**
- No attachment upload implementation (UI exists but no actual file upload)
- No note templates (trainers write repetitive notes — templates would save time)
- Mood selector is basic (5 icons) — no custom moods
- No linking notes to specific sessions/workouts
- No member progress timeline view (notes + metrics together)
- No photo attachment (progress photos linked to notes)
- Category colors and mood icons are hardcoded functions — should be constants

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Real file attachment upload | Upload images/docs and link to notes |
| **P0** | Note templates | Pre-save templates: "First session assessment", "Weekly check-in", "Goal review" |
| **P0** | Link note to session | Associate a note with a specific PT session or class |
| **P1** | Progress timeline | Chronological timeline of notes + metrics + photos for a member |
| **P1** | Note visibility control | "Share with member" toggle (some notes are trainer-private) |
| **P1** | Metrics snapshot | Attach current metrics (weight, body fat) to note automatically |
| **P2** | Voice note | Record and attach voice memo to note |
| **P2** | Follow-up reminders | "Follow up on this note in 7 days" scheduled reminder |
| **P2** | Collaborative notes | Trainers viewing same member can add to each other's notes |
| **P3** | AI summary | Auto-summarize member's progress from last 4 notes |

---

## UI/UX Improvements

### Layout Changes
- **Split view:** Member selector (left) → Notes timeline (right)
- **Note cards:** Card layout with mood icon, category badge, excerpt, metrics summary, attachment count
- **Template picker:** Modal/drawer with pre-saved note templates

### Visual Enhancements
- Mood-based card accent colors (happy=green, neutral=blue, struggling=amber)
- Timeline connector lines between notes for same member
- Attachment preview thumbnails on card
- Rich text editor for note body (not just plain textarea)
- "Yesterday" / "This Week" date group headers

### Interactions
- Click member → filter notes to that member only
- Inline expand note (click to read full, no new page)
- Quick add from session completion (auto-populate session details)

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Real file upload, note templates, link to session |
| **Phase 2** | Progress timeline, visibility toggle, metrics snapshot |
| **Phase 3** | Voice notes, follow-up reminders, rich text editor |
| **Phase 4** | Collaborative notes, AI summary |
