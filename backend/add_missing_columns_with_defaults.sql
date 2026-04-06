SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_nullable USER_TAB_COLUMNS.NULLABLE%TYPE;
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE group_classes ADD (max_capacity NUMBER DEFAULT 20)';
    DBMS_OUTPUT.PUT_LINE('Added group_classes.max_capacity with default');
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%ORA-01430%' THEN
        DBMS_OUTPUT.PUT_LINE('group_classes.max_capacity already exists');
    ELSIF SQLERRM LIKE '%ORA-01451%' THEN
        DBMS_OUTPUT.PUT_LINE('group_classes.max_capacity already exists (cannot modify to NULL)');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Err group_classes.max_capacity: ' || SQLERRM);
    END IF;
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE group_classes ADD (category VARCHAR2(50) DEFAULT ''OTHER'')';
    DBMS_OUTPUT.PUT_LINE('Added group_classes.category with default');
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%ORA-01430%' THEN
        DBMS_OUTPUT.PUT_LINE('group_classes.category already exists');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Err group_classes.category: ' || SQLERRM);
    END IF;
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE group_classes ADD (name VARCHAR2(255) DEFAULT ''Unnamed Class'')';
    DBMS_OUTPUT.PUT_LINE('Added group_classes.name with default');
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%ORA-01430%' THEN
        DBMS_OUTPUT.PUT_LINE('group_classes.name already exists');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Err group_classes.name: ' || SQLERRM);
    END IF;
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE group_classes ADD (type VARCHAR2(20) DEFAULT ''GROUP'')';
    DBMS_OUTPUT.PUT_LINE('Added group_classes.type with default');
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%ORA-01430%' THEN
        DBMS_OUTPUT.PUT_LINE('group_classes.type already exists');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Err group_classes.type: ' || SQLERRM);
    END IF;
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'USER_SESSIONS' AND column_name = 'IP_ADDRESS';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE user_sessions ADD (ip_address VARCHAR2(50))';
        DBMS_OUTPUT.PUT_LINE('Added user_sessions.ip_address');
    ELSE
        DBMS_OUTPUT.PUT_LINE('user_sessions.ip_address already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err user_sessions.ip_address: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'USER_SESSIONS' AND column_name = 'USER_AGENT';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE user_sessions ADD (user_agent VARCHAR2(500))';
        DBMS_OUTPUT.PUT_LINE('Added user_sessions.user_agent');
    ELSE
        DBMS_OUTPUT.PUT_LINE('user_sessions.user_agent already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err user_sessions.user_agent: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND column_name = 'TYPE';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE notifications ADD (type VARCHAR2(50))';
        DBMS_OUTPUT.PUT_LINE('Added notifications.type');
    ELSE
        DBMS_OUTPUT.PUT_LINE('notifications.type already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err notifications.type: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND column_name = 'LINK';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE notifications ADD (link VARCHAR2(255))';
        DBMS_OUTPUT.PUT_LINE('Added notifications.link');
    ELSE
        DBMS_OUTPUT.PUT_LINE('notifications.link already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err notifications.link: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'NOTIFICATIONS' AND column_name = 'SENDER_ID';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE notifications ADD (sender_id NUMBER)';
        DBMS_OUTPUT.PUT_LINE('Added notifications.sender_id');
    ELSE
        DBMS_OUTPUT.PUT_LINE('notifications.sender_id already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err notifications.sender_id: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'AUDIT_LOGS' AND column_name = 'ACTION';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE audit_logs ADD (action VARCHAR2(100))';
        DBMS_OUTPUT.PUT_LINE('Added audit_logs.action');
    ELSE
        DBMS_OUTPUT.PUT_LINE('audit_logs.action already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err audit_logs.action: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'AUDIT_LOGS' AND column_name = 'ENTITY_TYPE';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE audit_logs ADD (entity_type VARCHAR2(100))';
        DBMS_OUTPUT.PUT_LINE('Added audit_logs.entity_type');
    ELSE
        DBMS_OUTPUT.PUT_LINE('audit_logs.entity_type already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err audit_logs.entity_type: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'AUDIT_LOGS' AND column_name = 'ENTITY_ID';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE audit_logs ADD (entity_id NUMBER)';
        DBMS_OUTPUT.PUT_LINE('Added audit_logs.entity_id');
    ELSE
        DBMS_OUTPUT.PUT_LINE('audit_logs.entity_id already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err audit_logs.entity_id: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'AUDIT_LOGS' AND column_name = 'CHANGES';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE audit_logs ADD (changes CLOB)';
        DBMS_OUTPUT.PUT_LINE('Added audit_logs.changes');
    ELSE
        DBMS_OUTPUT.PUT_LINE('audit_logs.changes already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err audit_logs.changes: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'MEMBERS' AND column_name = 'MEMBERSHIP_ID';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE members ADD (membership_id NUMBER)';
        DBMS_OUTPUT.PUT_LINE('Added members.membership_id');
    ELSE
        DBMS_OUTPUT.PUT_LINE('members.membership_id already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err members.membership_id: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'GYMS' AND column_name = 'IS_ACTIVE';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE gyms ADD (is_active NUMBER(1) DEFAULT 1)';
        DBMS_OUTPUT.PUT_LINE('Added gyms.is_active with default');
    ELSE
        DBMS_OUTPUT.PUT_LINE('gyms.is_active already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err gyms.is_active: ' || SQLERRM);
END;
/

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tab_columns WHERE table_name = 'EQUIPMENT' AND column_name = 'IS_DELETED';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE equipment ADD (is_deleted NUMBER(1) DEFAULT 0)';
        DBMS_OUTPUT.PUT_LINE('Added equipment.is_deleted with default');
    ELSE
        DBMS_OUTPUT.PUT_LINE('equipment.is_deleted already exists');
    END IF;
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Err equipment.is_deleted: ' || SQLERRM);
END;
/

COMMIT;
DBMS_OUTPUT.PUT_LINE('All column additions complete.');
EXIT;