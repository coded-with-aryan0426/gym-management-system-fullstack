-- =========================================
-- V3__create_user_gym_roles.sql
-- Gym-scoped role assignments for AthlonX V2
-- =========================================

CREATE TABLE user_gym_roles (
    id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     NUMBER NOT NULL,
    gym_id      NUMBER NOT NULL,
    role        VARCHAR2(20) NOT NULL,
    status      VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    granted_by  NUMBER,
    granted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP,
    notes       VARCHAR2(500),
    
    CONSTRAINT fk_ugr_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ugr_gym FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON DELETE CASCADE,
    CONSTRAINT fk_ugr_granted_by FOREIGN KEY (granted_by) REFERENCES users(user_id),
    CONSTRAINT uk_user_gym_role UNIQUE (user_id, gym_id, role),
    CONSTRAINT chk_ugr_role CHECK (role IN ('OWNER', 'ADMIN', 'TRAINER', 'MEMBER')),
    CONSTRAINT chk_ugr_status CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED', 'REVOKED'))
);

-- Indexes for common queries
CREATE INDEX idx_ugr_user ON user_gym_roles(user_id);
CREATE INDEX idx_ugr_gym ON user_gym_roles(gym_id);
CREATE INDEX idx_ugr_status ON user_gym_roles(status);
CREATE INDEX idx_ugr_role ON user_gym_roles(role);

COMMENT ON TABLE user_gym_roles IS 'Central table for gym-scoped role assignments. One user can have multiple roles at different gyms.';
