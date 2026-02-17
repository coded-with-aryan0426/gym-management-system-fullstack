-- =========================================
-- V7__add_social_auth_fields.sql
-- Add social login and phone auth fields
-- =========================================

-- Add social authentication fields to users table
ALTER TABLE users ADD (
    google_id VARCHAR2(255),
    facebook_id VARCHAR2(255),
    phone_number VARCHAR2(20),
    auth_provider VARCHAR2(20) DEFAULT 'LOCAL'
);

-- Add unique constraints
CREATE UNIQUE INDEX uk_users_google_id ON users(google_id);
CREATE UNIQUE INDEX uk_users_facebook_id ON users(facebook_id);
CREATE UNIQUE INDEX uk_users_phone ON users(phone_number);

-- Add constraint for auth_provider values
ALTER TABLE users ADD CONSTRAINT chk_auth_provider 
    CHECK (auth_provider IN ('LOCAL', 'GOOGLE', 'FACEBOOK'));

-- Create OTP table for multi-channel verification
CREATE TABLE otp_codes (
    id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         NUMBER,
    target          VARCHAR2(255) NOT NULL,
    target_type     VARCHAR2(20) NOT NULL,
    otp_code        VARCHAR2(10) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP NOT NULL,
    verified        NUMBER(1) DEFAULT 0,
    attempts        NUMBER DEFAULT 0,
    
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_target_type CHECK (target_type IN ('EMAIL', 'SMS', 'WHATSAPP'))
);

-- Index for quick OTP lookup
CREATE INDEX idx_otp_target ON otp_codes(target, target_type, verified);

COMMENT ON TABLE otp_codes IS 'Stores OTP codes for email, SMS, and WhatsApp verification.';
