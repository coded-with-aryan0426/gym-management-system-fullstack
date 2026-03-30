-- ===================================================================
-- V101__add_performance_indexes.sql (Oracle-Compliant Version)
-- Purpose: Add missing indexes to prevent full table scans at scale
-- Critical for handling 100k+ records without performance degradation
-- ===================================================================

PROMPT ===================================================================
PROMPT V101: Adding Performance Indexes (Oracle Syntax)
PROMPT ===================================================================

-- ============================================
-- PT_SESSIONS INDEXES
-- ============================================

-- Index for trainer calendar queries (most common access pattern)
CREATE INDEX idx_pt_sessions_trainer_date ON pt_sessions(trainer_id, session_date);

-- Index for member session history
CREATE INDEX idx_pt_sessions_member_date ON pt_sessions(member_id, session_date);

-- Index for status-based dashboard queries
CREATE INDEX idx_pt_sessions_status_date ON pt_sessions(status, session_date);

PROMPT Created PT_SESSIONS indexes

-- ============================================
-- MESSAGES INDEXES (Chat System)
-- ============================================

-- Index for conversation message history (reverse chronological)
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Index for finding messages by sender
CREATE INDEX idx_messages_sender_created ON messages(sender_id, created_at DESC);

PROMPT Created MESSAGES indexes

-- ============================================
-- CLASS_BOOKINGS INDEXES
-- ============================================

-- Index for member class history
CREATE INDEX idx_class_bookings_member ON class_bookings(member_id, booking_date DESC);

-- Index for class capacity management
CREATE INDEX idx_class_bookings_class_date ON class_bookings(class_id, booking_date, status);

PROMPT Created CLASS_BOOKINGS indexes

-- ============================================
-- CHECK_INS INDEXES (Attendance)
-- ============================================

-- Index for gym daily attendance reports
CREATE INDEX idx_checkins_gym_date ON check_ins(gym_id, check_in_date DESC);

-- Index for member attendance history
CREATE INDEX idx_checkins_member_date ON check_ins(member_id, check_in_date DESC);

PROMPT Created CHECK_INS indexes

-- ============================================
-- USER_SESSIONS INDEXES (Security)
-- ============================================

-- Index for finding active sessions by user
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active, created_at DESC);

-- Index for gym session tracking
CREATE INDEX idx_user_sessions_gym ON user_sessions(gym_id, created_at DESC);

PROMPT Created USER_SESSIONS indexes

-- ============================================
-- AUDIT_LOGS INDEXES (Compliance)
-- ============================================

-- Index for timestamp-based log retrieval
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Index for entity-specific audit trails
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, timestamp DESC);

-- Index for user activity logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC);

-- Index for gym-specific audit queries
CREATE INDEX idx_audit_logs_gym ON audit_logs(gym_id, timestamp DESC);

PROMPT Created AUDIT_LOGS indexes

-- ============================================
-- STAFF_PERFORMANCE INDEXES
-- ============================================

-- Index for trainer performance queries
CREATE INDEX idx_staff_performance_staff_date ON staff_performance(staff_id, period_start DESC);

PROMPT Created STAFF_PERFORMANCE indexes

-- ============================================
-- GYM_STAFF INDEXES
-- ============================================

-- Index for gym staff lookup
CREATE INDEX idx_gym_staff_gym_role ON gym_staff(gym_id, role, is_active);

PROMPT Created GYM_STAFF indexes

-- ============================================
-- USER_GYM_ROLES INDEXES
-- ============================================

-- Index for user's gym roles
CREATE INDEX idx_user_gym_roles_user ON user_gym_roles(user_id, is_active);

-- Index for gym role assignments
CREATE INDEX idx_user_gym_roles_gym ON user_gym_roles(gym_id, role_type, is_active);

PROMPT Created USER_GYM_ROLES indexes

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================

-- Index for user notification retrieval
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Index for unread notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

PROMPT Created NOTIFICATIONS indexes

-- ============================================
-- EQUIPMENT_MAINTENANCE INDEXES
-- ============================================

-- Index for gym equipment maintenance schedules
CREATE INDEX idx_equipment_maintenance_gym_status ON equipment_maintenance(gym_id, status, next_maintenance_date);

PROMPT Created EQUIPMENT_MAINTENANCE indexes

-- ============================================
-- TRANSACTIONS INDEXES (Billing)
-- ============================================

-- Index for gym transaction history
CREATE INDEX idx_transactions_gym_date ON transactions(gym_id, transaction_date DESC);

-- Index for member billing history
CREATE INDEX idx_transactions_member ON transactions(member_id, transaction_date DESC);

-- Index for payment status queries
CREATE INDEX idx_transactions_status ON transactions(status, transaction_date DESC);

PROMPT Created TRANSACTIONS indexes

COMMIT;

PROMPT;
PROMPT ===================================================================
PROMPT V101 Migration Complete!
PROMPT ===================================================================
PROMPT Created 25+ indexes for query performance optimization
PROMPT These indexes will significantly improve response times at scale
PROMPT ===================================================================
