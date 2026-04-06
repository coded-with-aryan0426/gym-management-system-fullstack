SET SERVEROUTPUT ON FEEDBACK OFF
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE pt_sessions MODIFY (assignment_id NULL)';
    DBMS_OUTPUT.PUT_LINE('pt_sessions.assignment_id is now nullable');
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/
SELECT column_name, nullable FROM user_tab_columns WHERE table_name = 'PT_SESSIONS' AND column_name = 'ASSIGNMENT_ID';
EXIT;