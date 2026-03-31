-- V105__attendance_audit_fields.sql
-- Add attendance audit fields and method/status enums to CHECK_INS table

ALTER TABLE CHECK_INS ADD (
    check_in_method VARCHAR2(20) DEFAULT 'MANUAL'
);

ALTER TABLE CHECK_INS ADD (
    device_info VARCHAR2(200)
);

ALTER TABLE CHECK_INS ADD (
    ip_address VARCHAR2(64)
);

ALTER TABLE CHECK_INS ADD (
    operator_user_id NUMBER
);

ALTER TABLE CHECK_INS ADD (
    notes VARCHAR2(500)
);

UPDATE CHECK_INS SET check_in_method = 'MANUAL' WHERE check_in_method IS NULL;

UPDATE CHECK_INS SET status = 'CHECKED_OUT' WHERE status IS NULL AND check_out_time IS NOT NULL;

UPDATE CHECK_INS SET status = 'ACTIVE' WHERE status IS NULL AND check_out_time IS NULL;

ALTER TABLE CHECK_INS MODIFY (check_in_method NOT NULL);

ALTER TABLE CHECK_INS MODIFY (status NOT NULL);

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE CHECK_INS ADD CONSTRAINT FK_CHECKINS_OPERATOR FOREIGN KEY (operator_user_id) REFERENCES USERS(user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

COMMENT ON COLUMN CHECK_INS.check_in_method IS 'How the check-in occurred: MANUAL, QR, SELF, CLASS';
COMMENT ON COLUMN CHECK_INS.device_info IS 'Device information for audit';
COMMENT ON COLUMN CHECK_INS.ip_address IS 'IP address of check-in request';
COMMENT ON COLUMN CHECK_INS.operator_user_id IS 'Staff who performed manual check-in';
COMMENT ON COLUMN CHECK_INS.notes IS 'Optional admin notes';
