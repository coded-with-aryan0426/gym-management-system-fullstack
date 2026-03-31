-- ===================================================================
-- V101__attendance_fields.sql
-- Purpose: Add attendance audit fields and method/status enums
--          to the CHECK_INS table for production-ready tracking
-- ===================================================================

PROMPT ===================================================================
PROMPT V101: Adding Attendance Fields
PROMPT ===================================================================

PROMPT;
PROMPT [STEP 1] Add check_in_method column...

ALTER TABLE CHECK_INS ADD (
    check_in_method VARCHAR2(20) DEFAULT 'MANUAL'
);

PROMPT [STEP 2] Add device_info column...
ALTER TABLE CHECK_INS ADD (
    device_info VARCHAR2(200)
);

PROMPT [STEP 3] Add ip_address column...
ALTER TABLE CHECK_INS ADD (
    ip_address VARCHAR2(64)
);

PROMPT [STEP 4] Add operator_user_id column...
ALTER TABLE CHECK_INS ADD (
    operator_user_id NUMBER
);

PROMPT [STEP 5] Add notes column...
ALTER TABLE CHECK_INS ADD (
    notes VARCHAR2(500)
);

PROMPT;
PROMPT [STEP 6] Backfill check_in_method = 'MANUAL' for existing records...
UPDATE CHECK_INS SET check_in_method = 'MANUAL' WHERE check_in_method IS NULL;

PROMPT [STEP 7] Backfill status = 'CHECKED_OUT' where check_out_time IS NOT NULL...
UPDATE CHECK_INS SET status = 'CHECKED_OUT' WHERE status IS NULL AND check_out_time IS NOT NULL;

PROMPT [STEP 8] Backfill status = 'ACTIVE' where check_out_time IS NULL...
UPDATE CHECK_INS SET status = 'ACTIVE' WHERE status IS NULL AND check_out_time IS NULL;

PROMPT;
PROMPT [STEP 9] Set NOT NULL constraints after backfill...
ALTER TABLE CHECK_INS MODIFY (check_in_method NOT NULL);
ALTER TABLE CHECK_INS MODIFY (status NOT NULL);

PROMPT;
PROMPT [STEP 10] Add foreign key for operator_user_id...
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE CHECK_INS ADD CONSTRAINT FK_CHECKINS_OPERATOR FOREIGN KEY (operator_user_id) REFERENCES USERS(user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

PROMPT;
PROMPT [STEP 11] Add comments for documentation...
COMMENT ON COLUMN CHECK_INS.check_in_method IS 'How the check-in occurred: MANUAL, QR, SELF, CLASS';
COMMENT ON COLUMN CHECK_INS.device_info IS 'Device information for audit (browser, OS, app version)';
COMMENT ON COLUMN CHECK_INS.ip_address IS 'IP address of check-in request for geo-validation';
COMMENT ON COLUMN CHECK_INS.operator_user_id IS 'Staff user who performed manual check-in (NULL for self-service)';
COMMENT ON COLUMN CHECK_INS.notes IS 'Optional admin notes for this check-in record';

PROMPT;
PROMPT ===================================================================
PROMPT V101 Complete: Attendance audit fields added successfully
PROMPT ===================================================================
