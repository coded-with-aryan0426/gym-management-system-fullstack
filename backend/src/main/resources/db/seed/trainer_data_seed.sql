-- Trainer Data Seeding Script
-- Run this in SQL*Plus or Oracle SQL Developer connected to the gym database
-- This will seed data for ALL trainers in the system

-- ============================================
-- STEP 1: Find trainer IDs (run this first to verify)
-- ============================================
-- SELECT user_id, full_name, email FROM users WHERE user_id IN 
--   (SELECT DISTINCT ur.user_id FROM user_roles ur 
--    JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');

-- ============================================
-- NOTIFICATIONS for all trainers
-- ============================================
-- Insert notifications for each trainer (replace TRAINER_ID with actual ID)
-- You can run: SELECT user_id FROM users WHERE full_name LIKE '%Darshan%'; to find the ID

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_starred, is_archived, is_read, created_at)
SELECT u.user_id, 
       'New Session Booked',
       'A member has booked a PT session for tomorrow at 10:00 AM',
       'BOOKING', 'high', 0, 0, 0, SYSTIMESTAMP - INTERVAL '2' HOUR
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM NOTIFICATIONS n WHERE n.user_id = u.user_id AND n.title = 'New Session Booked');

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_starred, is_archived, is_read, created_at)
SELECT u.user_id, 
       'Session Reminder',
       'You have 3 sessions scheduled for today. Check your schedule.',
       'SCHEDULE', 'normal', 0, 0, 0, SYSTIMESTAMP - INTERVAL '5' HOUR
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM NOTIFICATIONS n WHERE n.user_id = u.user_id AND n.title = 'Session Reminder');

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_starred, is_archived, is_read, created_at)
SELECT u.user_id, 
       'Achievement Unlocked! 🏆',
       'Congratulations! You have completed 50+ sessions. Keep up the great work!',
       'ACHIEVEMENT', 'normal', 1, 0, 0, SYSTIMESTAMP - INTERVAL '2' DAY
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM NOTIFICATIONS n WHERE n.user_id = u.user_id AND n.title LIKE 'Achievement%');

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_starred, is_archived, is_read, created_at)
SELECT u.user_id, 
       'New 5-Star Review ⭐',
       'A member left a 5-star review: "Amazing trainer! Highly recommended."',
       'REVIEW', 'normal', 0, 0, 1, SYSTIMESTAMP - INTERVAL '3' DAY
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM NOTIFICATIONS n WHERE n.user_id = u.user_id AND n.title LIKE '%5-Star%');

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_starred, is_archived, is_read, created_at)
SELECT u.user_id, 
       'Payment Processed 💰',
       'Your earnings of $1,850 for this period have been processed.',
       'PAYMENT', 'normal', 0, 0, 1, SYSTIMESTAMP - INTERVAL '5' DAY
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM NOTIFICATIONS n WHERE n.user_id = u.user_id AND n.title LIKE '%Payment%');

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_starred, is_archived, is_read, created_at)
SELECT u.user_id, 
       'New Member Assigned',
       'A new member has been assigned to you. Check your members list for details.',
       'MEMBER', 'high', 0, 0, 0, SYSTIMESTAMP - INTERVAL '1' DAY
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM NOTIFICATIONS n WHERE n.user_id = u.user_id AND n.title = 'New Member Assigned');

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_starred, is_archived, is_read, created_at)
SELECT u.user_id, 
       'Weekly Report Available',
       'Your weekly performance report is now available. View your stats.',
       'REPORT', 'low', 0, 0, 0, SYSTIMESTAMP - INTERVAL '4' DAY
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM NOTIFICATIONS n WHERE n.user_id = u.user_id AND n.title LIKE '%Weekly Report%');

-- ============================================
-- TRAINER CLASSES
-- ============================================
-- Morning HIIT - Today
INSERT INTO trainer_classes (trainer_id, title, class_date, start_time, end_time, duration, room, capacity, enrolled, class_type, status, is_recurring, notes)
SELECT u.user_id, 'Morning HIIT Blast', TRUNC(SYSDATE), 
       TO_TIMESTAMP('07:00:00', 'HH24:MI:SS'), TO_TIMESTAMP('08:00:00', 'HH24:MI:SS'),
       60, 'Studio A', 20, 15, 'GROUP', 'UPCOMING', 1, 'High-intensity interval training for all levels'
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM trainer_classes tc WHERE tc.trainer_id = u.user_id AND tc.title = 'Morning HIIT Blast' AND tc.class_date = TRUNC(SYSDATE));

-- Strength & Conditioning - Tomorrow
INSERT INTO trainer_classes (trainer_id, title, class_date, start_time, end_time, duration, room, capacity, enrolled, class_type, status, is_recurring, notes)
SELECT u.user_id, 'Strength & Conditioning', TRUNC(SYSDATE) + 1, 
       TO_TIMESTAMP('18:00:00', 'HH24:MI:SS'), TO_TIMESTAMP('19:00:00', 'HH24:MI:SS'),
       60, 'Weight Room', 15, 12, 'GROUP', 'UPCOMING', 1, 'Build strength and muscle endurance'
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM trainer_classes tc WHERE tc.trainer_id = u.user_id AND tc.title = 'Strength & Conditioning' AND tc.class_date = TRUNC(SYSDATE) + 1);

-- Power Yoga Flow - Day after tomorrow
INSERT INTO trainer_classes (trainer_id, title, class_date, start_time, end_time, duration, room, capacity, enrolled, class_type, status, is_recurring, notes)
SELECT u.user_id, 'Power Yoga Flow', TRUNC(SYSDATE) + 2, 
       TO_TIMESTAMP('12:00:00', 'HH24:MI:SS'), TO_TIMESTAMP('13:00:00', 'HH24:MI:SS'),
       60, 'Yoga Studio', 25, 18, 'GROUP', 'UPCOMING', 1, 'Dynamic yoga for flexibility and balance'
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM trainer_classes tc WHERE tc.trainer_id = u.user_id AND tc.title = 'Power Yoga Flow');

-- CrossFit WOD - In 3 days
INSERT INTO trainer_classes (trainer_id, title, class_date, start_time, end_time, duration, room, capacity, enrolled, class_type, status, is_recurring, notes)
SELECT u.user_id, 'CrossFit WOD', TRUNC(SYSDATE) + 3, 
       TO_TIMESTAMP('17:30:00', 'HH24:MI:SS'), TO_TIMESTAMP('18:30:00', 'HH24:MI:SS'),
       60, 'CrossFit Box', 12, 9, 'GROUP', 'UPCOMING', 1, 'Workout of the Day - high intensity'
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM trainer_classes tc WHERE tc.trainer_id = u.user_id AND tc.title = 'CrossFit WOD');

-- Completed class - Yesterday
INSERT INTO trainer_classes (trainer_id, title, class_date, start_time, end_time, duration, room, capacity, enrolled, class_type, status, is_recurring, notes)
SELECT u.user_id, 'Friday Burn Circuit', TRUNC(SYSDATE) - 1, 
       TO_TIMESTAMP('18:30:00', 'HH24:MI:SS'), TO_TIMESTAMP('19:30:00', 'HH24:MI:SS'),
       60, 'Studio B', 20, 17, 'GROUP', 'COMPLETED', 1, 'High-energy circuit training'
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM trainer_classes tc WHERE tc.trainer_id = u.user_id AND tc.title = 'Friday Burn Circuit');

-- Weekend Bootcamp - Last Saturday
INSERT INTO trainer_classes (trainer_id, title, class_date, start_time, end_time, duration, room, capacity, enrolled, class_type, status, is_recurring, notes)
SELECT u.user_id, 'Weekend Bootcamp', TRUNC(SYSDATE) - 2, 
       TO_TIMESTAMP('09:00:00', 'HH24:MI:SS'), TO_TIMESTAMP('10:00:00', 'HH24:MI:SS'),
       60, 'Outdoor Area', 30, 25, 'GROUP', 'COMPLETED', 1, 'Outdoor full-body bootcamp'
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM trainer_classes tc WHERE tc.trainer_id = u.user_id AND tc.title = 'Weekend Bootcamp');

-- ============================================
-- PROGRESS NOTES (for trainers and their assigned members)
-- ============================================
-- First, let's insert notes for trainers with any member they work with
INSERT INTO PROGRESS_NOTES (trainer_id, member_id, note, created_at, session_date, session_time, session_type, category, mood, highlights_json, goals_json, is_private)
SELECT 
    t.user_id,
    (SELECT user_id FROM users WHERE user_id != t.user_id AND ROWNUM = 1),
    'Great progress on compound lifts today. Deadlift form has improved significantly. Increased weight on bench press by 5lbs. Member showed excellent dedication.',
    SYSTIMESTAMP - INTERVAL '1' DAY,
    TRUNC(SYSDATE) - 1,
    TO_TIMESTAMP('10:00:00', 'HH24:MI:SS'),
    'PT Session',
    'Strength',
    'motivated',
    '["Improved deadlift form", "Increased bench press weight", "Great attitude"]',
    '[{"title":"Increase bench press","progress":75},{"title":"Master deadlift form","progress":90}]',
    0
FROM users t
JOIN user_roles ur ON t.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM PROGRESS_NOTES pn WHERE pn.trainer_id = t.user_id AND pn.category = 'Strength' AND pn.session_date = TRUNC(SYSDATE) - 1);

INSERT INTO PROGRESS_NOTES (trainer_id, member_id, note, created_at, session_date, session_time, session_type, category, mood, highlights_json, goals_json, is_private)
SELECT 
    t.user_id,
    (SELECT user_id FROM users WHERE user_id != t.user_id AND ROWNUM = 1),
    'Completed 30-minute HIIT circuit with minimal rest. Heart rate recovery improved from last week. Endurance is building nicely. Ready to increase intensity next session.',
    SYSTIMESTAMP - INTERVAL '3' DAY,
    TRUNC(SYSDATE) - 3,
    TO_TIMESTAMP('07:00:00', 'HH24:MI:SS'),
    'Group Class',
    'Cardio',
    'energetic',
    '["Improved heart rate recovery", "Completed all intervals", "No breaks needed"]',
    '[{"title":"Run 5K under 25min","progress":65}]',
    0
FROM users t
JOIN user_roles ur ON t.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM PROGRESS_NOTES pn WHERE pn.trainer_id = t.user_id AND pn.category = 'Cardio');

INSERT INTO PROGRESS_NOTES (trainer_id, member_id, note, created_at, session_date, session_time, session_type, category, mood, highlights_json, goals_json, is_private)
SELECT 
    t.user_id,
    (SELECT user_id FROM users WHERE user_id != t.user_id AND ROWNUM = 1),
    'Focused on hip mobility and hamstring flexibility. Notable improvement in forward fold. Recommended daily stretching routine for home. Check back in 2 weeks.',
    SYSTIMESTAMP - INTERVAL '5' DAY,
    TRUNC(SYSDATE) - 5,
    TO_TIMESTAMP('12:00:00', 'HH24:MI:SS'),
    'Assessment',
    'Flexibility',
    'focused',
    '["Improved forward fold", "Better hip mobility", "Good stretching form"]',
    '[{"title":"Touch toes","progress":80},{"title":"Full splits","progress":30}]',
    0
FROM users t
JOIN user_roles ur ON t.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM PROGRESS_NOTES pn WHERE pn.trainer_id = t.user_id AND pn.category = 'Flexibility');

INSERT INTO PROGRESS_NOTES (trainer_id, member_id, note, created_at, session_date, session_time, session_type, category, mood, highlights_json, goals_json, is_private)
SELECT 
    t.user_id,
    (SELECT user_id FROM users WHERE user_id != t.user_id AND ROWNUM = 1),
    'High-intensity interval training - 8 rounds completed successfully. Member pushed through fatigue. Good mental toughness shown today. Recovery between sets is improving.',
    SYSTIMESTAMP - INTERVAL '7' DAY,
    TRUNC(SYSDATE) - 7,
    TO_TIMESTAMP('18:00:00', 'HH24:MI:SS'),
    'PT Session',
    'HIIT',
    'challenging',
    '["Completed all 8 rounds", "Improved recovery time", "Mental breakthrough"]',
    '[{"title":"Complete 10 rounds","progress":80}]',
    0
FROM users t
JOIN user_roles ur ON t.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'TRAINER'
AND NOT EXISTS (SELECT 1 FROM PROGRESS_NOTES pn WHERE pn.trainer_id = t.user_id AND pn.category = 'HIIT');

COMMIT;

-- Verify the data was inserted
SELECT 'Notifications: ' || COUNT(*) FROM NOTIFICATIONS WHERE user_id IN (SELECT user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');
SELECT 'Classes: ' || COUNT(*) FROM trainer_classes WHERE trainer_id IN (SELECT user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');
SELECT 'Progress Notes: ' || COUNT(*) FROM PROGRESS_NOTES WHERE trainer_id IN (SELECT user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');
