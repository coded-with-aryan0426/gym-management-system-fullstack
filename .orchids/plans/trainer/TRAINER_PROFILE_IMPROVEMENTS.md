# Trainer Profile — Improvement Plan

## Current State Analysis

**File:** `TrainerProfile.tsx` (585 lines)  
**Current features:** Avatar upload, personal info editing (name, phone, email, bio, DOB, gender, address), specialization tags, language tags, certifications display, availability status, experience years, stats (rating, reviews, members), inline field rendering with edit mode, save functionality via API.

**Problems:**
- No certification upload (only display — can't add/remove certifications)
- Avatar upload exists but no crop/resize functionality
- Tags input for languages/specializations has no autocomplete
- No portfolio section (before/after photos of clients)
- No "View profile as members see it" preview
- `renderField` helper handles all field types in one function — grows complex
- No fields for pricing (session rates, packages)
- No schedule/availability configuration from profile page
- Stats section is read-only with no drill-down

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Certification management | Upload cert images/PDFs, add expiry dates, auto-expire warnings |
| **P0** | Session pricing | Set per-session rate, package deals (5/10/20 sessions), display on profile |
| **P0** | Availability schedule | Set weekly availability hours (not just online/offline toggle) |
| **P1** | Portfolio section | Before/after client transformations, training videos, testimonials |
| **P1** | Profile preview mode | "See how members see your profile" toggle |
| **P1** | Cover photo | Background banner image for profile page |
| **P1** | Detailed bio editor | Rich text editor for bio (bold, bullets, links) |
| **P2** | Social media links | Instagram, YouTube, LinkedIn for personal branding |
| **P2** | Training philosophy | Text field: "My training approach is..." |
| **P2** | Client testimonials | Invite clients to leave testimonials displayed on profile |
| **P3** | Video introduction | Upload a 30-second intro video |
| **P3** | Profile analytics | How many members viewed your profile, click-through rate |

---

## UI/UX Improvements

### Layout Changes
- **Hero section:** Full-width cover photo + circular avatar (overlapping) + name + specialization title + rating stars
- **Tab navigation:** Overview | Certifications | Portfolio | Reviews | Pricing
- **Stats bar:** 4 inline stats with icons (Rating, Reviews, Experience, Active Members) below hero

### Visual Enhancements
- Profile completeness progress bar (encourage filling all sections)
- Animated rating stars
- Certification cards with badge icons and expiry countdown
- Specialization tags as premium pill chips
- Avatar with camera overlay on hover (upload prompt)

### Interactions
- Click-to-edit per field (inline editing without global edit mode)
- Drag-and-drop portfolio image ordering
- Image crop modal for avatar and cover photo
- Auto-save with debounce (no explicit save button per field)

---

## Things to Remove
- **Monolithic `renderField` function** — split into typed field components

## Things Showing Same Content
- Trainer profile info shown here AND partially on member's MyTrainer page → ensure API returns same data
- Specializations shown here AND in MyClasses as class instructor

---

## Performance Improvements
- Lazy load Portfolio and Reviews tabs
- Compress uploaded images client-side
- Cache profile data in context

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Certification management, pricing section, cover photo |
| **Phase 2** | Availability schedule, profile preview, stats drill-down |
| **Phase 3** | Portfolio, testimonials, social links |
| **Phase 4** | Video intro, profile analytics |
