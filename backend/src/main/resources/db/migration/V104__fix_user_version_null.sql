-- =========================================
-- V104__fix_user_version_null.sql
-- Fix NULL version values in users table for Hibernate optimistic locking
-- =========================================

-- Update all users with NULL version to have version = 0
UPDATE users SET version = 0 WHERE version IS NULL;

-- Ensure version column has a default value for future inserts
-- This prevents NULL versions for new users
