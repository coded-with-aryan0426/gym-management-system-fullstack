-- Add remaining missing columns

ALTER TABLE users ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE members ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE gym_profiles ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE gym_branches ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE staff ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE equipment ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE equipment_categories ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE equipment_maintenance ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE membership_plans ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE plan_pricing_tiers ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE member_memberships ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE payment_transactions ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE invoices ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE group_classes ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE class_schedules ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE class_bookings ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE pt_assignments ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE pt_sessions ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE financial_transactions ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE checkin_records ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE daily_attendance ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE staff_attendance ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE staff_payroll ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE member_documents ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE member_health_metrics ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE notifications ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE audit_logs ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE user_roles ADD (
    updated_by VARCHAR2(100)
);

ALTER TABLE user_role_assignments ADD (
    updated_by VARCHAR2(100)
);

-- Add missing columns that exist in entities but not in DB

ALTER TABLE users ADD (
    address VARCHAR2(500),
    emergency_contact_name VARCHAR2(200),
    emergency_contact_phone VARCHAR2(20),
    emergency_contact_relation VARCHAR2(50)
);

ALTER TABLE members ADD (
    emergency_contact_name VARCHAR2(200),
    emergency_contact_phone VARCHAR2(20),
    emergency_contact_relation VARCHAR2(50)
);

ALTER TABLE staff ADD (
    emergency_contact_name VARCHAR2(200),
    emergency_contact_phone VARCHAR2(20),
    emergency_contact_relation VARCHAR2(50)
);

ALTER TABLE gym_profiles ADD (
    emergency_contact_name VARCHAR2(200),
    emergency_contact_phone VARCHAR2(20),
    emergency_contact_relation VARCHAR2(50)
);

COMMIT;