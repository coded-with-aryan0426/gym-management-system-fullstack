# Member Layout & Navigation — Improvement Plan

## Current State (Accurate — March 2026)

**File:** `MemberLayout.tsx` — **40 lines** (confirmed by reading actual source)

```tsx
// Actual current navItems array (10 items):
{ path: '/member',             icon: <Home />,         label: 'Dashboard',         color: '#EF4444', end: true }
{ path: '/member/profile',     icon: <User />,         label: 'My Profile',         color: '#3B82F6' }
{ path: '/member/membership',  icon: <CreditCard />,   label: 'My Membership',      color: '#8B5CF6' }
{ path: '/member/progress',    icon: <Activity />,     label: 'My Progress',        color: '#10B981' }
{ path: '/member/classes',     icon: <BookOpen />,     label: 'Available Classes',  color: '#F59E0B' }
{ path: '/member/trainer',     icon: <UserCheck />,    label: 'My Trainer',         color: '#06B6D4' }
{ path: '/member/bookings',    icon: <Calendar />,     label: 'My Bookings',        color: '#EC4899' }
{ path: '/member/messages',    icon: <MessageSquare />,label: 'Messages',           color: '#6366F1' }
{ path: '/member/notifications',icon: <Bell />,        label: 'Notifications',      color: '#F97316' }
{ path: '/member/settings',    icon: <Settings />,     label: 'Settings',           color: '#64748B' }
```

**What is confirmed working:**
- All 10 pages are reachable via navigation
- Uses shared `DashboardLayout` component (consistent with Owner/Trainer roles)
- `useEffect` sets `data-layout="member"` on `<html>` for CSS scoping and cleanly removes it on unmount
- Imports `unified-design-system.css` for consistent tokens
- Renders `<Outlet />` or `children` correctly

**Confirmed missing from current code:**
- `navItems` array is defined inline inside the component body — recreated on every render
- No unread badge counts on Messages or Notifications nav items — both show as plain nav items with no count
- `ChatContext` is NOT imported in MemberLayout — no path to show unread message count
- No collapsed/icon-only sidebar mode
- No mobile bottom tab bar
- No section grouping/headers in sidebar

---

## What Needs to Be Fixed

### P0 — Unread Badges (High Impact, Low Effort)

**Gap:** The Messages nav item renders `<MessageSquare size={20} />` with no badge. The Notifications nav item renders `<Bell size={20} />` with no badge. Both are critical engagement drivers — users won't know to check them.

**Fix for Messages:**
```tsx
// In MemberLayout.tsx — import ChatContext
import { useChatContext } from '../../contexts/ChatContext';
// Inside component:
const { unreadCount } = useChatContext();
// In navItems for messages, pass badge: unreadCount > 0 ? unreadCount : undefined
```

**Fix for Notifications:**
```tsx
// Import notificationApi
import { notificationApi } from '../../api/notificationApi';
// Add state:
const [notifUnread, setNotifUnread] = useState(0);
useEffect(() => {
    if (!user?.userId) return;
    notificationApi.getStats(user.userId)
        .then(stats => setNotifUnread(stats.unread))
        .catch(() => {});
    const interval = setInterval(() => {
        notificationApi.getStats(user.userId!)
            .then(stats => setNotifUnread(stats.unread))
            .catch(() => {});
    }, 60_000); // poll every 60s
    return () => clearInterval(interval);
}, [user?.userId]);
```

**Backend:** `GET /api/notifications/stats?userId={id}` already exists and returns `{ unread, total, starred, archived }`. No backend work needed.

**Check:** Verify `DashboardLayout` / `CommandRail` supports a `badge` prop on `NavItem`. If not, extend the `NavItem` type:
```ts
interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    end?: boolean;
    badge?: number;  // add this
}
```
Then in `CommandRail.tsx`, render badge pill next to the nav item label.

---

### P1 — Performance Fix

**Gap:** `navItems` is an array literal defined inside the component function body — it is recreated on every render (every keystroke, every state change in parent).

**Fix:**
```tsx
// Move navItems OUTSIDE the component (it never depends on state):
const NAV_ITEMS: NavItem[] = [
    { path: '/member', icon: <Home size={20} />, label: 'Dashboard', color: '#EF4444', end: true },
    // ...
];

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
    // navItems no longer defined here
    return (
        <DashboardLayout navItems={NAV_ITEMS}>
```
This is a 5-line change and a guaranteed improvement.

---

### P1 — Section Grouping in Sidebar

**Fix:** Extend `NavItem` to support `groupLabel` separator:
```ts
interface NavItem {
    // ...existing fields...
    groupLabel?: string; // renders as section header above this item
}
```

**Proposed nav structure:**
```
── MAIN ─────────────────
   Dashboard

── MEMBERSHIP ───────────
   My Membership
   My Bookings

── FITNESS ──────────────
   My Progress
   Available Classes
   My Trainer

── ACCOUNT ──────────────
   My Profile
   Messages       [badge]
   Notifications  [badge]
   Settings
```

---

### P2 — Mobile Bottom Tab Bar

**5 tab items (most used):**
| Tab | Icon | Route |
|-----|------|-------|
| Home | `Home` | `/member` |
| Classes | `BookOpen` | `/member/classes` |
| Progress | `Activity` | `/member/progress` |
| Messages | `MessageSquare` | `/member/messages` |
| More | `MoreHorizontal` | opens drawer with remaining items |

**Implementation:** Add `MemberBottomNav.tsx` rendered inside `MemberLayout` only when `window.innerWidth < 768`. "More" drawer contains: My Membership, My Bookings, My Trainer, Notifications, Settings, My Profile.

---

### P2 — Future Pages

| Page | Route | Backend Exists? | Priority |
|------|-------|----------------|----------|
| Workout Plans | `/member/workouts` | Partially (PTSession endpoints) | P1 |
| Gym Info | `/member/gym-info` | `GET /api/gym/info` exists | P1 |
| Help & Support | `/member/help` | No | P2 |
| Achievements | `/member/achievements` | Embedded in Progress | P2 |
| QR Check-in | `/member/checkin` | `POST /api/checkin` exists | P2 |

---

## Implementation Priority

| Phase | Work | Files Changed |
|-------|------|---------------|
| **Phase 1** | Move `navItems` outside component; add `badge` prop to `NavItem`; wire Messages unread count from `ChatContext`; wire Notifications unread count via polling | `MemberLayout.tsx`, `CommandRail.tsx` (NavItem type) |
| **Phase 2** | Section group headers in sidebar (`groupLabel` on NavItem) | `MemberLayout.tsx`, `CommandRail.tsx` |
| **Phase 3** | Mobile bottom tab bar `MemberBottomNav.tsx` | New file + `MemberLayout.tsx` |
| **Phase 4** | Add Gym Info page, Workout Plans page | New route + page files |
