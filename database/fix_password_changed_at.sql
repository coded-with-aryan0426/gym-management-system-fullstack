-- Add PASSWORD_CHANGED_AT to USERS table
ALTER TABLE users ADD (password_changed_at TIMESTAMP);

COMMIT;