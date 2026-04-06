-- Quick fix for equipment duplicates - run this AFTER setup_complete.sql if you see equipment errors

DELETE FROM equipment WHERE equipment_code IN ('EQ001', 'EQ002', 'EQ003');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, serial_number, purchase_date, purchase_amount, location, status, condition_status, is_active)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ001', 'Treadmill Pro 5000', 1, 'Life Fitness', 'LF20240001', TO_DATE('2024-01-15', 'YYYY-MM-DD'), 250000, 'Cardio Zone - Bandra', 'ACTIVE', 'EXCELLENT', 'Y');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, serial_number, purchase_date, purchase_amount, location, status, condition_status, is_active)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ002', 'Elliptical Cross Trainer', 1, 'Precor', 'PC20240002', TO_DATE('2024-02-20', 'YYYY-MM-DD'), 180000, 'Cardio Zone - Bandra', 'ACTIVE', 'GOOD', 'Y');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, serial_number, purchase_date, purchase_amount, location, status, condition_status, is_active)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ003', 'Dumbbell Set 5-50kg', 3, 'York', 'YK2024015', TO_DATE('2024-01-20', 'YYYY-MM-DD'), 85000, 'Free Weights Area - Powai', 'ACTIVE', 'EXCELLENT', 'Y');

COMMIT;