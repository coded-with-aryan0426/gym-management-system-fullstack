SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
    v_count NUMBER;

    PROCEDURE make_nullable(p_table VARCHAR2, p_col VARCHAR2) IS
    BEGIN
        SELECT nullable INTO v_nullable FROM user_tab_columns WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
        IF v_nullable = 'N' THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' MODIFY (' || p_col || ' NULL)';
            DBMS_OUTPUT.PUT_LINE('NULLABLE: ' || p_table || '.' || p_col);
        ELSE
            DBMS_OUTPUT.PUT_LINE('OK: ' || p_table || '.' || p_col || ' (nullable=Y)');
        END IF;
    EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('ERR: ' || p_table || '.' || p_col || ' - ' || SQLERRM);
    END;

    PROCEDURE add_col_if_missing(p_table VARCHAR2, p_col VARCHAR2, p_type VARCHAR2) IS
    BEGIN
        SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = UPPER(p_table) AND column_name = UPPER(p_col);
        IF v_count = 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' ADD (' || p_col || ' ' || p_type || ')';
            DBMS_OUTPUT.PUT_LINE('ADDED: ' || p_table || '.' || p_col);
        END IF;
    EXCEPTION WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('ERR: ' || p_table || '.' || p_col || ' - ' || SQLERRM);
    END;
BEGIN
    make_nullable('pt_sessions', 'gym_id');
    make_nullable('pt_sessions', 'member_id');
    make_nullable('pt_sessions', 'trainer_id');
    make_nullable('pt_sessions', 'session_date');
    make_nullable('pt_sessions', 'duration_minutes');
    make_nullable('pt_sessions', 'status');
    make_nullable('pt_sessions', 'is_recurring');
    make_nullable('pt_sessions', 'recurring_frequency');
    add_col_if_missing('pt_sessions', 'gym_id', 'NUMBER');
    make_nullable('gyms', 'gym_id');
    make_nullable('member_memberships', 'gym_id');
    make_nullable('member_memberships', 'member_id');
    make_nullable('member_memberships', 'plan_id');
    make_nullable('member_memberships', 'membership_code');
    make_nullable('payment_transactions', 'gym_id');
    make_nullable('payment_transactions', 'member_id');
    make_nullable('payment_transactions', 'membership_id');
    make_nullable('payment_transactions', 'invoice_id');
    make_nullable('invoices', 'gym_id');
    make_nullable('invoices', 'member_id');
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Done.');
END;
/
EXIT;