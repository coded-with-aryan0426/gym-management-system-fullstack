SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
BEGIN
    FOR col_rec IN (
        SELECT 'is_archived' AS col_name, 'NUMBER(1)' AS col_type FROM dual
        UNION ALL SELECT 'is_starred', 'NUMBER(1)' FROM dual
        UNION ALL SELECT 'is_read', 'NUMBER(1)' FROM dual
        UNION ALL SELECT 'meta_data', 'CLOB' FROM dual
        UNION ALL SELECT 'action_data', 'CLOB' FROM dual
    ) LOOP
        SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND column_name = UPPER(col_rec.col_name);
        IF v_count = 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE notifications ADD (' || col_rec.col_name || ' ' || col_rec.col_type || ')';
            DBMS_OUTPUT.PUT_LINE('Added: NOTIFICATIONS.' || col_rec.col_name);
        ELSE
            DBMS_OUTPUT.PUT_LINE('Exists: NOTIFICATIONS.' || col_rec.col_name);
        END IF;
    END LOOP;
    COMMIT;
END;
/
SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' ORDER BY column_id;
EXIT;