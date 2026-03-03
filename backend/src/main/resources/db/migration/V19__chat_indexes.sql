-- =========================================================
-- V19__chat_indexes.sql
-- Performance indexes for the chat system tables
-- (Tables are managed by Hibernate ddl-auto=update)
-- =========================================================

-- D2: Speed up "get messages for conversation ordered by time"
CREATE INDEX idx_messages_conv_time ON messages (conversation_id, created_at DESC);

-- D3: Unique index on message_status prevents duplicate status rows
--     and speeds up read-receipt lookups
CREATE UNIQUE INDEX idx_msg_status_msg_user ON message_status (message_id, user_id);

-- D4: Speed up getPendingRequests() — queries by receiver_id + status
CREATE INDEX idx_conv_req_receiver_status ON conversation_requests (receiver_id, status);
