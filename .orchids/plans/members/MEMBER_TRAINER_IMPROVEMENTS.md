# My Trainer — Improvement Plan

## Current State (Confirmed from Actual Code — March 2026)

**File:** `MyTrainer.tsx` — **564 lines**
**CSS:** `MyTrainer.css` (exists), also imports `MemberProfile.css` (tight coupling)

**Confirmed structure:**
- Root `<motion.div className="member-profile">` — uses `MemberProfile.css` classes (coupling confirmed)
- `<motion.div className="profile-hero">` — hero banner with animated ring, dynamic title based on `assignedTrainers.length`
- 3 stat minis: `{trainers.length} Professionals`, `98% Member Sat` (hardcoded), `Elite Expertise` (hardcoded)
- Toggle button: `showDiscovery` state → "Discover Trainers" / "Back to Team"
- **Team view:** assigned trainer full cards + "Recommended for You" compact grid (top 3 unassigned)
- **Discovery view:** search + category filter chips + sort dropdown + trainer grid

**Backend (MemberTrainerController.java — confirmed):**
- `GET /api/member/trainers/assigned` — reads from `SecurityContextHolder` → returns `currentUser.getTrainers()`
- `POST /api/member/trainers/{trainerId}/request` — immediately adds trainer to `currentUser.getTrainers()` (no approval flow)
- `GET /api/member/trainers` — returns all users with TRAINER role
- **No** `DELETE /api/member/trainers/{id}/unassign` endpoint
- `matchPercentage` is NOT returned by backend — field is optional in DTO, always `null`/`undefined`

---

## Confirmed Bugs (Line Numbers from Actual Source)

### Bug 1: "View Profile" button on recommended card ASSIGNS the trainer (line 421–425)
```tsx
// CURRENT (line 421-425) — misleading label:
<button
    className="macos-btn macos-btn--primary"
    style={{ width: '100%', padding: '8px', fontSize: '12px' }}
    onClick={() => handleRequestTrainer(trainer.userId, trainer.name)}
>
    View Profile   ← WRONG: this actually calls handleRequestTrainer which ASSIGNS the trainer
</button>
```
**Fix:** Rename to "Add to My Team" or "Request Trainer".

### Bug 2: MessageSquare button has NO onClick (lines 297–300)
```tsx
// CURRENT:
<button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }} title="Send Message">
    <MessageSquare size={18} />
</button>
// No onClick handler — clicking does nothing
```
**Fix:** `onClick={() => navigate('/member/messages?trainerId=${trainer.userId}')}`

### Bug 3: Info button has NO onClick (lines 301–303 and line 548–550)
```tsx
// In assigned trainer card (line 301):
<button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }} title="Trainer Details">
    <Info size={18} />
</button>
// In discovery card (line 548):
<button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }}>
    <Info size={16} />
</button>
// Both have no onClick
```
**Fix:** Open a `TrainerDetailModal` showing full bio, certifications, availability, stats.

### Bug 4: `trainer.name[0]` crashes if name is undefined/null (lines 273, 387, 501)
```tsx
// Line 273 (assigned full card):
fontSize: '36px', ...
}>
    {trainer.name[0]}   ← crashes if trainer.name is undefined, null, or empty string

// Line 387 (recommended card):
{trainer.name[0]}

// Line 501 (discovery card):
{trainer.name[0]}
```
**Fix (all 3 occurrences):**
```tsx
{(trainer.name || 'T').charAt(0).toUpperCase()}
```

### Bug 5: "98% Member Sat" is hardcoded (lines 209–214)
```tsx
<div className="profile-stat-mini">
    <div className="profile-stat-mini__header">
        <span className="profile-stat-mini__value">98%</span>
        <Heart size={12} className="profile-stat-mini__icon" />
    </div>
    <span className="profile-stat-mini__label">Member Sat</span>
</div>
```
This is a fabricated statistic shown to every member regardless of actual trainer ratings.

**Fix:** Compute from real data: `const avgRating = trainers.length ? (trainers.reduce((sum, t) => sum + (t.stats?.rating || 0), 0) / trainers.length) : 0;` then display `{Math.round((avgRating / 5) * 100)}%`.

### Bug 6: "Elite Expertise" is hardcoded (lines 215–221)
Same pattern — fabricated. **Fix:** Replace with `{assignedTrainers.length > 0 ? assignedTrainers.length + ' Assigned' : 'Explore'}` or remove this stat entirely.

### Bug 7: Discovery empty state is missing
When `filteredAndSortedTrainers.length === 0` (after search/filter), the `trainer-grid` is empty — no message shown. Only blank space.

**Fix:**
```tsx
{filteredAndSortedTrainers.length === 0 && (
    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
        <Search size={32} style={{ marginBottom: '12px' }} />
        <div>No trainers match your search</div>
        <button onClick={() => { setSearchQuery(''); setSelectedCategory('All Skills'); }}>
            Clear filters
        </button>
    </div>
)}
```

### Bug 8: Sort by "Match" shows no differentiation
`matchPercentage` is never set by backend (field not in `mapToDiscoveryDTO`). All trainers sort as `0`. Sort by "Match" is effectively random.

**Fix Option A:** Remove "Sort: Match" from dropdown since it has no real data. Keep Rating and Experience.  
**Fix Option B:** Backend adds `matchPercentage` based on member's `primaryGoal` from settings vs. trainer's `specializations`.

### Bug 9: CSS coupling — uses `member-profile` and `profile-hero` from `MemberProfile.css`
```tsx
// Line 149:
className="member-profile"
// Line 154:
className="profile-hero"
```
These classes are defined in `MemberProfile.css`. Any change to `MemberProfile.css` can break `MyTrainer.tsx`.

**Fix:** Add `trainer-page` and `trainer-hero` classes to `MyTrainer.css` with equivalent styles. Remove `import './MemberProfile.css'`.

### Bug 10: `fetchData` not in `useCallback`
```tsx
const fetchData = async () => { ... };  // line 82 — not memoized
useEffect(() => { if (!authLoading) fetchData(); }, [authLoading]); // depends on fetchData
```
This is lint-clean since `fetchData` is stable (no deps), but it should be `useCallback` for correctness if deps are added later.

---

## Missing Features (P1)

### Unassign trainer
No "Remove" button on assigned trainer cards. No `DELETE /api/member/trainers/{id}/unassign` endpoint.

**Frontend fix:**
```tsx
const handleUnassignTrainer = async (trainerId: number, trainerName: string) => {
    if (!window.confirm(`Remove ${trainerName} from your team?`)) return;
    // replace window.confirm with inline confirm UI
    try {
        await api.delete(`/member/trainers/${trainerId}/unassign`);
        toast.success(`${trainerName} removed from your team`);
        const res = await api.get('/member/trainers/assigned');
        setAssignedTrainers(res.data || []);
    } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to remove trainer');
    }
};
```

**Backend fix:** Add to `MemberTrainerController`:
```java
@DeleteMapping("/{trainerId}/unassign")
public ResponseEntity<Map<String, String>> unassignTrainer(@PathVariable Long trainerId) {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    User currentUser = userRepository.findByUsername(username).orElse(null);
    User trainer = userRepository.findById(trainerId).orElse(null);
    if (currentUser == null || trainer == null) return ResponseEntity.notFound().build();
    currentUser.getTrainers().remove(trainer);
    userRepository.save(currentUser);
    return ResponseEntity.ok(Map.of("message", "Trainer removed from your team"));
}
```

### Trainer detail modal (Info button fix)
```tsx
// New component: TrainerDetailModal.tsx
// Props: trainer, isAssigned, onClose, onRequest, onUnassign
// Content: avatar, name, rating, experience badge, bio, all specializations, availability grid, stats
// Footer: [Close] [Request / Your Trainer]
```

### Trainer count in discovery view
Add count label: `Showing {filteredAndSortedTrainers.length} of {trainers.length} professionals`

---

## Backend Gaps

| Endpoint | Status | Priority |
|----------|--------|----------|
| `DELETE /api/member/trainers/{id}/unassign` | Missing | P1 |
| `matchPercentage` in `GET /api/member/trainers` response | Missing (never computed) | P2 |
| Full trainer profile (certifications, availability) in GET response | Present in `mapToDiscoveryDTO` but only when `TrainerDetails` exists | P0 — verify |

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1 (P0)** | Fix 3x `trainer.name[0]` crash; rename "View Profile" → "Request Trainer" on recommended card; wire MessageSquare onClick to navigate; remove hardcoded "98% satisfaction" stat |
| **Phase 2 (P0)** | Add empty state for discovery grid (no results); remove Sort:Match option (or implement it); fix CSS coupling (add trainer-page/trainer-hero to MyTrainer.css, remove MemberProfile.css import) |
| **Phase 3 (P1)** | Add `TrainerDetailModal` wired to Info buttons; add unassign button + backend endpoint |
| **Phase 4 (P2)** | Implement `matchPercentage` backend logic; add trainer count label in discovery; add next-session info on assigned trainer card |

---

## File Scope

| File | Changes |
|------|---------|
| `MyTrainer.tsx` | Fix name[0] crashes (3 spots); rename button; wire onClick (2 buttons); remove hardcoded stats; add empty state; add `TrainerDetailModal`; add unassign | ~600 lines |
| `MyTrainer.css` | Add `trainer-page`, `trainer-hero`, `trainer-card--full`, `trainer-card__bio` (line-clamp) | +30 lines |
| `MemberProfile.css` import | Remove from `MyTrainer.tsx` | -1 line |
| `TrainerDetailModal.tsx` | New component | ~120 lines |
| `MemberTrainerController.java` | Add `DELETE /{trainerId}/unassign` | +15 lines |
