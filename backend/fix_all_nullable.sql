SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
    v_count NUMBER;
    v_col USER_TAB_COLUMNS.COLUMN_NAME%TYPE;
    v_type USER_TAB_COLUMNS.DATA_TYPE%TYPE;

    PROCEDURE make_nullable(p_table VARCHAR2, p_col VARCHAR2) IS
    BEGIN
        SELECT nullable INTO v_nullable FROM user_tab_columns
        WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
        IF v_nullable = 'N' THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' MODIFY (' || p_col || ' NULL)';
            DBMS_OUTPUT.PUT_LINE('Made ' || p_table || '.' || p_col || ' nullable');
        ELSE
            DBMS_OUTPUT.PUT_LINE(p_table || '.' || p_col || ' already nullable');
        END IF;
    EXCEPTION WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Column not found: ' || p_table || '.' || p_col);
    END;
BEGIN
    make_nullable('USERS', 'FIRST_NAME');
    make_nullable('USERS', 'LAST_NAME');
    make_nullable('USERS', 'PHONE');
    make_nullable('USERS', 'EMAIL');
    make_nullable('USERS', 'FULL_NAME');
    make_nullable('USERS', 'USERNAME');
    make_nullable('USERS', 'PASSWORD');
    make_nullable('USERS', 'GENDER');
    make_nullable('USERS', 'DATE_OF_BIRTH');
    make_nullable('USERS', 'ADDRESS');
    make_nullable('USERS', 'EMERGENCY_CONTACT_NAME');
    make_nullable('USERS', 'EMERGENCY_CONTACT_PHONE');
    make_nullable('USERS', 'EMERGENCY_CONTACT_RELATION');
    make_nullable('USERS', 'PASSWORD_CHANGED_AT');
    make_nullable('USERS', 'CREATED_BY');
    make_nullable('USERS', 'UPDATED_BY');
    make_nullable('USERS', 'DATE_OF_BIRTH');
    make_nullable('USERS', 'HEIGHT');
    make_nullable('USERS', 'WEIGHT');
    make_nullable('USERS', 'BODY_FAT');
    make_nullable('USERS', 'BLOOD_TYPE');
    make_nullable('USERS', 'CITY');
    make_nullable('USERS', 'STATE');
    make_nullable('USERS', 'ZIP_CODE');
    make_nullable('USERS', 'AVATAR_ID');
    make_nullable('USERS', 'GOOGLE_ID');
    make_nullable('USERS', 'PHONE_NUMBER');
    make_nullable('USERS', 'AUTH_PROVIDER');
    make_nullable('USERS', 'ACCOUNT_NON_LOCKED');
    make_nullable('USERS', 'IS_FIRST_LOGIN');
    make_nullable('USERS', 'TWO_FACTOR_ENABLED');
    make_nullable('USERS', 'STATUS');
    make_nullable('USERS', 'LEAVING_DATE');
    make_nullable('USERS', 'JOB_TITLE');
    make_nullable('USERS', 'DEPARTMENT');
    make_nullable('USERS', 'SHIFT_TIMING');
    make_nullable('USERS', 'SALARY');
    make_nullable('USERS', 'EMPLOYEE_ID_CODE');
    make_nullable('USERS', 'HEALTH_NOTES');
    make_nullable('USERS', 'FITNESS_GOALS');
    COMMIT;
END;
/
EXIT;