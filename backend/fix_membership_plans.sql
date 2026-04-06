SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
    v_col VARCHAR2(128);

    PROCEDURE fix_col(p_table VARCHAR2, p_col VARCHAR2, p_type VARCHAR2 := 'VARCHAR2', p_nullable CHAR := 'Y') IS
    BEGIN
        SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
        IF v_count = 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' ADD (' || p_col || ' ' || p_type || ')';
            DBMS_OUTPUT.PUT_LINE('Added: ' || p_table || '.' || p_col || ' (' || p_type || ')');
        ELSE
            SELECT nullable INTO v_nullable FROM user_tab_columns WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
            IF v_nullable = 'N' AND p_nullable = 'Y' THEN
                EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' MODIFY (' || p_col || ' NULL)';
                DBMS_OUTPUT.PUT_LINE('Made nullable: ' || p_table || '.' || p_col);
            ELSE
                DBMS_OUTPUT.PUT_LINE('OK: ' || p_table || '.' || p_col || ' (nullable=' || v_nullable || ')');
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('Error on ' || p_table || '.' || p_col || ': ' || SQLERRM);
    END;
BEGIN
    fix_col('membership_plans', 'updated_at', 'TIMESTAMP');
    fix_col('membership_plans', 'plan_color', 'VARCHAR2(20)');
    fix_col('membership_plans', 'icon_name', 'VARCHAR2(50)');
    fix_col('membership_plans', 'sort_order', 'NUMBER(4)');
    fix_col('membership_plans', 'is_recommended', 'NUMBER(1)');
    COMMIT;
END;
/
SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'MEMBERSHIP_PLANS' ORDER BY column_id;
EXIT;