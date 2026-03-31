# AthlonX — Messaging System PRD (Technical)

**Version:** 1.1 (Technical Refinement)
**Current Status:** Partially Implemented (See Gap Analysis)

---

## 1 — Gap Analysis & Implementation Status

Before new features are built, we must understand the current codebase capability (`com.gym.management.controller.ChatController`, `ChatService`, etc.).

| Feature | Current State (Codebase) | Missing / Improvement Needed |
| :--- | :--- | :--- |
| **Entities** | `Message`, `Conversation`, `ConversationParticipant`, `UserBlock`, `MessageAttachment` exist. | `ConversationRequest` entity is MISSING. `Conversation` needs a `status` field for Pending/Active states if not using separate Request table. |
| **Private Chat** | `getOrCreatePrivateConversation(u1, u2)` exists. Auto-joins users. | No "Request" flow. Users are instantly connected. Needs `Request` → `Accept` logic for non-trainer relationships. |
| **Messaging** | POST `/api/chat` sends text/payload. Persists to DB. | **Attachment Upload** endpoint is missing. `MessageAttachment` exists in model but no API to upload files. |
| **Realtime** | WebSocket `/topic/conversation/{id}` broadcasts messages. | No **Read Receipts** broadcasting. No **Typing Indicators**. No **Presence** system. |
| **Blocking** | `BlockingService` implementation exists and is integrated. | Logic seems complete (`isBlocked` check). UI endpoint exists. |
| **User Discovery** | `ChatUserService` filters available users. | Needs refinement to support "Pending Requests" filter and "Search Global Gym Users" for new requests. |
| **AI Integration** | **Zero implementation.** | Needs `AIService`, Prompt Engineering, and `draft`/`finalize` endpoints. |

---

## 2 — Enhanced Data Model

### 2.1 New/Modified Schemas

#### **ConversationRequest (New Entity)**
Manage the "Invite" flow.
```java
@Entity
@Table(name = "conversation_requests")
public class ConversationRequest {
    @Id
    private Long id;
    
    @ManyToOne 
    private User fromUser;
    
    @ManyToOne 
    private User toUser;
    
    @Column
    private String status; // PENDING, REJECTED, ACCEPTED
    
    @Column
    private LocalDateTime createdAt;
    
    // Logic: If ACCEPTED, a Conversation is created/linked.
}
```

#### **Message (Enhancements)**
Current `Message` entity has `payload`. We need to standardize `payload` JSON schemas.
*   **Plan Payload:** `{"planId": 101, "planType": "WORKOUT", "preview": "Split A"}`
*   **Attachment Payload:** `{"attachments": [{"id": 1, "url": "...", "type": "IMAGE"}]}` (Or use `MessageAttachment` relation directly). *Current Code uses `@OneToMany` relation likely, but `ChatController` DTO logic needs to check this.*

---

## 3 — API Specification (Technical)

### 3.1 Chat Flow (Updated)

**POST /api/chat/requests** (New)
*   **Auth:** User Bearer Token
*   **Body:** `{ "targetUserId": 55 }`
*   **Logic:**
    1.  Check `BlockingService.isBlocked(target, sender)`. If true, fail silently or 403.
    2.  Check if `Conversation` already exists. if yes, return `{ permission: "GRANTED", conversationId: 12 }`.
    3.  Check if `Role` allows direct msg (e.g. Trainer -> Own Member). If yes, `createConversation` immediately.
    4.  Else, create `ConversationRequest`. Send WebSocket notification to `target`.
*   **Response:** `{ "status": "PENDING", "requestId": 333 }`

**POST /api/chat/requests/{reqId}/accept** (New)
*   **Logic:**
    1.  Update Request -> ACCEPTED.
    2.  Call `ChatService.getOrCreatePrivateConversation`.
    3.  Notify sender via WS (`/user/queue/notifications`).

### 3.2 Attachments (New Endpoint)

**POST /api/chat/attachments**
*   **Consumes:** `multipart/form-data`
*   **Param:** `file` (Binary), `conversationId` (Long)
*   **Logic:**
    1.  Validate file size (e.g., < 10MB) and type (List of allowed MIMEs).
    2.  Upload to Storage (S3/Local).
    3.  Create `MessageAttachment` record (Orphaned initially or linked to temporary message placeholder).
    4.  **Return:** `{ "attachmentId": 99, "url": "/secure/files/99", "preview": "..." }`
*   **Client Workflow:**
    1.  Upload File -> Get ID.
    2.  Send Message -> Include `{ "attachmentIds": [99] }` in payload.
    3.  Backend links Attachment to Message.

### 3.3 AI Assistant (Greenfield)

**POST /api/chat/ai/draft**
*   **Body:** `{ "prompt": "Create 5x5 routine", "contextUserId": 12 }`
*   **Logic:**
    1.  `AIService` fetches `contextUserId` profile (Injuries, Goals).
    2.  Construct LLM System Prompt: *"You are AthlonX Guide. User wants... Member stats:..."*
    3.  Call LLM (OpenAI/Gemini).
    4.  Parse JSON response.
    5.  Save as `AIDraft` (New Entity or temp storage).
*   **Response:** `{ "draftId": "uuid", "content": "Here is a plan...", "structuredPlan": {...} }`

---

## 4 — WebSocket Protocol (STOMP)

Current: `/topic/conversation/{id}` exists.
**Additions:**

| Destination | Payload (JSON) | Trigger |
| :--- | :--- | :--- |
| `/topic/conversation/{id}` | `{ "type": "TYPING", "userId": 1, "isTyping": true }` | Client onInput |
| `/topic/conversation/{id}` | `{ "type": "READ_RECEIPT", "userId": 1, "messageId": 500 }` | Client onView |
| `/user/queue/notifications` | `{ "type": "NEW_REQUEST", "fromUser": {...} }` | `POST /chat/requests` |

**Security Note:** `ChatWebSocketController` must validate `SimpMessageHeaderAccessor` user principal for *every* subscription. A user cannot subscribe to `/topic/conversation/99` unless they are a participant. **This check is currently missing in the standard STOMP config usually; needs `ChannelInterceptor`.**

---

## 5 — Technical Roadmap

1.  **Phase 1: Request Logic & Refactor**
    *   Create `ConversationRequest` entity/repo.
    *   Refactor `ChatController.startPrivateChat` to check for specific role-based "Direct Access" permissions, otherwise trigger Request flow.
    *   Implement `POST /attachments` endpoint using `MessageAttachmentRepository`.
2.  **Phase 2: Realtime Polish**
    *   Update `ChatWebSocketController` to handle `ReadStatus` events.
    *   Create `ChannelInterceptor` for WebSocket security (authorization check).
3.  **Phase 3: AI Service**
    *   Scaffold `AIService`.
    *   Implement "Draft Plan" endpoint.
    *   Build "ConvertToMessage" logic.

---

## 6 — UI Requirements (Dev)

*   **ChatWindow.tsx**:
    *   Support `Message.type = 'WORKOUT_PLAN'` (Render a Card, not text).
    *   Support `Message.type = 'IMAGE'` (Render with `MessageAttachment.url`).
*   **ChatSidebar.tsx**:
    *   Add "Requests" tab (fetch `POST /requests`).
    *   Add "Unread" badges (Calculate from `lastReadMessageId` vs `lastMessageId`).

---
