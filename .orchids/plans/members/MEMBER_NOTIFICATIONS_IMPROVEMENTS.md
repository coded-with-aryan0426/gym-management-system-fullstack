# Member Notifications — Improvement Plan

## Current State (Confirmed from Actual Code — March 2026)

**File:** `MemberNotifications.tsx` — **922 lines**

**What actually exists (confirmed by reading full source):**
- `on-page` layout with `on-header`, `on-stats-strip`, `on-body` (sidebar + content)
- Stats strip: Total / Unread / Starred / Archived — **all wired to real `stats` API response**
- Sidebar: 3 collapsible sections — Views (All/Unread/Starred/Archived) / Categories (9 member-specific types) / Priority (urgent/high/normal/low)
- Sidebar collapse state persisted to `localStorage('mn_sidebar_open_section')` (accordion — only one open at a time)
- Mobile sidebar: animated slide-in overlay with filter button + dot indicator when active filters exist
- Content: toolbar with select mode, Select All, bulk actions menu, search input
- Active filter chips row with per-filter remove + "Clear all"
- Grouped list: Today / Yesterday / This Week / Earlier
- Per-notification: unread dot, category icon, title, preview/expand toggle, tags row, inline action buttons (star, archive, unarchive, delete, detail)
- Detail modal: full notification with metadata cards, deep-link "Go there" button
- Keyboard: `Escape` closes detail modal
- Auto-refresh every 30 seconds via `setInterval`
- Live/Offline indicator badge (Wifi/WifiOff icon)

**Real API calls (confirmed):**
- `notificationApi.getUserNotifications(userId, viewFilter)` — fetches filtered list
- `notificationApi.getByType(userId, typeFilter)` — fetches by category
- `notificationApi.getStats(userId)` — fetches Total/Unread/Starred/Archived counts
- `notificationApi.markAsRead(id)`, `markAllAsRead(userId)` — mark read
- `notificationApi.toggleStar(id)` — toggle star ✅ calls real API
- `notificationApi.archive(id)`, `unarchive(id)` — archive/unarchive ✅ calls real API
- `notificationApi.delete(id)` — delete ✅
- `notificationApi.bulkAction(action, ids)` — bulk read/unread/star/archive/delete ✅

**Key finding vs. old plan:** The old plan said star/archive were no-ops with `toast.success` only. **This is WRONG in the current code.** Both `handleToggleStar` and `handleArchive` call real API endpoints (lines 224–249). The `notificationApi` module has real `toggleStar`, `archive`, `unarchive` methods.

---

## Real Gaps Found (After Reading Full Source)

### Gap 1: `liveConnected` state is misleading
`liveConnected` is set to `true` on successful fetch and `false` on error. It shows a Wifi/WifiOff badge. But this is **not** real WebSocket connection status — it's just whether the last HTTP poll succeeded. The badge says "Live" when it really means "Last fetch succeeded." This is misleading.

**Fix:** Rename to `lastFetchOk` and label it "Online" / "Offline". Or connect to a real WebSocket status if the app has one.

### Gap 2: Categories in sidebar have NO per-category counts
The sidebar category buttons (MEMBERSHIP, BOOKING, PAYMENT, etc.) show the category label and description but **no count**. The stats object from the backend has `total`, `unread`, `starred`, `archived` but no per-category breakdown.

**Fix Option A (frontend):** Derive counts from current `notifications` array:
```tsx
const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notifications.forEach(n => {
        const key = n.type?.toUpperCase();
        if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
}, [notifications]);
```
Then render `{categoryCounts[key] || 0}` in the sidebar next to each category.

**Fix Option B (backend):** Add `categoryCounts: Record<string, number>` to `NotificationStats` response from `GET /api/notifications/stats`.

### Gap 3: Priority filter sidebar has no counts either
Same issue — priority filter buttons show no count. Easy fix using `useMemo`:
```tsx
const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notifications.forEach(n => { counts[n.priority] = (counts[n.priority] || 0) + 1; });
    return counts;
}, [notifications]);
```

### Gap 4: `typeFilter` and `viewFilter` don't combine correctly
When `typeFilter` is set, the code calls `notificationApi.getByType(userId, typeFilter)` (line 146). But then `priorityFilter` and `searchQuery` still apply via `filteredNotifications` useMemo. This is correct. **However**, when `viewFilter === 'starred'` AND `typeFilter === 'PAYMENT'`, the starred filter is ignored because the type branch fetches all by type regardless of viewFilter. The two filters don't AND.

**Fix:** Always call `getUserNotifications(userId, viewFilter)` and apply type filter client-side — simpler and more correct:
```tsx
const fetchData = useCallback(async (showRefresh = false) => {
    const data = await notificationApi.getUserNotifications(userId, viewFilter);
    setNotifications(data);
    // type filtering done in useMemo, not API call
}, [userId, viewFilter]);

const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
        if (typeFilter && n.type?.toUpperCase() !== typeFilter) return false;
        if (searchQuery) { /* ... existing logic */ }
        if (priorityFilter && n.priority !== priorityFilter) return false;
        return true;
    });
}, [notifications, typeFilter, searchQuery, priorityFilter]);
```

### Gap 5: Bulk action for `'unread'` uses string `'unread'` but mark-as-read uses `markAsRead(id)`
The bulk actions menu calls `handleBulkAction('unread')` (line 695). This goes to `notificationApi.bulkAction('unread', ids)`. Verify the backend `PATCH /api/notifications/bulk` accepts `action: 'unread'` not just `'read'`.

### Gap 6: `grouped` date bucketing edge case
Line 208: `if (diffDays < 1 && d.getDate() === now.getDate())` — this condition can fail at midnight boundaries (e.g., a notification from 11:58 PM yesterday that is less than 1 hour old). A more robust check:
```ts
const isToday = d.toDateString() === now.toDateString();
const isYesterday = d.toDateString() === new Date(now.getTime() - 86400000).toDateString();
const isThisWeek = diffDays < 7;
```

### Gap 7: Select mode has duplicate toggle in toolbar and header
`setSelectMode(!selectMode)` is wired to both the header right button (line 586) AND the toolbar button (line 667). Both work, but clicking the header button toggles select mode without the user seeing any visual change in the toolbar since the header is above the scroll area. This is a minor UX confusion but not a bug.

### Gap 8: No "Mark as unread" for already-read single notifications
The three-dot detail modal only has: star, archive, delete. There is no "Mark as unread" option in the detail modal, even though bulk action supports unread. Add a `MailOpen/Mail` toggle to the detail modal actions.

---

## Backend Gaps

### Confirmed existing endpoints:
- `GET /api/notifications?userId=` (or filtered via `notificationApi`)
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all?userId=`
- `DELETE /api/notifications/{id}`
- `PATCH /api/notifications/{id}/star` ✅ (confirmed — `toggleStar` API call works)
- `PATCH /api/notifications/{id}/archive` ✅ (confirmed — `archive` API call works)
- `GET /api/notifications/stats?userId=` ✅

### Missing:
| Endpoint | Purpose | Priority |
|----------|---------|----------|
| Category counts in `/stats` response | Add `categoryCounts: Map<String,Long>` to `NotificationStats` DTO | P1 |
| `PATCH /api/notifications/bulk` supporting `action=unread` | Ensure bulk "mark unread" works | P1 |
| `GET /api/notifications?userId=&page=&size=` pagination | For long-term members with 100+ notifications | P2 |

---

## UI/UX Improvements

### Counts in category sidebar (P1)
Add a badge count next to each category label showing how many notifications are in that category from the current view:
```tsx
<span className="on-nav-count">{categoryCounts[key] || 0}</span>
```

### "Mark as unread" in detail modal (P1)
In `renderDetailModal()`, add to `on-modal__header-acts`:
```tsx
<button className="on-detail-act" onClick={() => handleMarkUnread(detailNotif.id)} title={detailNotif.isRead ? 'Mark unread' : 'Mark read'}>
    {detailNotif.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
</button>
```

### Fix "Live" label (P1)
Change `liveConnected` display from "Live" / "Offline" to "Synced" / "Offline" to avoid implying real-time WebSocket connection when it's just HTTP polling.

### Pagination / Load More (P2)
```tsx
const [hasMore, setHasMore] = useState(false);
// Add "Load more" button at bottom of on-list__scroll when hasMore === true
```

---

## What to NOT Add
- No push notifications (browser Notification API) — save for a later sprint
- No notification scheduling/snooze — out of scope
- No per-notification creation by member — notifications are gym-event-driven only
- No stagger animation on list items (already uses `motion.div` per item — avoid adding more animation complexity)

---

## File Scope

| File | Changes | Current → Target |
|------|---------|-----------------|
| `MemberNotifications.tsx` | Fix grouped date bucketing, add category counts, add priority counts, fix filter combination logic, add "Mark unread" to detail modal, fix "Live" label | 922 lines → ~960 lines |
| Backend `NotificationController` | Add `categoryCounts` to `/stats` response | +10 lines |
| Backend `NotificationController` | Ensure bulk `action=unread` endpoint works | Verify/add |
