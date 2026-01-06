-- =========================================
-- V1__baseline.sql
-- Baseline migration for AthlonX V2
-- This captures the current schema state
-- =========================================

-- Note: Since we're using baseline-on-migrate=true with baseline-version=0,
-- this migration will run on existing databases without issues.
-- Flyway will mark it as completed and continue with future migrations.

-- Future tables will be created here via Flyway migrations
-- Current tables are managed by JPA/Hibernate

-- Placeholder for schema documentation
-- Existing tables managed by JPA:
-- - users
-- - roles
-- - user_role_map
-- - gyms
-- - gym_staff
-- - memberships
-- - pt_sessions
-- - classes
-- - otp_tokens
-- - packages

SELECT 1 FROM DUAL;
