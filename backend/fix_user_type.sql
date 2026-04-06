SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
    v_type USER_TAB_COLUMNS.DATA_TYPE%TYPE;

    PROCEDURE check_and_fix(p_col VARCHAR2, p_type VARCHAR2 := 'VARCHAR2') IS
    BEGIN
        SELECT COUNT(*), MAX(nullable), MAX(data_type)
        INTO v_count, v_nullable, v_type
        FROM user_tab_columns
        WHERE table_name = 'USERS' AND column_name = UPPER(p_col);

        IF v_count = 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE users ADD (' || p_col || ' ' || p_type || ')';
            DBMS_OUTPUT.PUT_LINE('Added: USERS.' || p_col);
        ELSIF v_nullable = 'N' THEN
            EXECUTE IMMEDIATE 'ALTER TABLE users MODIFY (' || p_col || ' NULL)';
            DBMS_OUTPUT.PUT_LINE('Made nullable: USERS.' || p_col);
        ELSE
            DBMS_OUTPUT.PUT_LINE('OK: USERS.' || p_col || ' (type=' || v_type || ', nullable=Y)');
        END IF;
    EXCEPTION WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error on ' || p_col || ': ' || SQLERRM);
    END;
BEGIN
    check_and_fix('USER_TYPE', 'VARCHAR2(50)');
    check_and_fix('FIRST_NAME', 'VARCHAR2(100)');
    check_and_fix('LAST_NAME', 'VARCHAR2(100)');
    COMMIT;
END;
/
EXIT;