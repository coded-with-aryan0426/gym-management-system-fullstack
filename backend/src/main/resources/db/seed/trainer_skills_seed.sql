-- Seed skills for trainers
-- Categories MUST match the frontend: 
-- Weight Loss, Muscle Gain, Strength Training, Cardio & Endurance, Rehabilitation, Yoga / Mobility

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

-- Trainer 3: Focus on Yoga and Rehab
UPDATE trainer_details
SET skills_json = '[{"name": "Vinyasa Flow", "category": "Yoga / Mobility", "level": "Expert", "isPrimary": true}, {"name": "Injury Rehab", "category": "Rehabilitation", "level": "Advanced", "isPrimary": false}]',
    specializations = 'Yoga / Mobility, Rehabilitation'
WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER')
AND skills_json IS NULL;

COMMIT;
