-- Insert membership records for all customers with unique plans and dates
-- This creates realistic membership data with varied start dates and statuses

-- First, let's get the membership_id sequence value or create entries
DECLARE
    v_user_id NUMBER;
    v_package_id NUMBER;
    v_start_date DATE;
    v_end_date DATE;
    v_status VARCHAR2(20);
    v_day_offset NUMBER;
    v_counter NUMBER := 0;
BEGIN
    -- Loop through all CUSTOMER users (user_id 51-150 based on seed data)
    FOR customer IN (
        SELECT u.user_id 
        FROM users u 
        JOIN user_role_map urm ON u.user_id = urm.user_id
        JOIN roles r ON urm.role_id = r.role_id
        WHERE r.role_name = 'CUSTOMER'
        ORDER BY u.user_id
    ) LOOP
        v_counter := v_counter + 1;
        
        -- Assign package based on rotation (1-5)
        v_package_id := MOD(v_counter - 1, 5) + 1;
        
        -- Create varied start dates (ranging from 1 year ago to 1 month ago)
        v_day_offset := FLOOR(DBMS_RANDOM.VALUE(30, 365));
        v_start_date := TRUNC(SYSDATE) - v_day_offset;
        
        -- Set end date based on package type (monthly = 30 days, annual = 365 days)
        IF v_package_id IN (4, 5) THEN
            v_end_date := v_start_date + 365;
        ELSE
            v_end_date := v_start_date + 30;
        END IF;
        
        -- Assign status based on end date and random chance
        IF v_end_date >= SYSDATE THEN
            -- Active if end date is in future
            v_status := 'ACTIVE';
        ELSIF DBMS_RANDOM.VALUE < 0.3 THEN
            -- 30% expired
            v_status := 'EXPIRED';
        ELSE
            -- Renew to make active
            v_end_date := SYSDATE + FLOOR(DBMS_RANDOM.VALUE(30, 180));
            v_status := 'ACTIVE';
        END IF;
        
        -- Insert membership record
        INSERT INTO memberships (
            gym_id, 
            user_id, 
            package_id, 
            status, 
            start_date, 
            end_date, 
            created_at
        ) VALUES (
            1,  -- gym_id (AthlonX Main)
            customer.user_id,
            v_package_id,
            v_status,
            v_start_date,
            v_end_date,
            v_start_date  -- created_at same as start_date
        );
        
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('Inserted ' || v_counter || ' membership records');
    COMMIT;
END;
/

-- Verify the data
SELECT 
    COUNT(*) AS total_memberships,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
    SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) AS expired_count,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count
FROM memberships;

-- Show sample data
SELECT m.membership_id, u.full_name, mp.package_name, m.status, m.start_date, m.end_date
FROM memberships m
JOIN users u ON m.user_id = u.user_id
JOIN membership_packages mp ON m.package_id = mp.package_id
WHERE ROWNUM <= 10
ORDER BY m.membership_id;
