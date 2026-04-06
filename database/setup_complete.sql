-- ============================================================================
-- GYM MANAGEMENT SYSTEM - COMPLETE ONE-TIME SETUP
-- Run this SINGLE file in Oracle SQL Developer to set up everything
-- ============================================================================

-- ============================================================================
-- STEP 1: CLEANUP ALL EXISTING OBJECTS
-- ============================================================================

BEGIN
    FOR rec IN (SELECT table_name FROM user_tables) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || rec.table_name || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;
END;
/

BEGIN
    FOR rec IN (SELECT sequence_name FROM user_sequences) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || rec.sequence_name;
    END LOOP;
END;
/

BEGIN
    FOR rec IN (SELECT view_name FROM user_views) LOOP
        EXECUTE IMMEDIATE 'DROP VIEW ' || rec.view_name;
    END LOOP;
END;
/

BEGIN
    FOR rec IN (SELECT object_name FROM user_procedures WHERE object_type = 'PROCEDURE') LOOP
        EXECUTE IMMEDIATE 'DROP PROCEDURE ' || rec.object_name;
    END LOOP;
END;
/

BEGIN
    FOR rec IN (SELECT trigger_name FROM user_triggers) LOOP
        EXECUTE IMMEDIATE 'DROP TRIGGER ' || rec.trigger_name;
    END LOOP;
END;
/

COMMIT;

-- ============================================================================
-- STEP 2: CREATE SEQUENCES
-- ============================================================================

CREATE SEQUENCE gym_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE member_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE membership_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE staff_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE checkin_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE equipment_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE payment_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE invoice_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE transaction_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE audit_log_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE notification_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE class_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE trainer_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE schedule_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE attendance_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE onekey_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE role_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE assignment_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE branch_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE doc_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE health_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE tier_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE cat_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE maint_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE staff_att_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE payroll_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE mm_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE fin_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE booking_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE pt_assign_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE pt_session_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ============================================================================
-- STEP 3: CREATE TABLES
-- ============================================================================

CREATE TABLE tenants (
    tenant_id NUMBER PRIMARY KEY,
    tenant_code VARCHAR2(50) NOT NULL UNIQUE,
    tenant_name VARCHAR2(200) NOT NULL,
    contact_email VARCHAR2(200) NOT NULL,
    contact_phone VARCHAR2(20),
    city VARCHAR2(100),
    state VARCHAR2(100),
    country VARCHAR2(100) DEFAULT 'India',
    timezone VARCHAR2(50) DEFAULT 'Asia/Kolkata',
    currency VARCHAR2(3) DEFAULT 'INR',
    is_active CHAR(1) DEFAULT 'Y',
    subscription_tier VARCHAR2(50),
    max_members NUMBER DEFAULT 100,
    max_staff NUMBER DEFAULT 20,
    storage_limit_mb NUMBER DEFAULT 1024,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gym_profiles (
    gym_id NUMBER DEFAULT gym_seq.NEXTVAL PRIMARY KEY,
    gym_name VARCHAR2(200) NOT NULL,
    gym_code VARCHAR2(50),
    owner_user_id NUMBER NOT NULL,
    city VARCHAR2(100),
    state VARCHAR2(100),
    country VARCHAR2(100) DEFAULT 'India',
    phone VARCHAR2(20),
    email VARCHAR2(200),
    is_active CHAR(1) DEFAULT 'Y',
    total_members NUMBER DEFAULT 0,
    total_staff NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id NUMBER DEFAULT onekey_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    username VARCHAR2(100) NOT NULL,
    email VARCHAR2(200) NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100),
    phone VARCHAR2(20),
    user_type VARCHAR2(50) NOT NULL,
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_username UNIQUE (gym_id, username),
    CONSTRAINT uk_users_email UNIQUE (gym_id, email)
);

CREATE INDEX idx_users_gym ON users(gym_id);

CREATE TABLE user_roles (
    role_id NUMBER DEFAULT role_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    role_name VARCHAR2(50) NOT NULL,
    role_code VARCHAR2(50) NOT NULL,
    description VARCHAR2(500),
    is_system_role CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_role_assignments (
    assignment_id NUMBER DEFAULT assignment_seq.NEXTVAL PRIMARY KEY,
    user_id NUMBER NOT NULL,
    role_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gym_branches (
    branch_id NUMBER DEFAULT branch_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_name VARCHAR2(200) NOT NULL,
    branch_code VARCHAR2(50),
    city VARCHAR2(100),
    phone VARCHAR2(20),
    email VARCHAR2(200),
    opening_time VARCHAR2(10),
    closing_time VARCHAR2(10),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_gym ON gym_branches(gym_id);

CREATE TABLE members (
    member_id NUMBER DEFAULT member_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    member_code VARCHAR2(50),
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100),
    email VARCHAR2(200),
    phone VARCHAR2(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR2(20),
    blood_group VARCHAR2(10),
    emergency_contact_name VARCHAR2(200),
    emergency_contact_phone VARCHAR2(20),
    membership_status VARCHAR2(50) DEFAULT 'INACTIVE',
    membership_start_date DATE,
    membership_end_date DATE,
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_gym ON members(gym_id);
CREATE INDEX idx_members_phone ON members(phone);

CREATE TABLE member_documents (
    document_id NUMBER DEFAULT doc_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    document_type VARCHAR2(50) NOT NULL,
    document_name VARCHAR2(200) NOT NULL,
    document_url VARCHAR2(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member_health_metrics (
    metric_id NUMBER DEFAULT health_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    record_date DATE NOT NULL,
    weight_kg NUMBER(5, 2),
    height_cm NUMBER(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE membership_plans (
    plan_id NUMBER DEFAULT membership_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    plan_code VARCHAR2(50) NOT NULL,
    plan_name VARCHAR2(200) NOT NULL,
    plan_type VARCHAR2(50) DEFAULT 'INDIVIDUAL',
    duration_days NUMBER NOT NULL,
    plan_amount NUMBER(12, 2) NOT NULL,
    tax_percentage NUMBER(5, 2) DEFAULT 18,
    total_amount NUMBER(12, 2) NOT NULL,
    personal_training_sessions NUMBER DEFAULT 0,
    group_class_access CHAR(1) DEFAULT 'N',
    is_freeze_allowed CHAR(1) DEFAULT 'Y',
    features CLOB,
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plans_gym ON membership_plans(gym_id);

CREATE TABLE plan_pricing_tiers (
    tier_id NUMBER DEFAULT tier_seq.NEXTVAL PRIMARY KEY,
    plan_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    billing_cycle VARCHAR2(20) NOT NULL,
    duration_days NUMBER NOT NULL,
    price_amount NUMBER(12, 2) NOT NULL,
    total_amount NUMBER(12, 2) NOT NULL,
    is_default CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkin_records (
    checkin_id NUMBER DEFAULT checkin_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    member_id NUMBER NOT NULL,
    checkin_time TIMESTAMP NOT NULL,
    checkout_time TIMESTAMP,
    checkin_method VARCHAR2(50) DEFAULT 'QR_CODE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checkin_gym ON checkin_records(gym_id);
CREATE INDEX idx_checkin_member ON checkin_records(member_id);

CREATE TABLE daily_attendance (
    attendance_id NUMBER DEFAULT attendance_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    attendance_date DATE NOT NULL,
    total_checkins NUMBER DEFAULT 0,
    UNIQUE (gym_id, attendance_date)
);

CREATE TABLE equipment_categories (
    category_id NUMBER DEFAULT cat_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER,
    category_name VARCHAR2(100) NOT NULL,
    category_code VARCHAR2(50),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
    equipment_id NUMBER DEFAULT equipment_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    equipment_code VARCHAR2(50),
    equipment_name VARCHAR2(200) NOT NULL,
    category_id NUMBER,
    brand_name VARCHAR2(100),
    serial_number VARCHAR2(100),
    purchase_date DATE,
    purchase_amount NUMBER(12, 2),
    location VARCHAR2(200),
    status VARCHAR2(50) DEFAULT 'ACTIVE',
    condition_status VARCHAR2(50) DEFAULT 'GOOD',
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_gym ON equipment(gym_id);

CREATE TABLE equipment_maintenance (
    maintenance_id NUMBER DEFAULT maint_seq.NEXTVAL PRIMARY KEY,
    equipment_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    maintenance_type VARCHAR2(50),
    description CLOB,
    maintenance_date DATE NOT NULL,
    cost NUMBER(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    staff_id NUMBER DEFAULT staff_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    user_id NUMBER,
    staff_code VARCHAR2(50),
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100),
    email VARCHAR2(200),
    phone VARCHAR2(20) NOT NULL,
    designation VARCHAR2(100),
    department VARCHAR2(100),
    role VARCHAR2(100),
    joining_date DATE,
    employment_type VARCHAR2(50),
    salary_amount NUMBER(12, 2),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_gym ON staff(gym_id);

CREATE TABLE staff_attendance (
    attendance_id NUMBER DEFAULT staff_att_seq.NEXTVAL PRIMARY KEY,
    staff_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    attendance_date DATE NOT NULL,
    checkin_time TIMESTAMP,
    checkout_time TIMESTAMP,
    status VARCHAR2(50) DEFAULT 'PRESENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_payroll (
    payroll_id NUMBER DEFAULT payroll_seq.NEXTVAL PRIMARY KEY,
    staff_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    payroll_month DATE NOT NULL,
    basic_salary NUMBER(12, 2) NOT NULL,
    total_earnings NUMBER(12, 2) NOT NULL,
    total_deductions NUMBER(12, 2) DEFAULT 0,
    net_salary NUMBER(12, 2) NOT NULL,
    payment_status VARCHAR2(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member_memberships (
    membership_id NUMBER DEFAULT mm_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    plan_id NUMBER NOT NULL,
    membership_code VARCHAR2(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    plan_amount NUMBER(12, 2) NOT NULL,
    total_amount NUMBER(12, 2) NOT NULL,
    amount_paid NUMBER(12, 2) DEFAULT 0,
    amount_due NUMBER(12, 2) DEFAULT 0,
    payment_status VARCHAR2(50) DEFAULT 'PENDING',
    status VARCHAR2(50) DEFAULT 'ACTIVE',
    next_renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mm_gym ON member_memberships(gym_id);
CREATE INDEX idx_mm_member ON member_memberships(member_id);

CREATE TABLE payment_transactions (
    transaction_id NUMBER DEFAULT transaction_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER,
    membership_id NUMBER,
    transaction_code VARCHAR2(50) NOT NULL,
    transaction_type VARCHAR2(50) NOT NULL,
    payment_mode VARCHAR2(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    amount NUMBER(12, 2) NOT NULL,
    total_amount NUMBER(12, 2) NOT NULL,
    amount_received NUMBER(12, 2) NOT NULL,
    transaction_status VARCHAR2(50) DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_transaction_code UNIQUE (gym_id, transaction_code)
);

CREATE INDEX idx_txn_gym ON payment_transactions(gym_id);

CREATE TABLE invoices (
    invoice_id NUMBER DEFAULT invoice_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER,
    invoice_number VARCHAR2(50) NOT NULL,
    invoice_date DATE NOT NULL,
    total_amount NUMBER(12, 2) NOT NULL,
    amount_paid NUMBER(12, 2) DEFAULT 0,
    amount_due NUMBER(12, 2) DEFAULT 0,
    payment_status VARCHAR2(50) DEFAULT 'PENDING',
    status VARCHAR2(50) DEFAULT 'ISSUE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inv_gym ON invoices(gym_id);

CREATE TABLE group_classes (
    class_id NUMBER DEFAULT class_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    class_name VARCHAR2(200) NOT NULL,
    class_code VARCHAR2(50),
    description CLOB,
    category VARCHAR2(100),
    difficulty_level VARCHAR2(20),
    duration_minutes NUMBER DEFAULT 60,
    max_participants NUMBER DEFAULT 20,
    trainer_id NUMBER,
    room_name VARCHAR2(100),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_gym ON group_classes(gym_id);

CREATE TABLE class_schedules (
    schedule_id NUMBER DEFAULT schedule_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    class_id NUMBER NOT NULL,
    trainer_id NUMBER,
    day_of_week NUMBER,
    start_time VARCHAR2(10) NOT NULL,
    end_time VARCHAR2(10) NOT NULL,
    room_name VARCHAR2(100),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_bookings (
    booking_id NUMBER DEFAULT booking_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    schedule_id NUMBER NOT NULL,
    class_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR2(50) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pt_assignments (
    assignment_id NUMBER DEFAULT pt_assign_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    trainer_id NUMBER NOT NULL,
    session_count NUMBER NOT NULL,
    sessions_remaining NUMBER NOT NULL,
    session_price NUMBER(12, 2) NOT NULL,
    total_amount NUMBER(12, 2) NOT NULL,
    amount_paid NUMBER(12, 2) DEFAULT 0,
    status VARCHAR2(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pt_sessions (
    session_id NUMBER DEFAULT pt_session_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    assignment_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    trainer_id NUMBER NOT NULL,
    session_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes NUMBER,
    session_status VARCHAR2(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_transactions (
    transaction_id NUMBER DEFAULT fin_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    transaction_type VARCHAR2(20) NOT NULL,
    category VARCHAR2(100) NOT NULL,
    amount NUMBER(12, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    description VARCHAR2(500),
    payment_method VARCHAR2(50),
    status VARCHAR2(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_gym ON financial_transactions(gym_id);

CREATE TABLE audit_logs (
    audit_id NUMBER DEFAULT audit_log_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    user_id NUMBER,
    username VARCHAR2(100),
    action VARCHAR2(100) NOT NULL,
    entity_type VARCHAR2(100) NOT NULL,
    entity_id VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    notification_id NUMBER DEFAULT notification_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    notification_type VARCHAR2(50) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    message CLOB NOT NULL,
    status VARCHAR2(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 4: FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE users ADD CONSTRAINT fk_users_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE user_role_assignments ADD CONSTRAINT fk_ura_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE gym_branches ADD CONSTRAINT fk_branches_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE members ADD CONSTRAINT fk_members_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE member_documents ADD CONSTRAINT fk_docs_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE member_health_metrics ADD CONSTRAINT fk_health_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE membership_plans ADD CONSTRAINT fk_plans_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE plan_pricing_tiers ADD CONSTRAINT fk_tiers_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE checkin_records ADD CONSTRAINT fk_checkin_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE daily_attendance ADD CONSTRAINT fk_da_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE equipment ADD CONSTRAINT fk_equip_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE equipment_maintenance ADD CONSTRAINT fk_maint_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE staff ADD CONSTRAINT fk_staff_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE staff_attendance ADD CONSTRAINT fk_sa_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE staff_payroll ADD CONSTRAINT fk_payroll_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE member_memberships ADD CONSTRAINT fk_mm_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE payment_transactions ADD CONSTRAINT fk_txn_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE invoices ADD CONSTRAINT fk_inv_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE group_classes ADD CONSTRAINT fk_classes_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE class_schedules ADD CONSTRAINT fk_sched_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE class_bookings ADD CONSTRAINT fk_book_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE pt_assignments ADD CONSTRAINT fk_pt_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE pt_sessions ADD CONSTRAINT fk_pts_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);
ALTER TABLE notifications ADD CONSTRAINT fk_notif_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id);

-- ============================================================================
-- STEP 5: TRIGGERS
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_member_code
BEFORE INSERT ON members
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    IF :NEW.member_code IS NULL THEN
        SELECT COUNT(*) + 1 INTO v_count FROM members WHERE gym_id = :NEW.gym_id;
        :NEW.member_code := 'MBR-' || TO_CHAR(SYSDATE, 'YYYY') || '-' || LPAD(v_count, 6, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_membership_code
BEFORE INSERT ON member_memberships
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    IF :NEW.membership_code IS NULL THEN
        SELECT COUNT(*) + 1 INTO v_count FROM member_memberships WHERE gym_id = :NEW.gym_id;
        :NEW.membership_code := 'MEM-' || TO_CHAR(SYSDATE, 'YYYY') || '-' || LPAD(v_count, 6, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_transaction_code
BEFORE INSERT ON payment_transactions
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    IF :NEW.transaction_code IS NULL THEN
        SELECT COUNT(*) + 1 INTO v_count FROM payment_transactions WHERE gym_id = :NEW.gym_id;
        :NEW.transaction_code := 'TXN-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_count, 8, '0');
    END IF;
END;
/

COMMIT;

-- ============================================================================
-- STEP 6: SEED DATA
-- ============================================================================

-- Tenant
INSERT INTO tenants (tenant_id, tenant_code, tenant_name, contact_email, contact_phone, city, country, is_active, subscription_tier)
VALUES (1, 'DEFAULT', 'FitLife Fitness Center', 'admin@fitlife.com', '+91-22-27687888', 'Mumbai', 'India', 'Y', 'ENTERPRISE');

-- Gym Profile
INSERT INTO gym_profiles (gym_id, gym_name, gym_code, owner_user_id, city, state, phone, email, is_active)
VALUES (1, 'FitLife Fitness Center', 'FITLIFE001', 1, 'Mumbai', 'Maharashtra', '+91-22-27687888', 'admin@fitlife.com', 'Y');

-- Admin User (password: Admin@123)
INSERT INTO users (user_id, gym_id, username, email, password_hash, first_name, last_name, phone, user_type, is_active)
VALUES (1, 1, 'admin', 'admin@fitlife.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Gq1CZBYowG5qCZBYowG5qCZBYowG5qCZ', 'System', 'Administrator', '+91-9876543210', 'OWNER', 'Y');

-- Branches
INSERT INTO gym_branches (branch_id, gym_id, branch_name, branch_code, city, phone, email, opening_time, closing_time, is_active)
VALUES (branch_seq.NEXTVAL, 1, 'FitLife Bandra', 'FLBND001', 'Mumbai', '+91-22-26401234', 'bandra@fitlife.com', '06:00', '22:00', 'Y');

INSERT INTO gym_branches (branch_id, gym_id, branch_name, branch_code, city, phone, email, opening_time, closing_time, is_active)
VALUES (branch_seq.NEXTVAL, 1, 'FitLife Powai', 'FLPWR001', 'Mumbai', '+91-22-27654321', 'powai@fitlife.com', '05:30', '23:00', 'Y');

-- Membership Plans
INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, features, is_active)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN001', 'Basic Plan', 'INDIVIDUAL', 30, 999, 18, 1178.82, 0, 'N', '{"memberManagement":true,"qrCheckin":true}', 'Y');

INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, features, is_active)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN002', 'Professional Plan', 'INDIVIDUAL', 90, 2499, 18, 2948.82, 2, 'Y', '{"memberManagement":true,"qrCheckin":true,"personalTraining":true,"groupClasses":true}', 'Y');

INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, features, is_active)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN003', 'Business Plan', 'INDIVIDUAL', 180, 4999, 18, 5898.82, 4, 'Y', '{"memberManagement":true,"qrCheckin":true,"personalTraining":true,"groupClasses":true,"prioritySupport":true}', 'Y');

INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, features, is_active)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN004', 'Enterprise Plan', 'INDIVIDUAL', 365, 9999, 18, 11798.82, 12, 'Y', '{"memberManagement":true,"qrCheckin":true,"personalTraining":true,"groupClasses":true,"prioritySupport":true}', 'Y');

-- Equipment Categories
INSERT INTO equipment_categories (category_id, gym_id, category_name, category_code, is_active)
VALUES (cat_seq.NEXTVAL, 1, 'Cardio Equipment', 'CARDIO', 'Y');

INSERT INTO equipment_categories (category_id, gym_id, category_name, category_code, is_active)
VALUES (cat_seq.NEXTVAL, 1, 'Strength Training', 'STRENGTH', 'Y');

INSERT INTO equipment_categories (category_id, gym_id, category_name, category_code, is_active)
VALUES (cat_seq.NEXTVAL, 1, 'Free Weights', 'FREEWEIGHTS', 'Y');

-- Equipment
INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, serial_number, purchase_date, purchase_amount, location, status, condition_status, is_active)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ001', 'Treadmill Pro 5000', 1, 'Life Fitness', 'LF20240001', TO_DATE('2024-01-15', 'YYYY-MM-DD'), 250000, 'Cardio Zone - Bandra', 'ACTIVE', 'EXCELLENT', 'Y');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, serial_number, purchase_date, purchase_amount, location, status, condition_status, is_active)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ002', 'Elliptical Cross Trainer', 1, 'Precor', 'PC20240002', TO_DATE('2024-02-20', 'YYYY-MM-DD'), 180000, 'Cardio Zone - Bandra', 'ACTIVE', 'GOOD', 'Y');

INSERT INTO equipment (equipment_id, gym_id, equipment_code, equipment_name, category_id, brand_name, serial_number, purchase_date, purchase_amount, location, status, condition_status, is_active)
VALUES (equipment_seq.NEXTVAL, 1, 'EQ003', 'Dumbbell Set 5-50kg', 3, 'York', 'YK2024015', TO_DATE('2024-01-20', 'YYYY-MM-DD'), 85000, 'Free Weights Area - Powai', 'ACTIVE', 'EXCELLENT', 'Y');

-- Group Classes
INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, trainer_id, room_name, is_active)
VALUES (class_seq.NEXTVAL, 1, 'Morning Yoga Flow', 'YOGA001', 'Energizing yoga flows to start your day', 'Yoga', 'ALL_LEVELS', 60, NULL, 'Studio 1', 'Y');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, trainer_id, room_name, is_active)
VALUES (class_seq.NEXTVAL, 1, 'HIIT Circuit', 'HIIT001', 'High-intensity interval training', 'CrossFit', 'INTERMEDIATE', 45, NULL, 'Floor 2', 'Y');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, trainer_id, room_name, is_active)
VALUES (class_seq.NEXTVAL, 1, 'Zumba Dance Party', 'ZUMBA001', 'Dance fitness fun', 'Dance', 'BEGINNER', 60, NULL, 'Studio 2', 'Y');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, trainer_id, room_name, is_active)
VALUES (class_seq.NEXTVAL, 1, 'Strength Training 101', 'STR001', 'Weight training basics', 'Strength', 'BEGINNER', 60, NULL, 'Floor 2', 'Y');

INSERT INTO group_classes (class_id, gym_id, class_name, class_code, description, category, difficulty_level, duration_minutes, trainer_id, room_name, is_active)
VALUES (class_seq.NEXTVAL, 1, 'Pilates Core', 'PILATES001', 'Core strengthening and flexibility', 'Pilates', 'INTERMEDIATE', 55, NULL, 'Studio 1', 'Y');

-- Sample Members
INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, membership_status, membership_start_date, membership_end_date, is_active)
VALUES (member_seq.NEXTVAL, 1, 'Amit', 'Shah', 'amit.shah@email.com', '+91-9876511111', TO_DATE('1990-05-15', 'YYYY-MM-DD'), 'Male', 'ACTIVE', TO_DATE('2025-01-01', 'YYYY-MM-DD'), TO_DATE('2026-01-01', 'YYYY-MM-DD'), 'Y');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, membership_status, membership_start_date, membership_end_date, is_active)
VALUES (member_seq.NEXTVAL, 1, 'Pooja', 'Kapoor', 'pooja.kapoor@email.com', '+91-9876522222', TO_DATE('1992-08-22', 'YYYY-MM-DD'), 'Female', 'ACTIVE', TO_DATE('2025-02-01', 'YYYY-MM-DD'), TO_DATE('2025-08-01', 'YYYY-MM-DD'), 'Y');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, membership_status, membership_start_date, membership_end_date, is_active)
VALUES (member_seq.NEXTVAL, 1, 'Vikram', 'Mehta', 'vikram.mehta@email.com', '+91-9876533333', TO_DATE('1988-03-10', 'YYYY-MM-DD'), 'Male', 'ACTIVE', TO_DATE('2025-01-20', 'YYYY-MM-DD'), TO_DATE('2026-01-20', 'YYYY-MM-DD'), 'Y');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, membership_status, membership_start_date, membership_end_date, is_active)
VALUES (member_seq.NEXTVAL, 1, 'Sneha', 'Patel', 'sneha.patel@email.com', '+91-9876544444', TO_DATE('1995-11-30', 'YYYY-MM-DD'), 'Female', 'ACTIVE', TO_DATE('2025-03-01', 'YYYY-MM-DD'), TO_DATE('2026-03-01', 'YYYY-MM-DD'), 'Y');

INSERT INTO members (member_id, gym_id, first_name, last_name, email, phone, date_of_birth, gender, membership_status, membership_start_date, membership_end_date, is_active)
VALUES (member_seq.NEXTVAL, 1, 'Rahul', 'Singh', 'rahul.singh@email.com', '+91-9876555555', TO_DATE('1991-07-18', 'YYYY-MM-DD'), 'Male', 'INACTIVE', TO_DATE('2024-06-01', 'YYYY-MM-DD'), TO_DATE('2025-06-01', 'YYYY-MM-DD'), 'Y');

COMMIT;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================