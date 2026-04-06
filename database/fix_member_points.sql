-- Add member_user_id column to member_points table
ALTER TABLE member_points ADD (member_user_id NUMBER);

COMMIT;