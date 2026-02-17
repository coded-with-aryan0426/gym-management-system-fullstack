-- Member Data Seeding Script
-- This script seeds realistic data for Member Profiles (Alice Smith and Bob Jones)
-- to validate Booking, Schedule, and Notification pages.

-- ============================================
-- STEP 1: Seed Gym Classes (The Schedule)
-- ============================================
-- Yoga Flow - Tomorrow Morning
INSERT INTO gym_classes (class_name, class_type, description, trainer_id, start_time, duration_minutes, max_capacity, current_bookings, difficulty, location, status, recurring, created_at, updated_at)
SELECT 'Morning Yoga Flow', 'YOGA', 'A gentle morning flow to start your day with mindfulness and flexibility.', 
       (SELECT user_id FROM users WHERE username = 'mike.tyson'), 
       TRUNC(SYSDATE) + 1 + INTERVAL '8' HOUR, 60, 20, 0, 'Beginner', 'Studio A', 'SCHEDULED', 1, SYSTIMESTAMP, SYSTIMESTAMP
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM gym_classes WHERE class_name = 'Morning Yoga Flow' AND start_time = TRUNC(SYSDATE) + 1 + INTERVAL '8' HOUR);

-- HIIT Intensity - Today Evening
INSERT INTO gym_classes (class_name, class_type, description, trainer_id, start_time, duration_minutes, max_capacity, current_bookings, difficulty, location, status, recurring, created_at, updated_at)
SELECT 'Evening HIIT Blast', 'HIIT', 'High-intensity interval training to torch calories and build endurance.', 
       (SELECT user_id FROM users WHERE username = 'sarah.connor'), 
       TRUNC(SYSDATE) + INTERVAL '18' HOUR, 45, 15, 0, 'Advanced', 'Main Gym Floor', 'SCHEDULED', 1, SYSTIMESTAMP, SYSTIMESTAMP
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM gym_classes WHERE class_name = 'Evening HIIT Blast' AND start_time = TRUNC(SYSDATE) + INTERVAL '18' HOUR);

-- Pilates Core - Day After Tomorrow
INSERT INTO gym_classes (class_name, class_type, description, trainer_id, start_time, duration_minutes, max_capacity, current_bookings, difficulty, location, status, recurring, created_at, updated_at)
SELECT 'Core Pilates', 'PILATES', 'Focus on core strength, posture, and muscle balance.', 
       (SELECT user_id FROM users WHERE username = 'mike.tyson'), 
       TRUNC(SYSDATE) + 2 + INTERVAL '10' HOUR, 50, 12, 0, 'Intermediate', 'Studio B', 'SCHEDULED', 1, SYSTIMESTAMP, SYSTIMESTAMP
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM gym_classes WHERE class_name = 'Core Pilates');

-- CrossFit WOD - Today Morning (Past)
INSERT INTO gym_classes (class_name, class_type, description, trainer_id, start_time, duration_minutes, max_capacity, current_bookings, difficulty, location, status, recurring, created_at, updated_at)
SELECT 'CrossFit WOD', 'CROSSFIT', 'Workout of the Day. Prepare for the unknown and unknowable.', 
       (SELECT user_id FROM users WHERE username = 'sarah.connor'), 
       TRUNC(SYSDATE) + INTERVAL '7' HOUR, 60, 10, 8, 'Advanced', 'CrossFit Box', 'COMPLETED', 0, SYSTIMESTAMP, SYSTIMESTAMP
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM gym_classes WHERE class_name = 'CrossFit WOD');

-- ============================================
-- STEP 2: Seed Class Bookings
-- ============================================
-- Alice (ID 5) books Yoga and HIIT
INSERT INTO class_bookings (gym_class_id, user_id, status, booked_at, attended, notes)
SELECT class_id, 5, 'CONFIRMED', SYSTIMESTAMP - INTERVAL '1' DAY, 0, 'Looking forward to it!'
FROM gym_classes 
WHERE class_name IN ('Morning Yoga Flow', 'Evening HIIT Blast')
AND NOT EXISTS (SELECT 1 FROM class_bookings cb WHERE cb.gym_class_id = class_id AND cb.user_id = 5);

-- Bob (ID 6) books HIIT
INSERT INTO class_bookings (gym_class_id, user_id, status, booked_at, attended, notes)
SELECT class_id, 6, 'CONFIRMED', SYSTIMESTAMP - INTERVAL '2' HOUR, 0, 'First time trying HIIT'
FROM gym_classes 
WHERE class_name = 'Evening HIIT Blast'
AND NOT EXISTS (SELECT 1 FROM class_bookings cb WHERE cb.gym_class_id = class_id AND cb.user_id = 6);

-- Update current_bookings count
UPDATE gym_classes gc
SET current_bookings = (SELECT COUNT(*) FROM class_bookings cb WHERE cb.gym_class_id = gc.class_id AND cb.status = 'CONFIRMED');

-- ============================================
-- STEP 3: Seed PT Sessions
-- ============================================
-- Alice with Mike Tyson - Tomorrow
INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, workout_plan, created_at, updated_at)
SELECT (SELECT user_id FROM users WHERE username = 'mike.tyson'), 5, 
       TRUNC(SYSDATE) + 1 + INTERVAL '14' HOUR, 60, 'SCHEDULED', 'Upper body strength focus: Bench press, Pull-ups, Shoulder press.', SYSTIMESTAMP, SYSTIMESTAMP
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pt_sessions WHERE member_id = 5 AND session_date = TRUNC(SYSDATE) + 1 + INTERVAL '14' HOUR);

-- Bob with Sarah Connor - Today (In 2 hours)
INSERT INTO pt_sessions (trainer_id, member_id, session_date, duration_minutes, status, workout_plan, created_at, updated_at)
SELECT (SELECT user_id FROM users WHERE username = 'sarah.connor'), 6, 
       SYSTIMESTAMP + INTERVAL '2' HOUR, 45, 'SCHEDULED', 'Cardio endurance and agility drills.', SYSTIMESTAMP, SYSTIMESTAMP
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pt_sessions WHERE member_id = 6 AND status = 'SCHEDULED');

-- ============================================
-- STEP 4: Seed Notifications
-- ============================================
-- Notifications for Alice
INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_read, created_at)
VALUES (5, 'Welcome to the Gym!', 'Welcome Alice! We are excited to have you on board. Check out our class schedule to get started.', 'WELCOME', 'normal', 1, SYSTIMESTAMP - INTERVAL '5' DAY);

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_read, created_at)
VALUES (5, 'Booking Confirmed', 'Your booking for Morning Yoga Flow has been confirmed for tomorrow at 8:00 AM.', 'BOOKING', 'high', 0, SYSTIMESTAMP - INTERVAL '2' HOUR);

INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_read, created_at)
VALUES (5, 'Class Reminder', 'Don''t forget! You have Evening HIIT Blast today at 6:00 PM.', 'REMINDER', 'high', 0, SYSTIMESTAMP - INTERVAL '1' HOUR);

-- Notifications for Bob
INSERT INTO NOTIFICATIONS (user_id, title, message, type, priority, is_read, created_at)
VALUES (6, 'PT Session Reminder', 'Reminder: Your PT session with Sarah Connor is in 2 hours.', 'REMINDER', 'urgent', 0, SYSTIMESTAMP);

COMMIT;
