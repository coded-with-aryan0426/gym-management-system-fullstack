SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'USERS' AND column_name = 'PASSWORD_HASH';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE users ADD (password_hash VARCHAR2(255))';
        DBMS_OUTPUT.PUT_LINE('Added USERS.PASSWORD_HASH column');
    ELSE
        DBMS_OUTPUT.PUT_LINE('USERS.PASSWORD_HASH already exists');
    END IF;

    SELECT nullable INTO v_nullable FROM user_tab_columns WHERE table_name = 'USERS' AND column_name = 'PASSWORD_HASH';
    IF v_nullable = 'N' THEN
        EXECUTE IMMEDIATE 'ALTER TABLE users MODIFY (password_hash NULL)';
        DBMS_OUTPUT.PUT_LINE('Made PASSWORD_HASH nullable');
    END IF;

    COMMIT;
END;
/
SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'USERS' AND LOWER(column_name) LIKE '%password%';
EXIT;