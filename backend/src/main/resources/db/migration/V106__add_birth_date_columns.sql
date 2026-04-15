-- V106__add_birth_date_columns.sql
-- Add birth date columns to users table for age-based eligibility

-- Add DOB columns to users table (nullable first for migration safety)
ALTER TABLE users ADD (
    date_of_birth DATE,
    birth_date_verified CHAR(1) DEFAULT 'N',
    birth_date_verified_at TIMESTAMP,
    birth_date_verified_by NUMBER(22)
);

COMMENT ON COLUMN users.date_of_birth IS 'Member/trainer/staff date of birth - required for age-based eligibility';
COMMENT ON COLUMN users.birth_date_verified IS 'Whether DOB has been verified with ID document';
COMMENT ON COLUMN users.birth_date_verified_at IS 'When DOB was verified';
COMMENT ON COLUMN users.birth_date_verified_by IS 'User ID who verified the DOB';

-- Add constraint for birth_date_verified
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE users ADD CONSTRAINT chk_birth_date_verified CHECK (birth_date_verified IN (''Y'', ''N''))';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

-- Add age-related tracking fields to members table
ALTER TABLE members ADD (
    age_at_registration NUMBER(3,0),
    requires_parental_consent CHAR(1) DEFAULT 'N',
    parental_consent_document_id NUMBER(22)
);

COMMENT ON COLUMN members.age_at_registration IS 'Age calculated at time of registration';
COMMENT ON COLUMN members.requires_parental_consent IS 'Whether parental consent is required';
COMMENT ON COLUMN members.parental_consent_document_id IS 'Reference to consent document';

-- Add constraint for requires_parental_consent
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE members ADD CONSTRAINT chk_parental_consent CHECK (requires_parental_consent IN (''Y'', ''N''))';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

-- Add age restriction columns to membership_packages
ALTER TABLE membership_packages ADD (
    minimum_age NUMBER(3,0) DEFAULT 16,
    maximum_age NUMBER(3,0),
    requires_parental_consent_under NUMBER(3,0) DEFAULT 18,
    age_verification_required CHAR(1) DEFAULT 'N'
);

COMMENT ON COLUMN membership_packages.minimum_age IS 'Minimum age required for this membership tier';
COMMENT ON COLUMN membership_packages.maximum_age IS 'Maximum age allowed (NULL = no limit)';
COMMENT ON COLUMN membership_packages.requires_parental_consent_under IS 'Age below which parental consent is required';
COMMENT ON COLUMN membership_packages.age_verification_required IS 'Whether age verification with ID is required';

-- Add constraint for age_verification_required
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE membership_packages ADD CONSTRAINT chk_age_verification_required CHECK (age_verification_required IN (''Y'', ''N''))';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

-- Create audit log table for DOB changes
CREATE TABLE birth_date_audit_log (
    audit_id NUMBER DEFAULT birth_audit_seq.NEXTVAL PRIMARY KEY,
    user_id NUMBER NOT NULL,
    old_date_of_birth DATE,
    new_date_of_birth DATE,
    changed_by NUMBER NOT NULL,
    change_reason VARCHAR2(500),
    verification_status VARCHAR2(50),
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE birth_date_audit_log ADD CONSTRAINT fk_bdal_user FOREIGN KEY (user_id) REFERENCES users(user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 OR SQLCODE = -2430 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

COMMENT ON COLUMN birth_date_audit_log.audit_id IS 'Primary key';
COMMENT ON COLUMN birth_date_audit_log.user_id IS 'User whose DOB was changed';
COMMENT ON COLUMN birth_date_audit_log.old_date_of_birth IS 'Previous DOB value';
COMMENT ON COLUMN birth_date_audit_log.new_date_of_birth IS 'New DOB value';
COMMENT ON COLUMN birth_date_audit_log.changed_by IS 'User ID who made the change';
COMMENT ON COLUMN birth_date_audit_log.change_reason IS 'Reason for the change';
COMMENT ON COLUMN birth_date_audit_log.verification_status IS 'Status: PENDING, VERIFIED, ADMIN_VERIFIED';
COMMENT ON COLUMN birth_date_audit_log.ip_address IS 'IP address of request';
COMMENT ON COLUMN birth_date_audit_log.user_agent IS 'User agent of request';
COMMENT ON COLUMN birth_date_audit_log.created_at IS 'When the change was made';

-- Create indexes for age-based queries
CREATE INDEX idx_bdal_user ON birth_date_audit_log(user_id);
CREATE INDEX idx_bdal_date ON birth_date_audit_log(created_at);
CREATE INDEX idx_users_dob ON users(date_of_birth);
CREATE INDEX idx_members_age_group ON members(user_id, requires_parental_consent);
