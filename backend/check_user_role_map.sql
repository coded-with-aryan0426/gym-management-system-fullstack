SET PAGESIZE 0 LINESIZE 200 FEEDBACK OFF
SELECT column_name FROM user_tab_columns WHERE table_name = 'USER_ROLE_MAP' ORDER BY column_id;
SELECT column_name FROM user_tab_columns WHERE table_name = 'ROLES' ORDER BY column_id;
SELECT role_id, role_name FROM roles;
EXIT;