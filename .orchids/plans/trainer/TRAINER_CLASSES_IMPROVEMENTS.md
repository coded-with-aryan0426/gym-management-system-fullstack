# Trainer My Classes — Improvement Plan

## Current State Analysis

**File:** `MyClasses.tsx` (533 lines) + `CreateClassModal.tsx` (13K) + `ClassAttendanceModal.tsx` (9K) + `ClassReportModal.tsx` (13K)  
**Current features:** Class list with calendar navigation, create class modal, attendance tracking modal, class report modal, quick filters, status management (start/complete/cancel), edit/delete classes, week view with day columns.

**Problems:**
- Good modular structure (separate modals) — one of the better-structured trainer pages
- No recurring class creation (must create each individually)
- No class template system
- No waitlist management
- Class edit reuses CreateClassModal — should differentiate edit vs. create state better
- No class analytics (attendance trends, popular times)
- Export is basic (CSV of class list, not attendance reports)

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Recurring class creation | "Repeat every Mon, Wed, Fri" with end date |
| **P0** | Class template | Save a class config as template for quick re-creation |
| **P1** | Waitlist management | View waitlisted members, manually admit, set auto-admit |
| **P1** | Class analytics | Attendance rate trend, popular vs. unpopular classes graph |
| **P1** | Substitute trainer | Assign a substitute when trainer is unavailable |
| **P1** | Member feedback view | See ratings/reviews for each class |
| **P2** | Class series | Group related classes (e.g., "8-Week Yoga Beginner Course") |
| **P2** | Pre/post class notes | Notes visible to attendees (what to bring, warm-up instructions) |
| **P2** | Capacity auto-adjustment | Suggest optimal capacity based on historical attendance |
| **P3** | Virtual class support | Add Zoom/Meet link for online classes |

---

## UI/UX Improvements

### Visual Enhancements
- Class cards with attendance fill indicator (e.g., "18/25" as progress bar)
- Color-coding by status: green=Active, yellow=Starting Soon, gray=Completed, red=Cancelled
- "Next class" spotlight card at the top
- Calendar view with class blocks (not just list)
- Attendance trend sparkline on each class card

### Interactions
- Quick duplicate class (for recurring setup)
- Bulk cancel (select multiple classes → cancel all)
- Attendance modal: ability to mark members as "late" not just present/absent

---

## Things That Are Good
- Separate modal components (CreateClass, Attendance, Report) — good pattern
- Status management with API calls — functional

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Recurring class creation, class templates, attendance fill indicator |
| **Phase 2** | Waitlist management, class analytics, member feedback view |
| **Phase 3** | Class series, substitute trainer, pre/post class notes |
| **Phase 4** | Virtual class support, capacity auto-adjustment |
