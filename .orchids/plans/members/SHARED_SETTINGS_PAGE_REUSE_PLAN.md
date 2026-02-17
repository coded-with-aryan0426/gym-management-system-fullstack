# Shared Settings Page — Reuse Plan

## Overview

The Owner Settings page (`frontend/src/pages/Settings/Settings.tsx`) has the best UI architecture for settings pages in the application. Both the **Member Settings** and **Trainer Settings** pages currently have their own custom, inferior implementations. This plan outlines how to extract the Owner Settings UI shell into a shared component and reuse it across all three roles.

---

## Current Architecture Comparison

| Feature | Owner Settings ✅ | Member Settings ❌ | Trainer Settings ❌ |
|---------|------------------|-------------------|---------------------|
| **Sidebar style** | Gradient icons, label + description | Basic list items | Custom sidebar |
| **Section components** | Separate files in `sections/` | One 420-line switch statement | One 490-line switch statement |
| **Transitions** | AnimatePresence smooth transitions | Basic rendering | AnimatePresence (inconsistent) |
| **State persistence** | SessionStorage for active section | None | None |
| **CSS** | `Settings.css` (121KB — premium) | `MemberSettings.css` (12KB) | `TrainerSettings.css` (22KB) |
| **File size** | 128 lines (shell only) | 654 lines (monolith) | 724 lines (monolith) |

---

## Architecture Plan

### Step 1: Extract Shared `SettingsShell` Component

Create: `frontend/src/components/shared/SettingsShell.tsx`

```tsx
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
    storageKey: string; // e.g., 'member_settings', 'trainer_settings'
}

const SettingsShell: React.FC<SettingsShellProps> = ({
    categories, renderSection, storageKey
}) => {
    // SessionStorage persistence
    // Sidebar rendering
    // AnimatePresence transitions
    // Uses Settings.css (shared)
};
```

### Step 2: Refactor Owner Settings to Use Shell

```tsx
// Settings.tsx (Owner) — becomes thin wrapper
import SettingsShell from '../../components/shared/SettingsShell';

const ownerCategories = [
    { id: 'profile', label: 'Owner Profile', icon: User, desc: '...', color: '#3b82f6' },
    // ... existing categories
];

const Settings = () => (
    <SettingsShell
        categories={ownerCategories}
        storageKey="owner_settings"
        renderSection={(section) => {
            switch (section) {
                case 'profile': return <OwnerProfileSection />;
                // ... existing sections
            }
        }}
    />
);
```

### Step 3: Refactor Member Settings to Use Shell

```tsx
// MemberSettings.tsx — becomes thin wrapper
import SettingsShell from '../../components/shared/SettingsShell';

const memberCategories = [
    { id: 'profile', label: 'My Profile', icon: User, desc: 'Personal details', color: '#3b82f6' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & Display', color: '#a855f7' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & Reminders', color: '#f97316' },
    { id: 'privacy', label: 'Privacy', icon: Eye, desc: 'Visibility & Sharing', color: '#10b981' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Password & 2FA', color: '#ef4444' },
    { id: 'account', label: 'Account', icon: Settings, desc: 'Data & Deletion', color: '#6b7280' },
];

const MemberSettings = () => (
    <SettingsShell
        categories={memberCategories}
        storageKey="member_settings"
        renderSection={(section) => {
            switch (section) {
                case 'profile': return <MemberProfileSection />;
                case 'appearance': return <ThemeSection />;  // REUSE from owner!
                // ... new member-specific sections
            }
        }}
    />
);
```

### Step 4: Refactor Trainer Settings to Use Shell

```tsx
// TrainerSettings.tsx — becomes thin wrapper
import SettingsShell from '../../components/shared/SettingsShell';

const trainerCategories = [
    { id: 'profile', label: 'My Profile', icon: User, desc: 'Personal details', color: '#3b82f6' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & Display', color: '#a855f7' },
    { id: 'availability', label: 'Availability', icon: Calendar, desc: 'Working hours', color: '#10b981' },
    { id: 'sessions', label: 'Session Defaults', icon: Clock, desc: 'Duration & Buffer', color: '#f59e0b' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & Reminders', color: '#f97316' },
    { id: 'privacy', label: 'Privacy', icon: Eye, desc: 'Visibility & Sharing', color: '#06b6d4' },
    { id: 'security', label: 'Security', icon: Shield, desc: 'Password & 2FA', color: '#ef4444' },
    { id: 'integrations', label: 'Integrations', icon: Link, desc: 'Calendar sync', color: '#8b5cf6' },
    { id: 'account', label: 'Account', icon: Settings, desc: 'Data & Deletion', color: '#6b7280' },
];
```

---

## Reusable Sections Across Roles

| Section Component | Owner | Member | Trainer |
|-------------------|-------|--------|---------|
| `ThemeSection` | ✅ | ✅ (reuse) | ✅ (reuse) |
| `SecuritySection` | ✅ | ✅ (adapt) | ✅ (adapt) |
| `NotificationsSection` | ✅ (gym-wide) | New (personal) | New (personal) |
| `OwnerProfileSection` | ✅ | ❌ | ❌ |
| `MemberProfileSection` | ❌ | New | ❌ |
| `TrainerProfileSection` | ❌ | ❌ | New |
| `AvailabilitySection` | ❌ | ❌ | New |
| `SessionDefaultsSection` | ❌ | ❌ | New |
| `AccountSection` | ❌ | New | New |
| `PrivacySection` | ❌ | New | New |

---

## CSS Strategy

The Owner's `Settings.css` (121KB) contains all the styling needed for the settings shell (sidebar, layout, transitions). This file should be:
1. Kept as-is for the shared shell styling
2. Role-specific section CSS goes in each section's own CSS file
3. No need for `MemberSettings.css` or `TrainerSettings.css` as separate layout CSS — only section-specific overrides

---

## File Structure After Refactoring

```
components/shared/
├── SettingsShell.tsx          (extracted from owner Settings.tsx)
├── SettingsShell.css          (extracted from Settings.css — shell styles only)

pages/Settings/
├── Settings.tsx               (owner — thin wrapper using SettingsShell)
├── sections/
│   ├── OwnerProfileSection.tsx
│   ├── ThemeSection.tsx        ← SHARED across all roles
│   ├── SecuritySection.tsx     ← SHARED (with role prop)
│   ├── NotificationsSection.tsx (owner-specific: gym-wide)
│   └── ... (owner-specific sections)

pages/member/settings/
├── MemberSettings.tsx         (thin wrapper using SettingsShell)
├── sections/
│   ├── MemberProfileSection.tsx
│   ├── MemberNotificationsSection.tsx
│   ├── PrivacySection.tsx
│   └── AccountSection.tsx

pages/trainer/settings/
├── TrainerSettings.tsx        (thin wrapper using SettingsShell)
├── sections/
│   ├── TrainerProfileSection.tsx
│   ├── AvailabilitySection.tsx
│   ├── SessionDefaultsSection.tsx
│   ├── TrainerNotificationsSection.tsx
│   ├── PrivacySection.tsx
│   ├── IntegrationsSection.tsx
│   └── AccountSection.tsx
```

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Extract `SettingsShell` from owner Settings, verify owner still works |
| **Phase 2** | Refactor Member Settings to use SettingsShell + create section files |
| **Phase 3** | Refactor Trainer Settings to use SettingsShell + create section files |
| **Phase 4** | Add new sections (Availability, Session Defaults, Account, Integrations) |

---

## Benefits

- **Consistency:** All three settings pages look and behave identically
- **Maintenance:** Update sidebar/transitions in one place, applies to all
- **Code reduction:** Member goes from 654 → ~30 lines, Trainer from 724 → ~35 lines
- **Reusable sections:** ThemeSection and SecuritySection shared across all roles
- **Persistence:** All roles get sessionStorage active section memory
