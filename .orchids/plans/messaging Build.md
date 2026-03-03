# Messaging System — Complete Build Plan

> **Project:** Internal Gym Management App — WhatsApp-style messaging between Owners, Trainers, and Members\
> \*\***Audit Date:** 2026-03-03\
> \*\***Scope:** Full audit of current architecture → fix all bugs → build missing features → improve DB, backend, and UI/UX

---

## Table of Contents

 1. [Current Architecture Audit](#1-current-architecture-audit)
    - 1.1 [Backend — What Exists](#11-backend--what-exists)
    - 1.2 [Frontend — What Exists](#12-frontend--what-exists)
 2. [Phase 1 — Critical Bug Fixes](#phase-1--critical-bug-fixes)
 3. [Phase 2 — Owner Messages Feature](#phase-2--owner-messages-feature)
 4. [Phase 3 — Media & File Sending](#phase-3--media--file-sending)
 5. [Phase 4 — Trainer Workout Plan Sending](#phase-4--trainer-workout-plan-sending)
 6. [Phase 5 — UI/UX Improvements](#phase-5--uiux-improvements)
 7. [Phase 6 — Database Improvements](#phase-6--database-improvements)
 8. [Phase 7 — Backend API Improvements](#phase-7--backend-api-improvements)
 9. [Phase 8 — Cleanup & Removals](#phase-8--cleanup--removals)
10. [Files To Create](#files-to-create)
11. [Files To Modify](#files-to-modify)
12. [Implementation Order](#implementation-order)

---

## 1. Current Architecture Audit

### 1.1 Backend — What Exists

ComponentStatusIssues Found`Conversation` + `ConversationParticipant` models✅ BuiltNone`Message` model — types: `TEXT, IMAGE, WORKOUT_PLAN, VOICE_NOTE, FILE, VIDEO`✅ Built`FILE` type missing from frontend `ChatMessage` TypeScript interface`MessageAttachment` — stored to disk, served via `/api/chat/attachments/file/{name}`✅ BuiltNo audio/voice MIME type handling in controller pipeline`MessageStatus` — `SENT / DELIVERED / READ` per user✅ Model exists**Never written to or read anywhere** — no endpoint, no WS broadcast`MessageReaction` + `MessageEditHistory`✅ BuiltNone`ConversationRequest` — `PENDING / ACCEPTED / REJECTED`✅ BuiltNone`ChatService` — send, edit, delete, react, accept/reject✅ Built`isTrainerOf()` uses `trainer.getCustomers()` — **Oracle lazy-load crash** (same bug pattern as assign/unassign)`ChatWebSocketController` — `/app/chat.sendMessage`, `/app/chat.typing`✅ Built`senderId` correctly taken from JWT token`AttachmentController` — `POST /api/chat/attachments`, `GET /api/chat/attachments/file/{name}`✅ BuiltNo `@PreAuthorize` auth check; no file size limit`ChatController` — all REST endpoints✅ Built`lastMessage` not included in conversation list response; `unreadCount` not computed per conversation`ChatRetentionScheduler`✅ BuiltSchedule not documented; retention policy not clear**Owner role — messages**❌ MissingNo route, no controller access, no page, no nav item

---

### 1.2 Frontend — What Exists

ComponentStatusIssues Found`ChatContext` — WebSocket (STOMP/SockJS), conversations, messages, blocking✅ Built`totalUnread` hardcoded as `3`; `lastMessage` preview always says "Tap to view message"; no WS reconnect on token refresh`ChatLayout` — 3-panel: sidebar + window + contact info✅ Built**Imports** `ContactInfoPanel` **but the file does not exist → entire chat page crashes on load**`ChatSidebar` — Chats / Requests / Members tabs✅ BuiltAll tabs use raw `style={{}}` (no CSS classes); member list shows hardcoded "MEMBER" as preview text; `totalUnread` hardcoded; `alert()` calls instead of toasts`ChatWindow` — header, messages list, input bar✅ BuiltFile input has no `accept` filter (accepts everything); input is `<input type="text">` not `<textarea>` (no multiline); emoji button does nothing; `sendTyping` debounce logic is **inverted**; no read receipt trigger on open`MessageBubble` — text, image, workout plan, edit, delete, react✅ Built`FILE` type renders nothing; `AUDIO` / `VOICE_NOTE` type renders nothing; `replyToMessageId` never rendered; "View Plan" button on `WORKOUT_PLAN` messages does nothing`NewChatModal` — search users, start chat✅ BuiltCalls `api.chat.getAvailableUsers()` but `chatApi` exports `getAvailableChatUsers()` — **name mismatch causes runtime error**; passes raw `response.data` (double-unwrap bug)`chatApi.ts` — all REST calls✅ BuiltMissing: `uploadAttachment`, `getPendingRequests`, `sendRequest` (these exist in `api.ts` instead causing split logic); `FILE`, `VIDEO`, `AUDIO` missing from `ChatMessage` TypeScript type`TrainerMessages.tsx` — action bar: Share Workout, Notes, Book Session✅ BuiltAll three actions navigate away from the chat instead of injecting a message`MemberMessages.tsx` — renders `<ChatLayout />`✅ BuiltNo member-specific features (e.g. quick "message my trainer" shortcut)**Owner messages page**❌ MissingNo page, no route, no nav item`Chat.css`✅ BuiltMissing CSS classes for main tabs (currently all inline); no voice note player styles; no file card styles; no lightbox styles

---

## Phase 1 — Critical Bug Fixes

> These must be completed first. Nothing else works until these are resolved.

---

### F1 — `ContactInfoPanel` component is missing (CRASH)

**Problem:** `ChatLayout.tsx` imports `./ContactInfoPanel` but the file does not exist. The entire `/trainer/messages` and `/member/messages` pages crash on load with a module-not-found error.

**Fix:** Create `frontend/src/components/chat/ContactInfoPanel.tsx` with:

- Participant avatar, name, role badge
- Account joined date
- Shared media mini-grid (images sent in this conversation)
- Block / Unblock button (wired to existing `ChatContext.blockUser`)
- Clear Chat button
- Shared files count with link to full list

---

### F2 — `ChatService.isTrainerOf()` Oracle lazy-load crash

**Problem:** `isTrainerOf()` calls `trainer.getCustomers()` which triggers a Hibernate lazy collection load on Oracle. This throws a `LazyInitializationException` outside of a transaction context — same pattern as the assign/unassign bug fixed earlier.

**Fix:** Replace the in-memory check with a native SQL repository query:

```java
// UserRepository.java
@Query(
  value = "SELECT COUNT(*) FROM trainer_customer_map WHERE trainer_user_id = :trainerId AND customer_user_id = :customerId",
  nativeQuery = true
)
int isTrainerOf(@Param("trainerId") Long trainerId, @Param("customerId") Long customerId);
```

Update `ChatService.isTrainerOf()` to call this repository method and check `count > 0`.

---

### F3 — `NewChatModal` double API name mismatch

**Problem 1:** Modal calls `api.chat.getAvailableUsers()` and `api.chat.searchUsers()` but `chatApi.ts` exports `getAvailableChatUsers()` and `searchChatUsers()` — runtime error on every open.

**Problem 2:** `api.ts` wraps the response in an `ApiResponse` object, but `chatApi.ts` `handleResponse()` already unwraps `.data`. The modal currently double-unwraps, getting `undefined`.

**Fix:** Remove the `api.ts` chat proxy calls from the modal. Call `chatApi.getAvailableChatUsers()` and `chatApi.searchChatUsers()` directly. Remove the duplicate wrappers from `api.ts` chat section.

---

### F4 — `sendTyping` debounce is inverted

**Problem:** Current code:

```ts
if (newMessage.length > 0) sendTyping(false);  // stops typing when you ARE typing
```

This sends a "stop typing" event every time the user types a character.

**Fix:**

```ts
// On keypress: send typing=true immediately
sendTyping(true);
// Debounced 2s after last keypress: send typing=false
debouncedStopTyping();  // always fires after 2s idle, regardless of content
```

---

### F5 — `MessageStatus` table is never populated or read

**Problem:** The `message_status` table exists in the DB schema but nothing writes to it or reads from it. All messages show double grey ticks with no semantic meaning.

**Fix — Backend:**

- `ChatService.sendMessage()` → insert `MessageStatus(message, sender, SENT)` after save
- `ChatWebSocketController` → when a message is delivered to a subscriber, broadcast `MessageStatus` update with `DELIVERED` to `/topic/user/{userId}/status`
- `ChatController.getMessages()` → call `markAsDelivered(userId, conversationId)` on message fetch
- `POST /api/chat/conversations/{id}/read` → mark all as `READ` for current user, broadcast `READ` events

**Fix — Frontend:**

- Subscribe to `/topic/user/{userId}/status` in `ChatContext`
- In `MessageBubble`, render:
  - Single grey tick = `SENT`
  - Double grey tick = `DELIVERED`
  - Double blue tick = `READ`

---

### F6 — `ChatMessage` TypeScript type is incomplete

**Problem:** Backend sends `FILE`, `VIDEO`, `AUDIO` content types. Frontend TS type only allows:

```ts
contentType: 'TEXT' | 'IMAGE' | 'WORKOUT_PLAN' | 'DIET_PLAN' | 'VOICE_NOTE'
```

Any `FILE` or `VIDEO` message causes a TypeScript type error and renders nothing.

**Fix:** Update the type union in `chatApi.ts`:

```ts
contentType: 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO' | 'AUDIO' | 'VOICE_NOTE' | 'WORKOUT_PLAN' | 'DIET_PLAN'
```

---

### F7 — `unreadCount` hardcoded as `3` everywhere

**Problem:** `ChatSidebar` hardcodes `const totalUnread = 3`. Backend conversation list endpoint does not compute `unreadCount` per conversation.

**Fix — Backend:** In `ChatController.getConversations()`, for each conversation:

```java
long unread = messageStatusRepository.countByConversationAndUserAndStatusNot(
    conv.getConversationId(), userId, MessageStatusType.READ
);
dto.setUnreadCount((int) unread);
```

**Fix — Frontend:** Remove the hardcoded `3`. Use `conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)` for the total badge.

---

## Phase 2 — Owner Messages Feature

> Owner currently has zero access to the messaging system. This is a complete new feature.

---

### O1 — Owner Messages Page at `/owner/messages`

**What to build:**

- New page: `frontend/src/pages/Dashboard/OwnerMessages.tsx`
- Add route `/messages` to the owner `AppShell` in `App.tsx`
- Add "Messages" nav item to the owner sidebar with an unread badge

**Owner-specific use cases:**

1. Message any trainer in their gym directly (no request needed)
2. Message any member in their gym directly (no request needed)
3. Send broadcast announcements to all members or a filtered subset (e.g. "all members on Plan A")
4. View all their own conversations with read/unread status

---

### O2 — Owner Sidebar Tabs

The owner sidebar has different tabs than trainer/member:

TabContent**Chats**All active conversations (same as trainer/member)**Trainers**List all trainers in the owner's gym — click to open/start direct chat**Members**List all gym members — click to open/start direct chat**Announcements**Past broadcasts + "New Announcement" button

---

### O3 — Owner Permission in `ChatService`

**Problem:** `startOrGetConversation()` uses `isDirectAccess` flag to skip the conversation request flow. Currently this only checks trainer↔assigned-member. Owners bypass no one.

**Fix — Add** `isOwnerOf()` **check:**

```java
boolean isOwnerOf(User owner, User target) {
    // owner.getOwnedGym() contains target (member or trainer)
    // Use native SQL to avoid lazy-load:
    return gymMemberRepository.countByGymOwnerAndUser(owner.getId(), target.getId()) > 0
        || gymTrainerRepository.countByGymOwnerAndTrainer(owner.getId(), target.getId()) > 0;
}

boolean isDirectAccess = isTrainerOf(user1, user2) 
    || isTrainerOf(user2, user1)
    || isOwnerOf(user1, user2) 
    || isOwnerOf(user2, user1);
```

---

### O4 — Owner Action Bar (in `OwnerMessages.tsx`)

Unlike the trainer action bar which sends workout plans, the owner action bar offers:

ButtonAction**Send Announcement**Opens `AnnouncementModal` → select audience (all / by plan / by trainer) → sends as a group broadcast**View Member Profile**Navigate to `/owner/members/:id` (opens in new tab or modal)**View Trainer Profile**Navigate to `/owner/trainers/:id`**Payment Status**Quick badge showing if member has an active plan

---

### O5 — Announcement / Broadcast Feature

**Backend:**

- `POST /api/chat/announcements` — owner creates a broadcast
- Body: `{ title, content, audience: 'ALL' | 'BY_PLAN' | 'BY_TRAINER', planId?, trainerId? }`
- Service: creates one `Message` per targeted member conversation (or a shared group conversation)
- New `AnnouncementHistory` model to track what was sent, to whom, when

**Frontend:**

- `AnnouncementModal.tsx` — step 1: write message, step 2: choose audience, step 3: preview count, step 4: confirm send
- Announcements show in the "Announcements" tab as sent cards with recipient count

---

## Phase 3 — Media & File Sending

---

### M1 — Image Sending — Fix Lightbox

**What works:** Upload via `AttachmentController` ✅. `MessageBubble` renders `<img>` tag ✅.

**What's broken:** Clicking the image opens a new browser tab. No in-app viewer.

**Fix:** Create `ImageLightbox.tsx` — a full-screen overlay modal with:

- The image centered with `object-fit: contain`
- Download button (top-right)
- Close button or click-outside-to-close
- Left/right arrows if multiple images exist in the conversation

---

### M2 — File Attachment Rendering in `MessageBubble`

**What's broken:** `FILE` content type renders nothing — the message appears blank.

**Fix:** Parse the `payload` JSON and render a file card:

```tsx
if (message.contentType === 'FILE' && message.payload) {
  const meta = JSON.parse(message.payload);
  // meta: { fileName, fileSize, mimeType, url }
  return (
    <div className="file-card">
      <FileIcon mimeType={meta.mimeType} />
      <div className="file-card__info">
        <span className="file-card__name">{meta.fileName}</span>
        <span className="file-card__size">{formatBytes(meta.fileSize)}</span>
      </div>
      <a href={meta.url} download className="file-card__download">
        Download
      </a>
    </div>
  );
}
```

Create `FileCard.tsx` as a standalone reusable component. Add `.file-card` styles to `Chat.css`.

---

### M3 — Audio / Voice Note Recording and Playback

**What exists:** `VOICE_NOTE` and `AUDIO` content types in the backend model ✅. `AttachmentController` can store any file ✅.

**What's missing:** No recording UI. No playback UI.

**Fix — Recording (**`VoiceRecorder.tsx`**):**

- Microphone button in the `ChatWindow` input bar (replaces the send button when no text is typed)
- Press-and-hold to record using the browser `MediaRecorder` API
- Recording state: animated pulse ring around the mic icon
- Release to stop → auto-upload the `.webm` blob to `AttachmentController`
- On success → send a `VOICE_NOTE` message with `payload: { url, duration }`
- Cancel by dragging left (standard voice message UX)

**Fix — Playback (**`MessageBubble`**):**

```tsx
if (message.contentType === 'VOICE_NOTE' && message.payload) {
  const meta = JSON.parse(message.payload);
  return (
    <div className="voice-note">
      <audio controls src={meta.url} preload="metadata" />
      <span className="voice-note__duration">{meta.duration}s</span>
    </div>
  );
}
```

Add `.voice-note` styles to `Chat.css` with a custom audio player skin.

---

### M4 — Separate Upload Buttons by Type

**What's broken:** Single `<input type="file">` with no `accept` filter. User can attach anything, causing backend to receive unexpected MIME types.

**Fix:** Split the paperclip button into a small popup menu with three options:

```plaintext
📷 Photo / Video    accept="image/*,video/*"
📎 Document         accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
🎵 Audio File       accept="audio/*"
```

Each triggers its own hidden `<input>` with the appropriate `accept` attribute.

---

### M5 — `AttachmentController` Security and Limits

**Problem 1:** No `@PreAuthorize` — any unauthenticated request can upload files to the server.

**Problem 2:** No file size limit in the controller — a 1GB file would be accepted.

**Problem 3:** Filenames are stored as-is — path traversal risk (`../../etc/passwd`).

**Fix:**

```java
@PostMapping("/api/chat/attachments")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> uploadAttachment(
    @RequestParam("file") MultipartFile file,
    Authentication auth
) {
    if (file.getSize() > 25 * 1024 * 1024) {
        return ResponseEntity.badRequest().body("File exceeds 25MB limit");
    }
    String safeName = UUID.randomUUID() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
    // store safeName only — no path components
}
```

---

## Phase 4 — Trainer Workout Plan Sending

---

### T1 — "Share Workout Plan" Action Must Stay In Chat

**What's broken:** Trainer clicks "Share Workout Plan" in the action bar → navigated to `/trainer/members`, abandoning the chat entirely.

**Fix:** Replace the navigation with a modal:

- `WorkoutPlanModal.tsx` opens inline within `TrainerMessages.tsx`

- Fetches the active conversation member's workout plans from the existing workout plan API

- Shows a list of plans with exercise count and last updated date

- Trainer selects a plan → click "Send"

- Sends a `WORKOUT_PLAN` message with `payload` = serialized plan JSON:

  ```json
  {
    "planId": 12,
    "planName": "Strength Phase 2",
    "exercises": [
      { "name": "Bench Press", "sets": 4, "reps": "8-10", "weight": "80kg" }
    ]
  }
  ```

---

### T2 — "View Plan" Button in `MessageBubble` Does Nothing

**What's broken:** `WORKOUT_PLAN` messages render a card with a "View Plan" button. The button has no `onClick`.

**Fix:**

- Parse `message.payload` JSON on render
- "View Plan" onClick → open `WorkoutPlanViewModal.tsx` showing the full plan:
  - Plan name + creation date
  - Exercise table: name, sets, reps, weight, rest time, notes
  - For members: "Start Workout" button (navigates to `/member/workouts/:planId`)
  - For trainers: "Edit Plan" button (navigates to plan edit page)

---

### T3 — "Share Progress Note" Action Must Stay In Chat

**What's broken:** Trainer clicks "Share Progress Note" → navigated to `/trainer/progress-notes`, abandoning the chat.

**Fix:** Open a `ProgressNoteModal.tsx` inline:

- Lists the last 10 progress notes for the active conversation member
- Trainer selects one → click "Share"
- Sends as a styled card message (new content type `PROGRESS_NOTE` or rendered within `TEXT` with a special `payload`)
- Member sees it as a read-only card with their stats

---

### T4 — "Book Session" Button is Dead

**What's broken:** The "Book Session" button in the `ChatWindow` header has no `onClick` handler. It does nothing and confuses users.

**Fix options (choose one):**

- **Option A:** Wire it to open the scheduling/booking modal if one exists
- **Option B:** Remove it entirely (also listed in Phase 8 cleanup)

For now, remove it (Phase 8 R4) and re-add when scheduling is built.

---

## Phase 5 — UI/UX Improvements

---

### U1 — `ChatSidebar` Tab Styling: Remove All Inline Styles

**Problem:** The main tab buttons (Chats / Requests / Members) use raw `style={{}}` objects. Active state is also inline. This is unmaintainable and non-themeable.

**Fix:** Add to `Chat.css`:

```css
.chat-main-tab {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.chat-main-tab--active {
  background: var(--color-primary);
  color: #fff;
}
```

Remove all `style={{}}` from tab buttons in `ChatSidebar.tsx`.

---

### U2 — Conversation Preview Shows Last Message Content

**Problem:** Every conversation preview shows "Tap to view message" regardless of actual last message.

**Fix — Backend:** `ConversationDTO` must include:

- `lastMessageContent: String` — truncated to 60 chars
- `lastMessageType: String` — to show "📷 Photo", "🎤 Voice", "📎 File" prefixes
- `lastMessageAt: LocalDateTime`
- `lastMessageSenderId: Long` — to show "You: ..." prefix for own messages

**Fix — Frontend:** In `ChatSidebar` conversation list item:

```tsx
const preview = () => {
  if (!conv.lastMessageContent) return 'No messages yet';
  if (conv.lastMessageType === 'IMAGE') return '📷 Photo';
  if (conv.lastMessageType === 'VOICE_NOTE') return '🎤 Voice message';
  if (conv.lastMessageType === 'FILE') return '📎 File';
  const prefix = conv.lastMessageSenderId === currentUserId ? 'You: ' : '';
  return prefix + conv.lastMessageContent.slice(0, 60);
};
```

---

### U3 — Message Input: `<input>` → Auto-Resizing `<textarea>`

**Problem:** Single-line `<input type="text">` cannot handle multi-line messages. Pasting a paragraph puts everything on one line.

**Fix:**

```tsx
<textarea
  ref={textareaRef}
  rows={1}
  className="chat-input__textarea"
  value={newMessage}
  onChange={(e) => {
    setNewMessage(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }}
  placeholder="Type a message..."
/>
```

Add to `Chat.css`:

```css
.chat-input__textarea {
  resize: none;
  overflow-y: hidden;
  max-height: 120px;
  line-height: 1.4;
}
```

`Shift+Enter` adds a newline. `Enter` alone sends.

---

### U4 — Emoji Picker Wired Up

**Problem:** Emoji button exists in `ChatWindow` input bar but has no `onClick` and does nothing.

**Fix:** Install `emoji-picker-react` (check if already in `package.json` first):

```bash
npm install emoji-picker-react
```

```tsx
import EmojiPicker from 'emoji-picker-react';

// In ChatWindow:
const [showEmojiPicker, setShowEmojiPicker] = useState(false);

// Button:
<button onClick={() => setShowEmojiPicker(p => !p)}>😊</button>

// Picker (above input bar):
{showEmojiPicker && (
  <div className="emoji-picker-popup">
    <EmojiPicker onEmojiClick={(e) => {
      setNewMessage(prev => prev + e.emoji);
      setShowEmojiPicker(false);
    }} />
  </div>
)}
```

---

### U5 — Message Delivery Ticks (Visual Status)

> Depends on Phase 1 F5 (MessageStatus being written to DB)

**Render logic in** `MessageBubble` (only for messages sent by current user):

```tsx
const StatusTick = ({ status }: { status: string }) => {
  if (status === 'READ')      return <span className="tick tick--read">✓✓</span>;
  if (status === 'DELIVERED') return <span className="tick tick--delivered">✓✓</span>;
  return                             <span className="tick tick--sent">✓</span>;
};
```

CSS:

```css
.tick--sent      { color: #aaa; }
.tick--delivered { color: #aaa; }
.tick--read      { color: #4fc3f7; }  /* blue */
```

---

### U6 — Online Presence Indicator

**Problem:** `isOnline` is hardcoded `false` everywhere. The green dot in the sidebar and header is never shown.

**Fix — Backend:**

- Add `PresenceService` — maintains a `ConcurrentHashMap<Long, Instant>` of userId → lastSeenAt
- `ChatWebSocketController.afterConnectionEstablished()` → call `presenceService.setOnline(userId)`
- `ChatWebSocketController.afterConnectionClosed()` → call `presenceService.setOffline(userId)`
- Broadcast to `/topic/presence` on every change: `{ userId, online: true/false }`
- Add `GET /api/chat/presence?userIds=1,2,3` for initial state on page load

**Fix — Frontend:**

- In `ChatContext.connect()`, after WS subscribe, call the presence endpoint for all conversation participants
- Subscribe to `/topic/presence` → update a `presenceMap: Map<number, boolean>` in context
- Pass `isOnline={presenceMap.get(conv.otherUserId) ?? false}` to sidebar items and chat header

---

### U7 — `ContactInfoPanel` Full Design

> Also required for Phase 1 F1 crash fix — create the file first, fill in design after

Panel layout (right-side drawer, 280px wide):

```plaintext
[ Avatar (large, centered) ]
[ Full Name ]
[ Role badge: TRAINER / MEMBER / OWNER ]
[ Joined: Jan 2025 ]
[ Last seen: 2 hours ago ]

---[ SHARED MEDIA ]---
[ 3x3 image grid — last 9 images sent in this conversation ]
[ "View All 24 Photos →" link ]

---[ SHARED FILES ]---
[ List of last 5 files with filename + date ]

---[ ACTIONS ]---
[ Block User ]   [ Clear Chat ]
```

Data sources:

- Participant info: from `conversation.participants`
- Shared media: `GET /api/chat/conversations/{id}/media` (new endpoint — see Phase 7 B7)
- Shared files: same endpoint filtered by type `FILE`

---

### U8 — Unread Badge — Real Count

> Depends on Phase 1 F7

- `ChatSidebar` conversation items: show red badge with `conv.unreadCount` when `> 0`
- `ChatSidebar` top: show total unread next to "Messages" heading
- Owner/Trainer/Member nav item: show badge from `ChatContext.totalUnread`
- All badges disappear when user opens the conversation and the read receipt fires

---

### U9 — Message Search Within Conversation

**Where:** Search icon in the `ChatWindow` header (top-right, next to the info icon).

**Behaviour:**

- Click icon → a search bar slides down below the header
- User types → debounced filter on already-loaded `messages` array (client-side, instant)
- If user scrolls to top and loads more (pagination) → re-filter against expanded list
- For deep search (&gt; 50 messages not loaded): show "Search all messages" button → calls `POST /api/chat/conversations/{id}/messages/search` (Phase 7 B6)
- Matches highlighted in yellow in `MessageBubble`

---

### U10 — Reply-To Message

**What exists:** `Message` model has `replyToMessageId` field ✅. It is never set in the frontend.

**Fix — Frontend:**

- Hover/long-press on any `MessageBubble` → show reply icon (↩) in the action row

- Click reply → sets `replyingTo: ChatMessage | null` state in `ChatWindow`

- Above the input bar, show a compact quoted preview:

  ```plaintext
  ┌─────────────────────────┐
  │ ↩ Replying to John      │  [✕ cancel]
  │ "Can you share the plan?"│
  └─────────────────────────┘
  ```

- Send → includes `replyToMessageId` in the WS message payload

**Fix —** `MessageBubble` **rendering:**

```tsx
{message.replyToMessage && (
  <div className="message-bubble__reply-preview">
    <span className="reply-preview__sender">{message.replyToMessage.senderName}</span>
    <span className="reply-preview__content">{message.replyToMessage.content.slice(0, 80)}</span>
  </div>
)}
```

---

### U11 — Message Reactions — Fix Render

**What exists:** `MessageReaction` model ✅. Reaction endpoint in `ChatController` ✅.

**What's broken:** Reactions are never displayed in `MessageBubble`. There's no UI to add/remove a reaction.

**Fix:**

- Below each `MessageBubble`, render reaction pills: `😊 2 ❤️ 1`
- Clicking a pill toggles your reaction (add if not reacted, remove if already reacted)
- Long-press on a message (or hover) shows a reaction picker bar with 6 quick emojis
- New reactions broadcast via WS to the conversation topic

---

### U12 — Conversation List: Sort by Most Recent

**Problem:** Conversations may not be sorted by most recent message. The `lastMessageAt` field (Phase 2 B1) must be used as the sort key.

**Fix:** In `ChatContext`, after loading conversations:

```ts
conversations.sort((a, b) => 
  new Date(b.lastMessageAt ?? b.createdAt).getTime() - 
  new Date(a.lastMessageAt ?? a.createdAt).getTime()
);
```

Also re-sort when a new message arrives via WS (move that conversation to the top, WhatsApp style).

---

### U13 — Typing Indicator Display

**What exists:** WS sends typing events ✅. `ChatContext` tracks `typingUsers` ✅.

**What's missing:** No visual display of "John is typing..." in `ChatWindow`.

**Fix:** Below the last message (above the input), when `typingUsers` contains the other participant:

```tsx
{isOtherUserTyping && (
  <div className="typing-indicator">
    <span>{otherUser.name} is typing</span>
    <span className="typing-indicator__dots">
      <span /><span /><span />  {/* animated bouncing dots */}
    </span>
  </div>
)}
```

---

## Phase 6 — Database Improvements

---

### D1 — Add Flyway Migration for Chat Tables

**Problem:** All chat tables are created by Hibernate `ddl-auto=update`. This is fragile in production:

- Order of table creation is non-deterministic
- Oracle dialect differences can cause silent failures
- No rollback path

**Fix:** Create `backend/src/main/resources/db/migration/V19__create_chat_tables.sql`:

Tables to include (Oracle-compatible DDL):

- `conversations` (conversation_id, title, type, is_group, created_at, updated_at, last_message_id)
- `conversation_participants` (id, conversation_id FK, user_id FK, joined_at, role)
- `conversation_requests` (id, sender_id FK, receiver_id FK, status, message, created_at)
- `messages` (message_id, conversation_id FK, sender_id FK, content, content_type, payload, reply_to_message_id FK, is_edited, is_deleted, created_at, updated_at)
- `message_attachments` (id, message_id FK, file_name, file_path, file_size, mime_type, created_at)
- `message_status` (id, message_id FK, user_id FK, status, updated_at)
- `message_reactions` (id, message_id FK, user_id FK, emoji, created_at)
- `message_edit_history` (id, message_id FK, old_content, edited_at)
- `announcements` (id, owner_id FK, title, content, audience_type, audience_filter, recipient_count, created_at)

Set `ddl-auto=validate` after creating this migration to prevent Hibernate from modifying tables directly.

---

### D2 — Index: `messages(conversation_id, created_at DESC)`

**Problem:** Every message fetch query does `ORDER BY created_at DESC WHERE conversation_id = ?`. Without an index, Oracle does a full table scan.

**Fix:** Add to migration:

```sql
CREATE INDEX idx_messages_conv_time ON messages (conversation_id, created_at DESC);
```

---

### D3 — Index: `message_status(message_id, user_id)`

**Problem:** Read receipt queries look up status by `message_id + user_id`. No index.

**Fix:**

```sql
CREATE UNIQUE INDEX idx_msg_status_msg_user ON message_status (message_id, user_id);
```

The unique constraint also prevents duplicate status rows per user per message.

---

### D4 — Index: `conversation_requests(receiver_id, status)`

**Problem:** `getPendingRequests()` queries `WHERE receiver_id = ? AND status = 'PENDING'`. No index → full scan.

**Fix:**

```sql
CREATE INDEX idx_conv_req_receiver_status ON conversation_requests (receiver_id, status);
```

---

### D5 — Add `last_message_id` FK to `conversations`

**Problem:** Every conversation list load runs a subquery to find the latest message per conversation. With 100 conversations this is 100 subqueries.

**Fix:** Add `last_message_id NUMBER(19)` to the `conversations` table. Update `ChatService.sendMessage()`:

```java
conversation.setLastMessageId(savedMessage.getMessageId());
conversationRepository.save(conversation);
```

Join to `messages` in `getConversations()` to get the last message in a single query instead of N subqueries.

---

### D6 — Populate `message_status` on Every Send

**Problem:** `message_status` table is always empty. All the status-related code in Phase 1 F5 depends on this being populated.

**Fix:** In `ChatService.sendMessage()`, after `messageRepository.save(message)`:

```java
MessageStatus sentStatus = new MessageStatus();
sentStatus.setMessage(savedMessage);
sentStatus.setUser(sender);
sentStatus.setStatus(MessageStatusType.SENT);
messageStatusRepository.save(sentStatus);
```

---

## Phase 7 — Backend API Improvements

---

### B1 — Add `lastMessage` to Conversation List Response

**Current:** `GET /api/chat/conversations` returns conversations with no last message data.

**Fix:** In `ChatController.getConversations()`:

```java
Message lastMsg = messageRepository
    .findTopByConversationConversationIdOrderByCreatedAtDesc(conv.getConversationId());
if (lastMsg != null) {
    dto.setLastMessageContent(
        lastMsg.isDeleted() ? "This message was deleted" : lastMsg.getContent()
    );
    dto.setLastMessageType(lastMsg.getContentType().name());
    dto.setLastMessageAt(lastMsg.getCreatedAt());
    dto.setLastMessageSenderId(lastMsg.getSender().getId());
}
```

Add these four fields to `ConversationDTO`.

---

### B2 — Add `unreadCount` to Conversation List Response

**Fix:** See Phase 1 F7. Add to each `ConversationDTO`:

```java
long unread = messageStatusRepository
    .countByConversationIdAndUserIdAndStatusNot(conv.getConversationId(), userId, MessageStatusType.READ);
dto.setUnreadCount((int) unread);
```

---

### B3 — Add Read Receipt Endpoint

```plaintext
POST /api/chat/conversations/{conversationId}/read
Authorization: Bearer {token}
```

**Service logic:**

1. Find all messages in conversation where status for current user is `SENT` or `DELIVERED`
2. Update all to `READ`
3. Broadcast via WS to each message's sender: `{ type: 'READ_RECEIPT', conversationId, readBy: userId, readAt }`
4. Return `200 OK`

**Frontend:** Call this endpoint when `ChatWindow` mounts (conversation opened) and when the browser tab/window gains focus while a conversation is open.

---

### B4 — Message Pagination (Infinite Scroll)

**Problem:** Always loads page 0 / size 50. No way to see messages older than the last 50.

**What exists:** `chatApi.ts` already accepts `page` and `size` params ✅.

**Fix — Frontend:**

- `ChatContext.loadMessages(conversationId, page)` appends to the message list when `page > 0` instead of replacing it
- `ChatWindow` detects scroll to top → calls `loadMessages(conversationId, currentPage + 1)`
- Show a loading spinner at the top during fetch
- When response is empty, stop triggering more fetches (set `hasMore = false`)

**Fix — Backend:** Ensure `ChatController.getMessages()` returns `totalPages` or `hasMore` in the response so frontend knows when to stop.

---

### B5 — Shared Media Endpoint

> Required by Phase 5 U7 (`ContactInfoPanel`)

```plaintext
GET /api/chat/conversations/{conversationId}/media?type=IMAGE&page=0&size=18
GET /api/chat/conversations/{conversationId}/media?type=FILE&page=0&size=10
```

Returns all `MessageAttachment` records for a conversation filtered by MIME type category. Used to build the shared media grid in `ContactInfoPanel`.

---

### B6 — Server-Side Message Search Endpoint

> Required by Phase 5 U9 (deep search)

```plaintext
POST /api/chat/conversations/{conversationId}/messages/search
Body: { "query": "workout plan", "page": 0, "size": 20 }
```

Returns messages where `LOWER(content) LIKE LOWER('%query%')`. Supports pagination.

---

### B7 — Announcement Broadcast Endpoint

> Required by Phase 2 O5

```plaintext
POST /api/chat/announcements
Body: {
  "title": "Holiday Schedule Change",
  "content": "The gym will be closed on...",
  "audience": "ALL" | "BY_PLAN" | "BY_TRAINER",
  "planId": 5,       // optional, used when audience=BY_PLAN
  "trainerId": 12    // optional, used when audience=BY_TRAINER
}
```

**Service logic:**

1. Resolve target user IDs based on `audience` filter
2. For each target user: `startOrGetConversation(owner, targetUser)` → `sendMessage(conversationId, content, TEXT)`
3. Save an `Announcement` record with `recipientCount`
4. Return `{ announcementId, recipientCount, status: 'SENT' }`

---

### B8 — Presence Endpoint for Initial Load

> Required by Phase 5 U6

```plaintext
GET /api/chat/presence?userIds=1,2,3,4
Response: { "1": true, "2": false, "3": true, "4": false }
```

Returns current online status for a list of user IDs. Called once on page load to initialize the presence map before WS events start flowing.

---

## Phase 8 — Cleanup & Removals

---

### R1 — Remove Hardcoded `totalUnread = 3`

File: `ChatSidebar.tsx`

```tsx
// REMOVE:
const totalUnread = 3;

// REPLACE WITH:
const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
```

---

### R2 — Replace `alert()` Calls with Toast Notifications

Files: `ChatSidebar.tsx`, `NewChatModal.tsx`

The project already uses `react-hot-toast`. Replace all `alert('...')` and `window.alert('...')` with:

```tsx
import toast from 'react-hot-toast';
toast.error('Could not start conversation. Please try again.');
toast.success('Message request sent!');
```

---

### R3 — Remove Unused `FILTER_TABS` in Member `ChatSidebar`

**Problem:** Members see a "Trainers / Support" filter tab that does nothing useful. Members only have one trainer and potentially the owner to talk to.

**Fix:** For `role === 'MEMBER'`, hide the filter tabs entirely. The sidebar shows only their conversation list.

---

### R4 — Remove the Dead "Book Session" Button

File: `ChatWindow.tsx` header

The button has no `onClick` and goes nowhere. Remove it entirely. Placeholder: add a comment `{/* TODO: Re-add when scheduling feature is built */}`.

---

### R5 — Move All Inline `style={{}}` to CSS Classes

Files: `ChatSidebar.tsx`, `ChatWindow.tsx`, `MessageBubble.tsx`

Audit each file for `style={{...}}` props. Move every style to a named CSS class in `Chat.css`. Inline styles block responsive design and theming.

---

### R6 — Remove Duplicate Chat API Wiring in `api.ts`

**Problem:** `api.ts` has a `chat` section that proxies `chatApi.ts` functions. This creates two import paths for the same functions and causes the double-unwrap bug (F3).

**Fix:** Delete the `chat` section from `api.ts`. Update all import sites to use `chatApi.ts` directly. There should be only one source of truth for chat API calls.

---

## Files To Create

FilePurpose`frontend/src/components/chat/ContactInfoPanel.tsx`Fixes crash in Phase 1 F1; full design in Phase 5 U7`frontend/src/components/chat/ContactInfoPanel.css`Styles for the contact info panel`frontend/src/components/chat/FileCard.tsx`Render FILE-type messages (Phase 3 M2)`frontend/src/components/chat/ImageLightbox.tsx`Full-screen image viewer (Phase 3 M1)`frontend/src/components/chat/VoiceRecorder.tsx`Hold-to-record mic button (Phase 3 M3)`frontend/src/components/chat/WorkoutPlanModal.tsx`Trainer selects and sends a workout plan (Phase 4 T1)`frontend/src/components/chat/WorkoutPlanViewModal.tsx`View full workout plan from a WORKOUT_PLAN message (Phase 4 T2)`frontend/src/components/chat/ProgressNoteModal.tsx`Trainer selects and shares a progress note (Phase 4 T3)`frontend/src/components/chat/AnnouncementModal.tsx`Owner creates a broadcast announcement (Phase 2 O5)`frontend/src/pages/Dashboard/OwnerMessages.tsx`Owner messages page (Phase 2 O1)`frontend/src/pages/Dashboard/OwnerMessages.css`Owner-specific chat layout styles`backend/.../V19__create_chat_tables.sql`Flyway migration for all chat tables (Phase 6 D1)`backend/.../PresenceService.java`Tracks online users in-memory (Phase 5 U6)`backend/.../AnnouncementController.java`REST endpoint for owner broadcasts (Phase 7 B7)`backend/.../Announcement.java`JPA model for announcement history (Phase 2 O5)

---

## Files To Modify

FileChanges Required`ChatLayout.tsx`Fix ContactInfoPanel import path`ChatContext.tsx`Add real unreadCount, presence map, read-on-open, pagination, WS reconnect on token refresh, re-sort conversations on new message`ChatSidebar.tsx`Remove all inline styles → CSS classes, fix unread badge, add owner tabs (Trainers/Members/Announcements), replace alert() with toast`ChatWindow.tsx`Fix typing debounce, replace input → textarea, wire emoji picker, separate file upload buttons, trigger read receipt on open`MessageBubble.tsx`Add FILE rendering (FileCard), AUDIO/VOICE_NOTE rendering, reply-to snippet, reaction display, fix "View Plan" button, add delivery ticks`NewChatModal.tsx`Fix API call name mismatch, fix double-unwrap bug`chatApi.ts`Add FILE/VIDEO/AUDIO to content type union, add `uploadAttachment`, `markRead`, `searchMessages`, `getSharedMedia`, `getPresenceTrainerMessages.tsx`Fix action bar: open WorkoutPlanModal / ProgressNoteModal instead of navigating away`MemberMessages.tsx`Add member-specific sidebar shortcut to message their trainer`App.tsx`Add `/messages` route for owner + add nav item to owner sidebar`Chat.css`Add: tab CSS classes, file card styles, voice note player styles, image lightbox overlay, reply-to preview styles, typing indicator styles, delivery tick styles, emoji picker popup positioning`ChatService.java`Fix `isTrainerOf()` Oracle bug, add `isOwnerOf()`, write MessageStatus on send, mark delivered on fetch`ChatController.java`Add `lastMessage` + `unreadCount` to conversation DTO, add `POST .../read` endpoint, add `GET .../media` endpoint, add `POST .../messages/search` endpoint`AttachmentController.java`Add `@PreAuthorize("isAuthenticated()")`, add 25MB size limit, sanitize filename (UUID prefix, no path traversal)`ConversationDTO.java`Add: `lastMessageContent`, `lastMessageType`, `lastMessageAt`, `lastMessageSenderId`, `unreadCount` fields`Message.java`Ensure `replyToMessage` is fetched correctly (not lazy-loading in a loop)

---

## Implementation Order

```plaintext
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1 — Bug Fixes (F1–F7)                                │
│  Must be done first. Pages crash without ContactInfoPanel.  │
│  Oracle bug blocks all message sending.                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴──────────┐
          ▼                      ▼
┌─────────────────┐    ┌──────────────────────┐
│  PHASE 6 — DB   │    │  PHASE 2 — Owner      │
│  Migrations +   │    │  Page + Tabs +        │
│  Indexes        │    │  Permissions          │
└────────┬────────┘    └──────────┬────────────┘
         │                        │
         ▼                        │
┌─────────────────┐               │
│  PHASE 7 — API  │               │
│  lastMessage,   │               │
│  unreadCount,   │               │
│  read receipt,  │◄──────────────┘
│  media, search  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────────┐
│  PHASE 3 — Media│    │  PHASE 4 — Workout    │
│  Lightbox,      │    │  Plan modal,          │
│  FileCard,      │    │  View Plan button,    │
│  Voice notes,   │    │  Progress note modal  │
│  Upload buttons │    │                       │
└────────┬────────┘    └──────────┬────────────┘
         │                        │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │  PHASE 5 — UI/UX       │
         │  All visual polish,    │
         │  presence, reactions,  │
         │  reply-to, emoji,      │
         │  search, typing dots   │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │  PHASE 8 — Cleanup     │
         │  Remove dead code,     │
         │  inline styles,        │
         │  duplicate API wiring  │
         └────────────────────────┘
```

**Why this order:**

- Phase 1 first because the pages crash without `ContactInfoPanel` and the Oracle bug breaks all sends
- Phase 6 (DB) before Phase 7 (API) because the new API endpoints depend on the new columns and indexes
- Phase 2 (Owner) can proceed in parallel with Phase 6 since it only needs Phase 1 to be complete
- Phase 3 and Phase 4 both depend on the API being solid (Phase 7) — especially read receipts and attachment endpoints
- Phase 5 (UX polish) last because it wraps all the data from phases 1–4
- Phase 8 (cleanup) is final — remove dead code only after all replacements are verified to work