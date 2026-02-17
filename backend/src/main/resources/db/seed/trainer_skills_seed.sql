-- Seed skills for trainers
-- Categories MUST match the frontend: 
-- Weight Loss, Muscle Gain, Strength Training, Cardio & Endurance, Rehabilitation, Yoga / Mobility

-- Reset any "General" categories to ensure consistency
UPDATE trainer_details
SET skills_json = REPLACE(skills_json, '"category": "General"', '"category": "Weight Loss"')
WHERE skills_json LIKE '%"category": "General"%';

-- Trainer 1: Focus on Weight Loss and Cardio
UPDATE trainer_details
SET skills_json = '[{"name": "Fat Loss", "category": "Weight Loss", "level": "Expert", "isPrimary": true}, {"name": "HIIT", "category": "Cardio & Endurance", "level": "Advanced", "isPrimary": false}]',
    specializations = 'Weight Loss, Cardio & Endurance'
WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER')
AND user_id = (SELECT MIN(user_id) FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');

-- Trainer 2: Focus on Muscle Gain and Strength
UPDATE trainer_details
SET skills_json = '[{"name": "Bodybuilding", "category": "Muscle Gain", "level": "Expert", "isPrimary": true}, {"name": "Powerlifting", "category": "Strength Training", "level": "Advanced", "isPrimary": true}]',
    specializations = 'Muscle Gain, Strength Training'
WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER')
AND user_id = (SELECT MAX(user_id) FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');

-- Update any trainers with missing skills or specializations
UPDATE trainer_details
SET skills_json = '[{"name": "Functional Training", "category": "Strength Training", "level": "Expert", "isPrimary": true}, {"name": "Recovery", "category": "Rehabilitation", "level": "Advanced", "isPrimary": false}]',
    specializations = 'Strength Training, Rehabilitation'
WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER')
AND (skills_json IS NULL OR specializations IS NULL OR specializations = 'General');

-- Add specific expertise for a mid-range trainer ID if exists
UPDATE trainer_details
SET skills_json = '[{"name": "Yoga Flow", "category": "Yoga / Mobility", "level": "Expert", "isPrimary": true}, {"name": "Weight Management", "category": "Weight Loss", "level": "Advanced", "isPrimary": false}]',
    specializations = 'Yoga / Mobility, Weight Loss'
WHERE user_id = (SELECT ROUND(AVG(user_id)) FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');

COMMIT;
