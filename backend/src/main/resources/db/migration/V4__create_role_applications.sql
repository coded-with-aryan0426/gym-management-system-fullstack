-- =========================================
-- V4__create_role_applications.sql
-- Role application workflow for AthlonX V2
-- =========================================

CREATE TABLE role_applications (
    id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         NUMBER NOT NULL,
    gym_id          NUMBER NOT NULL,
    requested_role  VARCHAR2(20) NOT NULL,
    status          VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    applied_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by     NUMBER,
    reviewed_at     TIMESTAMP,
    rejection_reason VARCHAR2(500),
    credentials     CLOB,
    
    CONSTRAINT fk_ra_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ra_gym FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON DELETE CASCADE,
    CONSTRAINT fk_ra_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id),
    CONSTRAINT chk_ra_role CHECK (requested_role IN ('TRAINER', 'ADMIN')),
    CONSTRAINT chk_ra_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'))
);

-- Indexes
CREATE INDEX idx_ra_user ON role_applications(user_id);
CREATE INDEX idx_ra_gym ON role_applications(gym_id);
CREATE INDEX idx_ra_status ON role_applications(status);

-- Prevent duplicate pending applications
CREATE UNIQUE INDEX uk_pending_application ON role_applications(user_id, gym_id, requested_role) 
WHERE status = 'PENDING';

COMMENT ON TABLE role_applications IS 'Tracks applications from members to become trainers/admins with approval workflow.';
