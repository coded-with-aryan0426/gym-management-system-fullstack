SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
BEGIN
    FOR rec IN (
        SELECT column_name FROM user_tab_columns
        WHERE table_name = 'PT_SESSIONS'
          AND column_name NOT IN ('SESSION_ID')
          AND column_name NOT IN (
              SELECT column_name FROM user_tab_columns
              WHERE table_name = 'PT_SESSIONS' AND nullable = 'Y'
          )
    ) LOOP
        EXECUTE IMMEDIATE 'ALTER TABLE pt_sessions MODIFY (' || rec.column_name || ' NULL)';
        DBMS_OUTPUT.PUT_LINE('Made nullable: PT_SESSIONS.' || rec.column_name);
    END LOOP;
    COMMIT;
END;
/
SELECT column_name, nullable FROM user_tab_columns WHERE table_name = 'PT_SESSIONS' ORDER BY column_id;
EXIT;