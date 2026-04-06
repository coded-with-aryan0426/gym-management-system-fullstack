-- Comprehensive fix for all missing columns in USERS table
-- This addresses: ORA-00904: "U1_0"."GENDER": invalid identifier

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

-- Also ensure MEMBER_POINTS has member_user_id
ALTER TABLE member_points ADD (
    member_user_id NUMBER
);

COMMIT;
