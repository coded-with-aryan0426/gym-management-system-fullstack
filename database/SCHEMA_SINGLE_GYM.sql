-- ============================================================================
-- GYM MANAGEMENT SYSTEM - SINGLE GYM DEPLOYMENT SCHEMA
-- Version: 1.0
-- Purpose: Single gym per deployment - no multi-tenancy
-- ============================================================================

-- ============================================================================
-- SECTION 0: CLEANUP EXISTING OBJECTS
-- ============================================================================

BEGIN
    FOR rec IN (SELECT table_name FROM user_tables) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || rec.table_name || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    FOR rec IN (SELECT sequence_name FROM user_sequences) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || rec.sequence_name;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    FOR rec IN (SELECT view_name FROM user_views) LOOP
        EXECUTE IMMEDIATE 'DROP VIEW ' || rec.view_name;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    FOR rec IN (SELECT object_name FROM user_procedures WHERE object_type = 'PROCEDURE') LOOP
        EXECUTE IMMEDIATE 'DROP PROCEDURE ' || rec.object_name;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

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
-- SECTION 2: SINGLE GYM CONFIGURATION TABLE
-- ============================================================================

CREATE TABLE gyms (
    gym_id NUMBER DEFAULT gym_seq.NEXTVAL PRIMARY KEY,
    gym_name VARCHAR2(200) NOT NULL,
    gym_code VARCHAR2(50),
    owner_user_id NUMBER,
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

CREATE INDEX idx_gym_code ON gyms(gym_code);

-- ============================================================================
-- SECTION 3: USER AND AUTHENTICATION TABLES (No gym_id)
-- ============================================================================

CREATE TABLE users (
    user_id NUMBER DEFAULT onekey_seq.NEXTVAL PRIMARY KEY,
    username VARCHAR2(100) NOT NULL UNIQUE,
    email VARCHAR2(200) NOT NULL UNIQUE,
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
    created_by VARCHAR2(100)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);

-- ============================================================================
-- SECTION 4: ROLES AND PERMISSIONS (No gym_id - simplified)
-- ============================================================================

CREATE TABLE roles (
    role_id NUMBER DEFAULT role_seq.NEXTVAL PRIMARY KEY,
    role_name VARCHAR2(50) NOT NULL UNIQUE,
    role_code VARCHAR2(50) NOT NULL UNIQUE,
    description VARCHAR2(500),
    permissions CLOB,
    is_system_role CHAR(1) DEFAULT 'N' CHECK (is_system_role IN ('Y', 'N')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simple user-role mapping (no gym association)
CREATE TABLE user_role_map (
    map_id NUMBER DEFAULT assignment_seq.NEXTVAL PRIMARY KEY,
    user_id NUMBER NOT NULL,
    role_id NUMBER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR2(100),
    CONSTRAINT uk_user_role_map UNIQUE (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

CREATE INDEX idx_urm_user ON user_role_map(user_id);
CREATE INDEX idx_urm_role ON user_role_map(role_id);

-- ============================================================================
-- SECTION 5: MEMBERS TABLE (No gym_id)
-- ============================================================================

CREATE TABLE members (
    member_id NUMBER DEFAULT member_seq.NEXTVAL PRIMARY KEY,
    member_code VARCHAR2(50) UNIQUE,
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
    created_by VARCHAR2(100)
);

CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_status ON members(membership_status);

-- Member documents
CREATE TABLE member_documents (
    document_id NUMBER DEFAULT doc_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    document_type VARCHAR2(50) NOT NULL CHECK (document_type IN ('ID_PROOF', 'ADDRESS_PROOF', 'MEDICAL_CERT', 'PHOTO', 'OTHER')),
    document_name VARCHAR2(200) NOT NULL,
    document_number VARCHAR2(100),
    document_url VARCHAR2(500) NOT NULL,
    expiry_date DATE,
    is_verified CHAR(1) DEFAULT 'N',
    verified_by VARCHAR2(100),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE INDEX idx_docs_member ON member_documents(member_id);

-- Member health metrics
CREATE TABLE member_health_metrics (
    metric_id NUMBER DEFAULT health_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    record_date DATE NOT NULL,
    weight_kg NUMBER(5, 2),
    height_cm NUMBER(5, 2),
    bmi NUMBER(4, 2),
    body_fat_percentage NUMBER(4, 2),
    blood_pressure_systolic NUMBER(3),
    blood_pressure_diastolic NUMBER(3),
    notes CLOB,
    recorded_by NUMBER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE INDEX idx_health_member ON member_health_metrics(member_id);
CREATE INDEX idx_health_date ON member_health_metrics(record_date);

-- ============================================================================
-- SECTION 6: MEMBERSHIP PLANS (No gym_id)
-- ============================================================================

CREATE TABLE membership_plans (
    plan_id NUMBER DEFAULT membership_seq.NEXTVAL PRIMARY KEY,
    plan_code VARCHAR2(50) NOT NULL UNIQUE,
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
    created_by VARCHAR2(100)
);

CREATE INDEX idx_plans_active ON membership_plans(is_active);

CREATE TABLE plan_pricing_tiers (
    tier_id NUMBER DEFAULT tier_seq.NEXTVAL PRIMARY KEY,
    plan_id NUMBER NOT NULL,
    billing_cycle VARCHAR2(20) NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'QUARTERLY', 'HALFYEARLY', 'YEARLY', 'LIFETIME')),
    duration_days NUMBER NOT NULL,
    price_amount NUMBER(12, 2) NOT NULL,
    discount_percentage NUMBER(5, 2) DEFAULT 0,
    final_amount NUMBER(12, 2) NOT NULL,
    tax_percentage NUMBER(5, 2) DEFAULT 18,
    total_amount NUMBER(12, 2) NOT NULL,
    is_default CHAR(1) DEFAULT 'N',
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES membership_plans(plan_id) ON DELETE CASCADE
);

CREATE INDEX idx_tiers_plan ON plan_pricing_tiers(plan_id);

-- ============================================================================
-- SECTION 7: CHECK-IN/OUT TRACKING (No gym_id)
-- ============================================================================

CREATE TABLE checkin_records (
    checkin_id NUMBER DEFAULT checkin_seq.NEXTVAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE INDEX idx_checkin_member ON checkin_records(member_id);
CREATE INDEX idx_checkin_time ON checkin_records(checkin_time);
CREATE INDEX idx_checkin_unfinished ON checkin_records(checkout_time);

CREATE TABLE daily_attendance (
    attendance_id NUMBER DEFAULT attendance_seq.NEXTVAL PRIMARY KEY,
    attendance_date DATE NOT NULL UNIQUE,
    total_checkins NUMBER DEFAULT 0,
    total_checkouts NUMBER DEFAULT 0,
    peak_hour NUMBER,
    peak_count NUMBER,
    new_members NUMBER DEFAULT 0,
    returning_members NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_date ON daily_attendance(attendance_date);

-- ============================================================================
-- SECTION 8: EQUIPMENT MANAGEMENT (No gym_id)
-- ============================================================================

CREATE TABLE equipment_categories (
    category_id NUMBER DEFAULT cat_seq.NEXTVAL PRIMARY KEY,
    category_name VARCHAR2(100) NOT NULL,
    category_code VARCHAR2(50),
    description VARCHAR2(500),
    parent_category_id NUMBER,
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
    equipment_id NUMBER DEFAULT equipment_seq.NEXTVAL PRIMARY KEY,
    equipment_code VARCHAR2(50) UNIQUE,
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
    FOREIGN KEY (category_id) REFERENCES equipment_categories(category_id) ON DELETE SET NULL
);

CREATE INDEX idx_equipment_status ON equipment(status);

CREATE TABLE equipment_maintenance (
    maintenance_id NUMBER DEFAULT maint_seq.NEXTVAL PRIMARY KEY,
    equipment_id NUMBER NOT NULL,
    maintenance_type VARCHAR2(50) CHECK (maintenance_type IN ('SERVICE', 'REPAIR', 'INSPECTION', 'CALIBRATION', 'CLEANING')),
    description CLOB NOT NULL,
    maintenance_date DATE NOT NULL,
    performed_by VARCHAR2(200),
    cost NUMBER(12, 2) DEFAULT 0,
    next_maintenance_date DATE,
    completion_status VARCHAR2(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR2(100),
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE CASCADE
);

CREATE INDEX idx_maint_equipment ON equipment_maintenance(equipment_id);
CREATE INDEX idx_maint_date ON equipment_maintenance(maintenance_date);

-- ============================================================================
-- SECTION 9: STAFF MANAGEMENT (No gym_id)
-- ============================================================================

CREATE TABLE staff (
    staff_id NUMBER DEFAULT staff_seq.NEXTVAL PRIMARY KEY,
    user_id NUMBER,
    staff_code VARCHAR2(50) UNIQUE,
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
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_staff_role ON staff(role);

CREATE TABLE staff_attendance (
    attendance_id NUMBER DEFAULT staff_att_seq.NEXTVAL PRIMARY KEY,
    staff_id NUMBER NOT NULL,
    attendance_date DATE NOT NULL,
    checkin_time TIMESTAMP,
    checkout_time TIMESTAMP,
    work_hours NUMBER(5, 2),
    overtime_hours NUMBER(5, 2),
    status VARCHAR2(50) DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'OFF')),
    leave_type VARCHAR2(50),
    approved_by NUMBER,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

CREATE INDEX idx_staff_att_staff ON staff_attendance(staff_id);
CREATE INDEX idx_staff_att_date ON staff_attendance(attendance_date);

CREATE TABLE staff_payroll (
    payroll_id NUMBER DEFAULT payroll_seq.NEXTVAL PRIMARY KEY,
    staff_id NUMBER NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

CREATE INDEX idx_payroll_staff ON staff_payroll(staff_id);
CREATE INDEX idx_payroll_month ON staff_payroll(payroll_month);

-- ============================================================================
-- SECTION 10: BILLING AND PAYMENTS (No gym_id)
-- ============================================================================

CREATE TABLE member_memberships (
    membership_id NUMBER DEFAULT mm_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    plan_id NUMBER NOT NULL,
    membership_code VARCHAR2(50) NOT NULL UNIQUE,
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
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES membership_plans(plan_id) ON DELETE RESTRICT
);

CREATE INDEX idx_mm_member ON member_memberships(member_id);
CREATE INDEX idx_mm_plan ON member_memberships(plan_id);
CREATE INDEX idx_mm_status ON member_memberships(status);
CREATE INDEX idx_mm_next_renewal ON member_memberships(next_renewal_date);

CREATE TABLE payment_transactions (
    transaction_id NUMBER DEFAULT transaction_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER,
    membership_id NUMBER,
    invoice_id NUMBER,
    transaction_code VARCHAR2(50) NOT NULL UNIQUE,
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
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL,
    FOREIGN KEY (membership_id) REFERENCES member_memberships(membership_id) ON DELETE SET NULL
);

CREATE INDEX idx_txn_member ON payment_transactions(member_id);
CREATE INDEX idx_txn_status ON payment_transactions(transaction_status);
CREATE INDEX idx_txn_date ON payment_transactions(transaction_date);

CREATE TABLE invoices (
    invoice_id NUMBER DEFAULT invoice_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER,
    membership_id NUMBER,
    invoice_number VARCHAR2(50) NOT NULL UNIQUE,
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
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL,
    FOREIGN KEY (membership_id) REFERENCES member_memberships(membership_id) ON DELETE SET NULL
);

CREATE INDEX idx_inv_member ON invoices(member_id);
CREATE INDEX idx_inv_date ON invoices(invoice_date);

-- ============================================================================
-- SECTION 11: GROUP CLASSES AND SCHEDULES (No gym_id)
-- ============================================================================

CREATE TABLE group_classes (
    class_id NUMBER DEFAULT class_seq.NEXTVAL PRIMARY KEY,
    class_name VARCHAR2(200) NOT NULL,
    class_code VARCHAR2(50) UNIQUE,
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
    created_by VARCHAR2(100),
    FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_classes_trainer ON group_classes(trainer_id);

CREATE TABLE class_schedules (
    schedule_id NUMBER DEFAULT schedule_seq.NEXTVAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES group_classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_schedule_class ON class_schedules(class_id);
CREATE INDEX idx_schedule_trainer ON class_schedules(trainer_id);

CREATE TABLE class_bookings (
    booking_id NUMBER DEFAULT booking_seq.NEXTVAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES class_schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES group_classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE INDEX idx_booking_schedule ON class_bookings(schedule_id);
CREATE INDEX idx_booking_member ON class_bookings(member_id);
CREATE INDEX idx_booking_date ON class_bookings(booking_date);

-- ============================================================================
-- SECTION 12: PERSONAL TRAINING (No gym_id)
-- ============================================================================

CREATE TABLE pt_assignments (
    assignment_id NUMBER DEFAULT pt_assign_seq.NEXTVAL PRIMARY KEY,
    member_id NUMBER NOT NULL,
    trainer_id NUMBER NOT NULL,
    assignment_code VARCHAR2(50) UNIQUE,
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
    created_by VARCHAR2(100),
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_pt_member ON pt_assignments(member_id);
CREATE INDEX idx_pt_trainer ON pt_assignments(trainer_id);

CREATE TABLE pt_sessions (
    session_id NUMBER DEFAULT pt_session_seq.NEXTVAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES pt_assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_pts_assignment ON pt_sessions(assignment_id);
CREATE INDEX idx_pts_date ON pt_sessions(session_date);

-- ============================================================================
-- SECTION 13: FINANCIAL TRANSACTIONS (No gym_id)
-- ============================================================================

CREATE TABLE financial_transactions (
    transaction_id NUMBER DEFAULT fin_seq.NEXTVAL PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL
);

CREATE INDEX idx_fin_type ON financial_transactions(transaction_type);
CREATE INDEX idx_fin_category ON financial_transactions(category);
CREATE INDEX idx_fin_date ON financial_transactions(transaction_date);
CREATE INDEX idx_fin_member ON financial_transactions(member_id);

-- ============================================================================
-- SECTION 14: AUDIT LOGS (No gym_id)
-- ============================================================================

CREATE TABLE audit_logs (
    audit_id NUMBER DEFAULT audit_log_seq.NEXTVAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- ============================================================================
-- SECTION 15: NOTIFICATIONS (No gym_id)
-- ============================================================================

CREATE TABLE notifications (
    notification_id NUMBER DEFAULT notification_seq.NEXTVAL PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_status ON notifications(status);

-- ============================================================================
-- SECTION 16: TRIGGERS (Simplified - no gym_id references)
-- ============================================================================

CREATE OR REPLACE TRIGGER trg_member_code
BEFORE INSERT ON members
FOR EACH ROW
DECLARE
    v_member_count NUMBER;
BEGIN
    IF :NEW.member_code IS NULL THEN
        SELECT COUNT(*) + 1 INTO v_member_count FROM members;
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
        SELECT COUNT(*) + 1 INTO v_membership_count FROM member_memberships;
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
        SELECT COUNT(*) + 1 INTO v_txn_count FROM payment_transactions;
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
        SELECT COUNT(*) + 1 INTO v_count FROM invoices;
        :NEW.invoice_number := 'INV-' || v_year || '-' || LPAD(v_count, 6, '0');
    END IF;
END;
/

-- ============================================================================
-- SECTION 17: SEED DATA - DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (role_name, role_code, description, is_system_role) VALUES ('Owner', 'OWNER', 'Gym owner with full access', 'Y');
INSERT INTO roles (role_name, role_code, description, is_system_role) VALUES ('Admin', 'ADMIN', 'Gym administrator', 'Y');
INSERT INTO roles (role_name, role_code, description, is_system_role) VALUES ('Trainer', 'TRAINER', 'Fitness trainer', 'Y');
INSERT INTO roles (role_name, role_code, description, is_system_role) VALUES ('Member', 'MEMBER', 'Gym member', 'Y');
INSERT INTO roles (role_name, role_code, description, is_system_role) VALUES ('Staff', 'STAFF', 'Gym staff', 'Y');

COMMIT;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
