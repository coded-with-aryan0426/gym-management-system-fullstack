-- ============================================================================
-- GYM MANAGEMENT SYSTEM - COMPREHENSIVE SEED DATA
-- Realistic Gym Data for Testing
-- Tenant ID: 1 (Default Gym - FitLife Fitness Center)
-- ============================================================================

-- ============================================================================
-- PART 1: EXPANDED TENANT DATA
-- ============================================================================

UPDATE tenants SET
    tenant_name = 'FitLife Fitness Center',
    tenant_code = 'FITLIFE',
    domain = 'fitlife.gymapp.com',
    contact_email = 'admin@fitlife.com',
    contact_phone = '+91-22-27687888',
    address = '123 Fitness Road, Andheri West',
    city = 'Mumbai',
    state = 'Maharashtra',
    country = 'India',
    postal_code = '400058',
    logo_url = 'https://fitlife.gymapp.com/assets/img/logo.png',
    timezone = 'Asia/Kolkata',
    currency = 'INR',
    language = 'en',
    is_active = 'Y',
    is_trial = 'N',
    subscription_tier = 'ENTERPRISE',
    max_members = 500,
    max_staff = 50,
    max_trainers = 25,
    storage_limit_mb = 5120,
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 1;

-- ============================================================================
-- PART 2: USER ROLES
-- ============================================================================

INSERT INTO user_roles (role_id, gym_id, role_name, role_code, description, permissions, is_system_role, created_at, updated_at)
VALUES (role_seq.NEXTVAL, 1, 'Gym Owner', 'OWNER', 'Full access to all gym operations', '{"all":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_roles (role_id, gym_id, role_name, role_code, description, permissions, is_system_role, created_at, updated_at)
VALUES (role_seq.NEXTVAL, 1, 'Administrator', 'ADMIN', 'Administrative access', '{"members":true,"staff":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_roles (role_id, gym_id, role_name, role_code, description, permissions, is_system_role, created_at, updated_at)
VALUES (role_seq.NEXTVAL, 1, 'Trainer', 'TRAINER', 'Fitness trainer', '{"members":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_roles (role_id, gym_id, role_name, role_code, description, permissions, is_system_role, created_at, updated_at)
VALUES (role_seq.NEXTVAL, 1, 'Member', 'MEMBER', 'Gym member', '{"profile":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- PART 3: GYM PROFILE & BRANCHES
-- ============================================================================

UPDATE gym_profiles SET
    gym_name = 'FitLife Fitness Center',
    gym_code = 'FLMUM001',
    owner_user_id = 1,
    street_address = '123 Fitness Road, Andheri West',
    city = 'Mumbai',
    state = 'Maharashtra',
    country = 'India',
    postal_code = '400058',
    phone = '+91-22-27687888',
    email = 'info@fitlife.com',
    opening_time = '06:00',
    closing_time = '23:00',
    timezone = 'Asia/Kolkata',
    is_active = 'Y',
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE gym_id = 1;

INSERT INTO gym_branches (branch_id, gym_id, branch_name, branch_code, address, city, state, postal_code, phone, email, opening_time, closing_time, is_active, created_at, updated_at)
VALUES (branch_seq.NEXTVAL, 1, 'FitLife Bandra', 'FLBND001', '45 Linking Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', '+91-22-26401234', 'bandra@fitlife.com', '06:00', '22:00', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO gym_branches (branch_id, gym_id, branch_name, branch_code, address, city, state, postal_code, phone, email, opening_time, closing_time, is_active, created_at, updated_at)
VALUES (branch_seq.NEXTVAL, 1, 'FitLife Powai', 'FLPWR001', '678 Lake Boulevard, Powai', 'Mumbai', 'Maharashtra', '400076', '+91-22-27654321', 'powai@fitlife.com', '05:30', '23:00', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- PART 4: STAFF MEMBERS
-- ============================================================================

DECLARE
    v_user_id NUMBER;
BEGIN
    INSERT INTO users (user_id, gym_id, username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified, created_at, updated_at, created_by)
    VALUES (onekey_seq.NEXTVAL, 1, 'trainer.yoga', 'meera.patel@fitlife.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Gq1CZBYowG5qCZBYowG5qCZBYowG5qCZ', 'Meera', 'Patel', '+91-9876523456', 'TRAINER', 'Y', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin')
    RETURNING user_id INTO v_user_id;

    INSERT INTO staff (staff_id, gym_id, user_id, staff_code, first_name, last_name, email, phone, designation, department, role, joining_date, employment_type, salary_amount, salary_type, is_active, created_at, updated_at, created_by)
    VALUES (staff_seq.NEXTVAL, 1, v_user_id, 'TRN001', 'Meera', 'Patel', 'meera.patel@fitlife.com', '+91-9876523456', 'Senior Yoga Instructor', 'Fitness', 'TRAINER', TO_DATE('2021-06-01', 'YYYY-MM-DD'), 'FULL_TIME', 45000, 'MONTHLY', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

    INSERT INTO users (user_id, gym_id, username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified, created_at, updated_at, created_by)
    VALUES (onekey_seq.NEXTVAL, 1, 'trainer.rajesh', 'rajesh.kumar@fitlife.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Gq1CZBYowG5qCZBYowG5qCZBYowG5qCZ', 'Rajesh', 'Kumar', '+91-9876534567', 'TRAINER', 'Y', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin')
    RETURNING user_id INTO v_user_id;

    INSERT INTO staff (staff_id, gym_id, user_id, staff_code, first_name, last_name, email, phone, designation, department, role, joining_date, employment_type, salary_amount, salary_type, is_active, created_at, updated_at, created_by)
    VALUES (staff_seq.NEXTVAL, 1, v_user_id, 'TRN002', 'Rajesh', 'Kumar', 'rajesh.kumar@fitlife.com', '+91-9876534567', 'Strength Coach', 'Fitness', 'TRAINER', TO_DATE('2020-01-10', 'YYYY-MM-DD'), 'FULL_TIME', 55000, 'MONTHLY', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

    INSERT INTO users (user_id, gym_id, username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified, created_at, updated_at, created_by)
    VALUES (onekey_seq.NEXTVAL, 1, 'trainer.ankit', 'ankit.singh@fitlife.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Gq1CZBYowG5qCZBYowG5qCZBYowG5qCZ', 'Ankit', 'Singh', '+91-9876545678', 'TRAINER', 'Y', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin')
    RETURNING user_id INTO v_user_id;

    INSERT INTO staff (staff_id, gym_id, user_id, staff_code, first_name, last_name, email, phone, designation, department, role, joining_date, employment_type, salary_amount, salary_type, is_active, created_at, updated_at, created_by)
    VALUES (staff_seq.NEXTVAL, 1, v_user_id, 'TRN003', 'Ankit', 'Singh', 'ankit.singh@fitlife.com', '+91-9876545678', 'CrossFit Specialist', 'Fitness', 'TRAINER', TO_DATE('2022-08-20', 'YYYY-MM-DD'), 'FULL_TIME', 50000, 'MONTHLY', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

    INSERT INTO users (user_id, gym_id, username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified, created_at, updated_at, created_by)
    VALUES (onekey_seq.NEXTVAL, 1, 'trainer.sneha', 'sneha.joshi@fitlife.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Gq1CZBYowG5qCZBYowG5qCZBYowG5qCZ', 'Sneha', 'Joshi', '+91-9876556789', 'TRAINER', 'Y', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin')
    RETURNING user_id INTO v_user_id;

    INSERT INTO staff (staff_id, gym_id, user_id, staff_code, first_name, last_name, email, phone, designation, department, role, joining_date, employment_type, salary_amount, salary_type, is_active, created_at, updated_at, created_by)
    VALUES (staff_seq.NEXTVAL, 1, v_user_id, 'TRN004', 'Sneha', 'Joshi', 'sneha.joshi@fitlife.com', '+91-9876556789', 'Zumba Instructor', 'Fitness', 'TRAINER', TO_DATE('2021-11-15', 'YYYY-MM-DD'), 'FULL_TIME', 40000, 'MONTHLY', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

    INSERT INTO users (user_id, gym_id, username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified, created_at, updated_at, created_by)
    VALUES (onekey_seq.NEXTVAL, 1, 'staff.vikram', 'vikram.reddy@fitlife.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Gq1CZBYowG5qCZBYowG5qCZBYowG5qCZ', 'Vikram', 'Reddy', '+91-9876578901', 'STAFF', 'Y', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin')
    RETURNING user_id INTO v_user_id;

    INSERT INTO staff (staff_id, gym_id, user_id, staff_code, first_name, last_name, email, phone, designation, department, role, joining_date, employment_type, salary_amount, salary_type, is_active, created_at, updated_at, created_by)
    VALUES (staff_seq.NEXTVAL, 1, v_user_id, 'STF003', 'Vikram', 'Reddy', 'vikram.reddy@fitlife.com', '+91-9876578901', 'Maintenance', 'Operations', 'JANITOR', TO_DATE('2021-02-01', 'YYYY-MM-DD'), 'FULL_TIME', 22000, 'MONTHLY', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

    COMMIT;
END;
/

-- ============================================================================
-- PART 5: MEMBERS (25 Members)
-- ============================================================================

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Amit', 'Shah', 'amit.shah@email.com', '+91-9820012345', TO_DATE('1988-05-15', 'YYYY-MM-DD'), 'Male', 'O+', 'Neha Shah', '+91-9820098765', 'Spouse', 'Walk-in', 'ACTIVE', TO_DATE('2025-01-15', 'YYYY-MM-DD'), TO_DATE('2026-01-15', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Pooja', 'Kapoor', 'pooja.kapoor@email.com', '+91-9820123456', TO_DATE('1992-08-22', 'YYYY-MM-DD'), 'Female', 'A+', 'Raj Kapoor', '+91-9820198766', 'Father', 'Google', 'ACTIVE', TO_DATE('2025-02-01', 'YYYY-MM-DD'), TO_DATE('2025-08-01', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Vikram', 'Mehta', 'vikram.mehta@email.com', '+91-9820234567', TO_DATE('1985-03-10', 'YYYY-MM-DD'), 'Male', 'B+', 'Anita Mehta', '+91-9820298767', 'Wife', 'Referral', 'ACTIVE', TO_DATE('2025-01-20', 'YYYY-MM-DD'), TO_DATE('2026-01-20', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Sunita', 'Verma', 'sunita.verma@email.com', '+91-9820345678', TO_DATE('1990-12-05', 'YYYY-MM-DD'), 'Female', 'AB+', 'Deepak Verma', '+91-9820398768', 'Spouse', 'Walk-in', 'ACTIVE', TO_DATE('2025-03-01', 'YYYY-MM-DD'), TO_DATE('2025-06-01', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Rohit', 'Patel', 'rohit.patel@email.com', '+91-9820456789', TO_DATE('1995-07-18', 'YYYY-MM-DD'), 'Male', 'A-', 'Mita Patel', '+91-9820498769', 'Mother', 'Social Media', 'ACTIVE', TO_DATE('2025-02-15', 'YYYY-MM-DD'), TO_DATE('2026-02-15', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Deepa', 'Iyer', 'deepa.iyer@email.com', '+91-9820567890', TO_DATE('1987-11-30', 'YYYY-MM-DD'), 'Female', 'O-', 'Karthik Iyer', '+91-9820598770', 'Spouse', 'Google', 'ACTIVE', TO_DATE('2025-01-10', 'YYYY-MM-DD'), TO_DATE('2026-01-10', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Sanjay', 'Gupta', 'sanjay.gupta@email.com', '+91-9820678901', TO_DATE('1991-04-25', 'YYYY-MM-DD'), 'Male', 'B-', 'Preeti Gupta', '+91-9820698771', 'Wife', 'Referral', 'ACTIVE', TO_DATE('2025-02-20', 'YYYY-MM-DD'), TO_DATE('2026-02-20', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Kavya', 'Reddy', 'kavya.reddy@email.com', '+91-9820789012', TO_DATE('1994-09-12', 'YYYY-MM-DD'), 'Female', 'A+', 'Naresh Reddy', '+91-9820798772', 'Father', 'Walk-in', 'ACTIVE', TO_DATE('2025-03-05', 'YYYY-MM-DD'), TO_DATE('2025-09-05', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Arjun', 'Nair', 'arjun.nair@email.com', '+91-9820890123', TO_DATE('1989-01-08', 'YYYY-MM-DD'), 'Male', 'AB-', 'Lakshmi Nair', '+91-9820898773', 'Mother', 'Google', 'ACTIVE', TO_DATE('2025-01-25', 'YYYY-MM-DD'), TO_DATE('2026-01-25', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Ritu', 'Singh', 'ritu.singh@email.com', '+91-9820901234', TO_DATE('1993-06-20', 'YYYY-MM-DD'), 'Female', 'O+', 'Vikram Singh', '+91-9820998774', 'Spouse', 'Social Media', 'ACTIVE', TO_DATE('2025-02-10', 'YYYY-MM-DD'), TO_DATE('2026-02-10', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Karan', 'Shetty', 'karan.shetty@email.com', '+91-9821012345', TO_DATE('1996-02-14', 'YYYY-MM-DD'), 'Male', 'B+', 'Geeta Shetty', '+91-9821098775', 'Mother', 'Referral', 'ACTIVE', TO_DATE('2025-03-10', 'YYYY-MM-DD'), TO_DATE('2026-03-10', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Nisha', 'Kumar', 'nisha.kumar@email.com', '+91-9821123456', TO_DATE('1991-10-28', 'YYYY-MM-DD'), 'Female', 'A-', 'Suresh Kumar', '+91-9821198776', 'Father', 'Walk-in', 'ACTIVE', TO_DATE('2025-01-05', 'YYYY-MM-DD'), TO_DATE('2025-07-05', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Aditya', 'Joshi', 'aditya.joshi@email.com', '+91-9821234567', TO_DATE('1988-08-03', 'YYYY-MM-DD'), 'Male', 'O+', 'Sunita Joshi', '+91-9821298777', 'Mother', 'Campaign', 'ACTIVE', TO_DATE('2025-02-25', 'YYYY-MM-DD'), TO_DATE('2026-02-25', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Priya', 'Menon', 'priya.menon@email.com', '+91-9821345678', TO_DATE('1995-03-17', 'YYYY-MM-DD'), 'Female', 'AB+', 'Unni Menon', '+91-9821398778', 'Spouse', 'Google', 'ACTIVE', TO_DATE('2025-03-15', 'YYYY-MM-DD'), TO_DATE('2026-03-15', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Vivek', 'Pandey', 'vivek.pandey@email.com', '+91-9821456789', TO_DATE('1990-05-22', 'YYYY-MM-DD'), 'Male', 'A+', 'Asha Pandey', '+91-9821498779', 'Wife', 'Referral', 'ACTIVE', TO_DATE('2025-01-30', 'YYYY-MM-DD'), TO_DATE('2026-01-30', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Anjali', 'Mishra', 'anjali.mishra@email.com', '+91-9821567890', TO_DATE('1992-12-09', 'YYYY-MM-DD'), 'Female', 'B-', 'Ravi Mishra', '+91-9821598780', 'Spouse', 'Social Media', 'ACTIVE', TO_DATE('2025-02-05', 'YYYY-MM-DD'), TO_DATE('2025-08-05', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Rahul', 'Desai', 'rahul.desai@email.com', '+91-9821678901', TO_DATE('1987-07-31', 'YYYY-MM-DD'), 'Male', 'O-', 'Mina Desai', '+91-9821698781', 'Wife', 'Walk-in', 'ACTIVE', TO_DATE('2025-03-20', 'YYYY-MM-DD'), TO_DATE('2026-03-20', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Divya', 'Rao', 'divya.rao@email.com', '+91-9821789012', TO_DATE('1994-01-16', 'YYYY-MM-DD'), 'Female', 'A+', 'Prasad Rao', '+91-9821798782', 'Spouse', 'Google', 'ACTIVE', TO_DATE('2025-01-12', 'YYYY-MM-DD'), TO_DATE('2026-01-12', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Suresh', 'Khatri', 'suresh.khatri@email.com', '+91-9821890123', TO_DATE('1986-04-07', 'YYYY-MM-DD'), 'Male', 'AB+', 'Kamala Khatri', '+91-9821898783', 'Spouse', 'Referral', 'ACTIVE', TO_DATE('2025-02-28', 'YYYY-MM-DD'), TO_DATE('2026-02-28', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Meenal', 'Saxena', 'meenal.saxena@email.com', '+91-9821901234', TO_DATE('1993-09-24', 'YYYY-MM-DD'), 'Female', 'B+', 'Narendra Saxena', '+91-9821998784', 'Father', 'Campaign', 'ACTIVE', TO_DATE('2025-03-08', 'YYYY-MM-DD'), TO_DATE('2026-03-08', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Nikhil', 'Bhat', 'nikhil.bhat@email.com', '+91-9822012345', TO_DATE('1989-06-11', 'YYYY-MM-DD'), 'Male', 'O+', 'Shobha Bhat', '+91-9822098785', 'Mother', 'Google', 'ACTIVE', TO_DATE('2025-02-18', 'YYYY-MM-DD'), TO_DATE('2026-02-18', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, source, membership_status, membership_start_date, membership_end_date, is_active, created_at, updated_at, created_by)
VALUES (member_seq.NEXTVAL, 1, 'Shweta', 'Kulkarni', 'shweta.kulkarni@email.com', '+91-9822123456', TO_DATE('1996-11-02', 'YYYY-MM-DD'), 'Female', 'A-', 'Mohan Kulkarni', '+91-9822198786', 'Father', 'Walk-in', 'ACTIVE', TO_DATE('2025-01-22', 'YYYY-MM-DD'), TO_DATE('2025-07-22', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

-- ============================================================================
-- PART 6: EQUIPMENT CATEGORIES & EQUIPMENT
-- ============================================================================

INSERT INTO equipment_categories (category_id, gym_id, category_name, category_code, description, is_active, created_at)
VALUES (cat_seq.NEXTVAL, 1, 'Cardiovascular', 'CARDIO', 'Treadmills, Ellipticals, Bikes', 'Y', CURRENT_TIMESTAMP);

INSERT INTO equipment_categories (category_id, gym_id, category_name, category_code, description, is_active, created_at)
VALUES (cat_seq.NEXTVAL, 1, 'Strength Training', 'STRENGTH', 'Cable Machines, Smith Machines', 'Y', CURRENT_TIMESTAMP);

INSERT INTO equipment_categories (category_id, gym_id, category_name, category_code, description, is_active, created_at)
VALUES (cat_seq.NEXTVAL, 1, 'Free Weights', 'FREEWEIGHT', 'Dumbbells, Barbells, Benches', 'Y', CURRENT_TIMESTAMP);

INSERT INTO equipment_categories (category_id, gym_id, category_name, category_code, description, is_active, created_at)
VALUES (cat_seq.NEXTVAL, 1, 'Group Fitness', 'GROUP', 'Yoga Mats, Equipment', 'Y', CURRENT_TIMESTAMP);

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ001', 'Treadmill Pro 5000', 1, 'Life Fitness', 'Pro 5000', 'LF2024TM001', 'Fitness Solutions', TO_DATE('2024-01-15', 'YYYY-MM-DD'), 185000, TO_DATE('2027-01-15', 'YYYY-MM-DD'), 'Floor 1 - Cardio', 'ACTIVE', 'EXCELLENT', 'Y', TO_DATE('2025-02-01', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ002', 'Treadmill Pro 5000', 1, 'Life Fitness', 'Pro 5000', 'LF2024TM002', 'Fitness Solutions', TO_DATE('2024-01-15', 'YYYY-MM-DD'), 185000, TO_DATE('2027-01-15', 'YYYY-MM-DD'), 'Floor 1 - Cardio', 'ACTIVE', 'EXCELLENT', 'Y', TO_DATE('2025-02-01', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ003', 'Elliptical Cross Trainer', 1, 'Precor', 'EFX 222', 'PC2024EL001', 'Fitness Solutions', TO_DATE('2024-02-01', 'YYYY-MM-DD'), 145000, TO_DATE('2027-02-01', 'YYYY-MM-DD'), 'Floor 1 - Cardio', 'ACTIVE', 'GOOD', 'Y', TO_DATE('2025-01-15', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ004', 'Stationary Bike', 1, 'Keiser', 'M3', 'KS2024BK001', 'Fitness Solutions', TO_DATE('2024-02-15', 'YYYY-MM-DD'), 85000, TO_DATE('2027-02-15', 'YYYY-MM-DD'), 'Floor 1 - Cardio', 'ACTIVE', 'GOOD', 'Y', TO_DATE('2025-01-20', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ005', 'Cable Machine', 2, 'Hammer Strength', 'Pro Dual', 'HS2024CM001', 'Strength Equipment', TO_DATE('2023-06-01', 'YYYY-MM-DD'), 325000, TO_DATE('2026-06-01', 'YYYY-MM-DD'), 'Floor 2 - Strength', 'ACTIVE', 'EXCELLENT', 'Y', TO_DATE('2025-01-05', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ006', 'Smith Machine', 2, 'Body-Solid', 'SGM400', 'BS2024SM001', 'Strength Equipment', TO_DATE('2023-06-15', 'YYYY-MM-DD'), 185000, TO_DATE('2026-06-15', 'YYYY-MM-DD'), 'Floor 2 - Strength', 'ACTIVE', 'GOOD', 'Y', TO_DATE('2025-02-15', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ007', 'Dumbbell Set 5-50kg', 3, 'York', 'Pro Gym', 'YK2024DB001', 'Fitness Solutions', TO_DATE('2023-08-01', 'YYYY-MM-DD'), 225000, TO_DATE('2026-08-01', 'YYYY-MM-DD'), 'Floor 2 - Free Weights', 'ACTIVE', 'GOOD', 'Y', TO_DATE('2025-02-05', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ008', 'Olympic Barbell Set', 3, 'Rogue', 'Ohio', 'RG2024BB001', 'Strength Equipment', TO_DATE('2023-08-15', 'YYYY-MM-DD'), 65000, TO_DATE('2026-08-15', 'YYYY-MM-DD'), 'Floor 2 - Free Weights', 'ACTIVE', 'EXCELLENT', 'Y', TO_DATE('2025-01-10', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, model_name, serial_number, supplier_name, purchase_date, purchase_amount, warranty_expiry_date, location, status, condition_status, operational_status, last_service_date, is_active, created_at, updated_at, created_by)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ009', 'Yoga Mat Set (30)', 4, 'Liforme', 'Yoga Mat', 'LF2024YM001', 'Group Fitness', TO_DATE('2024-02-01', 'YYYY-MM-DD'), 45000, TO_DATE('2027-02-01', 'YYYY-MM-DD'), 'Studio 1 - Yoga', 'ACTIVE', 'EXCELLENT', 'Y', TO_DATE('2025-01-30', 'YYYY-MM-DD'), 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

-- ============================================================================
-- PART 7: GROUP CLASSES & SCHEDULES
-- ============================================================================

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, max_participants, trainer_id, room_name, is_active, is_featured, icon, color, created_at, updated_at, created_by)
VALUES (class_seq.NEXTVAL, 1, 'Morning Yoga Flow', 'YOGA001', 'Energizing yoga flows', 'Yoga', 'ALL_LEVELS', 60, 25, 2, 'Studio 1', 'Y', 'Y', 'self_improvement', '#4CAF50', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, max_participants, trainer_id, room_name, is_active, is_featured, icon, color, created_at, updated_at, created_by)
VALUES (class_seq.NEXTVAL, 1, 'HIIT Circuit', 'HIIT001', 'High-intensity intervals', 'CrossFit', 'INTERMEDIATE', 45, 20, 4, 'Floor 2', 'Y', 'Y', 'fitness_center', '#FF5722', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, max_participants, trainer_id, room_name, is_active, is_featured, icon, color, created_at, updated_at, created_by)
VALUES (class_seq.NEXTVAL, 1, 'Zumba Dance Party', 'ZUMBA001', 'Dance fitness', 'Dance', 'BEGINNER', 60, 30, 5, 'Studio 2', 'Y', 'Y', 'music_note', '#E91E63', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, max_participants, trainer_id, room_name, is_active, is_featured, icon, color, created_at, updated_at, created_by)
VALUES (class_seq.NEXTVAL, 1, 'Strength Training 101', 'STR001', 'Weight training basics', 'Strength', 'BEGINNER', 60, 15, 3, 'Floor 2', 'Y', 'N', 'fitness_center', '#2196F3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, max_participants, trainer_id, room_name, is_active, is_featured, icon, color, created_at, updated_at, created_by)
VALUES (class_seq.NEXTVAL, 1, 'Pilates Core', 'PILATES001', 'Core strengthening', 'Pilates', 'INTERMEDIATE', 55, 20, 2, 'Studio 1', 'Y', 'N', 'self_improvement', '#9C27B0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin');

-- Class Schedules
INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 1, 2, 1, '06:30', '07:30', 'Y', 'Studio 1', 25, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 1, 2, 3, '06:30', '07:30', 'Y', 'Studio 1', 25, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 1, 2, 5, '06:30', '07:30', 'Y', 'Studio 1', 25, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 2, 4, 2, '18:00', '18:45', 'Y', 'Floor 2', 20, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 2, 4, 4, '18:00', '18:45', 'Y', 'Floor 2', 20, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 3, 5, 6, '10:00', '11:00', 'Y', 'Studio 2', 30, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 4, 3, 1, '19:00', '20:00', 'Y', 'Floor 2', 15, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 5, 2, 2, '20:00', '20:55', 'Y', 'Studio 1', 20, 'Y', CURRENT_TIMESTAMP);

INSERT INTO class_schedules (schedule_id, gym_id, class_id, trainer_id, day_of_week, start_time, end_time, is_recurring, room_name, max_bookings, is_active, created_at)
VALUES (schedule_seq.NEXTVAL, 1, 5, 2, 4, '20:00', '20:55', 'Y', 'Studio 1', 20, 'Y', CURRENT_TIMESTAMP);

-- ============================================================================
-- PART 8: FINANCIAL TRANSACTIONS
-- ============================================================================

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'INCOME', 'Membership Fees', 11798.82, 'INR', TO_DATE('2025-01-15', 'YYYY-MM-DD'), 'Annual Membership - Amit Shah', 'MEM-2025-0001', 'ONLINE', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'INCOME', 'Membership Fees', 2948.82, 'INR', TO_DATE('2025-02-01', 'YYYY-MM-DD'), 'Quarterly Membership - Pooja Kapoor', 'MEM-2025-0002', 'CASH', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'INCOME', 'Membership Fees', 11798.82, 'INR', TO_DATE('2025-01-20', 'YYYY-MM-DD'), 'Annual Membership - Vikram Mehta', 'MEM-2025-0003', 'ONLINE', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'INCOME', 'Personal Training', 2500, 'INR', TO_DATE('2025-01-25', 'YYYY-MM-DD'), 'PT Session - Amit Shah', 'PT-2025-001', 'CASH', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'EXPENSE', 'Rent', 150000, 'INR', TO_DATE('2025-01-01', 'YYYY-MM-DD'), 'Monthly Rent - January', 'RENT-2025-01', 'BANK_TRANSFER', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'EXPENSE', 'Electricity', 25000, 'INR', TO_DATE('2025-01-15', 'YYYY-MM-DD'), 'Electricity Bill - January', 'ELEC-2025-01', 'BANK_TRANSFER', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'EXPENSE', 'Staff Salary', 220000, 'INR', TO_DATE('2025-01-31', 'YYYY-MM-DD'), 'Staff Salaries - January', 'SAL-2025-01', 'BANK_TRANSFER', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'EXPENSE', 'Equipment Maintenance', 15000, 'INR', TO_DATE('2025-02-01', 'YYYY-MM-DD'), 'Treadmill Service', 'MAINT-2025-01', 'CASH', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

INSERT INTO financial_transactions (transaction_id, gym_id, transaction_type, category, amount, currency, transaction_date, description, reference_number, payment_method, status, created_by, created_at)
VALUES (fin_seq.NEXTVAL, 1, 'EXPENSE', 'Purchases', 8500, 'INR', TO_DATE('2025-02-10', 'YYYY-MM-DD'), 'Yoga Mats Purchase', 'PUR-2025-01', 'CARD', 'COMPLETED', 'admin', CURRENT_TIMESTAMP);

-- ============================================================================
-- PART 9: AUDIT LOGS
-- ============================================================================

INSERT INTO audit_logs (audit_id, gym_id, username, action, entity_type, entity_id, ip_address, created_at)
VALUES (audit_log_seq.NEXTVAL, 1, 'admin', 'LOGIN', 'USER', '1', '192.168.1.100', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (audit_id, gym_id, username, action, entity_type, entity_id, ip_address, created_at)
VALUES (audit_log_seq.NEXTVAL, 1, 'admin', 'CREATE', 'MEMBER', '1', '192.168.1.100', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (audit_id, gym_id, username, action, entity_type, entity_id, ip_address, created_at)
VALUES (audit_log_seq.NEXTVAL, 1, 'admin', 'UPDATE', 'MEMBERSHIP', '1', '192.168.1.100', CURRENT_TIMESTAMP);

INSERT INTO audit_logs (audit_id, gym_id, username, action, entity_type, entity_id, ip_address, created_at)
VALUES (audit_log_seq.NEXTVAL, 1, 'admin', 'LOGIN', 'USER', '2', '192.168.1.101', CURRENT_TIMESTAMP);

COMMIT;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================