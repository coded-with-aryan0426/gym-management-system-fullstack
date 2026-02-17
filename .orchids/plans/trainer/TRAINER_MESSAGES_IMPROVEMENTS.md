# Trainer Messages — Improvement Plan

## Current State Analysis

**File:** `TrainerMessages.tsx` (14 lines)  
**Current features:** Wraps `ChatLayout` component — the cleanest page in the app.

**Problems:**
- Uses shared `ChatLayout` component (good architecture!)
- But need to verify `ChatLayout` itself is functional and connected to real API
- No trainer-specific message features (workout plan sharing, session notes sharing)
- No way to distinguish between member conversations and support/admin conversations

---

## Missing Functionality (in ChatLayout context)

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Verify real API connection | Ensure ChatLayout fetches real conversations, not mock data |
| **P1** | Quick send workout plan | Share a workout plan as a structured message card (not text) |
| **P1** | Session notes in chat | Share progress notes as formatted cards in conversation |
| **P1** | Member tagging | @mention a member by name for quick navigation |
| **P1** | Conversation categories | Tabs: Members, Staff, Support — filter by role |
| **P2** | Broadcast message | Send same message to all assigned members (e.g., "Holiday schedule") |
| **P2** | Voice note recording | Record and send voice messages |
| **P2** | Quick responses | Pre-saved templates: "Great session today!", "Don't forget to stretch" |
| **P3** | Video call integration | In-chat video call button for remote training |

---

## UI/UX Improvements

- Since this uses `ChatLayout`, improvements should be made to the shared component
- Ensure ChatLayout and member Messages page use the SAME component (consistency)
- Add trainer-specific action bar in chat (share workout, share notes, book session)

---

## Things That Are Good
- **14-line wrapper using shared component** — this is the gold standard. Member Messages should follow this pattern.

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Verify ChatLayout is connected to real API |
| **Phase 2** | Quick send workout plan, session notes cards, conversation categories |
| **Phase 3** | Broadcast messages, quick responses, voice notes |
| **Phase 4** | Video call integration |
