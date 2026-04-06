-- ============================================================================
-- GYM MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Oracle SQL Developer Script
-- Multi-Tenant Architecture Support (Shared DB & Separate DB Models)
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- SECTION 0: CLEANUP EXISTING OBJECTS
-- ============================================================================

-- Drop all tables first (in reverse FK order)
BEGIN
    FOR rec IN (SELECT table_name FROM user_tables) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || rec.table_name || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Drop all sequences
BEGIN
    FOR rec IN (SELECT sequence_name FROM user_sequences) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || rec.sequence_name;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Drop all views
BEGIN
    FOR rec IN (SELECT view_name FROM user_views) LOOP
        EXECUTE IMMEDIATE 'DROP VIEW ' || rec.view_name;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Drop all procedures
BEGIN
    FOR rec IN (SELECT object_name FROM user_procedures WHERE object_type = 'PROCEDURE') LOOP
        EXECUTE IMMEDIATE 'DROP PROCEDURE ' || rec.object_name;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Drop all triggers
BEGIN
    FOR rec IN (SELECT trigger_name FROM user_triggers) LOOP
        EXECUTE IMMEDIATE 'DROP TRIGGER ' || rec.trigger_name;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

COMMIT;

-- ============================================================================
-- SECTION 1: SEQUENCES
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
CREATE SEQUENCE arch_seq START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ============================================================================
-- SECTION 2: CORE TABLES - TENANT MANAGEMENT
-- ============================================================================

CREATE TABLE tenants (
    tenant_id NUMBER DEFAULT 1 PRIMARY KEY,
    tenant_code VARCHAR2(50) NOT NULL UNIQUE,
    tenant_name VARCHAR2(200) NOT NULL,
    database_name VARCHAR2(100),
    domain VARCHAR2(200),
    contact_email VARCHAR2(200) NOT NULL,
    contact_phone VARCHAR2(20),
    address CLOB,
    city VARCHAR2(100),
    state VARCHAR2(100),
    country VARCHAR2(100) DEFAULT 'India',
    postal_code VARCHAR2(20),
    logo_url VARCHAR2(500),
    timezone VARCHAR2(50) DEFAULT 'Asia/Kolkata',
    currency VARCHAR2(3) DEFAULT 'INR',
    language VARCHAR2(10) DEFAULT 'en',
    is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
    is_trial CHAR(1) DEFAULT 'N' CHECK (is_trial IN ('Y', 'N')),
    trial_ends_at DATE,
    subscription_tier VARCHAR2(50),
    max_members NUMBER DEFAULT 100,
    max_staff NUMBER DEFAULT 20,
    max_trainers NUMBER DEFAULT 10,
    storage_limit_mb NUMBER DEFAULT 1024,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_tenant_code UNIQUE (tenant_code),
    CONSTRAINT uk_tenant_email UNIQUE (contact_email)
);

COMMENT ON TABLE tenants IS 'Multi-tenant support - one record per gym operator';
COMMENT ON COLUMN tenants.tenant_id IS 'Primary key and tenant identifier for shared DB model';

-- ============================================================================
-- SECTION 3: USER AND AUTHENTICATION TABLES
-- ============================================================================

CREATE TABLE users (
    user_id NUMBER DEFAULT onekey_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    username VARCHAR2(100) NOT NULL,
    email VARCHAR2(200) NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100),
    phone VARCHAR2(20),
    profile_image_url VARCHAR2(500),
    user_type VARCHAR2(50) NOT NULL CHECK (user_type IN ('OWNER', 'ADMIN', 'STAFF', 'TRAINER', 'MEMBER')),
    is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
    email_verified CHAR(1) DEFAULT 'N' CHECK (email_verified IN ('Y', 'N')),
    phone_verified CHAR(1) DEFAULT 'N' CHECK (phone_verified IN ('Y', 'N')),
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR2(45),
    password_changed_at TIMESTAMP,
    failed_login_attempts NUMBER DEFAULT 0,
    locked_until TIMESTAMP,
    mfa_enabled CHAR(1) DEFAULT 'N' CHECK (mfa_enabled IN ('Y', 'N')),
    mfa_secret VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_users_username UNIQUE (gym_id, username),
    CONSTRAINT uk_users_email UNIQUE (gym_id, email)
);

CREATE INDEX idx_users_gym ON users(gym_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);

CREATE TABLE user_roles (
    role_id NUMBER DEFAULT role_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    role_name VARCHAR2(50) NOT NULL,
    role_code VARCHAR2(50) NOT NULL,
    description VARCHAR2(500),
    permissions CLOB,
    is_system_role CHAR(1) DEFAULT 'N' CHECK (is_system_role IN ('Y', 'N')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_roles_gym_code UNIQUE (gym_id, role_code)
);

CREATE INDEX idx_roles_gym ON user_roles(gym_id);

CREATE TABLE user_role_assignments (
    assignment_id NUMBER DEFAULT assignment_seq.NEXTVAL PRIMARY KEY,
    user_id NUMBER NOT NULL,
    role_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR2(100),
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

-- ============================================================================
-- SECTION 4: GYM PROFILE TABLES
-- ============================================================================

CREATE TABLE gym_profiles (
    gym_id NUMBER DEFAULT gym_seq.NEXTVAL PRIMARY KEY,
    gym_name VARCHAR2(200) NOT NULL,
    gym_code VARCHAR2(50),
    owner_user_id NUMBER NOT NULL,
    address CLOB,
    street_address VARCHAR2(300),
    city VARCHAR2(100),
    state VARCHAR2(100),
    country VARCHAR2(100) DEFAULT 'India',
    postal_code VARCHAR2(20),
    phone VARCHAR2(20),
    email VARCHAR2(200),
    website VARCHAR2(200),
    logo_url VARCHAR2(500),
    opening_time VARCHAR2(10) DEFAULT '06:00',
    closing_time VARCHAR2(10) DEFAULT '22:00',
    timezone VARCHAR2(50) DEFAULT 'Asia/Kolkata',
    is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
    total_members NUMBER DEFAULT 0,
    total_staff NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100)
);

CREATE INDEX idx_gym_code ON gym_profiles(gym_code);

CREATE TABLE gym_branches (
    branch_id NUMBER DEFAULT branch_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_name VARCHAR2(200) NOT NULL,
    branch_code VARCHAR2(50),
    address CLOB,
    city VARCHAR2(100),
    state VARCHAR2(100),
    postal_code VARCHAR2(20),
    phone VARCHAR2(20),
    email VARCHAR2(200),
    manager_user_id NUMBER,
    opening_time VARCHAR2(10),
    closing_time VARCHAR2(10),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_gym ON gym_branches(gym_id);

-- ============================================================================
-- SECTION 5: MEMBERS TABLE
-- ============================================================================

CREATE TABLE members (
    member_id NUMBER DEFAULT member_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    member_code VARCHAR2(50),
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100),
    email VARCHAR2(200),
    phone VARCHAR2(20) NOT NULL,
    alternate_phone VARCHAR2(20),
    date_of_birth DATE,
    gender VARCHAR2(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    blood_group VARCHAR2(10),
    emergency_contact_name VARCHAR2(200),
    emergency_contact_phone VARCHAR2(20),
    emergency_contact_relation VARCHAR2(50),
    profile_image_url VARCHAR2(500),
    address CLOB,
    referred_by_member_id NUMBER,
    source VARCHAR2(50) CHECK (source IN ('Walk-in', 'Referral', 'Social Media', 'Google', 'Campaign', 'Other')),
    membership_id NUMBER,
    membership_status VARCHAR2(50) DEFAULT 'INACTIVE' CHECK (membership_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED')),
    membership_start_date DATE,
    membership_end_date DATE,
    freeze_start_date DATE,
    freeze_end_date DATE,
    is_freezed CHAR(1) DEFAULT 'N',
    qr_code VARCHAR2(255),
    is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
    deactivation_reason VARCHAR2(500),
    deactivation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_member_code UNIQUE (gym_id, member_code)
);

CREATE INDEX idx_members_gym ON members(gym_id);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_status ON members(membership_status);

-- Member documents
CREATE TABLE member_documents (
    document_id NUMBER DEFAULT doc_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    document_type VARCHAR2(50) NOT NULL CHECK (document_type IN ('ID_PROOF', 'ADDRESS_PROOF', 'MEDICAL_CERT', 'PHOTO', 'OTHER')),
    document_name VARCHAR2(200) NOT NULL,
    document_number VARCHAR2(100),
    document_url VARCHAR2(500) NOT NULL,
    expiry_date DATE,
    is_verified CHAR(1) DEFAULT 'N',
    verified_by VARCHAR2(100),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_docs_member ON member_documents(member_id);

-- Member health metrics
CREATE TABLE member_health_metrics (
    metric_id NUMBER DEFAULT health_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    record_date DATE NOT NULL,
    weight_kg NUMBER(5, 2),
    height_cm NUMBER(5, 2),
    bmi NUMBER(4, 2),
    body_fat_percentage NUMBER(4, 2),
    blood_pressure_systolic NUMBER(3),
    blood_pressure_diastolic NUMBER(3),
    notes CLOB,
    recorded_by NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_member ON member_health_metrics(member_id);
CREATE INDEX idx_health_date ON member_health_metrics(record_date);

-- ============================================================================
-- SECTION 6: MEMBERSHIP PLANS
-- ============================================================================

CREATE TABLE membership_plans (
    plan_id NUMBER DEFAULT membership_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    plan_code VARCHAR2(50) NOT NULL,
    plan_name VARCHAR2(200) NOT NULL,
    plan_type VARCHAR2(50) CHECK (plan_type IN ('INDIVIDUAL', 'COUPLE', 'FAMILY', 'CORPORATE', 'STUDENT')),
    duration_days NUMBER NOT NULL,
    plan_amount NUMBER(12, 2) NOT NULL,
    tax_percentage NUMBER(5, 2) DEFAULT 18,
    tax_amount NUMBER(12, 2),
    total_amount NUMBER(12, 2) NOT NULL,
    admission_fee NUMBER(12, 2) DEFAULT 0,
    security_deposit NUMBER(12, 2) DEFAULT 0,
    personal_training_sessions NUMBER DEFAULT 0,
    group_class_access CHAR(1) DEFAULT 'N',
    is_freeze_allowed CHAR(1) DEFAULT 'Y',
    max_freeze_days NUMBER DEFAULT 0,
    description CLOB,
    features CLOB,
    is_active CHAR(1) DEFAULT 'Y',
    is_featured CHAR(1) DEFAULT 'N',
    display_order NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_plan_code UNIQUE (gym_id, plan_code)
);

CREATE INDEX idx_plans_gym ON membership_plans(gym_id);
CREATE INDEX idx_plans_active ON membership_plans(is_active);

CREATE TABLE plan_pricing_tiers (
    tier_id NUMBER DEFAULT tier_seq.NEXTVAL PRIMARY KEY,
    plan_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    billing_cycle VARCHAR2(20) NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'QUARTERLY', 'HALFYEARLY', 'YEARLY', 'LIFETIME')),
    duration_days NUMBER NOT NULL,
    price_amount NUMBER(12, 2) NOT NULL,
    discount_percentage NUMBER(5, 2) DEFAULT 0,
    final_amount NUMBER(12, 2) NOT NULL,
    tax_percentage NUMBER(5, 2) DEFAULT 18,
    total_amount NUMBER(12, 2) NOT NULL,
    is_default CHAR(1) DEFAULT 'N',
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tiers_plan ON plan_pricing_tiers(plan_id);

-- ============================================================================
-- SECTION 7: CHECK-IN/OUT TRACKING
-- ============================================================================

CREATE TABLE checkin_records (
    checkin_id NUMBER DEFAULT checkin_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    member_id NUMBER NOT NULL,
    membership_id NUMBER,
    checkin_time TIMESTAMP NOT NULL,
    checkout_time TIMESTAMP,
    checkin_method VARCHAR2(50) DEFAULT 'QR_CODE' CHECK (checkin_method IN ('QR_CODE', 'MANUAL', 'FACE_RECOGNITION', 'RFID', 'APP')),
    device_id VARCHAR2(100),
    staff_id NUMBER,
    notes CLOB,
    workout_duration_minutes NUMBER,
    calories_burned NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checkin_gym ON checkin_records(gym_id);
CREATE INDEX idx_checkin_member ON checkin_records(member_id);
CREATE INDEX idx_checkin_time ON checkin_records(checkin_time);
CREATE INDEX idx_checkin_unfinished ON checkin_records(checkout_time);

CREATE TABLE daily_attendance (
    attendance_id NUMBER DEFAULT attendance_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    attendance_date DATE NOT NULL,
    total_checkins NUMBER DEFAULT 0,
    total_checkouts NUMBER DEFAULT 0,
    peak_hour NUMBER,
    peak_count NUMBER,
    new_members NUMBER DEFAULT 0,
    returning_members NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (gym_id, attendance_date)
);

CREATE INDEX idx_attendance_date ON daily_attendance(attendance_date);

-- ============================================================================
-- SECTION 8: EQUIPMENT MANAGEMENT
-- ============================================================================

CREATE TABLE equipment_categories (
    category_id NUMBER DEFAULT cat_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER,
    category_name VARCHAR2(100) NOT NULL,
    category_code VARCHAR2(50),
    description VARCHAR2(500),
    parent_category_id NUMBER,
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
    equipment_id NUMBER DEFAULT equipment_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    equipment_code VARCHAR2(50),
    equipment_name VARCHAR2(200) NOT NULL,
    category_id NUMBER,
    brand_name VARCHAR2(100),
    model_name VARCHAR2(100),
    serial_number VARCHAR2(100),
    supplier_name VARCHAR2(200),
    purchase_date DATE,
    purchase_amount NUMBER(12, 2),
    warranty_expiry_date DATE,
    location VARCHAR2(200),
    status VARCHAR2(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'REPAIR', 'RETIRED', 'SOLD', 'SCRAPPED')),
    condition_status VARCHAR2(50) DEFAULT 'GOOD' CHECK (condition_status IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    operational_status CHAR(1) DEFAULT 'Y',
    last_service_date DATE,
    next_service_date DATE,
    notes CLOB,
    qr_code VARCHAR2(255),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_equipment_code UNIQUE (gym_id, equipment_code)
);

CREATE INDEX idx_equipment_gym ON equipment(gym_id);
CREATE INDEX idx_equipment_status ON equipment(status);

CREATE TABLE equipment_maintenance (
    maintenance_id NUMBER DEFAULT maint_seq.NEXTVAL PRIMARY KEY,
    equipment_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    maintenance_type VARCHAR2(50) CHECK (maintenance_type IN ('SERVICE', 'REPAIR', 'INSPECTION', 'CALIBRATION', 'CLEANING')),
    description CLOB NOT NULL,
    maintenance_date DATE NOT NULL,
    performed_by VARCHAR2(200),
    cost NUMBER(12, 2) DEFAULT 0,
    next_maintenance_date DATE,
    completion_status VARCHAR2(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100)
);

CREATE INDEX idx_maint_equipment ON equipment_maintenance(equipment_id);
CREATE INDEX idx_maint_date ON equipment_maintenance(maintenance_date);

-- ============================================================================
-- SECTION 9: STAFF MANAGEMENT
-- ============================================================================

CREATE TABLE staff (
    staff_id NUMBER DEFAULT staff_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    user_id NUMBER,
    staff_code VARCHAR2(50),
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100),
    email VARCHAR2(200),
    phone VARCHAR2(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR2(20),
    profile_image_url VARCHAR2(500),
    address CLOB,
    designation VARCHAR2(100),
    department VARCHAR2(100),
    role VARCHAR2(100) CHECK (role IN ('RECEPTIONIST', 'TRAINER', 'MANAGER', 'ADMIN', 'JANITOR', 'SECURITY', 'ACCOUNTANT', 'OTHER')),
    joining_date DATE,
    termination_date DATE,
    employment_type VARCHAR2(50) CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')),
    salary_amount NUMBER(12, 2),
    salary_type VARCHAR2(50),
    is_active CHAR(1) DEFAULT 'Y',
    termination_reason VARCHAR2(500),
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_staff_code UNIQUE (gym_id, staff_code)
);

CREATE INDEX idx_staff_gym ON staff(gym_id);
CREATE INDEX idx_staff_role ON staff(role);

CREATE TABLE staff_attendance (
    attendance_id NUMBER DEFAULT staff_att_seq.NEXTVAL PRIMARY KEY,
    staff_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    attendance_date DATE NOT NULL,
    checkin_time TIMESTAMP,
    checkout_time TIMESTAMP,
    work_hours NUMBER(5, 2),
    overtime_hours NUMBER(5, 2),
    status VARCHAR2(50) DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'OFF')),
    leave_type VARCHAR2(50),
    approved_by NUMBER,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_att_staff ON staff_attendance(staff_id);
CREATE INDEX idx_staff_att_date ON staff_attendance(attendance_date);

CREATE TABLE staff_payroll (
    payroll_id NUMBER DEFAULT payroll_seq.NEXTVAL PRIMARY KEY,
    staff_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    payroll_month DATE NOT NULL,
    basic_salary NUMBER(12, 2) NOT NULL,
    hra_amount NUMBER(12, 2) DEFAULT 0,
    conveyance_allowance NUMBER(12, 2) DEFAULT 0,
    other_allowances NUMBER(12, 2) DEFAULT 0,
    total_earnings NUMBER(12, 2) NOT NULL,
    pf_deduction NUMBER(12, 2) DEFAULT 0,
    esi_deduction NUMBER(12, 2) DEFAULT 0,
    tds_deduction NUMBER(12, 2) DEFAULT 0,
    total_deductions NUMBER(12, 2) DEFAULT 0,
    net_salary NUMBER(12, 2) NOT NULL,
    working_days NUMBER DEFAULT 0,
    present_days NUMBER DEFAULT 0,
    payment_date DATE,
    payment_mode VARCHAR2(50),
    payment_status VARCHAR2(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED')),
    remarks CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payroll_staff ON staff_payroll(staff_id);
CREATE INDEX idx_payroll_month ON staff_payroll(payroll_month);

-- ============================================================================
-- SECTION 10: BILLING AND PAYMENTS
-- ============================================================================

CREATE TABLE member_memberships (
    membership_id NUMBER DEFAULT mm_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    plan_id NUMBER NOT NULL,
    branch_id NUMBER,
    membership_code VARCHAR2(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    billing_cycle VARCHAR2(20) DEFAULT 'MONTHLY',
    plan_amount NUMBER(12, 2) NOT NULL,
    tax_percentage NUMBER(5, 2) DEFAULT 18,
    tax_amount NUMBER(12, 2),
    total_amount NUMBER(12, 2) NOT NULL,
    amount_paid NUMBER(12, 2) DEFAULT 0,
    amount_due NUMBER(12, 2) DEFAULT 0,
    discount_amount NUMBER(12, 2) DEFAULT 0,
    admission_fee NUMBER(12, 2) DEFAULT 0,
    security_deposit NUMBER(12, 2) DEFAULT 0,
    security_deposit_status VARCHAR2(50) DEFAULT 'PENDING',
    payment_status VARCHAR2(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED')),
    status VARCHAR2(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED', 'COMPLETED')),
    auto_renew CHAR(1) DEFAULT 'N',
    freeze_allowed CHAR(1) DEFAULT 'N',
    freeze_start_date DATE,
    freeze_end_date DATE,
    freeze_days NUMBER DEFAULT 0,
    trainer_id NUMBER,
    notes CLOB,
    cancellation_reason VARCHAR2(500),
    upgraded_to_membership_id NUMBER,
    renewal_count NUMBER DEFAULT 0,
    last_renewal_date DATE,
    next_renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_membership_code UNIQUE (gym_id, membership_code)
);

CREATE INDEX idx_mm_gym ON member_memberships(gym_id);
CREATE INDEX idx_mm_member ON member_memberships(member_id);
CREATE INDEX idx_mm_plan ON member_memberships(plan_id);
CREATE INDEX idx_mm_status ON member_memberships(status);
CREATE INDEX idx_mm_next_renewal ON member_memberships(next_renewal_date);

CREATE TABLE payment_transactions (
    transaction_id NUMBER DEFAULT transaction_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER,
    membership_id NUMBER,
    invoice_id NUMBER,
    transaction_code VARCHAR2(50) NOT NULL,
    transaction_type VARCHAR2(50) NOT NULL CHECK (transaction_type IN ('MEMBERSHIP_FEE', 'RENEWAL', 'UPGRADE', 'PT_SESSION', 'CLASS_FEE', 'PRODUCT_SALE', 'REGISTRATION', 'FREEZE_FEE', 'OTHER')),
    payment_mode VARCHAR2(50) NOT NULL CHECK (payment_mode IN ('CASH', 'CARD', 'UPI', 'NETBANKING', 'WALLET', 'CHEQUE', 'DD', 'BANK_TRANSFER', 'QR_CODE')),
    transaction_date TIMESTAMP NOT NULL,
    amount NUMBER(12, 2) NOT NULL,
    tax_percentage NUMBER(5, 2) DEFAULT 18,
    tax_amount NUMBER(12, 2) DEFAULT 0,
    total_amount NUMBER(12, 2) NOT NULL,
    discount_amount NUMBER(12, 2) DEFAULT 0,
    amount_received NUMBER(12, 2) NOT NULL,
    amount_change NUMBER(12, 2) DEFAULT 0,
    gateway_name VARCHAR2(50),
    gateway_transaction_id VARCHAR2(100),
    transaction_status VARCHAR2(50) DEFAULT 'SUCCESS' CHECK (transaction_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED')),
    receipt_number VARCHAR2(50),
    notes CLOB,
    is_reversed CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_transaction_code UNIQUE (gym_id, transaction_code)
);

CREATE INDEX idx_txn_gym ON payment_transactions(gym_id);
CREATE INDEX idx_txn_member ON payment_transactions(member_id);
CREATE INDEX idx_txn_status ON payment_transactions(transaction_status);
CREATE INDEX idx_txn_date ON payment_transactions(transaction_date);

CREATE TABLE invoices (
    invoice_id NUMBER DEFAULT invoice_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER,
    membership_id NUMBER,
    invoice_number VARCHAR2(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal NUMBER(12, 2) NOT NULL,
    tax_percentage NUMBER(5, 2) DEFAULT 18,
    tax_amount NUMBER(12, 2) DEFAULT 0,
    discount_percentage NUMBER(5, 2) DEFAULT 0,
    discount_amount NUMBER(12, 2) DEFAULT 0,
    total_amount NUMBER(12, 2) NOT NULL,
    amount_paid NUMBER(12, 2) DEFAULT 0,
    amount_due NUMBER(12, 2) DEFAULT 0,
    payment_status VARCHAR2(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID')),
    status VARCHAR2(50) DEFAULT 'ISSUE' CHECK (status IN ('DRAFT', 'ISSUE', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID')),
    billing_name VARCHAR2(200),
    billing_address CLOB,
    billing_gst VARCHAR2(20),
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    CONSTRAINT uk_invoice_number UNIQUE (gym_id, invoice_number)
);

CREATE INDEX idx_inv_gym ON invoices(gym_id);
CREATE INDEX idx_inv_member ON invoices(member_id);
CREATE INDEX idx_inv_date ON invoices(invoice_date);

-- ============================================================================
-- SECTION 11: GROUP CLASSES AND SCHEDULES
-- ============================================================================

CREATE TABLE group_classes (
    class_id NUMBER DEFAULT class_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    class_name VARCHAR2(200) NOT NULL,
    class_code VARCHAR2(50),
    description CLOB,
    category VARCHAR2(100),
    difficulty_level VARCHAR2(20) CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS')),
    duration_minutes NUMBER DEFAULT 60,
    max_participants NUMBER DEFAULT 20,
    current_participants NUMBER DEFAULT 0,
    trainer_id NUMBER,
    room_name VARCHAR2(100),
    is_active CHAR(1) DEFAULT 'Y',
    is_featured CHAR(1) DEFAULT 'N',
    icon VARCHAR2(50),
    color VARCHAR2(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100)
);

CREATE INDEX idx_classes_gym ON group_classes(gym_id);
CREATE INDEX idx_classes_trainer ON group_classes(trainer_id);

CREATE TABLE class_schedules (
    schedule_id NUMBER DEFAULT schedule_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    class_id NUMBER NOT NULL,
    trainer_id NUMBER,
    day_of_week NUMBER CHECK (day_of_week BETWEEN 0 AND 6),
    start_time VARCHAR2(10) NOT NULL,
    end_time VARCHAR2(10) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_recurring CHAR(1) DEFAULT 'Y',
    room_name VARCHAR2(100),
    max_bookings NUMBER,
    current_bookings NUMBER DEFAULT 0,
    is_cancelled CHAR(1) DEFAULT 'N',
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedule_gym ON class_schedules(gym_id);
CREATE INDEX idx_schedule_class ON class_schedules(class_id);
CREATE INDEX idx_schedule_trainer ON class_schedules(trainer_id);

CREATE TABLE class_bookings (
    booking_id NUMBER DEFAULT booking_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    schedule_id NUMBER NOT NULL,
    class_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR2(50) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'WAITLISTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')),
    checkin_time TIMESTAMP,
    amount_charged NUMBER(12, 2) DEFAULT 0,
    cancellation_reason VARCHAR2(500),
    waitlist_position NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_gym ON class_bookings(gym_id);
CREATE INDEX idx_booking_schedule ON class_bookings(schedule_id);
CREATE INDEX idx_booking_member ON class_bookings(member_id);
CREATE INDEX idx_booking_date ON class_bookings(booking_date);

-- ============================================================================
-- SECTION 12: PERSONAL TRAINING
-- ============================================================================

CREATE TABLE pt_assignments (
    assignment_id NUMBER DEFAULT pt_assign_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    trainer_id NUMBER NOT NULL,
    assignment_code VARCHAR2(50),
    assignment_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    session_count NUMBER NOT NULL,
    sessions_remaining NUMBER NOT NULL,
    session_price NUMBER(12, 2) NOT NULL,
    total_amount NUMBER(12, 2) NOT NULL,
    amount_paid NUMBER(12, 2) DEFAULT 0,
    amount_due NUMBER(12, 2) DEFAULT 0,
    payment_status VARCHAR2(50) DEFAULT 'PENDING',
    status VARCHAR2(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
    goals CLOB,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100)
);

CREATE INDEX idx_pt_gym ON pt_assignments(gym_id);
CREATE INDEX idx_pt_member ON pt_assignments(member_id);
CREATE INDEX idx_pt_trainer ON pt_assignments(trainer_id);

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
    workout_type VARCHAR2(100),
    exercises_performed CLOB,
    trainer_notes CLOB,
    member_feedback VARCHAR2(500),
    rating NUMBER(1),
    session_status VARCHAR2(50) DEFAULT 'SCHEDULED' CHECK (session_status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    is_paid CHAR(1) DEFAULT 'N',
    amount_charged NUMBER(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pts_gym ON pt_sessions(gym_id);
CREATE INDEX idx_pts_assignment ON pt_sessions(assignment_id);
CREATE INDEX idx_pts_date ON pt_sessions(session_date);

-- ============================================================================
-- SECTION 13: FINANCIAL TRANSACTIONS (Unified)
-- ============================================================================

CREATE TABLE financial_transactions (
    transaction_id NUMBER DEFAULT fin_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    branch_id NUMBER,
    transaction_type VARCHAR2(20) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE')),
    category VARCHAR2(100) NOT NULL,
    amount NUMBER(12, 2) NOT NULL,
    currency VARCHAR2(3) DEFAULT 'INR',
    amount_in_base_currency NUMBER(12, 2),
    exchange_rate NUMBER(15, 10) DEFAULT 1,
    transaction_date DATE NOT NULL,
    description VARCHAR2(500),
    reference_number VARCHAR2(100),
    payment_method VARCHAR2(50),
    gateway_transaction_id VARCHAR2(255),
    gateway_name VARCHAR2(50),
    receipt_url VARCHAR2(500),
    member_id NUMBER,
    membership_id NUMBER,
    invoice_id NUMBER,
    expense_category VARCHAR2(100),
    expense_type VARCHAR2(50) CHECK (expense_type IN ('OPERATIONAL', 'CAPITAL', 'RECURRING', 'ONE_TIME')),
    vendor_name VARCHAR2(200),
    tax_percentage NUMBER(5, 2) DEFAULT 0,
    tax_amount NUMBER(12, 2) DEFAULT 0,
    total_amount NUMBER(12, 2),
    status VARCHAR2(50) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')),
    is_recurring CHAR(1) DEFAULT 'N',
    recurring_schedule_id NUMBER,
    created_by VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_gym ON financial_transactions(gym_id);
CREATE INDEX idx_fin_type ON financial_transactions(transaction_type);
CREATE INDEX idx_fin_category ON financial_transactions(category);
CREATE INDEX idx_fin_date ON financial_transactions(transaction_date);
CREATE INDEX idx_fin_member ON financial_transactions(member_id);

-- ============================================================================
-- SECTION 14: AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
    audit_id NUMBER DEFAULT audit_log_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    user_id NUMBER,
    username VARCHAR2(100),
    action VARCHAR2(100) NOT NULL,
    entity_type VARCHAR2(100) NOT NULL,
    entity_id VARCHAR2(100),
    old_value CLOB,
    new_value CLOB,
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    device_info VARCHAR2(200),
    session_id VARCHAR2(100),
    error_message CLOB,
    execution_time_ms NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_gym ON audit_logs(gym_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- ============================================================================
-- SECTION 15: NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    notification_id NUMBER DEFAULT notification_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    notification_type VARCHAR2(50) NOT NULL CHECK (notification_type IN ('MEMBERSHIP_EXPIRY', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'CHECKIN_REMINDER', 'CLASS_REMINDER', 'PT_SESSION_REMINDER', 'BIRTHDAY', 'RENEWAL_REMINDER', 'SYSTEM', 'MARKETING')),
    title VARCHAR2(200) NOT NULL,
    message CLOB NOT NULL,
    priority VARCHAR2(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    channel VARCHAR2(50) DEFAULT 'BOTH' CHECK (channel IN ('PUSH', 'EMAIL', 'SMS', 'BOTH')),
    status VARCHAR2(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED')),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    action_url VARCHAR2(500),
    metadata CLOB,
    failure_reason VARCHAR2(500),
    retry_count NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_gym ON notifications(gym_id);
CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_status ON notifications(status);

-- ============================================================================
-- SECTION 16: FOREIGN KEY CONSTRAINTS
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
-- SECTION 17: TRIGGERS
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_member_code
BEFORE INSERT ON members
FOR EACH ROW
DECLARE
    v_member_count NUMBER;
BEGIN
    IF :NEW.member_code IS NULL THEN
        SELECT COUNT(*) + 1 INTO v_member_count FROM members WHERE gym_id = :NEW.gym_id;
        :NEW.member_code := 'MBR-' || TO_CHAR(SYSDATE, 'YYYY') || '-' || LPAD(v_member_count, 6, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_membership_code
BEFORE INSERT ON member_memberships
FOR EACH ROW
DECLARE
    v_membership_count NUMBER;
BEGIN
    IF :NEW.membership_code IS NULL THEN
        SELECT COUNT(*) + 1 INTO v_membership_count FROM member_memberships WHERE gym_id = :NEW.gym_id;
        :NEW.membership_code := 'MEM-' || TO_CHAR(SYSDATE, 'YYYY') || '-' || LPAD(v_membership_count, 6, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_transaction_code
BEFORE INSERT ON payment_transactions
FOR EACH ROW
DECLARE
    v_txn_count NUMBER;
BEGIN
    IF :NEW.transaction_code IS NULL THEN
        SELECT COUNT(*) + 1 INTO v_txn_count FROM payment_transactions WHERE gym_id = :NEW.gym_id;
        :NEW.transaction_code := 'TXN-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(v_txn_count, 8, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
DECLARE
    v_year VARCHAR2(4);
    v_count NUMBER;
BEGIN
    IF :NEW.invoice_number IS NULL THEN
        v_year := TO_CHAR(SYSDATE, 'YYYY');
        SELECT COUNT(*) + 1 INTO v_count
        FROM invoices
        WHERE gym_id = :NEW.gym_id
        AND TO_CHAR(invoice_date, 'YYYY') = v_year;
        :NEW.invoice_number := 'INV-' || v_year || '-' || LPAD(v_count, 6, '0');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_update_gym_members
AFTER INSERT OR UPDATE OR DELETE ON members
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE gym_profiles SET total_members = total_members + 1 WHERE gym_id = :NEW.gym_id;
    ELSIF DELETING THEN
        UPDATE gym_profiles SET total_members = total_members - 1 WHERE gym_id = :OLD.gym_id;
    END IF;
END;
/

-- ============================================================================
-- SECTION 18: VIEWS FOR REPORTING
-- ============================================================================

CREATE OR REPLACE VIEW vw_active_members AS
SELECT
    m.gym_id,
    g.gym_name,
    m.membership_status,
    COUNT(*) as member_count
FROM members m
JOIN gym_profiles g ON m.gym_id = g.gym_id
JOIN member_memberships mm ON m.member_id = mm.member_id
WHERE m.is_active = 'Y' AND mm.status = 'ACTIVE'
GROUP BY m.gym_id, g.gym_name, m.membership_status;

CREATE OR REPLACE VIEW vw_daily_revenue AS
SELECT
    gym_id,
    TRUNC(transaction_date) as revenue_date,
    SUM(CASE WHEN transaction_type = 'INCOME' THEN total_amount ELSE 0 END) as total_income,
    SUM(CASE WHEN transaction_type = 'EXPENSE' THEN total_amount ELSE 0 END) as total_expense
FROM financial_transactions
WHERE status = 'COMPLETED'
GROUP BY gym_id, TRUNC(transaction_date);

CREATE OR REPLACE VIEW vw_membership_expiry AS
SELECT
    mm.gym_id,
    mm.member_id,
    m.first_name || ' ' || m.last_name as member_name,
    m.phone,
    mp.plan_name,
    mm.end_date,
    mm.status as membership_status,
    TRUNC(mm.end_date - SYSDATE) as days_until_expiry,
    CASE
        WHEN TRUNC(mm.end_date - SYSDATE) <= 0 THEN 'EXPIRED'
        WHEN TRUNC(mm.end_date - SYSDATE) <= 7 THEN 'EXPIRING_SOON'
        WHEN TRUNC(mm.end_date - SYSDATE) <= 30 THEN 'RENEWAL_DUE'
        ELSE 'ACTIVE'
    END as expiry_status
FROM member_memberships mm
JOIN members m ON mm.member_id = m.member_id
JOIN membership_plans mp ON mm.plan_id = mp.plan_id;

-- ============================================================================
-- SECTION 19: STORED PROCEDURES
-- ============================================================================

CREATE OR REPLACE PROCEDURE prc_calculate_membership_due(
    p_gym_id IN NUMBER
) AS
BEGIN
    UPDATE member_memberships mm
    SET amount_due = mm.total_amount - mm.amount_paid
    WHERE mm.gym_id = p_gym_id
    AND mm.payment_status != 'PAID';
    COMMIT;
END prc_calculate_membership_due;
/

CREATE OR REPLACE PROCEDURE prc_update_expired_memberships(
    p_gym_id IN NUMBER
) AS
BEGIN
    UPDATE member_memberships
    SET status = 'EXPIRED',
        membership_status = 'EXPIRED'
    WHERE gym_id = p_gym_id
    AND status = 'ACTIVE'
    AND end_date < TRUNC(SYSDATE);
    COMMIT;
END prc_update_expired_memberships;
/

CREATE OR REPLACE PROCEDURE prc_generate_daily_report(
    p_gym_id IN NUMBER,
    p_date IN DATE
) AS
    v_total_checkins NUMBER;
    v_peak_count NUMBER;
    v_peak_hour NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_total_checkins
    FROM checkin_records
    WHERE gym_id = p_gym_id
    AND TRUNC(checkin_time) = p_date;

    UPDATE daily_attendance
    SET total_checkins = NVL(v_total_checkins, 0),
        peak_count = NVL(v_peak_count, 0),
        peak_hour = v_peak_hour
    WHERE gym_id = p_gym_id
    AND attendance_date = p_date;
    COMMIT;
END prc_generate_daily_report;
/

-- ============================================================================
-- SECTION 20: INITIALIZATION SCRIPTS
-- ============================================================================

-- Insert default tenant
INSERT INTO tenants (tenant_id, tenant_code, tenant_name, contact_email, contact_phone, country, timezone, currency, language, is_active, created_at, updated_at)
VALUES (1, 'DEFAULT', 'Default Gym', 'admin@gym.com', '+91-9876543210', 'India', 'Asia/Kolkata', 'INR', 'en', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default gym profile
INSERT INTO gym_profiles (gym_id, gym_name, gym_code, owner_user_id, city, state, country, phone, email, is_active, created_at, updated_at)
VALUES (gym_seq.NEXTVAL, 'Default Gym', 'GYM001', 1, 'Mumbai', 'Maharashtra', 'India', '+91-9876543210', 'admin@gym.com', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default admin user (password: Admin@123)
INSERT INTO users (user_id, gym_id, username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified, created_at, updated_at)
VALUES (onekey_seq.NEXTVAL, 1, 'admin', 'admin@gym.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Gq1CZBYowG5qCZBYowG5qCZBYowG5qCZ', 'System', 'Administrator', '+91-9876543210', 'OWNER', 'Y', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;

-- ============================================================================
-- SECTION 21: SAMPLE DATA
-- ============================================================================

-- Insert sample membership plans
INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, is_freeze_allowed, max_freeze_days, features, is_active, created_at, updated_at)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN001', 'Basic Plan', 'INDIVIDUAL', 30, 999, 18, 1178.82, 0, 'N', 'Y', 5, '{"memberManagement":true,"qrCheckin":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, is_freeze_allowed, max_freeze_days, features, is_active, created_at, updated_at)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN002', 'Professional Plan', 'INDIVIDUAL', 90, 2499, 18, 2948.82, 2, 'Y', 'Y', 10, '{"memberManagement":true,"qrCheckin":true,"personalTraining":true,"groupClasses":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, is_freeze_allowed, max_freeze_days, features, is_active, created_at, updated_at)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN003', 'Business Plan', 'INDIVIDUAL', 180, 4999, 18, 5898.82, 4, 'Y', 'Y', 15, '{"memberManagement":true,"qrCheckin":true,"personalTraining":true,"groupClasses":true,"prioritySupport":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO membership_plans (plan_id, gym_id, plan_code, plan_name, plan_type, duration_days, plan_amount, tax_percentage, total_amount, personal_training_sessions, group_class_access, is_freeze_allowed, max_freeze_days, features, is_active, created_at, updated_at)
VALUES (membership_seq.NEXTVAL, 1, 'PLAN004', 'Enterprise Plan', 'INDIVIDUAL', 365, 9999, 18, 11798.82, 12, 'Y', 'Y', 30, '{"memberManagement":true,"qrCheckin":true,"personalTraining":true,"groupClasses":true,"prioritySupport":true,"allFeatures":true}', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert plan pricing tiers for each plan
INSERT INTO plan_pricing_tiers (tier_id, plan_id, gym_id, billing_cycle, duration_days, price_amount, discount_percentage, final_amount, tax_percentage, total_amount, is_default, is_active, created_at)
SELECT tier_seq.NEXTVAL, p.plan_id, p.gym_id, 'MONTHLY', p.duration_days, p.plan_amount, 0, p.plan_amount, p.tax_percentage, p.total_amount, 'Y', 'Y', CURRENT_TIMESTAMP
FROM membership_plans p WHERE p.gym_id = 1;

INSERT INTO plan_pricing_tiers (tier_id, plan_id, gym_id, billing_cycle, duration_days, price_amount, discount_percentage, final_amount, tax_percentage, total_amount, is_default, is_active, created_at)
SELECT tier_seq.NEXTVAL, p.plan_id, p.gym_id, 'QUARTERLY', p.duration_days, p.plan_amount * 0.95, 5, p.plan_amount * 0.95, p.tax_percentage, p.plan_amount * 0.95 * (1 + p.tax_percentage/100), 'N', 'Y', CURRENT_TIMESTAMP
FROM membership_plans p WHERE p.gym_id = 1;

INSERT INTO plan_pricing_tiers (tier_id, plan_id, gym_id, billing_cycle, duration_days, price_amount, discount_percentage, final_amount, tax_percentage, total_amount, is_default, is_active, created_at)
SELECT tier_seq.NEXTVAL, p.plan_id, p.gym_id, 'YEARLY', p.duration_days, p.plan_amount * 0.80, 20, p.plan_amount * 0.80, p.tax_percentage, p.plan_amount * 0.80 * (1 + p.tax_percentage/100), 'N', 'Y', CURRENT_TIMESTAMP
FROM membership_plans p WHERE p.gym_id = 1;

COMMIT;

-- ============================================================================
-- END OF SCHEMA SCRIPT
-- ============================================================================
