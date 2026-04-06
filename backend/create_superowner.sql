SET SERVEROUTPUT ON FEEDBACK OFF
DECLARE
    v_count NUMBER;
    v_user_id NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM users WHERE LOWER(email) = 'superowner@gym.com';
    IF v_count > 0 THEN
        SELECT user_id INTO v_user_id FROM users WHERE LOWER(email) = 'superowner@gym.com';
        DELETE FROM user_role_map WHERE user_id = v_user_id;
        DELETE FROM users WHERE user_id = v_user_id;
        DBMS_OUTPUT.PUT_LINE('Deleted old entry');
    END IF;

    SELECT MAX(user_id) + 1 INTO v_user_id FROM users;

    INSERT INTO users (
        user_id, username, email, password, full_name, phone_number,
        auth_provider, is_deleted, is_first_login, account_non_locked,
        two_factor_enabled, created_at, status, gender
    ) VALUES (
        v_user_id, 'superowner', 'superowner@gym.com',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FCgK1wZJqH0J4y',
        'Super Owner', '+1234567890',
        'LOCAL', 0, 1, 1, 0, CURRENT_TIMESTAMP, 'ACTIVE', 'OTHER'
    );
    DBMS_OUTPUT.PUT_LINE('Created user with id: ' || v_user_id);

    INSERT INTO user_role_map (user_id, role_id)
    VALUES (v_user_id, 1);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('SUCCESS - Login: superowner@gym.com / SuperPassword123!');
EXCEPTION WHEN OTHERS THEN
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/