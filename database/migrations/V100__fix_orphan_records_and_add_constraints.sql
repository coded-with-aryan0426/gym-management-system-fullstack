-- ===================================================================
-- V100__fix_orphan_records_and_add_constraints.sql
-- Purpose: Fix existing orphan records and add database constraints
--         to prevent future orphan records
-- ===================================================================

PROMPT ===================================================================
PROMPT V100: Fixing Orphan Records and Adding Constraints
PROMPT ===================================================================

PROMPT;
PROMPT [STEP 1] Identifying orphan records in PT_SESSIONS...
PROMPT;

-- Check for PT_SESSIONS with invalid trainer_id
SELECT 'PT_SESSIONS - Invalid Trainer References:' as check_name, COUNT(*) as orphan_count
FROM pt_sessions ps
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = ps.trainer_id);

-- Check for PT_SESSIONS with invalid member_id
SELECT 'PT_SESSIONS - Invalid Member References:' as check_name, COUNT(*) as orphan_count
FROM pt_sessions ps
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = ps.member_id);

PROMPT;
PROMPT [STEP 2] Backing up orphan records before deletion...
PROMPT;

-- Create backup table for orphaned PT sessions
CREATE TABLE pt_sessions_orphaned_backup AS
SELECT ps.*, 'Invalid Trainer' as orphan_reason
FROM pt_sessions ps
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = ps.trainer_id)
UNION ALL
SELECT ps.*, 'Invalid Member' as orphan_reason
FROM pt_sessions ps
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = ps.member_id);

PROMPT Backup table created: pt_sessions_orphaned_backup
PROMPT Rows backed up: &1

PROMPT;
PROMPT [STEP 3] Deleting orphan records from PT_SESSIONS...
PROMPT;

-- Delete PT sessions with invalid trainer
DELETE FROM pt_sessions
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = pt_sessions.trainer_id);
PROMPT Deleted PT sessions with invalid trainers

-- Delete PT sessions with invalid member
DELETE FROM pt_sessions
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = pt_sessions.member_id);
PROMPT Deleted PT sessions with invalid members

COMMIT;

PROMPT;
PROMPT [STEP 4] Adding Foreign Key Constraints to prevent future orphans...
PROMPT;

-- Add FK constraint for trainer_id with CASCADE DELETE
DECLARE
    v_constraint_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_constraint_exists
    FROM user_constraints
    WHERE constraint_name = 'FK_PT_SESSIONS_TRAINER';

    IF v_constraint_exists = 0 THEN
        EXECUTE IMMEDIATE '
            ALTER TABLE pt_sessions
            ADD CONSTRAINT FK_PT_SESSIONS_TRAINER
            FOREIGN KEY (trainer_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE';
        DBMS_OUTPUT.PUT_LINE('Added FK_PT_SESSIONS_TRAINER');
    ELSE
        DBMS_OUTPUT.PUT_LINE('FK_PT_SESSIONS_TRAINER already exists');
    END IF;
END;
/

-- Add FK constraint for member_id with CASCADE DELETE
DECLARE
    v_constraint_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_constraint_exists
    FROM user_constraints
    WHERE constraint_name = 'FK_PT_SESSIONS_MEMBER';

    IF v_constraint_exists = 0 THEN
        EXECUTE IMMEDIATE '
            ALTER TABLE pt_sessions
            ADD CONSTRAINT FK_PT_SESSIONS_MEMBER
            FOREIGN KEY (member_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE';
        DBMS_OUTPUT.PUT_LINE('Added FK_PT_SESSIONS_MEMBER');
    ELSE
        DBMS_OUTPUT.PUT_LINE('FK_PT_SESSIONS_MEMBER already exists');
    END IF;
END;
/

COMMIT;

PROMPT;
PROMPT [STEP 5] Checking for other tables with potential orphan issues...
PROMPT;

-- Check for orphaned records in other tables
-- STAFF_PERFORMANCE
CREATE TABLE staff_performance_orphaned_backup AS
SELECT sp.*, 'Invalid Staff' as orphan_reason
FROM staff_performance sp
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = sp.staff_id);

DELETE FROM staff_performance
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = staff_performance.staff_id);

-- STAFF_SHIFTS
CREATE TABLE staff_shifts_orphaned_backup AS
SELECT ss.*, 'Invalid Staff' as orphan_reason
FROM staff_shifts ss
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = ss.staff_id);

DELETE FROM staff_shifts
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = staff_shifts.staff_id);

COMMIT;

PROMPT;
PROMPT [STEP 6] Creating Database Integrity Check Procedure...
PROMPT;

CREATE OR REPLACE PROCEDURE check_and_fix_database_integrity AS
    v_orphan_count NUMBER;
    v_fk_errors NUMBER;
BEGIN
    -- Check PT_SESSIONS for orphan records
    SELECT COUNT(*) INTO v_orphan_count
    FROM pt_sessions ps
    WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = ps.trainer_id)
       OR NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = ps.member_id);

    IF v_orphan_count > 0 THEN
        DBMS_OUTPUT.PUT_LINE('WARNING: Found ' || v_orphan_count || ' orphan PT session records');
        DELETE FROM pt_sessions
        WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = pt_sessions.trainer_id)
           OR NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = pt_sessions.member_id);
        DBMS_OUTPUT.PUT_LINE('Deleted ' || SQL%ROWCOUNT || ' orphan PT session records');
    ELSE
        DBMS_OUTPUT.PUT_LINE('OK: No orphan PT sessions found');
    END IF;

    COMMIT;
END check_and_fix_database_integrity;
/

PROMPT;
PROMPT [STEP 7] Creating Scheduled Integrity Check (optional)...
PROMPT;

-- Note: To enable scheduled checks, uncomment the following and configure Oracle Scheduler
/*
BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
        job_name => 'INTEGRITY_CHECK_JOB',
        job_type => 'PLSQL_BLOCK',
        job_action => 'BEGIN check_and_fix_database_integrity; END;',
        repeat_interval => 'FREQ=DAILY; BYHOUR=2; BYMINUTE=0',
        enabled => TRUE,
        comments => 'Daily database integrity check and repair'
    );
END;
/
*/

PROMPT;
PROMPT ===================================================================
PROMPT V100 Migration Complete!
PROMPT ===================================================================
PROMPT Summary:
PROMPT - Fixed orphan PT_SESSIONS records (backed up to pt_sessions_orphaned_backup)
PROMPT - Added FK constraints with CASCADE DELETE for trainer_id and member_id
PROMPT - Created check_and_fix_database_integrity procedure for manual/automated repairs
PROMPT
PROMPT To run integrity check manually:
PROMPT   BEGIN check_and_fix_database_integrity; END;
PROMPT ===================================================================
