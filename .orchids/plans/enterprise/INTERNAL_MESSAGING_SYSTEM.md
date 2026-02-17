# Internal Messaging System Plan
## Role-Based, Privacy-Aware, Real-Time Messaging for the Entire Gym

---

## Current State

### What Exists
- `ChatController.java` + `ChatWebSocketController.java` — backend controllers
- `ChatService.java` + `ChatUserService.java` — backend services
- Models: `Message.java`, `Conversation.java`, `ConversationParticipant.java`, `ConversationRequest.java`, `MessageAttachment.java`, `MessageReaction.java`, `MessageEditHistory.java`, `MessageStatus.java`
- Frontend: `chatApi.ts` (7.6KB)
- `TrainerMessages.tsx` uses shared `ChatLayout` (14 lines — clean)
- `MemberMessages.tsx` — **100% hardcoded mock data** (809 lines — non-functional)
- WebSocket config exists (`WebSocketConfig.java`)

### What's BROKEN
- Member messaging doesn't work AT ALL
- No clear role-based access control on conversations
- No group messaging
- No broadcast/announcement system
- No admin/owner oversight capability
- No message moderation tools
- No file sharing beyond text

---

## Messaging Architecture Design

### User Roles & Communication Rules

```
┌─────────────────────────────────────────────────────────┐
│                    COMMUNICATION MATRIX                   │
├──────────────┬───────┬─────────┬────────┬───────┬───────┤
│ Can Message  │ Owner │ Trainer │ Member │ Staff │ Admin │
├──────────────┼───────┼─────────┼────────┼───────┼───────┤
│ Owner        │  ✅   │   ✅    │   ✅   │  ✅   │  ✅   │
│ Trainer      │  ✅   │   ✅    │ ✅ (*)│  ✅   │  ✅   │
│ Member       │  ❌   │ ✅ (*)│   ❌   │  ❌   │  ✅   │
│ Staff        │  ✅   │   ✅    │   ✅   │  ✅   │  ✅   │
│ Admin        │  ✅   │   ✅    │   ✅   │  ✅   │  ✅   │
└──────────────┴───────┴─────────┴────────┴───────┴───────┘

(*) Members can ONLY message their assigned trainer
    Trainers can ONLY message their assigned members
```

### Conversation Types

| Type | Description | Who Can Create | Who Can Join |
|------|-------------|----------------|--------------|
| **Direct Message** | 1-to-1 chat | Any allowed pair | Only the 2 participants |
| **Group Chat** | Named group | Owner, Trainer, Staff | Invited participants |
| **Class Channel** | Auto-created per class | System (auto) | All class members + trainer |
| **Announcement** | Owner broadcasts | Owner only | All members/trainers (read-only) |
| **Support Ticket** | Member → Support | Member | Member + assigned staff |
| **Trainer Notes Channel** | Private notes per member | Trainer | Trainer only (private) |

---

## Backend Architecture

### New/Modified Services
```
NEW:
├── service/MessagingService.java           — Core messaging logic
├── service/ConversationAccessService.java  — Role-based access validation
├── service/MessageModerationService.java   — Content filtering, flagging
├── service/BroadcastService.java           — Announcement distribution
├── service/FileUploadService.java          — Attachment handling (S3/local)
├── dto/CreateMessageDTO.java              — Message creation input
├── dto/ConversationDTO.java               — Conversation response
├── dto/MessageDTO.java                    — Message response with status
├── model/ConversationType.java            — Enum: DIRECT, GROUP, CLASS, ANNOUNCEMENT, SUPPORT
├── model/MessageType.java                 — Enum: TEXT, IMAGE, FILE, WORKOUT_PLAN, PROGRESS_NOTE

MODIFY:
├── ChatController.java   — Add gym_id validation, permission checks
├── ChatService.java      — Add tenant isolation, role-based filtering
├── ChatWebSocketController.java — Add gym-scoped topics
```

### WebSocket Architecture
```
WebSocket Topics (STOMP):
├── /topic/gym/{gymId}/conversations          — New conversation for this gym
├── /topic/conversation/{convId}/messages     — New messages in conversation
├── /topic/user/{userId}/notifications        — Personal message notifications
├── /topic/gym/{gymId}/announcements          — Owner broadcasts
├── /topic/class/{classId}/chat               — Class-specific channel

User Events:
├── /app/message.send         — Send message
├── /app/message.read         — Mark as read
├── /app/message.edit         — Edit message
├── /app/message.delete       — Delete message
├── /app/typing               — Typing indicator
├── /app/presence             — Online/offline status
```

### Privacy & Access Control Rules

```java
// ConversationAccessService.java pseudocode

boolean canCreateConversation(User sender, User recipient) {
    // Same gym check
    if (!sameGym(sender, recipient)) return false;

    // Role-based rules
    if (sender.isMember() && recipient.isMember()) return false;  // Members can't DM each other
    if (sender.isMember() && !isAssignedTrainer(sender, recipient)) return false;
    if (sender.isMember() && recipient.isOwner()) return false;

    return true;
}

boolean canViewConversation(User user, Conversation conv) {
    if (conv.getGymId() != user.getCurrentGymId()) return false;  // Tenant isolation
    if (!conv.getParticipants().contains(user)) return false;
    return true;
}
```

---

## Frontend Architecture

### Member Messages (COMPLETE REWRITE)
```
Current:  MemberMessages.tsx (809 lines → DELETE)
New:      MemberMessages.tsx (14 lines → use ChatLayout like TrainerMessages)
```

### ChatLayout Enhancements
```
components/chat/
├── ChatLayout.tsx              — Main layout (conversation list + message area)
├── ConversationList.tsx        — Left panel with search, filters
├── MessageArea.tsx             — Right panel with messages
├── MessageInput.tsx            — Text input, attachments, emoji, voice
├── MessageBubble.tsx           — Individual message rendering
├── ConversationHeader.tsx      — Participant info, actions
├── TypingIndicator.tsx         — "John is typing..."
├── OnlineIndicator.tsx         — Green/gray dot
├── AttachmentPreview.tsx       — File/image preview in chat
├── WorkoutPlanCard.tsx         — Rich card for shared workout plans
├── ProgressNoteCard.tsx        — Rich card for shared progress notes
├── AnnouncementBanner.tsx      — Owner announcement display
├── MessageSearch.tsx           — Search within conversations
├── ConversationSettings.tsx    — Mute, block, leave group
└── NewConversationModal.tsx    — Create new chat, search contacts
```

### Role-Specific Features in ChatLayout

| Feature | Owner | Trainer | Member | Staff |
|---------|-------|---------|--------|-------|
| Create group chat | ✅ | ✅ | ❌ | ✅ |
| Broadcast announcement | ✅ | ❌ | ❌ | ❌ |
| Send workout plan card | ❌ | ✅ | ❌ | ❌ |
| Send progress note | ❌ | ✅ | ❌ | ❌ |
| View all conversations | ✅ | Own only | Own only | ✅ |
| Moderate/delete messages | ✅ | Own only | Own only | ❌ |
| Block users | ✅ | ❌ | ❌ | ❌ |
| File attachments | ✅ | ✅ | ✅ (limited) | ✅ |
| Voice messages | ✅ | ✅ | ✅ | ✅ |
| Read receipts | ✅ | ✅ | ✅ | ✅ |

---

## Message Types & Rich Cards

### Workout Plan Card
```
┌───────────────────────────────┐
│ 🏋️ Workout Plan Shared       │
│ ─────────────────────────────│
│ Chest & Triceps - Day 3      │
│ 6 exercises · 45 min         │
│                               │
│ [View Plan]  [Save to My Plans]│
└───────────────────────────────┘
```

### Progress Note Card
```
┌───────────────────────────────┐
│ 📝 Progress Update            │
│ ─────────────────────────────│
│ Weight: 78kg → 76kg (-2kg)   │
│ Body Fat: 22% → 20%         │
│ Mood: 😊 Great               │
│                               │
│ [View Full Note]              │
└───────────────────────────────┘
```

### Session Booking Card
```
┌───────────────────────────────┐
│ 📅 Session Scheduled          │
│ ─────────────────────────────│
│ PT Session with Mike Tyson    │
│ Tomorrow · 10:00 AM · 60 min │
│                               │
│ [Confirm]  [Reschedule]       │
└───────────────────────────────┘
```

---

## Implementation Priority

| Phase | Items |
|-------|-------|
| **Phase 1** | Rewrite MemberMessages to use ChatLayout, verify API connectivity |
| **Phase 2** | Role-based access control, tenant isolation, conversation types |
| **Phase 3** | Real-time WebSocket events, typing indicators, read receipts |
| **Phase 4** | Rich cards (workout, progress, booking), file attachments |
| **Phase 5** | Group chat, class channels, announcements, moderation |
| **Phase 6** | Voice messages, message search, conversation settings |
