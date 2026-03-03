-- =========================================================
-- V20__create_chat_tables.sql
-- Full Oracle-compatible DDL for all chat system tables.
-- Uses IF NOT EXISTS (Oracle 23c / 23ai) so this migration
-- is idempotent — safe to run even if Hibernate ddl-auto=update
-- already created the tables.
-- =========================================================

-- -------------------------------------------------------
-- 1. CONVERSATIONS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id NUMBER(19)     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type            VARCHAR2(20)   NOT NULL,            -- 'PRIVATE', 'GROUP'
    title           VARCHAR2(255),
    metadata        VARCHAR2(4000),                     -- JSON string
    last_message_id NUMBER(19),                         -- D5: FK set after messages table exists
    created_at      TIMESTAMP      DEFAULT SYSTIMESTAMP,
    updated_at      TIMESTAMP      DEFAULT SYSTIMESTAMP
);

-- -------------------------------------------------------
-- 2. CONVERSATION_PARTICIPANTS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id     NUMBER(19)    NOT NULL,
    user_id             NUMBER(19)    NOT NULL,
    role                VARCHAR2(20),                   -- 'ADMIN', 'MEMBER'
    status              VARCHAR2(20)  DEFAULT 'ACTIVE', -- PENDING|ACTIVE|LEFT|BLOCKED
    last_read_message_id NUMBER(19),
    is_muted            NUMBER(1)     DEFAULT 0,
    is_pinned           NUMBER(1)     DEFAULT 0,
    joined_at           TIMESTAMP     DEFAULT SYSTIMESTAMP,
    accepted_at         TIMESTAMP,
    CONSTRAINT pk_conv_participants PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT fk_cp_conversation   FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_user           FOREIGN KEY (user_id)         REFERENCES users(user_id)
);

-- -------------------------------------------------------
-- 3. CONVERSATION_REQUESTS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_requests (
    request_id      NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id       NUMBER(19)   NOT NULL,
    receiver_id     NUMBER(19)   NOT NULL,
    conversation_id NUMBER(19),
    status          VARCHAR2(20) DEFAULT 'PENDING' NOT NULL, -- PENDING|ACCEPTED|REJECTED
    message         VARCHAR2(500),
    created_at      TIMESTAMP    DEFAULT SYSTIMESTAMP,
    responded_at    TIMESTAMP,
    CONSTRAINT fk_cr_sender      FOREIGN KEY (sender_id)       REFERENCES users(user_id),
    CONSTRAINT fk_cr_receiver    FOREIGN KEY (receiver_id)     REFERENCES users(user_id),
    CONSTRAINT fk_cr_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);

-- -------------------------------------------------------
-- 4. MESSAGES
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    message_id          NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id     NUMBER(19)   NOT NULL,
    sender_id           NUMBER(19),                      -- NULL for system messages
    content             CLOB,
    content_type        VARCHAR2(30) DEFAULT 'TEXT',     -- TEXT|IMAGE|FILE|VIDEO|AUDIO|VOICE_NOTE|WORKOUT_PLAN|DIET_PLAN
    payload             CLOB,                            -- JSON for structured messages
    is_system_message   NUMBER(1)    DEFAULT 0,
    reply_to_message_id NUMBER(19),
    is_deleted          NUMBER(1)    DEFAULT 0,
    created_at          TIMESTAMP    DEFAULT SYSTIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id)     REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender       FOREIGN KEY (sender_id)           REFERENCES users(user_id),
    CONSTRAINT fk_msg_reply_to     FOREIGN KEY (reply_to_message_id) REFERENCES messages(message_id)
);

-- Now that MESSAGES exists, add the FK from CONVERSATIONS → MESSAGES for last_message_id
ALTER TABLE IF EXISTS conversations
    ADD CONSTRAINT fk_conv_last_message FOREIGN KEY (last_message_id) REFERENCES messages(message_id);

-- -------------------------------------------------------
-- 5. MESSAGE_ATTACHMENTS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_attachments (
    attachment_id    NUMBER(19)    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id       NUMBER(19),
    stored_file_name VARCHAR2(255),
    file_type        VARCHAR2(20)  NOT NULL,  -- IMAGE|VIDEO|DOCUMENT|VOICE_NOTE|AUDIO|OTHER
    file_url         VARCHAR2(1000) NOT NULL,
    file_name        VARCHAR2(255),
    file_size        NUMBER(19),
    mime_type        VARCHAR2(100),
    thumbnail_url    VARCHAR2(1000),
    duration         NUMBER(10),              -- seconds, for audio/video
    width            NUMBER(10),
    height           NUMBER(10),
    created_at       TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_attach_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- 6. MESSAGE_STATUS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_status (
    message_id NUMBER(19)   NOT NULL,
    user_id    NUMBER(19)   NOT NULL,
    status     VARCHAR2(20) NOT NULL,   -- SENT|DELIVERED|READ
    updated_at TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_message_status PRIMARY KEY (message_id, user_id),
    CONSTRAINT fk_ms_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_ms_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)
);

-- -------------------------------------------------------
-- 7. MESSAGE_REACTIONS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_reactions (
    reaction_id NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id  NUMBER(19)   NOT NULL,
    user_id     NUMBER(19)   NOT NULL,
    emoji       VARCHAR2(50) NOT NULL,
    created_at  TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT uq_reaction_msg_user_emoji UNIQUE (message_id, user_id, emoji),
    CONSTRAINT fk_react_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_react_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)
);

-- -------------------------------------------------------
-- 8. MESSAGE_EDIT_HISTORY
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_edit_history (
    history_id       NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id       NUMBER(19) NOT NULL,
    previous_content CLOB       NOT NULL,
    edited_at        TIMESTAMP  DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_edithist_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE
);

-- =========================================================
-- D2: Speed up "get messages for conversation ordered by time"
-- (also in V19 — IF NOT EXISTS makes this idempotent)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_messages_conv_time ON messages (conversation_id, created_at DESC);

-- =========================================================
-- D3: Unique index on message_status — prevents duplicate
--     status rows and speeds up read-receipt lookups
--     (also in V19 — IF NOT EXISTS makes this idempotent)
-- =========================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_msg_status_msg_user ON message_status (message_id, user_id);

-- =========================================================
-- D4: Speed up getPendingRequests() — filter by receiver + status
--     (also in V19 — IF NOT EXISTS makes this idempotent)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_conv_req_receiver_status ON conversation_requests (receiver_id, status);

-- =========================================================
-- D5: Index on last_message_id for JOIN performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_conv_last_message ON conversations (last_message_id);

-- =========================================================
-- Additional performance indexes
-- =========================================================
-- Speed up "get participants for a conversation"
CREATE INDEX IF NOT EXISTS idx_cp_conversation ON conversation_participants (conversation_id);

-- Speed up "get all conversations for a user"
CREATE INDEX IF NOT EXISTS idx_cp_user ON conversation_participants (user_id);

-- Speed up attachment lookups by message
CREATE INDEX IF NOT EXISTS idx_attach_message ON message_attachments (message_id);
