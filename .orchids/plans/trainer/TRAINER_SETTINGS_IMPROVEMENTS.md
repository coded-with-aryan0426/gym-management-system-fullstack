# Trainer Settings — Improvement Plan

## Current State Analysis

**File:** `TrainerSettings.tsx` (724 lines)  
**Current features:** Profile editing, notification toggles, privacy settings, appearance (theme), security (password change), active sessions, sidebar navigation with section switching.

**Problems:**
- Custom sidebar navigation — completely different from the Owner Settings page UI
- `renderSectionContent()` is a 490-line switch statement — monolithic
- Has its own theme toggle but no sync with system-wide theme
- Profile editing duplicated here AND in TrainerProfile
- No 2FA setup
- No account deletion option
- No data export
- Uses its own save mechanism instead of auto-save pattern

---

## Critical: Reuse Owner Settings UI Architecture

> **The Owner Settings page uses a superior architecture:**
> - Sidebar with gradient icons, labels, and descriptions
> - Each section is a separate component in `sections/`
> - AnimatePresence for smooth transitions
> - SessionStorage persistence of active section
>
> **Trainer Settings MUST adopt this same architecture.** See `SHARED_SETTINGS_PAGE_REUSE_PLAN.md`.

---

## Missing Functionality

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Adopt Owner Settings UI shell | Use shared SettingsShell component |
| **P0** | Split into section components | One file per section, matching owner pattern |
| **P1** | Availability preferences | Default working hours, break preferences, max sessions/day |
| **P1** | Session defaults | Default session duration, buffer time between sessions, auto-notes template |
| **P1** | 2FA setup | Two-factor authentication with QR code |
| **P1** | Connected devices with details | Device name, OS, browser, location, last active |
| **P2** | Notification granularity | Per-type: new booking, cancellation, payment, message, review |
| **P2** | Calendar integration | Sync with Google Calendar, Apple Calendar |
| **P2** | Account deletion | "Delete my account" with data export option |
| **P2** | Data download | Export all trainer data as JSON/PDF |
| **P3** | Custom branding | Custom color accent for trainer's profile/session views |

---

## Proposed Settings Sections (using Owner Settings UI)

```
1. My Profile         — Read-only summary with "Edit Profile" link
2. Appearance         — Theme, font size, reduced motion (reuse owner ThemeSection)
3. Availability       — Working hours, max sessions, break preferences (NEW)
4. Session Defaults   — Default duration, buffer, notes template (NEW)
5. Notifications      — Per-type notification toggles
6. Privacy            — Profile visibility, activity sharing
7. Security           — Password, 2FA, active sessions with device info
8. Integrations       — Google Calendar, Apple Calendar sync (NEW)
9. Account            — Data download, account deletion
```

---

## UI/UX Improvements

### Architecture Change
- Replace custom sidebar with shared `SettingsShell` component
- Split `renderSectionContent()` into separate files:
  - `TrainerProfileSection.tsx`
  - `AppearanceSection.tsx` (reuse from owner)
  - `AvailabilitySection.tsx` (new)
  - `SessionDefaultsSection.tsx` (new)
  - `NotificationsSection.tsx`
  - `PrivacySection.tsx`
  - `SecuritySection.tsx`
  - `IntegrationsSection.tsx` (new)
  - `AccountSection.tsx` (new)

### Visual Enhancements
- Match owner's gradient icon sidebar style
- Auto-save with "Saved ✓" indicator per section
- Danger zone styling for account deletion
- Toggle switches with smooth animation

---

## Things to Remove
- **Profile editing** — belongs in TrainerProfile, not here
- **Custom sidebar** — replace with shared component
- **490-line switch statement** — decompose into components

## Things Showing Same Content
- Profile info editable in BOTH TrainerProfile AND TrainerSettings — consolidate
- Theme toggle exists here AND in system header — sync via context

---

## Performance Improvements
- Lazy load each section (only render active)
- Auto-save with debounce
- Cache settings in context

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Adopt shared SettingsShell, split into sections |
| **Phase 2** | Availability, session defaults, notification granularity |
| **Phase 3** | Security (2FA, devices), data download, account deletion |
| **Phase 4** | Calendar integration, custom branding |
