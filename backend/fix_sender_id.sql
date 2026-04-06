SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND UPPER(column_name) = 'SENDER_ID';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE notifications ADD (sender_id NUMBER)';
        DBMS_OUTPUT.PUT_LINE('Added SENDER_ID to NOTIFICATIONS');
    ELSE
        DBMS_OUTPUT.PUT_LINE('SENDER_ID already exists in NOTIFICATIONS');
    END IF;
    COMMIT;
END;
/
SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND UPPER(column_name) = 'SENDER_ID';
EXIT;