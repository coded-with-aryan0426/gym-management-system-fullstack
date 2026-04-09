-- V105__attendance_audit_fields.sql (Manual Execution)
-- Run this in SQL Developer as the gym schema user
-- Purpose: Add attendance audit fields to CHECK_INS table

-- Step 1: Add check_in_method column
ALTER TABLE CHECK_INS ADD (
    check_in_method VARCHAR2(20) DEFAULT 'MANUAL'
);

-- Step 2: Add device_info column
ALTER TABLE CHECK_INS ADD (
    device_info VARCHAR2(200)
);

-- Step 3: Add ip_address column
ALTER TABLE CHECK_INS ADD (
    ip_address VARCHAR2(64)
);

-- Step 4: Add operator_user_id column
ALTER TABLE CHECK_INS ADD (
    operator_user_id NUMBER
);

-- Step 5: Add notes column
ALTER TABLE CHECK_INS ADD (
    notes VARCHAR2(500)
);

-- Step 6: Backfill check_in_method = 'MANUAL' for existing records
UPDATE CHECK_INS SET check_in_method = 'MANUAL' WHERE check_in_method IS NULL;

-- Step 7: Backfill status = 'CHECKED_OUT' where check_out_time IS NOT NULL and status IS NULL
UPDATE CHECK_INS SET status = 'CHECKED_OUT' WHERE status IS NULL AND check_out_time IS NOT NULL;

-- Step 8: Backfill status = 'ACTIVE' where check_out_time IS NULL and status IS NULL
UPDATE CHECK_INS SET status = 'ACTIVE' WHERE status IS NULL AND check_out_time IS NULL;

-- Step 9: Add NOT NULL constraints after backfill
ALTER TABLE CHECK_INS MODIFY (check_in_method NOT NULL);

-- Step 10: Add foreign key for operator_user_id (ignore if fails - constraint may exist)
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE CHECK_INS ADD CONSTRAINT FK_CHECKINS_OPERATOR FOREIGN KEY (operator_user_id) REFERENCES USERS(user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 THEN
            DBMS_OUTPUT.PUT_LINE('Constraint already exists, skipping');
        ELSE
            RAISE;
        END IF;
END;
/

-- Step 11: Add column comments
COMMENT ON COLUMN CHECK_INS.check_in_method IS 'How the check-in occurred: MANUAL, QR, SELF, CLASS';
COMMENT ON COLUMN CHECK_INS.device_info IS 'Device information for audit (browser, OS, app version)';
COMMENT ON COLUMN CHECK_INS.ip_address IS 'IP address of check-in request for geo-validation';
COMMENT ON COLUMN CHECK_INS.operator_user_id IS 'Staff user who performed manual check-in (NULL for self-service)';
COMMENT ON COLUMN CHECK_INS.notes IS 'Optional admin notes for this check-in record';

-- Verify the columns were added
SELECT column_name, data_type, nullable, data_default
FROM user_tab_columns
WHERE table_name = 'CHECK_INS'
ORDER BY column_id;

PROMPT
PROMPT V105 Complete! Run the attendance page to verify.
