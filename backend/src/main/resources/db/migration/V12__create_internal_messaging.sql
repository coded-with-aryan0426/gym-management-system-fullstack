-- Internal Messaging System Schema

-- 1. Conversations Table
CREATE TABLE conversations (
    conversation_id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'PRIVATE', 'GROUP'
    title VARCHAR(255), -- Nullable, used for group chats like "Morning HIIT Class"
    metadata JSONB, -- Stores context like class_id, cohort_id, or custom attributes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Conversation Participants Table
CREATE TABLE conversation_participants (
    conversation_id BIGINT REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER', -- 'ADMIN' (for group creators), 'MEMBER'
    last_read_message_id BIGINT,
    is_muted BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- 3. Messages Table
CREATE TABLE messages (
    message_id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL, -- Null for System/AI messages
    
    -- Content
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'TEXT', -- 'TEXT', 'IMAGE', 'WORKOUT_PLAN', 'DIET_PLAN', 'AI_RESPONSE'
    
    -- Structured Data (The "Gym Object" Payload)
    payload JSONB, 
    
    -- Metadata
    is_system_message BOOLEAN DEFAULT FALSE,
    reply_to_message_id BIGINT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 4. Message Status (Read Receipts)
CREATE TABLE message_status (
    message_id BIGINT REFERENCES messages(message_id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20), -- 'SENT', 'DELIVERED', 'READ'
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
