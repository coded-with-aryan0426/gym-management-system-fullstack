# Member Profile — Improvement Plan

## Current State Analysis

**File:** `MemberProfile.tsx` (1121 lines)  
**Current features:** Avatar, personal info editing, assigned trainer display, fitness goals toggle, achievements section, tabs (Personal/Fitness/Security), save bar with undo.

**Problems:**
- 1121 lines in a single component — needs splitting into sub-components per tab
- `PulsingBadge`, `StatMini`, `AchievementCard` are inline components — should be extracted
- Profile and Settings pages overlap significantly (both handle profile editing)
- No body measurements display (data exists in MyProgress but not shown on profile)
- No social/community profile (no "about me" for other members to see)
- `handleGoalToggle` logic allows unlimited goal selections — real gyms often limit to 3-5 primary goals
- `getRelativeTime` and `formatDate` utility functions are duplicated across multiple pages

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Profile photo upload (actual) | Currently no real image upload — should support crop, resize, compress |
| **P0** | Profile completeness indicator | "Your profile is 65% complete" progress ring |
| **P0** | Emergency contact | Name, phone, relationship — required for real gyms |
| **P0** | Medical info section | Allergies, injuries, medical conditions, blood group — liability requirement |
| **P1** | Body stats display | Show latest weight, height, BMI, body fat on profile (pulled from MyProgress) |
| **P1** | Membership ID card | Digital membership card with QR code (for check-in) |
| **P1** | Activity timeline | Recent gym visits, class bookings, achievements in chronological order |
| **P1** | Fitness level assessment | Beginner/Intermediate/Advanced based on workout history |
| **P2** | Social profile toggle | Choose what's visible to other members (name, goals, achievements) |
| **P2** | Workout preferences | Preferred workout time, favorite exercises, equipment preferences |
| **P2** | Dietary preferences | Veg/Non-veg/Vegan, allergies, supplements used |
| **P3** | Profile sharing | Share profile as link or QR for trainer handoff |

---

## UI/UX Improvements

### Structural Changes
- **Split into sub-components:** Extract each tab into its own component file:
  - `PersonalInfoTab.tsx`
  - `FitnessGoalsTab.tsx`
  - `SecurityTab.tsx`
  - `MedicalInfoTab.tsx` (new)
- **Profile header redesign:** Large cover photo area + circular avatar with edit overlay + name + membership badge + completion ring
- **Tab navigation:** Use horizontal pill tabs (not vertical) matching modern app patterns

### Visual Enhancements
- Animated profile completeness ring around the avatar
- Achievement badges displayed as a horizontal scrollable ribbon
- Body stats shown as mini gauge charts (weight, BMI, body fat)
- Goal selection as interactive card chips with icons (not plain checkboxes)
- Trainer card as a premium styled card with "Message" and "Book Session" CTAs

### Interactions
- Inline editing per field (click to edit, auto-save) instead of global "Edit Mode"
- Image crop modal for avatar upload
- Drag-and-drop goal priority ordering
- "View as others see me" preview toggle
- Smooth tab transitions with AnimatePresence (already imported but underused)

---

## Things to Remove
- **Overlap with Settings:** Profile editing of email/phone/password should ONLY be in Settings. Profile page should display them as read-only with "Edit in Settings" link.
- **Duplicate `formatDate` and `getRelativeTime`:** Move to a shared `utils/dateUtils.ts`
- **Inline components:** Extract `PulsingBadge`, `StatMini`, `AchievementCard` to `components/member/`

## Things Showing Same Content Multiple Times
- **Personal info (name, email, phone):** Displayed in both Profile AND Settings — should be read-only in Profile
- **Fitness goals:** Shown in Profile AND partially in MyProgress — single source of truth needed
- **Trainer info:** Shown in Profile AND in MyTrainer page — Profile should show mini version only

---

## Performance Improvements
- Split 1121-line monolith into tab-level code-split components
- Lazy load `AchievementCard` list (only render visible ones)
- Memoize derived stats with `useMemo`
- Compress uploaded images client-side before API call
- Cache profile data with SWR/react-query staleTime

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Component splitting, profile header redesign, emergency contact, medical info |
| **Phase 2** | Profile photo upload with crop, completeness indicator, body stats display |
| **Phase 3** | Digital membership card, activity timeline, fitness level |
| **Phase 4** | Social profile, workout preferences, dietary preferences |
