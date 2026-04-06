SET SERVEROUTPUT ON FEEDBACK OFF
SELECT DISTINCT CASE WHEN column_name = UPPER(column_name) THEN column_name ELSE '"' || column_name || '"' END AS column_name
FROM user_tab_columns
WHERE table_name = 'NOTIFICATIONS'
ORDER BY column_id;

SELECT 'TYPE' AS col, COUNT(*) FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND UPPER(column_name) = 'TYPE' GROUP BY 'TYPE'
UNION ALL
SELECT 'NOTIFICATION_TYPE', COUNT(*) FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND UPPER(column_name) = 'NOTIFICATION_TYPE' GROUP BY 'NOTIFICATION_TYPE';
EXIT;