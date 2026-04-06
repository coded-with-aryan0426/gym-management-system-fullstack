-- Fix missing columns in USERS table (found during startup)
ALTER TABLE users ADD (
    gender VARCHAR2(20),
    date_of_birth DATE,
    address VARCHAR2(500),
    emergency_contact_name VARCHAR2(200),
    emergency_contact_phone VARCHAR2(20),
    emergency_contact_relation VARCHAR2(50),
    password_changed_at TIMESTAMP,
    created_by NUMBER,
    updated_by NUMBER
);

COMMIT;
