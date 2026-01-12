-- =====================================================
-- V10__seed_trainer_module_data.sql
-- Seed realistic data for Trainer Module pages
-- Includes: trainers, members, PT sessions, progress notes
-- =====================================================

-- 1. CREATE TRAINER USER (if not exists)
-- Using MERGE for Oracle/H2 compatibility
MERGE INTO users u
USING (SELECT 'john.trainer' AS username FROM DUAL) src
ON (u.username = src.username)
WHEN NOT MATCHED THEN
INSERT (username, password, full_name, email, phone, status, created_at)
VALUES ('john.trainer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/E2vLzL5vy6A8hPxDVK/d6', 
        'John Smith', 'john.trainer@athletix.com', '+91 98765 43210', 'ACTIVE', CURRENT_TIMESTAMP);

-- Get Trainer ID
-- Note: Using a constant ID for simplicity, in production would use sequences
-- Assuming trainer ID will be auto-generated

-- 2. CREATE MEMBER USERS
MERGE INTO users u USING (SELECT 'sarah.wilson' AS username FROM DUAL) src ON (u.username = src.username)
WHEN NOT MATCHED THEN INSERT (username, password, full_name, email, phone, status, created_at)
VALUES ('sarah.wilson', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Sarah Wilson', 'sarah.wilson@gmail.com', '+91 91234 56789', 'ACTIVE', CURRENT_TIMESTAMP);

MERGE INTO users u USING (SELECT 'mike.johnson' AS username FROM DUAL) src ON (u.username = src.username)
WHEN NOT MATCHED THEN INSERT (username, password, full_name, email, phone, status, created_at)
VALUES ('mike.johnson', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Mike Johnson', 'mike.j@gmail.com', '+91 92345 67890', 'ACTIVE', CURRENT_TIMESTAMP);

MERGE INTO users u USING (SELECT 'emma.davis' AS username FROM DUAL) src ON (u.username = src.username)
WHEN NOT MATCHED THEN INSERT (username, password, full_name, email, phone, status, created_at)
VALUES ('emma.davis', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Emma Davis', 'emma.d@gmail.com', '+91 93456 78901', 'ACTIVE', CURRENT_TIMESTAMP);

MERGE INTO users u USING (SELECT 'james.white' AS username FROM DUAL) src ON (u.username = src.username)
WHEN NOT MATCHED THEN INSERT (username, password, full_name, email, phone, status, created_at)
VALUES ('james.white', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'James White', 'james.w@gmail.com', '+91 94567 89012', 'ACTIVE', CURRENT_TIMESTAMP);

MERGE INTO users u USING (SELECT 'lisa.anderson' AS username FROM DUAL) src ON (u.username = src.username)
WHEN NOT MATCHED THEN INSERT (username, password, full_name, email, phone, status, created_at)
VALUES ('lisa.anderson', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'Lisa Anderson', 'lisa.a@gmail.com', '+91 95678 90123', 'ACTIVE', CURRENT_TIMESTAMP);

MERGE INTO users u USING (SELECT 'david.brown' AS username FROM DUAL) src ON (u.username = src.username)
WHEN NOT MATCHED THEN INSERT (username, password, full_name, email, phone, status, created_at)
VALUES ('david.brown', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'David Brown', 'david.b@gmail.com', '+91 96789 01234', 'ACTIVE', CURRENT_TIMESTAMP);

-- 3. MAP TRAINER TO MEMBERS (trainer_customer_map)
-- This establishes the relationship between trainer and their assigned members
INSERT INTO trainer_customer_map (trainer_id, customer_id)
SELECT t.user_id, m.user_id 
FROM users t, users m 
WHERE t.username = 'john.trainer' 
  AND m.username IN ('sarah.wilson', 'mike.johnson', 'emma.davis', 'james.white', 'lisa.anderson', 'david.brown')
  AND NOT EXISTS (
    SELECT 1 FROM trainer_customer_map tcm 
    WHERE tcm.trainer_id = t.user_id AND tcm.customer_id = m.user_id
  );

-- 4. CREATE PT SESSIONS FOR TODAY AND THIS WEEK
-- Today's Completed Session (Morning)
INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP - INTERVAL '3' HOUR, 
       60, 'COMPLETED', 
       'Focused on upper body strength. Good progress on bench press - increased weight by 5kg.',
       0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'sarah.wilson';

-- Today's In-Progress Session (Current)
INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP - INTERVAL '30' MINUTE, 
       60, 'SCHEDULED', 
       'Personal Training - Core Workout',
       0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'emma.davis';

-- Today's Upcoming Sessions
INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP + INTERVAL '2' HOUR, 
       60, 'SCHEDULED', 
       'Cardio and HIIT Training',
       0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'mike.johnson';

INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP + INTERVAL '4' HOUR, 
       45, 'SCHEDULED', 
       'Flexibility and Mobility Session',
       0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'james.white';

-- Tomorrow's Sessions
INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP + INTERVAL '1' DAY, 
       60, 'SCHEDULED', 
       'Lower Body Strength Training',
       1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'lisa.anderson';

INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP + INTERVAL '1' DAY + INTERVAL '3' HOUR, 
       45, 'SCHEDULED', 
       'Weight Loss Focus Session',
       0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'david.brown';

-- Past Week Sessions (for stats)
INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP - INTERVAL '1' DAY, 
       60, 'COMPLETED', 
       'Great cardio session. Heart rate zones were perfect.',
       0, CURRENT_TIMESTAMP - INTERVAL '1' DAY, CURRENT_TIMESTAMP - INTERVAL '1' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'mike.johnson';

INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP - INTERVAL '2' DAY, 
       60, 'COMPLETED', 
       'Core stability improved significantly.',
       0, CURRENT_TIMESTAMP - INTERVAL '2' DAY, CURRENT_TIMESTAMP - INTERVAL '2' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'emma.davis';

INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP - INTERVAL '3' DAY, 
       60, 'COMPLETED', 
       'Hit new PR on deadlift - 120kg!',
       0, CURRENT_TIMESTAMP - INTERVAL '3' DAY, CURRENT_TIMESTAMP - INTERVAL '3' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'sarah.wilson';

INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, progress_notes, is_recurring, created_at, updated_at)
SELECT t.user_id, m.user_id, 
       CURRENT_TIMESTAMP - INTERVAL '4' DAY, 
       45, 'CANCELLED', 
       'Member called in sick',
       0, CURRENT_TIMESTAMP - INTERVAL '4' DAY, CURRENT_TIMESTAMP - INTERVAL '4' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'james.white';

-- 5. CREATE PROGRESS NOTES
INSERT INTO progress_notes (trainer_id, member_id, note, created_at)
SELECT t.user_id, m.user_id, 
       'Excellent progress this week! Sarah has increased her bench press by 5kg and is showing improved form on squats. Continue with current program - ready to advance to Phase 2 next week.',
       CURRENT_TIMESTAMP - INTERVAL '1' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'sarah.wilson';

INSERT INTO progress_notes (trainer_id, member_id, note, created_at)
SELECT t.user_id, m.user_id, 
       'Mike is making steady progress with his weight loss goals. Lost 2kg this week. Cardio endurance has improved - can now complete full HIIT sessions without breaks. Need to focus more on nutrition consistency.',
       CURRENT_TIMESTAMP - INTERVAL '2' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'mike.johnson';

INSERT INTO progress_notes (trainer_id, member_id, note, created_at)
SELECT t.user_id, m.user_id, 
       'Emma showed great energy today! Core stability exercises are paying off. Plank hold time increased from 45s to 90s. Recommended additional yoga sessions for flexibility.',
       CURRENT_TIMESTAMP - INTERVAL '3' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'emma.davis';

INSERT INTO progress_notes (trainer_id, member_id, note, created_at)
SELECT t.user_id, m.user_id, 
       'James is recovering well from his minor back strain. Modified exercises to avoid aggravation. Focusing on mobility and light resistance training. Will reassess next week.',
       CURRENT_TIMESTAMP - INTERVAL '4' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'james.white';

INSERT INTO progress_notes (trainer_id, member_id, note, created_at)
SELECT t.user_id, m.user_id, 
       'Lisa completed her first month of training! Strength has improved across all major lifts. Setting new goals for Month 2: focus on muscle definition and adding 10 minutes cardio per session.',
       CURRENT_TIMESTAMP - INTERVAL '5' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'lisa.anderson';

INSERT INTO progress_notes (trainer_id, member_id, note, created_at)
SELECT t.user_id, m.user_id, 
       'David needs more attention on nutrition. Training consistency is good but results are slower than expected due to diet. Scheduled nutrition consultation for next week.',
       CURRENT_TIMESTAMP - INTERVAL '6' DAY
FROM users t, users m 
WHERE t.username = 'john.trainer' AND m.username = 'david.brown';

COMMIT;
