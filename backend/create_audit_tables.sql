-- Create sequences for Oracle
CREATE SEQUENCE AUDIT_LOG_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE USER_SESSION_SEQ START WITH 1 INCREMENT BY 1;

-- Create audit_logs table
CREATE TABLE audit_logs (
    audit_id NUMBER(19) PRIMARY KEY,
    action VARCHAR2(100) NOT NULL,
    entity VARCHAR2(100),
    entity_id VARCHAR2(100),
    entity_name VARCHAR2(255),
    target VARCHAR2(255),
    user_name VARCHAR2(100),
    user_role VARCHAR2(50),
    user_avatar VARCHAR2(500),
    details CLOB,
    changes CLOB,
    ip_address VARCHAR2(50),
    location VARCHAR2(255),
    device_type VARCHAR2(50),
    browser VARCHAR2(100),
    os VARCHAR2(100),
    session_id VARCHAR2(100),
    severity VARCHAR2(20) DEFAULT 'info',
    metadata CLOB,
    timestamp TIMESTAMP NOT NULL,
    user_id NUMBER(19),
    gym_id NUMBER(19)
);

-- Create indexes for audit_logs
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity);
CREATE INDEX idx_audit_severity ON audit_logs(severity);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_gym_id ON audit_logs(gym_id);

-- Create user_sessions table
CREATE TABLE user_sessions (
    session_id NUMBER(19) PRIMARY KEY,
    user_id NUMBER(19) NOT NULL,
    gym_id NUMBER(19),
    token_hash VARCHAR2(256) NOT NULL,
    status VARCHAR2(20) DEFAULT 'online',
    device VARCHAR2(255),
    device_type VARCHAR2(50),
    browser VARCHAR2(100),
    os VARCHAR2(100),
    ip_address VARCHAR2(50),
    location VARCHAR2(255),
    user_agent CLOB,
    created_at TIMESTAMP NOT NULL,
    last_active_at TIMESTAMP,
    logout_at TIMESTAMP,
    expires_at TIMESTAMP,
    duration NUMBER(19),
    is_active NUMBER(1) DEFAULT 1 NOT NULL
);

-- Create indexes for user_sessions
CREATE INDEX idx_session_user_id ON user_sessions(user_id);
CREATE INDEX idx_session_gym_id ON user_sessions(gym_id);
CREATE INDEX idx_session_status ON user_sessions(status);
CREATE INDEX idx_session_active ON user_sessions(is_active);

-- Add foreign key constraints (optional - uncomment if needed)
-- ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id);
-- ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_gym FOREIGN KEY (gym_id) REFERENCES gyms(gym_id);
-- ALTER TABLE user_sessions ADD CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id);
-- ALTER TABLE user_sessions ADD CONSTRAINT fk_session_gym FOREIGN KEY (gym_id) REFERENCES gyms(gym_id);

COMMIT;
