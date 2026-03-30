# Chat Feature - Temporarily Disabled

## Status: DISABLED BY DEFAULT

**Last Updated:** 2026-03-30

---

## Current Status

The **Chat/Messaging Feature** has been **temporarily disabled** and is not visible in the frontend by default.

---

## Files Involved (DO NOT DELETE)

### Frontend
- `frontend/src/contexts/FeatureContext.tsx` - Feature flag system (chat disabled by default)
- `frontend/src/components/chat/` - Chat UI components
  - `ChatSidebar.tsx`
  - `ChatWindow.tsx`
  - `MessageBubble.tsx`
  - `NewChatModal.tsx`
  - `ActionBar.tsx`
  - `ContactInfoPanel.tsx`
  - `RequestItem.tsx`
  - `VoiceRecorder.tsx`
  - `WorkoutPlanModal.tsx`
  - `ProgressNoteModal.tsx`
- `frontend/src/services/chatApi.ts` - Chat API service
- `frontend/src/contexts/ChatContext.tsx` - Chat state management
- `frontend/src/pages/trainer/TrainerMessages.tsx` - Trainer chat page
- `frontend/src/pages/Dashboard/OwnerMessages.tsx` - Owner messages page

### Backend
- `backend/src/main/java/com/gym/management/entity/OutboxEvent.java` - Outbox event entity
- `backend/src/main/java/com/gym/management/scheduler/OutboxProcessor.java` - Outbox event processor
- `backend/src/main/java/com/gym/management/service/TransactionalOutboxService.java` - Transactional outbox service
- `backend/src/main/java/com/gym/management/service/DeltaEventPublisher.java` - Real-time event publisher
- `backend/src/main/java/com/gym/management/controller/MessageController.java` - Messaging REST API

---

## How to Enable Chat Feature

### Step 1: Enable Backend Scheduling

In `backend/src/main/java/com/gym/management/GymManagementApplication.java`:

```java
// REMOVE the comment to enable scheduling
@org.springframework.scheduling.annotation.EnableScheduling  // ENABLED - Chat system active
public class GymManagementApplication extends SpringBootServletInitializer {
```

### Step 2: Re-enable Flyway Migrations

In `backend/src/main/resources/application.properties`:

```properties
spring.flyway.enabled=true
spring.jpa.hibernate.ddl-auto=none
```

### Step 3: Restore Migration Files

Ensure these migration files exist in `backend/src/main/resources/db/migration/`:
- V99__event_outbox.sql (already exists)

### Step 4: Enable Chat in Frontend Feature Context

In `frontend/src/contexts/FeatureContext.tsx`:

```javascript
// CHANGE this:
return { [CHAT_FEATURE_KEY]: false };

// TO THIS:
return { [CHAT_FEATURE_KEY]: true };
```

### Step 5: Restart Services

```bash
# Restart backend
cd backend && mvn spring-boot:run

# Restart frontend
cd frontend && npm run dev
```

---

## Architecture Notes

### Outbox Pattern
The chat system uses an **Outbox Pattern** for reliable message delivery:

1. Messages are written to `event_outbox` table within the same transaction as the parent operation
2. `OutboxProcessor` (scheduled task) processes outbox events and publishes via WebSocket
3. `DeltaEventPublisher` broadcasts changes to connected clients

### Key Tables
- `event_outbox` - Stores pending events to be processed
- `event_outbox_dlq` - Dead letter queue for failed events
- `messages` - Chat messages storage

### Why Disabled?
- Database connection issues with Oracle Free tier
- Background scheduler causing transaction errors
- Need time to debug and stabilize before production use

---

## Contact

For questions about this feature, refer to the original implementation or contact the development team.

---

## DO NOT DELETE

This file is for documentation purposes only. The code is preserved but disabled.
