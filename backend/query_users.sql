SET PAGESIZE 0 LINESIZE 200 FEEDBACK OFF
SELECT user_id || ' | ' || username || ' | ' || email || ' | pwd_len=' || NVL(TO_CHAR(LENGTH(password)), 'NULL') FROM users ORDER BY user_id;
EXIT;