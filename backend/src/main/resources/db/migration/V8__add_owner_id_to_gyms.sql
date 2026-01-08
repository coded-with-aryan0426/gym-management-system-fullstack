-- =========================================
-- V8__add_owner_id_to_gyms.sql
-- Add missing owner_id column to gyms table
-- =========================================

-- Add owner_id column to gyms table
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE gyms ADD owner_id NUMBER';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1430 THEN
            NULL; -- Column already exists, skip
        ELSE
            RAISE;
        END IF;
END;
/

-- Add foreign key constraint
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE gyms ADD CONSTRAINT fk_gyms_owner FOREIGN KEY (owner_id) REFERENCES users(user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -2264 OR SQLCODE = -2261 THEN
            NULL; -- Constraint already exists or column doesn't exist, skip
        ELSE
            RAISE;
        END IF;
END;
/

-- Update existing gyms to have an owner (using admin user with user_id=1 as default)
UPDATE gyms SET owner_id = 1 WHERE owner_id IS NULL;

COMMIT;
