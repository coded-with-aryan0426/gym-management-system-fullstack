SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
    PROCEDURE add_col(p_table VARCHAR2, p_col VARCHAR2, p_type VARCHAR2) IS
    BEGIN
        SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
        IF v_count = 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' ADD (' || p_col || ' ' || p_type || ')';
            DBMS_OUTPUT.PUT_LINE('ADDED: ' || p_table || '.' || p_col);
        ELSE
            DBMS_OUTPUT.PUT_LINE('EXISTS: ' || p_table || '.' || p_col);
        END IF;
    EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('ERR: ' || p_table || '.' || p_col || ' - ' || SQLERRM);
    END;
    PROCEDURE make_nullable(p_table VARCHAR2, p_col VARCHAR2) IS
    BEGIN
        SELECT nullable INTO v_nullable FROM user_tab_columns WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
        IF v_nullable = 'N' THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' MODIFY (' || p_col || ' NULL)';
            DBMS_OUTPUT.PUT_LINE('NULLABLE: ' || p_table || '.' || p_col);
        END IF;
    EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('ERR null: ' || p_table || '.' || p_col || ' - ' || SQLERRM);
    END;
BEGIN
    add_col('NOTIFICATIONS', 'TYPE', 'VARCHAR2(50)');
    add_col('NOTIFICATIONS', 'LINK', 'VARCHAR2(255)');
    make_nullable('NOTIFICATIONS', 'GYM_ID');
    make_nullable('NOTIFICATIONS', 'USER_ID');
    make_nullable('NOTIFICATIONS', 'NOTIFICATION_TYPE');
    make_nullable('NOTIFICATIONS', 'TITLE');
    make_nullable('NOTIFICATIONS', 'MESSAGE');
    make_nullable('NOTIFICATIONS', 'TYPE');
    make_nullable('NOTIFICATIONS', 'PRIORITY');
    make_nullable('NOTIFICATIONS', 'CHANNEL');
    make_nullable('NOTIFICATIONS', 'STATUS');
    make_nullable('NOTIFICATIONS', 'SCHEDULED_AT');
    make_nullable('NOTIFICATIONS', 'SENT_AT');
    make_nullable('NOTIFICATIONS', 'DELIVERED_AT');
    make_nullable('NOTIFICATIONS', 'READ_AT');
    make_nullable('NOTIFICATIONS', 'ACTION_URL');
    make_nullable('NOTIFICATIONS', 'METADATA');
    make_nullable('NOTIFICATIONS', 'FAILURE_REASON');
    make_nullable('NOTIFICATIONS', 'RETRY_COUNT');
    make_nullable('NOTIFICATIONS', 'CREATED_AT');
    make_nullable('NOTIFICATIONS', 'UPDATED_AT');
    make_nullable('NOTIFICATIONS', 'UPDATED_BY');
    make_nullable('NOTIFICATIONS', 'IS_ARCHIVED');
    make_nullable('NOTIFICATIONS', 'IS_STARRED');
    make_nullable('NOTIFICATIONS', 'IS_READ');
    make_nullable('NOTIFICATIONS', 'META_DATA');
    make_nullable('NOTIFICATIONS', 'ACTION_DATA');
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Done NOTIFICATIONS.');
END;
/
EXIT;