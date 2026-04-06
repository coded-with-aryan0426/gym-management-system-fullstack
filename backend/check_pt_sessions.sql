SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
BEGIN
    FOR rec IN (
        SELECT column_name FROM user_tab_columns WHERE table_name = 'PT_SESSIONS'
    ) LOOP
        DBMS_OUTPUT.PUT_LINE('DB has: ' || rec.column_name);
    END LOOP;
    COMMIT;
END;
/
SELECT column_name FROM user_tab_columns WHERE table_name = 'PT_SESSIONS' ORDER BY column_id;
EXIT;