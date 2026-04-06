SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
BEGIN
    SELECT nullable INTO v_nullable FROM user_tab_columns WHERE table_name = 'USERS' AND column_name = 'GYM_ID';
    IF v_nullable = 'N' THEN
        EXECUTE IMMEDIATE 'ALTER TABLE users MODIFY (gym_id NULL)';
        DBMS_OUTPUT.PUT_LINE('Made USERS.GYM_ID nullable');
    ELSE
        DBMS_OUTPUT.PUT_LINE('USERS.GYM_ID is already nullable');
    END IF;
    COMMIT;
END;
/
SELECT column_name, nullable FROM user_tab_columns WHERE table_name = 'USERS' AND column_name = 'GYM_ID';
EXIT;