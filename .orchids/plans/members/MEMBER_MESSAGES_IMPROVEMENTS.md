# Member Messages — Improvement Plan

## Current State (Confirmed from Actual Code — March 2026)

**File:** `MemberMessages.tsx` — **14 lines**

```tsx
// Exact current code:
import React from 'react';
import ChatLayout from '../../components/chat/ChatLayout';

const MemberMessages: React.FC = () => {
    return <ChatLayout />;
};

export default MemberMessages;
```

The entire messaging experience is a direct pass-through to `ChatLayout` — a shared component used across all three roles. There is no wrapper, no member-specific context, no error boundary, and no title.

**Backend (ChatController):** `GET /api/chat/conversations`, `POST /api/chat/send`, `GET /api/chat/messages/{conversationId}`, WebSocket at `/ws/chat`.

---

## Real Gaps Found

### Gap 1 — No deep-link pre-selection
**MyTrainer page** has a `MessageSquare` button that currently has **no `onClick` handler** (confirmed in `MyTrainer.tsx` line 297–300). The plan is to wire it to `navigate('/member/messages?trainerId={id}')`. But `ChatLayout` has no code to read `?trainerId=` and pre-select that conversation. This is a two-part fix.

### Gap 2 — No unread badge in nav
`MemberLayout.tsx` has no badge on the Messages nav item. `ChatContext.unreadCount` (if it exists) is not read. The badge only appears once `NavItem.badge` is wired in `MemberLayout` (see Layout plan).

### Gap 3 — Height/scroll issues
`ChatLayout` is rendered directly inside the member page content area. Without an explicit height container, the chat panel may either overflow the viewport or collapse to zero height depending on the layout wrapper. A `.member-chat-page { height: 100%; overflow: hidden; }` wrapper fixes this.

### Gap 4 — No empty state for members with no conversations
Members who just signed up have no conversations. `ChatLayout` likely shows a blank left panel. A member-specific empty state should show "Message your trainer to get started" with a CTA to `/member/trainer`.

### Gap 5 — No role-based conversation filter
`ChatContext` fetches all conversations for the user. For a member, this should only show conversations with trainers and gym staff — not other members. If `GET /api/chat/conversations` returns all users, members may see irrelevant conversations.

---

## What Needs to Be Fixed

### P0 — Broken/Missing

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `MessageSquare` button on MyTrainer is a no-op | No `onClick` in `MyTrainer.tsx` line 297 | Add `onClick={() => navigate('/member/messages?trainerId=${trainer.userId}')}` |
| `ChatLayout` ignores `?trainerId=` param | No `useSearchParams` in ChatLayout | Add param reading + auto-select conversation on mount |
| Chat panel height collapses | No height wrapper | Wrap `<ChatLayout />` in `.member-chat-page` with `height: 100%; display: flex; flex-direction: column; overflow: hidden` |

### P1 — Missing but Important

| Feature | Fix |
|---------|-----|
| Empty state (no conversations) | ChatLayout: when `conversations.length === 0` and role is MEMBER, show "Start a conversation with your trainer" → `/member/trainer` CTA |
| Unread badge in nav | Wire `ChatContext.unreadCount` to Messages nav item badge (see Layout plan) |
| Role-filter conversations | Backend: ensure `GET /api/chat/conversations` filters by role — members only see trainer/staff conversations |

---

## Implementation Details

### Fix 1: MyTrainer.tsx — wire MessageSquare button
```tsx
// Line 297 in MyTrainer.tsx — the button currently has no onClick:
// BEFORE:
<button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }} title="Send Message">
    <MessageSquare size={18} />
</button>

// AFTER:
<button
    className="macos-btn macos-btn--secondary"
    style={{ padding: '8px' }}
    title="Send Message"
    onClick={() => navigate(`/member/messages?trainerId=${trainer.userId}`)}
>
    <MessageSquare size={18} />
</button>
// Also: add `const navigate = useNavigate();` at the top of MyTrainer component
```

### Fix 2: MemberMessages.tsx — add wrapper + pass trainerId
```tsx
import React from 'react';
import ChatLayout from '../../components/chat/ChatLayout';
import './MemberMessages.css'; // or inline style

const MemberMessages: React.FC = () => (
    <div className="member-chat-page">
        <ChatLayout />
    </div>
);

export default MemberMessages;
```

```css
/* MemberMessages.css or in macos-member.css */
.member-chat-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
}

.member-chat-page .chat-layout {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
```

### Fix 3: ChatLayout.tsx — read ?trainerId= param
```tsx
// Add at the top of ChatLayout component:
const [searchParams] = useSearchParams();
const preSelectTrainerId = searchParams.get('trainerId');

useEffect(() => {
    if (!preSelectTrainerId || !conversations.length) return;
    const targetConv = conversations.find(c =>
        String(c.otherUserId) === preSelectTrainerId ||
        String(c.participantId) === preSelectTrainerId
    );
    if (targetConv) setSelectedConversation(targetConv);
}, [preSelectTrainerId, conversations]);
```

### Fix 4: Empty state for members with no conversations
```tsx
// In ChatLayout conversation list section:
{conversations.length === 0 && role === 'MEMBER' && (
    <div className="chat-empty-state">
        <MessageSquare size={36} opacity={0.4} />
        <h3>No Messages Yet</h3>
        <p>Connect with a trainer to start messaging</p>
        <button onClick={() => navigate('/member/trainer')}>
            Find a Trainer
        </button>
    </div>
)}
```

---

## Backend Gaps

### Existing endpoints (confirmed):
- `GET /api/chat/conversations` — returns conversation list
- `POST /api/chat/send` — sends a message
- `GET /api/chat/messages/{conversationId}` — fetches messages
- WebSocket `/ws/chat` — real-time updates

### Missing:
| Endpoint | Need | Priority |
|----------|------|----------|
| `GET /api/chat/conversations` role filter | Ensure it filters to only trainer/staff for MEMBER role | P1 |
| `GET /api/chat/unread-count?userId=` | For nav badge polling (alternative to ChatContext) | P1 |

---

## What NOT to Add
- No group chat — gym staff use Owner/Trainer dashboard for group comms
- No read receipts per message
- No voice/video calling
- No emoji reactions
- No file attachments in this phase

---

## File Scope
| File | Change | Target Size |
|------|--------|-------------|
| `MemberMessages.tsx` | Add wrapper div + CSS class | ~20 lines |
| `MyTrainer.tsx` | Add `navigate` import + wire MessageSquare `onClick` + wire Info `onClick` | +10 lines |
| `ChatLayout.tsx` (shared) | Add `useSearchParams` deep-link pre-selection; add empty state for MEMBER role | +25 lines |
| `MemberLayout.tsx` | Wire Messages unread badge from `ChatContext` | +8 lines |
