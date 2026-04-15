-- V107__add_parental_consent_table.sql
-- Create parental consent table for minors

-- Create parental consent table
CREATE TABLE parental_consent (
    consent_id NUMBER DEFAULT parental_consent_seq.NEXTVAL PRIMARY KEY,
    user_id NUMBER NOT NULL,
    guardian_name VARCHAR2(200) NOT NULL,
    guardian_email VARCHAR2(200) NOT NULL,
    guardian_phone VARCHAR2(20),
    guardian_relation VARCHAR2(50) NOT NULL,
    guardian_id_document_id NUMBER(22),
    consent_status VARCHAR2(50) DEFAULT 'PENDING',
    consent_given_at TIMESTAMP,
    expires_at TIMESTAMP,
    verification_token VARCHAR2(255),
    ip_address VARCHAR2(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE parental_consent ADD CONSTRAINT fk_pc_user FOREIGN KEY (user_id) REFERENCES users(user_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 OR SQLCODE = -2430 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE parental_consent ADD CONSTRAINT chk_consent_status CHECK (consent_status IN (''PENDING'', ''APPROVED'', ''REJECTED'', ''EXPIRED''))';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

COMMENT ON COLUMN parental_consent.consent_id IS 'Primary key';
COMMENT ON COLUMN parental_consent.user_id IS 'User (minor) requiring consent';
COMMENT ON COLUMN parental_consent.guardian_name IS 'Full name of parent/guardian';
COMMENT ON COLUMN parental_consent.guardian_email IS 'Email of parent/guardian for verification';
COMMENT ON COLUMN parental_consent.guardian_phone IS 'Phone of parent/guardian';
COMMENT ON COLUMN parental_consent.guardian_relation IS 'Relationship: PARENT, GUARDIAN, OTHER';
COMMENT ON COLUMN parental_consent.guardian_id_document_id IS 'Reference to uploaded ID document';
COMMENT ON COLUMN parental_consent.consent_status IS 'Status: PENDING, APPROVED, REJECTED, EXPIRED';
COMMENT ON COLUMN parental_consent.consent_given_at IS 'When consent was given';
COMMENT ON COLUMN parental_consent.expires_at IS 'When consent expires';
COMMENT ON COLUMN parental_consent.verification_token IS 'Token for email verification';
COMMENT ON COLUMN parental_consent.ip_address IS 'IP address when consent was submitted';
COMMENT ON COLUMN parental_consent.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN parental_consent.updated_at IS 'Record update timestamp';

-- Create indexes
CREATE INDEX idx_pc_user ON parental_consent(user_id);
CREATE INDEX idx_pc_token ON parental_consent(verification_token);
CREATE INDEX idx_pc_status ON parental_consent(consent_status);

-- Create sequence for parental_consent if not exists
BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE parental_consent_seq START WITH 1 INCREMENT BY 1';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02285 OR SQLCODE = -955 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

-- Create birth_audit_seq sequence if not exists
BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE birth_audit_seq START WITH 1 INCREMENT BY 1';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02285 OR SQLCODE = -955 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

-- Create training program age rules table
CREATE TABLE training_program_age_rules (
    rule_id NUMBER DEFAULT program_rule_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    program_id NUMBER NOT NULL,
    minimum_age NUMBER(3,0),
    maximum_age NUMBER(3,0),
    requires_medical_clearance_above NUMBER(3,0),
    requires_parental_consent_under NUMBER(3,0),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE training_program_age_rules ADD CONSTRAINT fk_tpar_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 OR SQLCODE = -2430 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

COMMENT ON COLUMN training_program_age_rules.rule_id IS 'Primary key';
COMMENT ON COLUMN training_program_age_rules.gym_id IS 'Gym this rule applies to';
COMMENT ON COLUMN training_program_age_rules.program_id IS 'Training program this rule applies to';
COMMENT ON COLUMN training_program_age_rules.minimum_age IS 'Minimum age to join program';
COMMENT ON COLUMN training_program_age_rules.maximum_age IS 'Maximum age to join program';
COMMENT ON COLUMN training_program_age_rules.requires_medical_clearance_above IS 'Age above which medical clearance required';
COMMENT ON COLUMN training_program_age_rules.requires_parental_consent_under IS 'Age below which parental consent required';
COMMENT ON COLUMN training_program_age_rules.is_active IS 'Whether rule is active';

CREATE INDEX idx_tpar_program ON training_program_age_rules(program_id);
CREATE INDEX idx_tpar_age ON training_program_age_rules(minimum_age, maximum_age);

-- Create equipment age restrictions table
CREATE TABLE equipment_age_restrictions (
    restriction_id NUMBER DEFAULT equip_restrict_seq.NEXTVAL PRIMARY KEY,
    gym_id NUMBER NOT NULL,
    equipment_id NUMBER NOT NULL,
    minimum_age NUMBER(3,0),
    maximum_age NUMBER(3,0),
    requires_supervision_under NUMBER(3,0),
    requires_induction CHAR(1) DEFAULT 'N',
    restriction_reason VARCHAR2(500),
    is_active CHAR(1) DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE equipment_age_restrictions ADD CONSTRAINT fk_ear_gym FOREIGN KEY (gym_id) REFERENCES gym_profiles(gym_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 OR SQLCODE = -2430 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE equipment_age_restrictions ADD CONSTRAINT fk_ear_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -02275 OR SQLCODE = -2430 THEN NULL;
        ELSE RAISE;
        END IF;
END;
/

COMMENT ON COLUMN equipment_age_restrictions.restriction_id IS 'Primary key';
COMMENT ON COLUMN equipment_age_restrictions.gym_id IS 'Gym this restriction applies to';
COMMENT ON COLUMN equipment_age_restrictions.equipment_id IS 'Equipment this restriction applies to';
COMMENT ON COLUMN equipment_age_restrictions.minimum_age IS 'Minimum age to use equipment';
COMMENT ON COLUMN equipment_age_restrictions.maximum_age IS 'Maximum age to use equipment';
COMMENT ON COLUMN equipment_age_restrictions.requires_supervision_under IS 'Age below which supervision required';
COMMENT ON COLUMN equipment_age_restrictions.requires_induction IS 'Whether induction is required';
COMMENT ON COLUMN equipment_age_restrictions.restriction_reason IS 'Reason for restriction';
COMMENT ON COLUMN equipment_age_restrictions.is_active IS 'Whether restriction is active';

CREATE INDEX idx_ear_equipment ON equipment_age_restrictions(equipment_id);
CREATE INDEX idx_ear_age ON equipment_age_restrictions(minimum_age, maximum_age);
