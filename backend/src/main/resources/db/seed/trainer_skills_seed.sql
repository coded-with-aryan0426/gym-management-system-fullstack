-- Seed skills for trainers
UPDATE trainer_details
SET skills_json = '[{"name": "Fat Loss", "category": "Weight Loss", "level": "Expert", "isPrimary": true}, {"name": "HIIT", "category": "Cardio & Endurance", "level": "Advanced", "isPrimary": false}]'
WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER')
AND user_id = (SELECT MIN(user_id) FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');

UPDATE trainer_details
SET skills_json = '[{"name": "Bodybuilding", "category": "Muscle Gain", "level": "Expert", "isPrimary": true}, {"name": "Powerlifting", "category": "Strength Training", "level": "Advanced", "isPrimary": true}]'
WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER')
AND user_id = (SELECT MAX(user_id) FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER');

-- For any other trainers, give them a mix
UPDATE trainer_details
SET skills_json = '[{"name": "Vinyasa Flow", "category": "Yoga / Mobility", "level": "Expert", "isPrimary": true}, {"name": "Injury Rehab", "category": "Rehabilitation", "level": "Advanced", "isPrimary": false}]'
WHERE user_id IN (SELECT ur.user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE r.role_name = 'TRAINER')
AND skills_json IS NULL;

COMMIT;
