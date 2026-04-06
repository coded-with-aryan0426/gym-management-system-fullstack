-- ============================================================================
-- MIGRATION SCRIPT: Single-Tenant to Multi-Tenant
-- Multi-Tenant Database Schema Conversion
-- Version: 1.0
-- ============================================================================

-- ============================================================================
-- MIGRATION PHASE 1: Add Tenant Columns (Non-Breaking)
-- ============================================================================

-- Step 1.1: Add tenant_id column to all tables that need it
-- This is a reversible migration step

ALTER TABLE users ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE users ADD CONSTRAINT fk_users_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_users_tenant_mig ON users(tenant_id);

ALTER TABLE gym_profiles ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE gym_profiles ADD CONSTRAINT fk_gym_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_gym_tenant_mig ON gym_profiles(tenant_id);

ALTER TABLE members ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE members ADD CONSTRAINT fk_members_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_members_tenant_mig ON members(tenant_id);

ALTER TABLE staff ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE staff ADD CONSTRAINT fk_staff_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_staff_tenant_mig ON staff(tenant_id);

ALTER TABLE payment_transactions ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE payment_transactions ADD CONSTRAINT fk_txn_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_txn_tenant_mig ON payment_transactions(tenant_id);

ALTER TABLE checkin_records ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE checkin_records ADD CONSTRAINT fk_checkin_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_checkin_tenant_mig ON checkin_records(tenant_id);

ALTER TABLE membership_plans ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE membership_plans ADD CONSTRAINT fk_plans_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_plans_tenant_mig ON membership_plans(tenant_id);

ALTER TABLE member_memberships ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE member_memberships ADD CONSTRAINT fk_mm_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_mm_tenant_mig ON member_memberships(tenant_id);

ALTER TABLE equipment ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE equipment ADD CONSTRAINT fk_equip_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_equip_tenant_mig ON equipment(tenant_id);

ALTER TABLE financial_transactions ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_fin_tenant_mig ON financial_transactions(tenant_id);

ALTER TABLE invoices ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE invoices ADD CONSTRAINT fk_inv_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_inv_tenant_mig ON invoices(tenant_id);

ALTER TABLE group_classes ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE group_classes ADD CONSTRAINT fk_classes_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_classes_tenant_mig ON group_classes(tenant_id);

ALTER TABLE class_schedules ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE class_schedules ADD CONSTRAINT fk_sched_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_sched_tenant_mig ON class_schedules(tenant_id);

ALTER TABLE class_bookings ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE class_bookings ADD CONSTRAINT fk_book_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_book_tenant_mig ON class_bookings(tenant_id);

ALTER TABLE pt_assignments ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE pt_assignments ADD CONSTRAINT fk_pt_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_pt_tenant_mig ON pt_assignments(tenant_id);

ALTER TABLE pt_sessions ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE pt_sessions ADD CONSTRAINT fk_pts_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_pts_tenant_mig ON pt_sessions(tenant_id);

ALTER TABLE audit_logs ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_audit_tenant_mig ON audit_logs(tenant_id);

ALTER TABLE notifications ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE notifications ADD CONSTRAINT fk_notif_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_notif_tenant_mig ON notifications(tenant_id);

ALTER TABLE equipment_categories ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE equipment_categories ADD CONSTRAINT fk_eqcat_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_eqcat_tenant_mig ON equipment_categories(tenant_id);

ALTER TABLE staff_attendance ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE staff_attendance ADD CONSTRAINT fk_sa_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_sa_tenant_mig ON staff_attendance(tenant_id);

ALTER TABLE staff_payroll ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE staff_payroll ADD CONSTRAINT fk_payroll_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_payroll_tenant_mig ON staff_payroll(tenant_id);

ALTER TABLE daily_attendance ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE daily_attendance ADD CONSTRAINT fk_da_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_da_tenant_mig ON daily_attendance(tenant_id);

ALTER TABLE member_documents ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE member_documents ADD CONSTRAINT fk_docs_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_docs_tenant_mig ON member_documents(tenant_id);

ALTER TABLE member_health_metrics ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE member_health_metrics ADD CONSTRAINT fk_health_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_health_tenant_mig ON member_health_metrics(tenant_id);

ALTER TABLE gym_branches ADD COLUMN tenant_id NUMBER DEFAULT 1;
ALTER TABLE gym_branches ADD CONSTRAINT fk_branches_tenant_mig FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
CREATE INDEX idx_branches_tenant_mig ON gym_branches(tenant_id);

-- ============================================================================
-- MIGRATION PHASE 2: Data Backfill
-- ============================================================================

-- Step 2.1: Create default tenant if not exists
INSERT INTO tenants (tenant_id, tenant_code, tenant_name, contact_email, contact_phone, country, timezone, currency, language, is_active, created_at, updated_at)
SELECT 1, 'DEFAULT', 'Default Organization', 'admin@org.com', '+91-9876543210', 'India', 'Asia/Kolkata', 'INR', 'en', 'Y', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE tenant_id = 1);

-- Step 2.2: Backfill tenant_id from gym_profiles relationship
-- All records get tenant_id = 1 as default (single-tenant mode)

UPDATE users u SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE gym_profiles g SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE members m SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE staff s SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE payment_transactions pt SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE checkin_records cr SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE membership_plans mp SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE member_memberships mm SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE equipment e SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE financial_transactions ft SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE invoices i SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE group_classes gc SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE class_schedules cs SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE class_bookings cb SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE pt_assignments pta SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE pt_sessions pts SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE audit_logs al SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE notifications n SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE equipment_categories ec SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE staff_attendance sa SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE staff_payroll sp SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE daily_attendance da SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE member_documents md SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE member_health_metrics mhm SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE gym_branches gb SET tenant_id = 1 WHERE tenant_id IS NULL;

COMMIT;

-- ============================================================================
-- MIGRATION PHASE 3: Add Unique Constraints for Multi-Tenancy
-- ============================================================================

-- Add composite unique constraints for tenant-scoped records

ALTER TABLE users DROP CONSTRAINT uk_users_username;
ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (tenant_id, username);

ALTER TABLE users DROP CONSTRAINT uk_users_email;
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (tenant_id, email);

ALTER TABLE members DROP CONSTRAINT uk_member_code;
ALTER TABLE members ADD CONSTRAINT uk_member_code UNIQUE (tenant_id, member_code);

ALTER TABLE membership_plans DROP CONSTRAINT uk_plan_code;
ALTER TABLE membership_plans ADD CONSTRAINT uk_plan_code UNIQUE (tenant_id, plan_code);

ALTER TABLE member_memberships DROP CONSTRAINT uk_membership_code;
ALTER TABLE member_memberships ADD CONSTRAINT uk_membership_code UNIQUE (tenant_id, membership_code);

ALTER TABLE payment_transactions DROP CONSTRAINT uk_transaction_code;
ALTER TABLE payment_transactions ADD CONSTRAINT uk_transaction_code UNIQUE (tenant_id, transaction_code);

ALTER TABLE invoices DROP CONSTRAINT uk_invoice_number;
ALTER TABLE invoices ADD CONSTRAINT uk_invoice_number UNIQUE (tenant_id, invoice_number);

ALTER TABLE staff DROP CONSTRAINT uk_staff_code;
ALTER TABLE staff ADD CONSTRAINT uk_staff_code UNIQUE (tenant_id, staff_code);

ALTER TABLE equipment DROP CONSTRAINT uk_equipment_code;
ALTER TABLE equipment ADD CONSTRAINT uk_equipment_code UNIQUE (tenant_id, equipment_code);

ALTER TABLE user_roles DROP CONSTRAINT uk_roles_tenant_code;
ALTER TABLE user_roles ADD CONSTRAINT uk_roles_tenant_code UNIQUE (tenant_id, role_code);

-- ============================================================================
-- MIGRATION PHASE 4: Add Row-Level Security Policies
-- ============================================================================

-- Create policy functions for tenant isolation

CREATE OR REPLACE FUNCTION fn_get_tenant_id()
RETURNS NUMBER AS $$
BEGIN
    RETURN COALESCE(CURRENT_SETTING('app.tenant_id', TRUE)::NUMBER, 1);
EXCEPTION WHEN OTHERS THEN
    RETURN 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies (PostgreSQL syntax - Oracle uses VPD)

CREATE POLICY tenant_isolation_users ON users
    FOR ALL
    USING (tenant_id = fn_get_tenant_id());

CREATE POLICY tenant_isolation_members ON members
    FOR ALL
    USING (tenant_id = fn_get_tenant_id());

CREATE POLICY tenant_isolation_staff ON staff
    FOR ALL
    USING (tenant_id = fn_get_tenant_id());

CREATE POLICY tenant_isolation_transactions ON payment_transactions
    FOR ALL
    USING (tenant_id = fn_get_tenant_id());

-- ============================================================================
-- MIGRATION PHASE 5: Create Tenant-Specific Schemas (For Separate DB Model)
-- ============================================================================

-- This script creates schemas for each tenant when migrating to separate DB model

CREATE OR REPLACE PROCEDURE prc_create_tenant_schema(
    p_tenant_id IN NUMBER,
    p_tenant_code IN VARCHAR2
) AS
    v_schema_name VARCHAR2(100);
BEGIN
    v_schema_name := 'TENANT_' || p_tenant_code;

    -- Create schema
    EXECUTE IMMEDIATE 'CREATE SCHEMA ' || v_schema_name;

    -- Grant privileges
    EXECUTE IMMEDIATE 'GRANT CONNECT, RESOURCE TO ' || v_schema_name;

    DBMS_OUTPUT.PUT_LINE('Schema created: ' || v_schema_name);
END prc_create_tenant_schema;
/

CREATE OR REPLACE PROCEDURE prc_migrate_tenant_to_separate_db(
    p_tenant_id IN NUMBER
) AS
    v_tenant_code VARCHAR2(50);
    v_database_link VARCHAR2(200);
BEGIN
    -- Get tenant details
    SELECT tenant_code INTO v_tenant_code
    FROM tenants
    WHERE tenant_id = p_tenant_id;

    -- Create database link to new tenant database (requires setup)
    v_database_link := 'TENANT_' || v_tenant_code || '_LINK';

    -- Export tenant data
    DBMS_OUTPUT.PUT_LINE('Starting data export for tenant: ' || v_tenant_code);

    -- Note: This requires Oracle Data Pump or expdp/impdp
    -- The actual migration would be:
    -- 1. Export tenant tables with tenant_id = p_tenant_id
    -- 2. Create new database for tenant
    -- 3. Import data into new database
    -- 4. Remove tenant data from shared database

    DBMS_OUTPUT.PUT_LINE('Migration prepared for tenant: ' || v_tenant_code);
    DBMS_OUTPUT.PUT_LINE('Manual steps required:');
    DBMS_OUTPUT.PUT_LINE('1. Create new Oracle database for tenant');
    DBMS_OUTPUT.PUT_LINE('2. Use Data Pump to export/import tenant data');
    DBMS_OUTPUT.PUT_LINE('3. Update tenants table with new database_name');
    DBMS_OUTPUT.PUT_LINE('4. Delete tenant data from shared database');
END prc_migrate_tenant_to_separate_db;
/

-- ============================================================================
-- MIGRATION VALIDATION QUERIES
-- ============================================================================

-- Validate migration completion
SELECT 'Users' as table_name, COUNT(*) as total_records, COUNT(DISTINCT tenant_id) as tenant_count FROM users
UNION ALL
SELECT 'Members', COUNT(*), COUNT(DISTINCT tenant_id) FROM members
UNION ALL
SELECT 'Staff', COUNT(*), COUNT(DISTINCT tenant_id) FROM staff
UNION ALL
SELECT 'Payment Transactions', COUNT(*), COUNT(DISTINCT tenant_id) FROM payment_transactions
UNION ALL
SELECT 'Membership Plans', COUNT(*), COUNT(DISTINCT tenant_id) FROM membership_plans
UNION ALL
SELECT 'Member Memberships', COUNT(*), COUNT(DISTINCT tenant_id) FROM member_memberships
UNION ALL
SELECT 'Equipment', COUNT(*), COUNT(DISTINCT tenant_id) FROM equipment
UNION ALL
SELECT 'Financial Transactions', COUNT(*), COUNT(DISTINCT tenant_id) FROM financial_transactions
UNION ALL
SELECT 'Invoices', COUNT(*), COUNT(DISTINCT tenant_id) FROM invoices;

-- Check for orphaned records (records without tenant_id)
SELECT 'Orphaned Records Check' as check_name, COUNT(*) as orphan_count
FROM users WHERE tenant_id IS NULL
UNION ALL
SELECT 'Members', COUNT(*) FROM members WHERE tenant_id IS NULL
UNION ALL
SELECT 'Staff', COUNT(*) FROM staff WHERE tenant_id IS NULL
UNION ALL
SELECT 'Transactions', COUNT(*) FROM payment_transactions WHERE tenant_id IS NULL;

-- ============================================================================
-- ROLLBACK SCRIPT (If needed)
-- ============================================================================

/*
-- This rollback script removes all multi-tenant additions
-- USE WITH CAUTION - This will remove tenant isolation!

-- Remove foreign key constraints
ALTER TABLE users DROP CONSTRAINT fk_users_tenant_mig;
ALTER TABLE gym_profiles DROP CONSTRAINT fk_gym_tenant_mig;
ALTER TABLE members DROP CONSTRAINT fk_members_tenant_mig;
-- ... (repeat for all tables)

-- Remove indexes
DROP INDEX idx_users_tenant_mig;
DROP INDEX idx_gym_tenant_mig;
DROP INDEX idx_members_tenant_mig;
-- ... (repeat for all indexes)

-- Remove columns
ALTER TABLE users DROP COLUMN tenant_id;
ALTER TABLE gym_profiles DROP COLUMN tenant_id;
ALTER TABLE members DROP COLUMN tenant_id;
-- ... (repeat for all tables)

-- Restore original unique constraints
ALTER TABLE users DROP CONSTRAINT uk_users_username;
ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);
-- ... (repeat for all tables)

COMMIT;
*/

-- ============================================================================
-- POST-MIGRATION STEPS
-- ============================================================================

-- 1. Rebuild any application connection pools
-- 2. Clear application caches
-- 3. Update connection strings in application config
-- 4. Enable Row-Level Security (for PostgreSQL) or VPD (for Oracle)
-- 5. Test tenant isolation with each user role
-- 6. Update monitoring and alerting for multi-tenant queries

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================
