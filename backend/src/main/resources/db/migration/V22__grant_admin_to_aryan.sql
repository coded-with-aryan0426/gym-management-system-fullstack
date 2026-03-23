-- =========================================================================
-- V22__grant_admin_to_aryan.sql
-- Grants OWNER role to Aryan23@gmail.com
-- =========================================================================

DECLARE
   user_id_val NUMBER;
   role_id_val NUMBER;
   role_cnt NUMBER;
   map_cnt NUMBER;
BEGIN
   -- Ensure OWNER role exists
   SELECT COUNT(*) INTO role_cnt FROM roles WHERE role_name = 'OWNER';
   IF role_cnt = 0 THEN
      INSERT INTO roles (role_name) VALUES ('OWNER');
   END IF;
   
   -- Get IDs and map
   BEGIN
      SELECT user_id INTO user_id_val FROM users WHERE UPPER(email) = UPPER('Aryan23@gmail.com') FETCH FIRST 1 ROWS ONLY;
      SELECT role_id INTO role_id_val FROM roles WHERE role_name = 'OWNER' FETCH FIRST 1 ROWS ONLY;
      
      SELECT COUNT(*) INTO map_cnt FROM user_role_map WHERE user_id = user_id_val AND role_id = role_id_val;
      IF map_cnt = 0 THEN
         INSERT INTO user_role_map (user_id, role_id) VALUES (user_id_val, role_id_val);
      END IF;
   EXCEPTION
      WHEN NO_DATA_FOUND THEN
         NULL; -- If user is not found, do nothing
   END;
END;
/
