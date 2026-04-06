SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;

    PROCEDURE add_col(p_table VARCHAR2, p_col VARCHAR2, p_type VARCHAR2 := 'VARCHAR2(255)') IS
    BEGIN
        SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
        IF v_count = 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' ADD (' || p_col || ' ' || p_type || ')';
            DBMS_OUTPUT.PUT_LINE('ADDED: ' || p_table || '.' || p_col || ' (' || p_type || ')');
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
    DBMS_OUTPUT.PUT_LINE('=== PT_SESSIONS ===');
    add_col('pt_sessions', 'status', 'VARCHAR2(20)');
    add_col('pt_sessions', 'progress_notes', 'CLOB');
    add_col('pt_sessions', 'workout_plan', 'CLOB');
    add_col('pt_sessions', 'diet_plan', 'CLOB');
    add_col('pt_sessions', 'is_recurring', 'NUMBER(1)');
    add_col('pt_sessions', 'recurring_frequency', 'VARCHAR2(20)');
    add_col('pt_sessions', 'updated_at', 'TIMESTAMP');
    make_nullable('pt_sessions', 'member_id');
    make_nullable('pt_sessions', 'trainer_id');

    DBMS_OUTPUT.PUT_LINE('=== MEMBERSHIP_PLANS ===');
    add_col('membership_plans', 'updated_at', 'TIMESTAMP');
    add_col('membership_plans', 'plan_color', 'VARCHAR2(20)');
    add_col('membership_plans', 'icon_name', 'VARCHAR2(50)');
    add_col('membership_plans', 'sort_order', 'NUMBER(4)');
    add_col('membership_plans', 'is_recommended', 'NUMBER(1)');

    DBMS_OUTPUT.PUT_LINE('=== AUDIT_LOGS ===');
    add_col('audit_logs', 'action', 'VARCHAR2(100)');
    add_col('audit_logs', 'entity_type', 'VARCHAR2(100)');
    add_col('audit_logs', 'entity_id', 'NUMBER');
    add_col('audit_logs', 'user_id', 'NUMBER');
    add_col('audit_logs', 'changes', 'CLOB');

    DBMS_OUTPUT.PUT_LINE('=== USER_SESSIONS ===');
    add_col('user_sessions', 'is_active', 'NUMBER(1)');
    add_col('user_sessions', 'last_active_at', 'TIMESTAMP');
    add_col('user_sessions', 'expires_at', 'TIMESTAMP');
    add_col('user_sessions', 'status', 'VARCHAR2(20)');

    DBMS_OUTPUT.PUT_LINE('=== EQUIPMENT ===');
    add_col('equipment', 'updated_at', 'TIMESTAMP');
    add_col('equipment', 'is_deleted', 'NUMBER(1)');

    DBMS_OUTPUT.PUT_LINE('=== ROLES ===');
    add_col('roles', 'description', 'VARCHAR2(500)');
    add_col('roles', 'is_active', 'NUMBER(1)');

    DBMS_OUTPUT.PUT_LINE('=== MEMBER_GOALS ===');
    add_col('member_goals', 'is_active', 'NUMBER(1)');
    add_col('member_goals', 'target_value', 'NUMBER');
    add_col('member_goals', 'current_value', 'NUMBER');
    add_col('member_goals', 'start_value', 'NUMBER');
    add_col('member_goals', 'goal_type', 'VARCHAR2(50)');

    DBMS_OUTPUT.PUT_LINE('=== MEMBERS ===');
    add_col('members', 'updated_at', 'TIMESTAMP');
    add_col('members', 'is_deleted', 'NUMBER(1)');

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Done.');
END;
/
EXIT;