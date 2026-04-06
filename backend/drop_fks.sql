SET SERVEROUTPUT ON FEEDBACK OFF
BEGIN
    FOR rec IN (
        SELECT constraint_name, table_name FROM user_constraints
        WHERE constraint_type = 'R'
          AND (table_name IN ('WORKOUT_LOGS','MEMBER_GOALS','PT_SESSIONS','USER_SESSIONS','ATTENDANCE_RECORDS','MEMBERS','MEMBER_MEMBERSHIPS','USER_ROLE_MAP','MESSAGE_RECIPIENTS','MESSAGES','MESSAGE_PARTICIPANTS','CHAT_CONVERSATIONS','CHAT_PARTICIPANTS','NOTIFICATIONS','AUDIT_LOGS','FEATURE_FLAGS','TRAINER_REQUESTS','EQUIPMENT_MAINTENANCE','CLASS_BOOKINGS','INVENTORY_ITEMS','STAFF_SCHEDULES','HOLIDAYS','ROOM_RESERVATIONS','APPOINTMENTS','BATCH_ATTENDANCE')
               OR table_name LIKE '%ATTENDANCE%' OR table_name LIKE '%WORKOUT%')
    ) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || rec.table_name || ' DROP CONSTRAINT ' || rec.constraint_name;
            DBMS_OUTPUT.PUT_LINE('Dropped: ' || rec.table_name || '.' || rec.constraint_name);
        EXCEPTION WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Err: ' || rec.table_name || '.' || rec.constraint_name || ' - ' || SQLERRM);
        END;
    END LOOP;
END;
/
EXIT;