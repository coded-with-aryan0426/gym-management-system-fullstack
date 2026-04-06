-- ============================================================================
-- GYM MANAGEMENT SYSTEM - SAFE DATABASE FIX
-- Only adds columns that DON'T already exist
-- ============================================================================

-- Add missing columns to USERS table (only if they don't exist)
ALTER TABLE users ADD (gender VARCHAR2(20));
ALTER TABLE users ADD (date_of_birth DATE);
ALTER TABLE users ADD (address VARCHAR2(500));
ALTER TABLE users ADD (emergency_contact_name VARCHAR2(200));
ALTER TABLE users ADD (emergency_contact_phone VARCHAR2(20));
ALTER TABLE users ADD (emergency_contact_relation VARCHAR2(50));
ALTER TABLE users ADD (password_changed_at TIMESTAMP);
ALTER TABLE users ADD (created_by NUMBER);
ALTER TABLE users ADD (updated_by NUMBER);

-- Add missing columns to MEMBER_POINTS table (only if they don't exist)
ALTER TABLE member_points ADD (member_user_id NUMBER);

COMMIT;
