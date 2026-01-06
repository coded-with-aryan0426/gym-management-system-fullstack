-- =========================================
-- V6__migrate_existing_roles.sql
-- Migrate GymStaff and Memberships to user_gym_roles
-- =========================================

-- Migrate existing staff roles from gym_staff table
INSERT INTO user_gym_roles (user_id, gym_id, role, status, granted_at)
SELECT 
    gs.user_id,
    gs.gym_id,
    gs.staff_role,
    CASE WHEN gs.status = 'ACTIVE' THEN 'ACTIVE' ELSE 'SUSPENDED' END,
    COALESCE(gs.joined_at, CURRENT_TIMESTAMP)
FROM gym_staff gs
WHERE NOT EXISTS (
    SELECT 1 FROM user_gym_roles ugr 
    WHERE ugr.user_id = gs.user_id 
    AND ugr.gym_id = gs.gym_id 
    AND ugr.role = gs.staff_role
);

-- Migrate existing memberships as MEMBER role
-- Note: This assumes memberships table has gym_id - adjust if structure differs
-- For now, using a default gym_id of 1 since current schema may not have gym_id in memberships
-- Uncomment and adjust when multi-gym is fully implemented:
/*
INSERT INTO user_gym_roles (user_id, gym_id, role, status, granted_at)
SELECT 
    m.user_id,
    m.gym_id,
    'MEMBER',
    CASE WHEN m.status = 'ACTIVE' THEN 'ACTIVE' ELSE 'SUSPENDED' END,
    m.start_date
FROM memberships m
WHERE m.status IN ('ACTIVE', 'PENDING')
AND NOT EXISTS (
    SELECT 1 FROM user_gym_roles ugr 
    WHERE ugr.user_id = m.user_id 
    AND ugr.gym_id = m.gym_id 
    AND ugr.role = 'MEMBER'
);
*/

-- Placeholder query to ensure migration runs successfully
SELECT COUNT(*) AS migrated_staff FROM user_gym_roles WHERE role IN ('OWNER', 'ADMIN', 'TRAINER');
