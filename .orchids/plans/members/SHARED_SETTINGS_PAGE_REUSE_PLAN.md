# Shared Settings Page — Reuse Plan

## Current State (Confirmed from Actual Code — March 2026)

### Architecture Comparison

| Feature | Owner Settings | Member Settings | Trainer Settings |
|---------|---------------|-----------------|------------------|
| **File size** | **131 lines** (thin wrapper) | **759 lines** (monolith) | **914 lines** (monolith) |
| **Sidebar structure** | Gradient icons, label + desc, `motion.button` via `Settings.css` | ✅ Same CSS classes — `settings-nav-item`, `settings-nav-item__icon`, etc. | Unknown (separate CSS) |
| **Section components** | ✅ Separate files in `pages/Settings/sections/` (13 files) | ❌ All inline in `renderSection()` switch | ❌ All inline |
| **AnimatePresence transitions** | ✅ Spring transitions | ✅ `duration: 0.25` transitions | Unknown |
| **State persistence** | ✅ `sessionStorage('settings_active_section')` | ✅ `sessionStorage('member_settings_section')` | Unknown |
| **Shared CSS** | `Settings.css` (5643 lines) | ✅ Imports `../Settings/Settings.css` at line 13 | Unknown |
| **API wired** | ✅ Most sections save | ❌ `handleSave()` is no-op (confirmed) | Unknown |
| **`import api`** | ✅ Used | ✅ Imported but **never called** | Unknown |

### Confirmed Key Finding

`MemberSettings.tsx` already:
- Imports `../Settings/Settings.css` — shares all 5643 lines of premium styles
- Uses identical CSS class names: `settings-page`, `settings-layout`, `settings-sidebar`, `settings-content`, `settings-nav`, `settings-nav-item`, `settings-nav-item--active`, `settings-nav-item__icon`, `settings-section`, `settings-section__header`, `settings-section__content`, `form-group`, `form-grid`, `field-wrapper`, `dense-input`, `policy-toggle`, `policy-toggle--active`
- Has `AnimatePresence` + `motion.div` with `mode="wait"`
- Has sessionStorage persistence

**The UI shell is effectively already shared.** The only structural difference is monolith vs. extracted section files.

---

## What Still Needs To Be Done

### Issue 1 (P0): Member Settings `handleSave` is a no-op
All 8 Save buttons call a `handleSave()` that only shows `toast.success` — no API call ever made. The `api` import on line 12 is unused. This is the highest priority fix. See `MEMBER_SETTINGS_IMPROVEMENTS.md` for full fix plan.

**This must be fixed before any architectural refactoring.**

### Issue 2 (P1): Appearance section duplicates ThemeSection
Owner Settings uses `<ThemeSection />` from `pages/Settings/sections/ThemeSection.tsx`.

Member Settings has its own inline appearance UI (lines 558–580):
```tsx
case 'appearance':
    return (
        <div className="settings-section" ...>
            <div className="theme-selector">
                {[
                    { key: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on the eyes' },
                    { key: 'light', icon: Sun, label: 'Light', desc: 'Classic bright look' },
                    { key: 'system', icon: Monitor, label: 'System', desc: 'Match device theme' },
                ].map(t => (
                    <button className={`theme-option ${themeMode === t.key ? 'theme-option--active' : ''}`}
                        onClick={() => setThemeMode(t.key as any)}>
```
This is a near-exact copy of what `ThemeSection.tsx` does. When Owner's ThemeSection is updated, Member's appearance section won't get the update.

**Fix:** Replace the `case 'appearance'` block entirely with:
```tsx
case 'appearance':
    return <ThemeSection />;
// import ThemeSection from '../Settings/sections/ThemeSection';
```

### Issue 3 (P1): Security section not reused
Owner Settings has `pages/Settings/sections/SecuritySection.tsx` (password change + 2FA).
Member Settings has its own inline password-change UI in `case 'security'` (lines 633–697).

**Options:**
- **Option A (Recommended):** Keep `MemberSecuritySection` separate (it has member-specific logic like `POST /api/member/settings/{userId}/change-password` vs owner's endpoint).
- **Option B:** Extract a shared `PasswordChangeSection` component used by both, with a `changePasswordEndpoint` prop.

### Issue 4 (P1): Trainer Settings (914 lines) is also a monolith
Same pattern — all sections inline. After member settings is fixed, trainer settings should get the same treatment.

### Issue 5 (P2): No shared `SettingsShell` component
Both Owner and Member Settings implement the sidebar + `AnimatePresence` + sessionStorage pattern themselves. A `SettingsShell` component could eliminate this duplication entirely.

---

## Recommended Refactoring Plan

### Phase 1 (P0) — Fix Saves First
**Do NOT refactor until saves work.** Extracting sections into files while saves are broken makes debugging harder.

1. Wire `handleSave` to correct API endpoints (see `MEMBER_SETTINGS_IMPROVEMENTS.md`)
2. Add `useEffect` to load data on mount
3. Fix `preferredTrainer` to use dropdown from API
4. Fix Membership section to show real data

### Phase 2 (P1) — Remove Appearance Duplication
1. Replace `case 'appearance'` in MemberSettings with `<ThemeSection />`
2. Same for Trainer Settings if it also has a duplicate appearance section

### Phase 3 (P1) — Extract Member Settings Sections

```
pages/member/settings/sections/
├── MemberProfileSection.tsx       (profile form + photo avatar)
├── FitnessSection.tsx             (goals, body stats, workout type chips)
├── MemberMembershipSection.tsx    (plan display from API)
├── BookingPrefsSection.tsx        (time/trainer/toggles)
├── HealthSection.tsx              (blood group, allergies, emergency contact)
├── AppearanceSection.tsx          → re-exports ThemeSection
├── MemberNotifSection.tsx         (7 notification toggles)
└── MemberSecuritySection.tsx      (password change)
```

`MemberSettings.tsx` becomes:
```tsx
// ~60 lines — thin wrapper
const SECTIONS = [...]; // same array, just import section components
const renderSection = () => {
    switch (activeSection) {
        case 'profile': return <MemberProfileSection />;
        case 'fitness': return <FitnessSection />;
        // ...
    }
};
```

### Phase 4 (P2) — Extract `SettingsShell`

The sidebar rendering, `AnimatePresence` transitions, and sessionStorage persistence are repeated in Owner and Member Settings. Extract to a shared component:

```tsx
// components/shared/SettingsShell.tsx
interface SettingsCategory {
    id: string;
    label: string;
    icon: LucideIcon;
    desc: string;
    color: string;
}

interface SettingsShellProps {
    categories: SettingsCategory[];
    renderSection: (activeSection: string) => React.ReactNode;
    storageKey: string;
}
```

Both `Settings.tsx` (owner, 131 lines) and `MemberSettings.tsx` (member, 759 lines) become ~30-line thin wrappers that define their section arrays and delegate everything to `SettingsShell`.

### Phase 5 (P2) — Trainer Settings Refactoring

Apply same treatment to `TrainerSettings.tsx` (914 lines):
```
pages/trainer/settings/sections/
├── TrainerProfileSection.tsx
├── AvailabilitySection.tsx
├── SessionDefaultsSection.tsx
├── AppearanceSection.tsx          → re-exports ThemeSection
├── TrainerNotifSection.tsx
├── PrivacySection.tsx
├── SecuritySection.tsx
└── AccountSection.tsx
```

---

## Reusable Components Inventory

### Currently shareable (in `pages/Settings/sections/`):

| Component | Shareable With | Status |
|-----------|---------------|--------|
| `ThemeSection.tsx` | Member ✅, Trainer (unknown) | P1 — use in Member Settings |
| `SecuritySection.tsx` | Member (adapt), Trainer (adapt) | P2 — evaluate if password endpoint is different |

### Owner-only (not shared):
- `AuditLogSection.tsx`
- `BillingRulesSection.tsx`
- `GymProfileSection.tsx`
- `MemberRulesSection.tsx`
- `MembershipPoliciesSection.tsx`
- `NotificationsSection.tsx` (gym-wide alerts — different from member notification prefs)
- `OwnerProfileSection.tsx`
- `RolesSection.tsx`
- `StaffRulesSection.tsx`
- `TrainerRulesSection.tsx`
- `UserRulesSection.tsx`

---

## File Structure After Full Refactoring

```
components/shared/
└── SettingsShell.tsx              ← extracted (Phase 4)

pages/Settings/
├── Settings.tsx                   ← owner, ~30 lines (Phase 4)
├── Settings.css                   ← shared styles, keep as-is
└── sections/
    ├── ThemeSection.tsx           ← shared across all 3 roles
    ├── SecuritySection.tsx        ← shared with role/endpoint prop
    └── ... (owner-only sections)

pages/member/settings/
├── MemberSettings.tsx             ← ~30 lines (Phase 4)
└── sections/
    ├── MemberProfileSection.tsx
    ├── FitnessSection.tsx
    ├── MemberMembershipSection.tsx
    ├── BookingPrefsSection.tsx
    ├── HealthSection.tsx
    ├── AppearanceSection.tsx      → re-exports ThemeSection
    ├── MemberNotifSection.tsx
    └── MemberSecuritySection.tsx

pages/trainer/settings/
├── TrainerSettings.tsx            ← ~30 lines (Phase 5)
└── sections/
    ├── TrainerProfileSection.tsx
    ├── AvailabilitySection.tsx
    ├── SessionDefaultsSection.tsx
    ├── AppearanceSection.tsx      → re-exports ThemeSection
    ├── TrainerNotifSection.tsx
    ├── PrivacySection.tsx
    ├── SecuritySection.tsx
    └── AccountSection.tsx
```

---

## Implementation Priority

| Phase | Items | Prerequisite |
|-------|-------|-------------|
| **Phase 1 (P0)** | Fix Member Settings no-op saves — wire all 8 section saves to real API | None |
| **Phase 2 (P1)** | Replace Member Settings appearance section with `<ThemeSection />` | Phase 1 done |
| **Phase 3 (P1)** | Extract Member Settings sections into separate files | Phase 1+2 done |
| **Phase 4 (P2)** | Extract `SettingsShell` shared component; refactor Owner + Member to use it | Phase 3 done |
| **Phase 5 (P2)** | Refactor Trainer Settings to use SettingsShell + section files | Phase 4 done |

> **Critical rule:** Never refactor for cleanliness while the feature is broken. Phase 1 (functional correctness) is a hard prerequisite for all phases.
