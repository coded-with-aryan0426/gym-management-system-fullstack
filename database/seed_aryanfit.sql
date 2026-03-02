-- ============================================================
-- HIGH-QUALITY SEED DATA for AryanFit3@gmail.com
-- 6-month realistic fitness journey (90 days of active data)
-- Generated: 2026-03-02
-- ============================================================

-- ========== STEP 1: CLEAN UP ALL EXISTING DATA ==========
DELETE FROM workout_logs    WHERE user_id = (SELECT user_id FROM users WHERE email = 'AryanFit3@gmail.com');
DELETE FROM personal_bests  WHERE user_id = (SELECT user_id FROM users WHERE email = 'AryanFit3@gmail.com');
DELETE FROM member_goals    WHERE user_id = (SELECT user_id FROM users WHERE email = 'AryanFit3@gmail.com');
DELETE FROM progress_metrics WHERE user_id = (SELECT user_id FROM users WHERE email = 'AryanFit3@gmail.com');
DELETE FROM body_measurements WHERE user_id = (SELECT user_id FROM users WHERE email = 'AryanFit3@gmail.com');

-- ========== STEP 2: UPDATE USER PROFILE ==========
UPDATE users SET
    full_name       = 'Aryan Sharma',
    height          = 178.0,
    weight          = 83.2,
    body_fat        = 19.8,
    date_of_birth   = TO_DATE('1998-08-22', 'YYYY-MM-DD'),
    gender          = 'Male',
    fitness_goals   = '["Lean Muscle", "Improve Endurance", "Athletic Performance"]',
    created_at      = SYSTIMESTAMP - INTERVAL '180' DAY
WHERE email = 'AryanFit3@gmail.com';

-- ========== STEP 3: PROGRESS METRICS (26 entries - biweekly + key dates) ==========
-- Starting point: 90 days ago — overweight, high body fat
INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-90, 96.5,28.2,32.0,30.47,104.0,95.0,37.0,58.0,102.0,118.0,'Starting my fitness journey. Feeling motivated!', SYSTIMESTAMP-INTERVAL'90'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-84, 95.8,27.8,32.2,30.24,103.5,94.2,37.2,58.2,101.5,118.5,'First week done. Diet is the hardest part.', SYSTIMESTAMP-INTERVAL'84'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-77, 94.8,27.2,32.5,29.91,103.0,93.0,37.5,58.5,101.0,119.0,'Down 1.7kg! Waist is narrowing.', SYSTIMESTAMP-INTERVAL'77'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-70, 93.5,26.5,32.8,29.50,102.5,91.5,37.8,58.8,100.5,119.5,'3 weeks in. Energy levels improving.', SYSTIMESTAMP-INTERVAL'70'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-63, 92.2,25.8,33.1,29.09,102.0,90.0,38.0,59.0,100.0,120.0,'One month checkpoint! Lost 4.3kg.', SYSTIMESTAMP-INTERVAL'63'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-56, 91.0,25.0,33.4,28.71,101.5,88.5,38.2,59.5,99.5,120.5,'Bench press improving. Added protein shake.', SYSTIMESTAMP-INTERVAL'56'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-49, 90.1,24.3,33.7,28.42,101.0,87.5,38.5,60.0,99.0,121.0,'Slight plateau but measurements improving.', SYSTIMESTAMP-INTERVAL'49'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-42, 89.2,23.5,34.0,28.13,100.5,86.0,38.8,60.5,98.5,121.5,'2 month mark. Visible difference in the mirror.', SYSTIMESTAMP-INTERVAL'42'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-35, 88.5,22.8,34.3,27.91,100.0,84.5,39.0,61.0,98.0,122.0,'Hit new deadlift PR this week!', SYSTIMESTAMP-INTERVAL'35'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-28, 87.8,22.2,34.5,27.69,99.5,83.0,39.3,61.5,97.5,122.5,'Down 8.7kg total. Arms growing!', SYSTIMESTAMP-INTERVAL'28'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-21, 87.0,21.5,34.8,27.44,99.0,82.0,39.5,62.0,97.0,123.0,'3 month mark. Squat feeling strong.', SYSTIMESTAMP-INTERVAL'21'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-17, 86.5,21.0,35.0,27.28,98.5,81.0,39.8,62.5,96.8,123.5,'Sprint intervals added to cardio.', SYSTIMESTAMP-INTERVAL'17'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-14, 85.9,20.5,35.2,27.09,98.0,80.0,40.0,63.0,96.5,124.0,'Metabolism feels faster now.', SYSTIMESTAMP-INTERVAL'14'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-10, 85.3,20.1,35.4,26.90,97.5,79.5,40.2,63.2,96.2,124.2,'Sleep has improved too — 8hrs now.', SYSTIMESTAMP-INTERVAL'10'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-7, 84.8,19.8,35.6,26.75,97.0,79.0,40.5,63.5,96.0,124.5,'Cut sugar completely this week.', SYSTIMESTAMP-INTERVAL'7'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-5, 84.3,19.5,35.8,26.59,96.8,78.5,40.7,63.8,95.8,124.8,'Visible abs starting to show!', SYSTIMESTAMP-INTERVAL'5'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-3, 84.0,19.2,36.0,26.50,96.5,78.0,41.0,64.0,95.5,125.0,'Trainer is happy with progress.', SYSTIMESTAMP-INTERVAL'3'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE)-1, 83.5,19.0,36.2,26.34,96.2,77.5,41.2,64.2,95.2,125.3,'Almost at 90 day target!', SYSTIMESTAMP-INTERVAL'1'DAY FROM users WHERE email='AryanFit3@gmail.com';

INSERT INTO progress_metrics (user_id, record_date, weight, body_fat, muscle_mass, bmi, chest, waist, arms, legs, hips, shoulders, notes, created_at)
SELECT user_id, TRUNC(SYSDATE), 83.2,18.9,36.4,26.24,96.0,77.0,41.5,64.5,95.0,125.5,'90 days! Lost 13.3kg. Body fat down 9.3%.', SYSTIMESTAMP FROM users WHERE email='AryanFit3@gmail.com';

-- ========== STEP 4: WORKOUT LOGS (40 entries - realistic 5 days/week) ==========
-- Week 13 (most recent)
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-1,65,'Upper Body Push',520,7,8,'Incline bench new PR: 90kg x5',SYSTIMESTAMP-INTERVAL'1'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-2,50,'HIIT Cardio',480,6,9,'Sprint intervals 30s on/30s off x15',SYSTIMESTAMP-INTERVAL'2'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-3,75,'Leg Day',580,8,8,'Squat 130kg x5 - new PR!',SYSTIMESTAMP-INTERVAL'3'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-4,60,'Upper Body Pull',490,7,7,'Weighted pull-ups +15kg x8',SYSTIMESTAMP-INTERVAL'4'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-5,45,'Steady State Cardio',310,1,5,'5km run in 24:30',SYSTIMESTAMP-INTERVAL'5'DAY FROM users WHERE email='AryanFit3@gmail.com';
-- Week 12
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-7,70,'Upper Body Push',530,7,8,'Bench Press 100kg x5',SYSTIMESTAMP-INTERVAL'7'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-8,55,'HIIT Cardio',460,6,8,'Bike intervals 20 min, felt great',SYSTIMESTAMP-INTERVAL'8'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-9,80,'Leg Day',600,8,9,'Deadlift 170kg x3 - new PR!',SYSTIMESTAMP-INTERVAL'9'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-10,60,'Upper Body Pull',470,7,7,'Rows and pull-ups focus',SYSTIMESTAMP-INTERVAL'10'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-11,40,'Yoga / Mobility',180,12,3,'Recovery session. Hip flexors much better.',SYSTIMESTAMP-INTERVAL'11'DAY FROM users WHERE email='AryanFit3@gmail.com';
-- Week 11
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-14,65,'Upper Body Push',505,7,7,'Volume day - moderate weight',SYSTIMESTAMP-INTERVAL'14'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-15,50,'HIIT Cardio',445,6,8,'Jump rope 15 min + burpees',SYSTIMESTAMP-INTERVAL'15'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-16,75,'Leg Day',560,8,8,'Front squats + hack squats',SYSTIMESTAMP-INTERVAL'16'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-17,55,'Upper Body Pull',455,6,7,'Cable rows focus',SYSTIMESTAMP-INTERVAL'17'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-18,45,'Steady State Cardio',295,1,5,'4.5km in 23min',SYSTIMESTAMP-INTERVAL'18'DAY FROM users WHERE email='AryanFit3@gmail.com';
-- Week 10
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-21,70,'Upper Body Push',510,7,8,'Shoulder press feeling strong',SYSTIMESTAMP-INTERVAL'21'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-22,60,'Full Body Circuit',540,10,9,'10 exercise circuit x4 rounds',SYSTIMESTAMP-INTERVAL'22'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-23,75,'Leg Day',575,8,8,'Romanian deadlifts + leg press',SYSTIMESTAMP-INTERVAL'23'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-24,55,'Upper Body Pull',450,7,7,'Lat pulldown + face pulls',SYSTIMESTAMP-INTERVAL'24'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-25,40,'Yoga / Mobility',170,10,3,'Rest and stretch day',SYSTIMESTAMP-INTERVAL'25'DAY FROM users WHERE email='AryanFit3@gmail.com';
-- Weeks 7-9 (slightly less intense)
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-28,65,'Upper Body Push',490,7,7,'Deload week — lighter weights',SYSTIMESTAMP-INTERVAL'28'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-30,70,'Leg Day',555,8,7,'Deload squats + lunges',SYSTIMESTAMP-INTERVAL'30'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-32,50,'HIIT Cardio',430,6,8,'Tabata protocol',SYSTIMESTAMP-INTERVAL'32'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-35,80,'Leg Day',590,8,9,'Deadlift 165kg x3',SYSTIMESTAMP-INTERVAL'35'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-37,60,'Upper Body Push',495,7,8,'Push day — flat + incline bench',SYSTIMESTAMP-INTERVAL'37'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-39,55,'Upper Body Pull',460,7,7,'Pull-up + row superset',SYSTIMESTAMP-INTERVAL'39'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-42,65,'Upper Body Push',480,7,7,'2 month mark workout!',SYSTIMESTAMP-INTERVAL'42'DAY FROM users WHERE email='AryanFit3@gmail.com';
-- Weeks 4-6 (building phase)
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-45,60,'Leg Day',530,7,7,'Squat 110kg x5',SYSTIMESTAMP-INTERVAL'45'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-47,45,'Steady State Cardio',280,1,5,'4km jog',SYSTIMESTAMP-INTERVAL'47'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-49,60,'Upper Body Push',470,6,7,'Dumbbell focus day',SYSTIMESTAMP-INTERVAL'49'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-52,55,'HIIT Cardio',410,6,7,'Rowing machine intervals',SYSTIMESTAMP-INTERVAL'52'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-56,65,'Leg Day',520,7,7,'Building leg strength base',SYSTIMESTAMP-INTERVAL'56'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-60,50,'Upper Body Pull',420,6,6,'Lat and row focus',SYSTIMESTAMP-INTERVAL'60'DAY FROM users WHERE email='AryanFit3@gmail.com';
-- Weeks 1-3 (foundation)
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-63,55,'Full Body Circuit',420,8,6,'Full body - getting used to gym',SYSTIMESTAMP-INTERVAL'63'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-65,40,'Steady State Cardio',260,1,4,'Easy cardio to start',SYSTIMESTAMP-INTERVAL'65'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-67,50,'Upper Body Push',390,6,5,'Learning bench press form',SYSTIMESTAMP-INTERVAL'67'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-70,55,'Leg Day',450,6,6,'Squat form work with coach',SYSTIMESTAMP-INTERVAL'70'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-77,45,'Full Body Circuit',370,7,5,'Second full body session',SYSTIMESTAMP-INTERVAL'77'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-84,40,'Full Body Circuit',340,6,5,'First proper workout!',SYSTIMESTAMP-INTERVAL'84'DAY FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO workout_logs (user_id,workout_date,duration_minutes,workout_type,calories_burned,exercises_count,intensity_level,notes,created_at)
SELECT user_id,TRUNC(SYSDATE)-90,30,'Steady State Cardio',220,1,4,'Day 1 - easy start',SYSTIMESTAMP-INTERVAL'90'DAY FROM users WHERE email='AryanFit3@gmail.com';

-- ========== STEP 5: PERSONAL BESTS (12 entries) ==========
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Bench Press',100,5,'kg',TRUNC(SYSDATE)-1,'PUSH' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Incline Bench Press',80,5,'kg',TRUNC(SYSDATE)-3,'PUSH' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Overhead Press',72,4,'kg',TRUNC(SYSDATE)-7,'PUSH' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Squat',130,5,'kg',TRUNC(SYSDATE)-3,'LEGS' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Deadlift',170,3,'kg',TRUNC(SYSDATE)-9,'LEGS' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Romanian Deadlift',120,8,'kg',TRUNC(SYSDATE)-23,'LEGS' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Pull-ups',15,1,'reps',TRUNC(SYSDATE)-4,'PULL' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Barbell Row',90,6,'kg',TRUNC(SYSDATE)-10,'PULL' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Weighted Pull-ups',15,8,'kg',TRUNC(SYSDATE)-4,'PULL' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Dumbbell Curl',22,10,'kg',TRUNC(SYSDATE)-14,'PULL' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'5K Run',0,1,'time:24:15',TRUNC(SYSDATE)-5,'CARDIO' FROM users WHERE email='AryanFit3@gmail.com';
INSERT INTO personal_bests (user_id, exercise, weight_value, reps, unit, record_date, category)
SELECT user_id,'Plank Hold',0,1,'time:3:45',TRUNC(SYSDATE)-2,'CORE' FROM users WHERE email='AryanFit3@gmail.com';

-- ========== STEP 6: MEMBER GOALS (5 goals — mix of active/completed) ==========
-- Goal 1: COMPLETED — Weight loss
INSERT INTO member_goals (user_id,title,goal_type,start_value,current_value,target_value,unit,start_date,target_date,weekly_target,is_active,completed_at,created_at)
SELECT user_id,'Drop Under 90kg','WEIGHT',96.5,83.2,89.9,'kg',TRUNC(SYSDATE)-90,TRUNC(SYSDATE)-45,1.0,0,SYSTIMESTAMP-INTERVAL'44'DAY,SYSTIMESTAMP-INTERVAL'90'DAY FROM users WHERE email='AryanFit3@gmail.com';

-- Goal 2: ACTIVE — Reach 80kg
INSERT INTO member_goals (user_id,title,goal_type,start_value,current_value,target_value,unit,start_date,target_date,weekly_target,is_active,created_at)
SELECT user_id,'Reach 80kg (Lean)','WEIGHT',96.5,83.2,80.0,'kg',TRUNC(SYSDATE)-90,TRUNC(SYSDATE)+45,0.5,1,SYSTIMESTAMP-INTERVAL'90'DAY FROM users WHERE email='AryanFit3@gmail.com';

-- Goal 3: ACTIVE — Reduce body fat to 15%
INSERT INTO member_goals (user_id,title,goal_type,start_value,current_value,target_value,unit,start_date,target_date,weekly_target,is_active,created_at)
SELECT user_id,'Body Fat Under 16%','BODY_FAT',28.2,18.9,15.9,'%',TRUNC(SYSDATE)-90,TRUNC(SYSDATE)+60,0.3,1,SYSTIMESTAMP-INTERVAL'90'DAY FROM users WHERE email='AryanFit3@gmail.com';

-- Goal 4: ACTIVE — 140kg Squat
INSERT INTO member_goals (user_id,title,goal_type,start_value,current_value,target_value,unit,start_date,target_date,weekly_target,is_active,created_at)
SELECT user_id,'Squat 140kg x5','STRENGTH',80.0,130.0,140.0,'kg',TRUNC(SYSDATE)-70,TRUNC(SYSDATE)+30,2.5,1,SYSTIMESTAMP-INTERVAL'70'DAY FROM users WHERE email='AryanFit3@gmail.com';

-- Goal 5: ACTIVE — 5K under 23 mins
INSERT INTO member_goals (user_id,title,goal_type,start_value,current_value,target_value,unit,start_date,target_date,weekly_target,is_active,created_at)
SELECT user_id,'5K Run Under 23 Min','ENDURANCE',29.5,24.5,23.0,'min',TRUNC(SYSDATE)-60,TRUNC(SYSDATE)+60,0.5,1,SYSTIMESTAMP-INTERVAL'60'DAY FROM users WHERE email='AryanFit3@gmail.com';

COMMIT;
