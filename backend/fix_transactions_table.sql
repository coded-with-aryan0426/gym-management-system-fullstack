SET SERVEROUTPUT ON FEEDBACK OFF

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM user_tables WHERE table_name = 'TRANSACTIONS';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE '
CREATE TABLE transactions (
    transaction_id NUMBER DEFAULT transaction_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER,
    date_time TIMESTAMP NOT NULL,
    description VARCHAR2(500),
    category VARCHAR2(100),
    type VARCHAR2(50),
    amount NUMBER(12, 2),
    status VARCHAR2(50),
    reference_number VARCHAR2(100),
    user_id NUMBER,
    created_by VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';
        DBMS_OUTPUT.PUT_LINE('Created TRANSACTIONS table');
    ELSE
        DBMS_OUTPUT.PUT_LINE('TRANSACTIONS table already exists');
    END IF;

    SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'TRANSACTION_SEQ';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE SEQUENCE transaction_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
        DBMS_OUTPUT.PUT_LINE('Created TRANSACTION_SEQ sequence');
    ELSE
        DBMS_OUTPUT.PUT_LINE('TRANSACTION_SEQ sequence already exists');
    END IF;

    COMMIT;
END;
/

SET LINESIZE 200 FEEDBACK OFF
COLUMN table_name FORMAT A30
COLUMN column_name FORMAT A30
COLUMN data_type FORMAT A15
SELECT table_name, column_name, data_type
FROM user_tab_columns
WHERE table_name = 'TRANSACTIONS'
ORDER BY column_id;

SELECT COUNT(*) AS total_rows FROM transactions;
EXIT;