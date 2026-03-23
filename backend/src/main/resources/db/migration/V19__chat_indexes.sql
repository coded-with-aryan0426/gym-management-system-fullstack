-- =========================================================
-- V19__chat_indexes.sql
-- Performance indexes for the chat system tables
-- (Tables are managed by Hibernate ddl-auto=update)
-- =========================================================

-- D2: Speed up "get messages for conversation ordered by time"
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_messages_conv_time ON messages (conversation_id, created_at DESC)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN -- -955 is name already used, -1408 is column list already indexed
            RAISE;
        END IF;
END;
/

-- D3: Unique index on message_status prevents duplicate status rows
--     and speeds up read-receipt lookups
BEGIN
    EXECUTE IMMEDIATE 'CREATE UNIQUE INDEX idx_msg_status_msg_user ON message_status (message_id, user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/

-- D4: Speed up getPendingRequests() — queries by receiver_id + status
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_conv_req_receiver_status ON conversation_requests (receiver_id, status)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/
