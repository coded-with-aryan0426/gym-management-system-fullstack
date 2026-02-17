-- =========================================
-- V2__add_indexes.sql
-- Performance indexes for AthlonX V2
-- =========================================

-- Index on users.email for fast lookups during login
-- Using EXCEPTION block to handle case where index already exists
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_users_email ON users(email)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1408 OR SQLCODE = -955 THEN
            NULL; -- Index already exists on this column, skip
        ELSE
            RAISE;
        END IF;
END;
/

-- Index on memberships.end_date for expiry queries
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_memberships_end_date ON memberships(end_date)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1408 OR SQLCODE = -955 THEN
            NULL; -- Index already exists on this column, skip
        ELSE
            RAISE;
        END IF;
END;
/

-- Note: username column already has a unique index from the entity constraint
-- so we skip creating idx_users_username
