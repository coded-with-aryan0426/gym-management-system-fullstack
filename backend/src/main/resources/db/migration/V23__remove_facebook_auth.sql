-- =========================================
-- V23__remove_facebook_auth.sql
-- Remove Facebook authentication support
-- Keep only Google OAuth for social login
-- =========================================

-- Step 1: Update any existing Facebook users to LOCAL auth provider
-- This ensures they can still login with username/password
UPDATE users 
SET auth_provider = 'LOCAL' 
WHERE auth_provider = 'FACEBOOK';

-- Step 2: Drop the facebook_id unique index
DROP INDEX uk_users_facebook_id;

-- Step 3: Drop the facebook_id column
ALTER TABLE users DROP COLUMN facebook_id;

-- Step 4: Update the auth_provider check constraint
-- Remove FACEBOOK from allowed values
ALTER TABLE users DROP CONSTRAINT chk_auth_provider;
ALTER TABLE users ADD CONSTRAINT chk_auth_provider 
    CHECK (auth_provider IN ('LOCAL', 'GOOGLE'));

COMMENT ON TABLE users IS 'User accounts - supports LOCAL (email/password) and GOOGLE OAuth authentication';
