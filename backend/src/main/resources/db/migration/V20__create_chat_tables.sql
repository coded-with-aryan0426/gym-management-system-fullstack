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
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE conversations (
    conversation_id NUMBER(19)     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type            VARCHAR2(20)   NOT NULL,            -- ''PRIVATE'', ''GROUP''
    title           VARCHAR2(255),
    metadata        VARCHAR2(4000),                     -- JSON string
    last_message_id NUMBER(19),                         -- D5: FK set after messages table exists
    created_at      TIMESTAMP      DEFAULT SYSTIMESTAMP,
    updated_at      TIMESTAMP      DEFAULT SYSTIMESTAMP
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- -------------------------------------------------------
-- 2. CONVERSATION_PARTICIPANTS
-- -------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE conversation_participants (
    conversation_id     NUMBER(19)    NOT NULL,
    user_id             NUMBER(19)    NOT NULL,
    role                VARCHAR2(20),                   -- ''ADMIN'', ''MEMBER''
    status              VARCHAR2(20)  DEFAULT ''ACTIVE'', -- PENDING|ACTIVE|LEFT|BLOCKED
    last_read_message_id NUMBER(19),
    is_muted            NUMBER(1)     DEFAULT 0,
    is_pinned           NUMBER(1)     DEFAULT 0,
    joined_at           TIMESTAMP     DEFAULT SYSTIMESTAMP,
    accepted_at         TIMESTAMP,
    CONSTRAINT pk_conv_participants PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT fk_cp_conversation   FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_user           FOREIGN KEY (user_id)         REFERENCES users(user_id)
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- -------------------------------------------------------
-- 3. CONVERSATION_REQUESTS
-- -------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE conversation_requests (
    request_id      NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id       NUMBER(19)   NOT NULL,
    receiver_id     NUMBER(19)   NOT NULL,
    conversation_id NUMBER(19),
    status          VARCHAR2(20) DEFAULT ''PENDING'' NOT NULL, -- PENDING|ACCEPTED|REJECTED
    message         VARCHAR2(500),
    created_at      TIMESTAMP    DEFAULT SYSTIMESTAMP,
    responded_at    TIMESTAMP,
    CONSTRAINT fk_cr_sender      FOREIGN KEY (sender_id)       REFERENCES users(user_id),
    CONSTRAINT fk_cr_receiver    FOREIGN KEY (receiver_id)     REFERENCES users(user_id),
    CONSTRAINT fk_cr_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- -------------------------------------------------------
-- 4. MESSAGES
-- -------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE messages (
    message_id          NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id     NUMBER(19)   NOT NULL,
    sender_id           NUMBER(19),                      -- NULL for system messages
    content             CLOB,
    content_type        VARCHAR2(30) DEFAULT ''TEXT'',     -- TEXT|IMAGE|FILE|VIDEO|AUDIO|VOICE_NOTE|WORKOUT_PLAN|DIET_PLAN
    payload             CLOB,                            -- JSON for structured messages
    is_system_message   NUMBER(1)    DEFAULT 0,
    reply_to_message_id NUMBER(19),
    is_deleted          NUMBER(1)    DEFAULT 0,
    created_at          TIMESTAMP    DEFAULT SYSTIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id)     REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender       FOREIGN KEY (sender_id)           REFERENCES users(user_id),
    CONSTRAINT fk_msg_reply_to     FOREIGN KEY (reply_to_message_id) REFERENCES messages(message_id)
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- Ensure last_message_id exists (in case table was created by Hibernate before this migration)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE conversations ADD last_message_id NUMBER(19)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN -- ORA-01430: column being added already exists
            RAISE;
        END IF;
END;
/

-- Now that MESSAGES exists, add the FK from CONVERSATIONS → MESSAGES for last_message_id
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE conversations ADD CONSTRAINT fk_conv_last_message FOREIGN KEY (last_message_id) REFERENCES messages(message_id)';
EXCEPTION
    WHEN OTHERS THEN
        -- ORA-02275: such a referential constraint already exists in the table
        IF SQLCODE != -2275 THEN
            RAISE;
        END IF;
END;
/

-- -------------------------------------------------------
-- 5. MESSAGE_ATTACHMENTS
-- -------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE message_attachments (
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
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- -------------------------------------------------------
-- 6. MESSAGE_STATUS
-- -------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE message_status (
    message_id NUMBER(19)   NOT NULL,
    user_id    NUMBER(19)   NOT NULL,
    status     VARCHAR2(20) NOT NULL,   -- SENT|DELIVERED|READ
    updated_at TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_message_status PRIMARY KEY (message_id, user_id),
    CONSTRAINT fk_ms_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_ms_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- -------------------------------------------------------
-- 7. MESSAGE_REACTIONS
-- -------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE message_reactions (
    reaction_id NUMBER(19)   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id  NUMBER(19)   NOT NULL,
    user_id     NUMBER(19)   NOT NULL,
    emoji       VARCHAR2(50) NOT NULL,
    created_at  TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT uq_reaction_msg_user_emoji UNIQUE (message_id, user_id, emoji),
    CONSTRAINT fk_react_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_react_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- -------------------------------------------------------
-- 8. MESSAGE_EDIT_HISTORY
-- -------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE message_edit_history (
    history_id       NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id       NUMBER(19) NOT NULL,
    previous_content CLOB       NOT NULL,
    edited_at        TIMESTAMP  DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_edithist_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE
)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- =========================================================
-- D2: Speed up "get messages for conversation ordered by time"
-- (also in V19 — IF NOT EXISTS makes this idempotent)
-- =========================================================
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_messages_conv_time ON messages (conversation_id, created_at DESC)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/

-- =========================================================
-- D3: Unique index on message_status — prevents duplicate
--     status rows and speeds up read-receipt lookups
--     (also in V19 — IF NOT EXISTS makes this idempotent)
-- =========================================================
BEGIN
    EXECUTE IMMEDIATE 'CREATE UNIQUE INDEX idx_msg_status_msg_user ON message_status (message_id, user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/

-- =========================================================
-- D4: Speed up getPendingRequests() — filter by receiver + status
--     (also in V19 — IF NOT EXISTS makes this idempotent)
-- =========================================================
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_conv_req_receiver_status ON conversation_requests (receiver_id, status)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/

-- =========================================================
-- D5: Index on last_message_id for JOIN performance
-- =========================================================
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_conv_last_message ON conversations (last_message_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/

-- =========================================================
-- Additional performance indexes
-- =========================================================
-- Speed up "get participants for a conversation"
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_cp_conversation ON conversation_participants (conversation_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/

-- Speed up "get all conversations for a user"
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_cp_user ON conversation_participants (user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/

-- Speed up attachment lookups by message
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_attach_message ON message_attachments (message_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/
