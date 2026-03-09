# Messaging System Architecture

## Overview
The messaging system enables real-time communication between users (Trainers, Members, etc.). It supports 1:1 and Group chats, attachments, reactions, editing, and deleting messages.

## Backend Architecture
- **Tech Stack**: Java Spring Boot, PostgreSQL, Spring WebSocket (STOMP).
- **Entities**:
  - `Message`: Core message entity.
  - `MessageReaction`: Stores user reactions per message.
  - `MessageEditHistory`: Tracks content history.
  - `Conversation`: Groups messages and participants.
- **Real-time**:
  - `ChatWebSocketController`: Handles typing indicators and message sending.
  - `SimpMessagingTemplate`: Broadcasts events (`MESSAGE_EDIT`, `MESSAGE_DELETE`, `REACTION_ADD`, etc.) to `/topic/conversation/{id}`.
- **Retention**:
  - `ChatRetentionScheduler`: Runs daily at 3 AM to soft-delete messages older than 1 year.

## Frontend Architecture
- **Tech Stack**: React, TypeScript, StompJS, Lucide React.
- **State Management**: `ChatContext` manages WebSocket subscription and message state.
- **Components**:
  - `ChatWindow`: Main container.
  - `MessageBubble`: Individual message rendering with actions.
  - `ChatSidebar`: Conversation list and filtering.
- **Features**:
  - Optimistic UI updates.
  - Typing indicators.
  - Message editing and deletion.
  - Emoji reactions.

## API Endpoints
- `PUT /api/chat/messages/{id}`: Edit message.
- `DELETE /api/chat/messages/{id}`: Delete message.
- `POST /api/chat/messages/{id}/reactions`: Add reaction.
- `DELETE /api/chat/messages/{id}/reactions`: Remove reaction.
