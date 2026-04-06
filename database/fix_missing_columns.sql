-- Fix missing columns in USERS table
ALTER TABLE users ADD (
    is_deleted CHAR(1) DEFAULT 'N',
    full_name VARCHAR2(200),
    status VARCHAR2(50) DEFAULT 'ACTIVE',
    avatar_id NUMBER,
    google_id VARCHAR2(100),
    auth_provider VARCHAR2(50),
    password VARCHAR2(255),
    is_first_login CHAR(1) DEFAULT 'Y',
    two_factor_enabled CHAR(1) DEFAULT 'N',
    phone_number VARCHAR2(20),
    blood_type VARCHAR2(10),
    height NUMBER(5,2),
    weight NUMBER(5,2),
    body_fat NUMBER(5,2),
    health_notes CLOB,
    fitness_goals CLOB,
    employee_id_code VARCHAR2(50),
    job_title VARCHAR2(100),
    department VARCHAR2(100),
    shift_timing VARCHAR2(100),
    salary NUMBER(12,2),
    joining_date DATE,
    leaving_date DATE,
    city VARCHAR2(100),
    state VARCHAR2(100),
    zip_code VARCHAR2(20),
    account_non_locked CHAR(1) DEFAULT 'Y',
    version NUMBER DEFAULT 0
);

-- Fix missing columns in MEMBERS table
ALTER TABLE members ADD (
    full_name VARCHAR2(200),
    phone_number VARCHAR2(20),
    blood_type VARCHAR2(10),
    height NUMBER(5,2),
    weight NUMBER(5,2),
    body_fat NUMBER(5,2),
    health_notes CLOB,
    fitness_goals CLOB,
    is_deleted CHAR(1) DEFAULT 'N'
);

COMMIT;