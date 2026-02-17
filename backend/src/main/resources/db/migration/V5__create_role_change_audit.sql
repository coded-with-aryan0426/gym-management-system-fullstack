-- =========================================
-- V5__create_role_change_audit.sql
-- Immutable audit log for role changes
-- =========================================

CREATE TABLE role_change_audit (
    id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         NUMBER NOT NULL,
    gym_id          NUMBER NOT NULL,
    action          VARCHAR2(30) NOT NULL,
    old_role        VARCHAR2(20),
    new_role        VARCHAR2(20),
    performed_by    NUMBER NOT NULL,
    performed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address      VARCHAR2(45),
    user_agent      VARCHAR2(500),
    notes           VARCHAR2(500),
    
    CONSTRAINT chk_rca_action CHECK (action IN (
        'ROLE_GRANTED', 'ROLE_REVOKED', 'ROLE_SUSPENDED', 'ROLE_REINSTATED',
        'ROLE_SWITCHED', 'APPLICATION_SUBMITTED', 'APPLICATION_APPROVED', 
        'APPLICATION_REJECTED', 'APPLICATION_WITHDRAWN'
    ))
);

-- Indexes for audit queries
CREATE INDEX idx_rca_user ON role_change_audit(user_id);
CREATE INDEX idx_rca_gym ON role_change_audit(gym_id);
CREATE INDEX idx_rca_action ON role_change_audit(action);
CREATE INDEX idx_rca_performed_at ON role_change_audit(performed_at);
CREATE INDEX idx_rca_performed_by ON role_change_audit(performed_by);

COMMENT ON TABLE role_change_audit IS 'Immutable audit log for all role-related changes. Used for compliance and security tracking.';
