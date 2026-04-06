SET SERVEROUTPUT ON FEEDBACK OFF
SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' ORDER BY column_id;
EXIT;