# Member Settings — Improvement Plan

## Current State (Confirmed from Actual Code — March 2026)

**File:** `MemberSettings.tsx` — **759 lines**

**Confirmed structure:**
- `SECTIONS` array: 8 items — profile / fitness / membership / bookings / health / appearance / notifications / security
- Section persistence: `sessionStorage('member_settings_section')` — works correctly
- Theme switching: `useTheme()` hook — works correctly (appearance section)
- Imports: `../Settings/Settings.css` (shared 5643-line stylesheet) — confirmed correct
- Animations: `AnimatePresence` + `motion.div` with `duration: 0.25` — confirmed working

**The P0 problem — confirmed line by line:**
```tsx
// Lines 98–107 in MemberSettings.tsx — handleSave is a complete no-op:
const handleSave = async () => {
    setSaving(true);
    try {
        toast.success('Settings saved successfully');   // ← only thing that happens
    } catch {
        toast.error('Failed to save');
    } finally {
        setSaving(false);
    }
};
```
Every "Save Changes" button in all 8 sections calls this same `handleSave`. No API call is ever made. No data is ever loaded on mount. The file has `import api from '../../services/api'` at line 12 — but `api` is never used anywhere in the file.

---

## Backend — What Already Exists (Confirmed from MemberSettingsController.java)

`MemberSettingsController` at `/api/member/settings` has:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/member/settings/{userId}` | GET | Load all settings → `MemberSettingsDTO` |
| `PATCH /api/member/settings/{userId}/profile` | PATCH | Save profile fields → `MemberProfileUpdateDTO` |
| `PATCH /api/member/settings/{userId}/preferences` | PATCH | Save booking preferences → `MemberPreferenceDTO` |
| `PATCH /api/member/settings/{userId}/notifications` | PATCH | Save notification toggles → `NotificationSettingDTO` |
| `PATCH /api/member/settings/{userId}/privacy` | PATCH | Save privacy settings → `PrivacySettingDTO` |
| `POST /api/member/settings/{userId}/change-password` | POST | Change password → `UpdatePasswordRequest` |
| `GET /api/member/settings/{userId}/sessions` | GET | Get active sessions (placeholder) |

**Key finding:** The backend is already complete for all core settings sections. The frontend is the only blocker. No new backend endpoints need to be written for P0.

**Missing backend endpoints:**
- No `PATCH /api/member/settings/{userId}/fitness` endpoint — fitness goals have no save path
- No `PATCH /api/member/settings/{userId}/health` endpoint — health/wellness has no save path

---

## Remaining Critical Issues

### P0 — Nothing Actually Saves (All 8 Sections)

| Section | Required Action | Backend Endpoint |
|---------|----------------|-----------------|
| Profile | Load on mount + save on button click | `GET/{userId}` to load, `PATCH/{userId}/profile` to save |
| Fitness Goals | Load on mount + save | No endpoint yet → need `PATCH/{userId}/fitness` |
| Membership | Load real data instead of hardcoded | `GET /api/member/membership/{memberId}` (from MembershipController) |
| Booking Prefs | Load on mount + save | `GET/{userId}` to load, `PATCH/{userId}/preferences` to save |
| Health & Wellness | Load on mount + save | No endpoint yet → need `PATCH/{userId}/health` |
| Appearance | Already saves immediately via `useTheme()` | ✅ No change needed |
| Notifications | Load on mount + save | `GET/{userId}` to load, `PATCH/{userId}/notifications` to save |
| Security | Save password change | `POST/{userId}/change-password` |

### P0 Implementation — Load on Mount

Add `useEffect` after state declarations:
```tsx
useEffect(() => {
    if (!user?.userId) return;
    api.get(`/member/settings/${user.userId}`)
        .then(res => {
            const s = res.data;
            if (s.profile) setProfile(prev => ({ ...prev, ...s.profile }));
            if (s.preferences) setBookingPrefs(prev => ({ ...prev, ...s.preferences }));
            if (s.notifications) setNotifSettings(prev => ({ ...prev, ...s.notifications }));
            // fitness and health stored in same DTO
            if (s.fitness) setFitness(prev => ({ ...prev, ...s.fitness }));
            if (s.health) setHealth(prev => ({ ...prev, ...s.health }));
        })
        .catch(() => {}); // fail silently — defaults already set
}, [user?.userId]);
```

### P0 Implementation — Per-Section Save

Replace `handleSave` with section-specific handlers:

```tsx
const handleSave = async () => {
    if (!user?.userId) return;
    setSaving(true);
    try {
        switch (activeSection) {
            case 'profile':
                await api.patch(`/member/settings/${user.userId}/profile`, profile);
                break;
            case 'fitness':
                await api.patch(`/member/settings/${user.userId}/fitness`, fitness);
                break;
            case 'bookings':
                await api.patch(`/member/settings/${user.userId}/preferences`, bookingPrefs);
                break;
            case 'health':
                await api.patch(`/member/settings/${user.userId}/health`, health);
                break;
            case 'notifications':
                await api.patch(`/member/settings/${user.userId}/notifications`, notifSettings);
                break;
            case 'security':
                if (passwords.newPass !== passwords.confirm) {
                    toast.error('Passwords do not match');
                    return;
                }
                if (!passwords.newPass || !passwords.current) {
                    toast.error('Please fill all password fields');
                    return;
                }
                await api.post(`/member/settings/${user.userId}/change-password`, {
                    currentPassword: passwords.current,
                    newPassword: passwords.newPass,
                    confirmPassword: passwords.confirm,
                });
                setPasswords({ current: '', newPass: '', confirm: '' });
                break;
        }
        toast.success('Saved successfully');
    } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
        setSaving(false);
    }
};
```

---

## Additional Gaps Found in Source Code

### Gap 1: `preferredTrainer` is a free-text `<input>` (line 430)
```tsx
<input className="dense-input" value={bookingPrefs.preferredTrainer}
    onChange={e => setBookingPrefs(b => ({ ...b, preferredTrainer: e.target.value }))}
    placeholder="Enter trainer name (optional)" />
```
This should be a `<select>` populated from `GET /api/member/trainers` (already exists in `MemberTrainerController`). Free text input will not match any trainer ID.

**Fix:**
```tsx
const [trainerOptions, setTrainerOptions] = useState<{userId: number; name: string}[]>([]);
useEffect(() => {
    api.get('/member/trainers').then(r => setTrainerOptions(r.data || [])).catch(() => {});
}, []);
// In JSX:
<select className="dense-input" value={bookingPrefs.preferredTrainer}
    onChange={e => setBookingPrefs(b => ({ ...b, preferredTrainer: e.target.value }))}>
    <option value="">No preference</option>
    {trainerOptions.map(t => <option key={t.userId} value={String(t.userId)}>{t.name}</option>)}
</select>
```

### Gap 2: Membership section is fully hardcoded (lines 368–376)
```tsx
<div style={{ fontWeight: 700, fontSize: '16px' }}>Premium Membership</div>
<div style={{ fontSize: '12px', opacity: 0.6 }}>Active - Renews on Mar 15, 2026</div>
<div style={{ fontWeight: 700, fontSize: '18px', color: '#34C759' }}>$49.99</div>
```
No API call. No dynamic data. Every member sees "Premium Membership / $49.99 / Mar 15, 2026" regardless of their actual plan.

**Fix:** Load from `GET /api/member/membership/{memberId}` (confirmed endpoint exists in `MembershipController`):
```tsx
const [membershipData, setMembershipData] = useState<any>(null);
useEffect(() => {
    if (!user?.userId) return;
    api.get(`/member/membership/${user.userId}`)
        .then(r => setMembershipData(r.data))
        .catch(() => {});
}, [user?.userId]);
```

### Gap 3: Security section — no validation before save
The "Update Password" button calls `handleSave()` even when all 3 password fields are empty. It would hit the API with empty strings.

**Fix:** Add guard (already included in the improved `handleSave` above — checks for empty fields).

### Gap 4: No `useEffect` data load at all
`api` is imported (line 12) but never called. Zero data loading on mount. All state starts from hardcoded defaults and never reflects actual saved values.

### Gap 5: Fitness section has no backend endpoint
`PATCH /api/member/settings/{userId}/fitness` does not exist in `MemberSettingsController`. Need to add it.

### Gap 6: Health section has no backend endpoint  
`PATCH /api/member/settings/{userId}/health` does not exist. Need to add it.

### Gap 7: No password strength indicator in Security section
The section shows a "Passwords match/do not match" message (line 686–693), but no password strength meter for the new password field.

---

## Missing Functionality (P1)

| Feature | Description | Effort |
|---------|-------------|--------|
| Form validation | Email regex, phone format, required field highlights | Low |
| Password strength meter | Color bar (weak/medium/strong) on new password field | Low |
| Per-section dirty state | Disable Save button until form is changed (avoids accidental API calls) | Medium |
| Profile photo upload | Currently shows initial avatar — add file input + `PUT /api/member/profile/photo` | Medium |
| Account deletion | "Delete My Account" with confirmation modal → `DELETE /api/member/{userId}` | Medium |

## Missing Functionality (P2)

| Feature | Description |
|---------|-------------|
| Download my data | Export personal data as JSON |
| 2FA setup | Enable/disable two-factor authentication |
| Language/locale | Hindi, English selection |

---

## Backend Work Required

| Endpoint | Method | Status | Priority |
|----------|--------|--------|----------|
| `PATCH /api/member/settings/{userId}/fitness` | PATCH | Missing | P0 |
| `PATCH /api/member/settings/{userId}/health` | PATCH | Missing | P0 |
| `GET /api/member/settings/{userId}` includes fitness/health | GET | Verify DTO has all fields | P0 |
| `GET /api/member/membership/{memberId}` | GET | Exists | P0 |
| `GET /api/member/trainers` | GET | Exists | P0 |

---

## Architecture Note

The `MemberSettings.tsx` monolith (759 lines, one `renderSection()` switch) is functional and should not be refactored until all 8 sections actually save data. Refactoring priority:

1. **Phase 1 (P0):** Add `useEffect` load on mount + wire each section's save to correct API
2. **Phase 2 (P0):** Fix `preferredTrainer` to use dropdown, fix membership to show real data
3. **Phase 3 (P1):** Validation, dirty state, password strength
4. **Phase 4 (P2):** Extract into section files (see SHARED_SETTINGS_PAGE_REUSE_PLAN)

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Load data on mount via `GET /api/member/settings/{userId}`; wire Profile save; wire Booking Prefs save; wire Notifications save; wire Password change |
| **Phase 2** | Add backend `PATCH /fitness` and `PATCH /health` endpoints; wire Fitness save and Health save; fix Membership to show real data; fix `preferredTrainer` to use dropdown |
| **Phase 3** | Validation, dirty tracking, password strength meter |
| **Phase 4** | Profile photo upload, account deletion |
