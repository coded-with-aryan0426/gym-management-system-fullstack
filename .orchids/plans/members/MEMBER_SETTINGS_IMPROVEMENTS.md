# Member Settings — Improvement Plan

## Current State Analysis

**File:** `MemberSettings.tsx` (654 lines)  
**Current features:** Profile editing, preferences (workout time, goal), notification toggles, privacy toggles, password change, active sessions list, sidebar section navigation.

**Problems:**
- Has its own custom sidebar navigation — inconsistent with the Owner Settings page UI which is significantly better designed
- Profile editing duplicated here AND in MemberProfile page
- Uses `"use client"` directive — this is a Vite SPA, not Next.js (dead code)
- `renderContent()` is a 420-line switch statement — monolithic
- Privacy toggles don't actually do anything visible (no API confirmation)
- No theme/appearance section (member can't change theme)
- No account deletion or data download (GDPR requirement)
- No language selection
- Active sessions display has no device details or location

---

## Critical: Reuse Owner Settings UI Architecture

> **The Owner Settings page (`Settings.tsx`) uses a much better architecture:**
> - Clean sidebar with icon + label + description
> - Each section is a separate component file in `sections/`
> - Animated transitions between sections
> - Session-storage persistence of active section
>
> **This MUST be adopted for Member Settings.** See `SHARED_SETTINGS_PAGE_REUSE_PLAN.md`.

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Adopt Owner Settings UI shell | Reuse sidebar + section component architecture |
| **P0** | Theme/appearance | Dark/light/system mode toggle (owner has this, member doesn't) |
| **P0** | Account deletion | "Delete my account" with confirmation and data wipeout |
| **P0** | Download my data | Export all personal data as JSON/PDF (GDPR/privacy compliance) |
| **P1** | Language selection | Hindi, English, etc. |
| **P1** | Notification granularity | Per-type toggles: class reminders, payment alerts, trainer messages, promotions |
| **P1** | Email preferences | Marketing emails opt-in/out, frequency (daily digest vs instant) |
| **P1** | Connected devices | Show device name, OS, browser, last active, location |
| **P1** | Two-factor authentication | Enable/disable 2FA with QR code setup |
| **P2** | Linked accounts | Google, Apple login linking |
| **P2** | Display name preference | What name to show on leaderboard/classes (full name vs nickname) |
| **P2** | Accessibility | Font size, high contrast, reduced motion toggles |
| **P3** | Auto check-in | Toggle automatic check-in via geofencing near gym |

---

## UI/UX Improvements

### Architecture Change
- **Replace custom sidebar** with Owner Settings sidebar component (shared `SettingsShell` component)
- **Split `renderContent()`** into separate section files:
  - `MemberProfileSection.tsx`
  - `AppearanceSection.tsx` (reuse owner's `ThemeSection` with member-specific options)
  - `NotificationSection.tsx`
  - `PrivacySection.tsx`
  - `SecuritySection.tsx`
  - `AccountSection.tsx` (new: delete account, download data)

### Sections for Member Settings (proposed)
```
1. My Profile       — Name, email, phone, avatar (read-only, link to Profile page)
2. Appearance       — Theme, font size, reduced motion
3. Notifications    — Per-type toggles with preview
4. Privacy          — Profile visibility, activity sharing, leaderboard opt-in
5. Security         — Password change, 2FA, active sessions with device info
6. Account          — Download data, delete account, deactivate
```

### Visual Enhancements
- Match owner's gradient icon style for sidebar items
- Success/error toasts with undo capability after changes
- Confirmation modal for dangerous actions (delete, deactivate)
- Toggle switches with smooth animation (consistent with owner page)
- Section-level save indicator (auto-save with "Saved ✓" badge)

---

## Things to Remove
- **`"use client"` directive** — not a Next.js app
- **Profile editing form** — belongs in MemberProfile, not Settings. Show read-only summary with "Edit Profile" link
- **Workout preference dropdowns** (goal, workout time) — these belong in Profile > Fitness Goals

## Things Showing Same Content Multiple Times
- **Profile info (name, email, phone, avatar):** Editable in BOTH MemberProfile AND MemberSettings — consolidate to one place
- **Password change:** Should be ONLY in Security section, not mixed with profile

---

## Performance Improvements
- Lazy-load each section component (only render active section)
- Auto-save with debounce (500ms) instead of explicit save buttons
- Cache settings data in context to avoid refetch on section switch

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Adopt shared SettingsShell UI, split into section components |
| **Phase 2** | Theme/appearance section, notification granularity |
| **Phase 3** | Security (2FA, device details), download data, delete account |
| **Phase 4** | Language, accessibility, linked accounts |
