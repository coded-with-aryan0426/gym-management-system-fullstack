-- AthlonX v2 Migration Verification Script
-- Run this script to verify that the migration was successful

SET SERVEROUTPUT ON;
SET LINESIZE 200;
SET PAGESIZE 100;

PROMPT ============================================================================
PROMPT AthlonX v2 Migration Verification
PROMPT ============================================================================
PROMPT;

-- Check 1: Verify all tables exist
PROMPT [CHECK 1] Verifying table creation...
PROMPT;

SELECT 
    CASE 
        WHEN COUNT(*) = 6 THEN '✓ PASS: All 6 tables created successfully'
        ELSE '✗ FAIL: Expected 6 tables, found ' || COUNT(*)
    END as result
FROM user_tables 
WHERE table_name IN (
    'PT_SESSIONS', 
    'STAFF_PERFORMANCE', 
    'STAFF_SHIFTS', 
    'GYM_SETTINGS', 
    'MEMBERSHIP_PACKAGES', 
    'BLACKOUT_DAYS'
);

PROMPT;
PROMPT Table Details:
SELECT table_name, 
       TO_CHAR(created, 'YYYY-MM-DD HH24:MI:SS') as created_date
FROM user_tables 
WHERE table_name IN (
    'PT_SESSIONS', 
    'STAFF_PERFORMANCE', 
    'STAFF_SHIFTS', 
    'GYM_SETTINGS', 
    'MEMBERSHIP_PACKAGES', 
    'BLACKOUT_DAYS'
)
ORDER BY table_name;

PROMPT;
PROMPT ============================================================================

-- Check 2: Verify indexes
PROMPT [CHECK 2] Verifying index creation...
PROMPT;

SELECT 
    CASE 
        WHEN COUNT(*) >= 12 THEN '✓ PASS: Performance indexes created'
        ELSE '✗ FAIL: Expected at least 12 indexes, found ' || COUNT(*)
    END as result
FROM user_indexes 
WHERE table_name IN (
    'PT_SESSIONS', 
    'STAFF_PERFORMANCE', 
    'STAFF_SHIFTS', 
    'GYM_SETTINGS', 
    'MEMBERSHIP_PACKAGES', 
    'BLACKOUT_DAYS'
)
AND index_name NOT LIKE 'SYS_%';

PROMPT;
PROMPT Index Details:
SELECT table_name, index_name, uniqueness
FROM user_indexes 
WHERE table_name IN (
    'PT_SESSIONS', 
    'STAFF_PERFORMANCE', 
    'STAFF_SHIFTS', 
    'GYM_SETTINGS', 
    'MEMBERSHIP_PACKAGES', 
    'BLACKOUT_DAYS'
)
AND index_name NOT LIKE 'SYS_%'
ORDER BY table_name, index_name;

PROMPT;
PROMPT ============================================================================

-- Check 3: Verify foreign key constraints
PROMPT [CHECK 3] Verifying foreign key constraints...
PROMPT;

SELECT 
    CASE 
        WHEN COUNT(*) >= 5 THEN '✓ PASS: Foreign key constraints created'
        ELSE '✗ FAIL: Expected at least 5 FK constraints, found ' || COUNT(*)
    END as result
FROM user_constraints 
WHERE table_name IN ('PT_SESSIONS', 'STAFF_PERFORMANCE', 'STAFF_SHIFTS')
AND constraint_type = 'R';

PROMPT;
PROMPT Foreign Key Details:
SELECT 
    c.table_name,
    c.constraint_name,
    cc.column_name,
    r.table_name as references_table
FROM user_constraints c
JOIN user_cons_columns cc ON c.constraint_name = cc.constraint_name
JOIN user_constraints r ON c.r_constraint_name = r.constraint_name
WHERE c.table_name IN ('PT_SESSIONS', 'STAFF_PERFORMANCE', 'STAFF_SHIFTS')
AND c.constraint_type = 'R'
ORDER BY c.table_name, c.constraint_name;

PROMPT;
PROMPT ============================================================================

-- Check 4: Verify check constraints
PROMPT [CHECK 4] Verifying check constraints...
PROMPT;

SELECT 
    CASE 
        WHEN COUNT(*) >= 10 THEN '✓ PASS: Check constraints created'
        ELSE '✗ FAIL: Expected at least 10 check constraints, found ' || COUNT(*)
    END as result
FROM user_constraints 
WHERE table_name IN (
    'PT_SESSIONS', 
    'STAFF_PERFORMANCE', 
    'STAFF_SHIFTS', 
    'MEMBERSHIP_PACKAGES'
)
AND constraint_type = 'C'
AND constraint_name NOT LIKE 'SYS_%';

PROMPT;
PROMPT ============================================================================

-- Check 5: Verify seed data
PROMPT [CHECK 5] Verifying seed data...
PROMPT;

PROMPT Row Counts:
SELECT 'PT_SESSIONS' as table_name, COUNT(*) as row_count,
       CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END as status
FROM pt_sessions
UNION ALL
SELECT 'STAFF_PERFORMANCE', COUNT(*),
       CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END
FROM staff_performance
UNION ALL
SELECT 'STAFF_SHIFTS', COUNT(*),
       CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END
FROM staff_shifts
UNION ALL
SELECT 'GYM_SETTINGS', COUNT(*),
       CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END
FROM gym_settings
UNION ALL
SELECT 'MEMBERSHIP_PACKAGES', COUNT(*),
       CASE WHEN COUNT(*) >= 5 THEN '✓' ELSE '✗' END
FROM membership_packages
UNION ALL
SELECT 'BLACKOUT_DAYS', COUNT(*),
       CASE WHEN COUNT(*) > 0 THEN '✓' ELSE '✗' END
FROM blackout_days;

PROMPT;
PROMPT ============================================================================

-- Check 6: Verify data integrity
PROMPT [CHECK 6] Verifying data integrity...
PROMPT;

PROMPT Checking PT Sessions reference valid users:
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: All PT sessions reference valid users'
        ELSE '✗ FAIL: Found ' || COUNT(*) || ' sessions with invalid user references'
    END as result
FROM pt_sessions ps
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = ps.trainer_id)
   OR NOT EXISTS (SELECT 1 FROM users WHERE user_id = ps.member_id);

PROMPT;
PROMPT Checking Staff Performance references valid users:
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: All performance records reference valid users'
        ELSE '✗ FAIL: Found ' || COUNT(*) || ' records with invalid user references'
    END as result
FROM staff_performance sp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = sp.staff_id);

PROMPT;
PROMPT Checking Staff Shifts reference valid users:
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: All shifts reference valid users'
        ELSE '✗ FAIL: Found ' || COUNT(*) || ' shifts with invalid user references'
    END as result
FROM staff_shifts ss
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = ss.staff_id);

PROMPT;
PROMPT ============================================================================

-- Check 7: Sample data queries
PROMPT [CHECK 7] Sample data verification...
PROMPT;

PROMPT Sample PT Sessions:
SELECT 
    ps.session_id,
    u1.full_name as trainer,
    u2.full_name as member,
    TO_CHAR(ps.session_date, 'YYYY-MM-DD HH24:MI') as session_time,
    ps.duration_minutes,
    ps.status
FROM pt_sessions ps
JOIN users u1 ON ps.trainer_id = u1.user_id
JOIN users u2 ON ps.member_id = u2.user_id
WHERE ROWNUM <= 5
ORDER BY ps.session_date DESC;

PROMPT;
PROMPT Sample Membership Packages:
SELECT 
    package_name,
    price,
    duration_days,
    included_pt_sessions,
    CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END as status
FROM membership_packages
WHERE ROWNUM <= 5
ORDER BY price;

PROMPT;
PROMPT Sample Gym Settings:
SELECT 
    setting_key,
    SUBSTR(setting_value, 1, 50) as setting_value,
    setting_type
FROM gym_settings
WHERE ROWNUM <= 5
ORDER BY setting_type, setting_key;

PROMPT;
PROMPT ============================================================================

-- Final Summary
PROMPT [SUMMARY] Migration Verification Complete
PROMPT;
PROMPT If all checks show ✓ PASS, the migration was successful!
PROMPT If any checks show ✗ FAIL, review the error details above.
PROMPT;
PROMPT ============================================================================
