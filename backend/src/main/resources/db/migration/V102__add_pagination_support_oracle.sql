-- ===================================================================
-- V102__add_pagination_support.sql (Oracle-Compliant Version)
-- Purpose: Add cursor-based pagination support for high-scale queries
-- Prevents timeout and memory issues when fetching large datasets
-- ===================================================================

PROMPT ===================================================================
PROMPT V102: Adding Pagination Support (Oracle Syntax)
PROMPT ===================================================================

-- ============================================
-- SEQUENCE TABLE FOR CURSOR-BASED PAGINATION
-- ============================================

-- Table to track pagination cursors for different entity types
CREATE TABLE pagination_cursors (
    cursor_id VARCHAR2(100) PRIMARY KEY,
    entity_type VARCHAR2(50) NOT NULL,
    last_id NUMBER NOT NULL,
    last_value VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create index separately (Oracle syntax)
CREATE INDEX idx_cursor_entity ON pagination_cursors(entity_type, created_at);

PROMPT Created pagination_cursors table and index

-- ============================================
-- DEAD LETTER QUEUE FOR EVENT OUTBOX
-- ============================================

-- Table to store permanently failed events for manual review
CREATE TABLE event_outbox_dlq (
    id NUMBER PRIMARY KEY,
    event_id VARCHAR2(36) NOT NULL,
    event_type VARCHAR2(50) NOT NULL,
    entity_type VARCHAR2(50) NOT NULL,
    entity_id NUMBER NOT NULL,
    operation VARCHAR2(10) NOT NULL,
    payload CLOB,
    tenant_id NUMBER NOT NULL,
    actor_id NUMBER,
    sequence_number NUMBER NOT NULL,
    version NUMBER,
    created_at TIMESTAMP,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retry_count NUMBER DEFAULT 0,
    last_error CLOB,
    original_error CLOB
);

PROMPT Created event_outbox_dlq table

-- ============================================
-- DATABASE JOB FOR ORPHAN RECORD CLEANUP
-- ============================================

-- Stored procedure for automated orphan record cleanup
CREATE OR REPLACE PROCEDURE cleanup_orphan_records AS
    v_deleted_count NUMBER;
BEGIN
    -- Clean up PT sessions with invalid trainers
    DELETE FROM pt_sessions
    WHERE trainer_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users WHERE user_id = pt_sessions.trainer_id);
    v_deleted_count := SQL%ROWCOUNT;
    DBMS_OUTPUT.PUT_LINE('Deleted ' || v_deleted_count || ' PT sessions with invalid trainers');

    -- Clean up PT sessions with invalid members
    DELETE FROM pt_sessions
    WHERE member_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users WHERE user_id = pt_sessions.member_id);
    v_deleted_count := SQL%ROWCOUNT;
    DBMS_OUTPUT.PUT_LINE('Deleted ' || v_deleted_count || ' PT sessions with invalid members');

    -- Clean up staff performance with invalid staff
    DELETE FROM staff_performance
    WHERE staff_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users WHERE user_id = staff_performance.staff_id);
    v_deleted_count := SQL%ROWCOUNT;
    DBMS_OUTPUT.PUT_LINE('Deleted ' || v_deleted_count || ' staff performance records with invalid staff');

    -- Clean up messages with invalid senders
    DELETE FROM messages
    WHERE sender_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users WHERE user_id = messages.sender_id);
    v_deleted_count := SQL%ROWCOUNT;
    DBMS_OUTPUT.PUT_LINE('Deleted ' || v_deleted_count || ' messages with invalid senders');

    COMMIT;
END cleanup_orphan_records;
/

PROMPT Created cleanup_orphan_records procedure

-- ============================================
-- HEALTH CHECK VIEW FOR MONITORING
-- Note: Only checks tables that exist in this schema
-- ============================================

CREATE OR REPLACE VIEW v_database_health AS
SELECT
    'ORPHAN_PT_SESSIONS' AS check_name,
    COUNT(*) AS issue_count,
    CASE WHEN COUNT(*) = 0 THEN 'HEALTHY' ELSE 'CRITICAL' END AS status
FROM pt_sessions
WHERE trainer_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM users WHERE user_id = pt_sessions.trainer_id)
UNION ALL
SELECT
    'ORPHAN_PT_MEMBER' AS check_name,
    COUNT(*) AS issue_count,
    CASE WHEN COUNT(*) = 0 THEN 'HEALTHY' ELSE 'CRITICAL' END AS status
FROM pt_sessions
WHERE member_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM users WHERE user_id = pt_sessions.member_id)
UNION ALL
SELECT
    'DLQ_EVENTS' AS check_name,
    COUNT(*) AS issue_count,
    CASE WHEN COUNT(*) = 0 THEN 'HEALTHY' ELSE 'CRITICAL' END AS status
FROM event_outbox_dlq;

PROMPT Created v_database_health view

-- ============================================
-- ADDITIONAL SCALABILITY INDEXES
-- ============================================

-- Index for PT sessions by date (for calendar queries)
CREATE INDEX idx_pt_sessions_date ON pt_sessions(session_date);

-- Index for PT sessions by status (for dashboard)
CREATE INDEX idx_pt_sessions_status ON pt_sessions(status);

-- Index for users by email (login lookups)
CREATE INDEX idx_users_email ON users(email);

-- Index for users by username (login lookups)
CREATE INDEX idx_users_username ON users(username);

-- Index for messages by conversation (chat)
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Index for class bookings by member
CREATE INDEX idx_class_bookings_member ON class_bookings(member_id);

PROMPT Created additional performance indexes

COMMIT;

PROMPT;
PROMPT ===================================================================
PROMPT V102 Migration Complete!
PROMPT ===================================================================
PROMPT - Created pagination_cursors for cursor-based pagination
PROMPT - Created event_outbox_dlq for failed event handling
PROMPT - Created cleanup_orphan_records procedure
PROMPT - Created v_database_health monitoring view
PROMPT - Created additional performance indexes
PROMPT ===================================================================
