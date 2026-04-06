SET SERVEROUTPUT ON FEEDBACK OFF
BEGIN
    FOR rec IN (
        SELECT constraint_name, table_name FROM user_constraints
        WHERE constraint_type = 'R'
    ) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || rec.table_name || ' DROP CONSTRAINT ' || rec.constraint_name;
            DBMS_OUTPUT.PUT_LINE('Dropped: ' || rec.table_name || '.' || rec.constraint_name);
        EXCEPTION WHEN OTHERS THEN
            IF SQLERRM NOT LIKE '%ORA-02291%' AND SQLERRM NOT LIKE '%ORA-02443%' THEN
                DBMS_OUTPUT.PUT_LINE('Err: ' || rec.table_name || '.' || rec.constraint_name || ' - ' || SQLERRM);
            END IF;
        END;
    END LOOP;
END;
/
EXIT;