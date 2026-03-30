-- =========================================
-- V103__ensure_owner_account_has_owner_role.sql
-- Ensure owner account has OWNER role assigned
-- =========================================

-- This migration ensures that users with 'owner' username have the OWNER role assigned
-- Required for @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')") to work on OwnerDashboardController

-- Assign OWNER role to 'owner' user if not already assigned
INSERT INTO user_role_map (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE LOWER(u.username) = 'owner'
  AND r.role_name = 'OWNER'
  AND NOT EXISTS (
    SELECT 1 FROM user_role_map urm
    WHERE urm.user_id = u.user_id
      AND urm.role_id = r.role_id
  );

-- Assign OWNER role to 'admin' user if not already assigned
INSERT INTO user_role_map (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE LOWER(u.username) = 'admin'
  AND r.role_name = 'OWNER'
  AND NOT EXISTS (
    SELECT 1 FROM user_role_map urm
    WHERE urm.user_id = u.user_id
      AND urm.role_id = r.role_id
  );
