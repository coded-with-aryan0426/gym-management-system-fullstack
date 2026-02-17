-- Create Member Preferences table
CREATE TABLE member_preferences (
    user_id NUMBER PRIMARY KEY,
    workout_preferences VARCHAR2(1000),
    skill_level VARCHAR2(255),
    theme VARCHAR2(50) DEFAULT 'LIGHT',
    language VARCHAR2(50) DEFAULT 'en',
    CONSTRAINT fk_prefs_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Notification Settings table
CREATE TABLE notification_settings (
    user_id NUMBER PRIMARY KEY,
    workout_reminders NUMBER(1) DEFAULT 1,
    class_schedule NUMBER(1) DEFAULT 1,
    trainer_messages NUMBER(1) DEFAULT 1,
    marketing_emails NUMBER(1) DEFAULT 0,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Privacy Settings table
CREATE TABLE privacy_settings (
    user_id NUMBER PRIMARY KEY,
    profile_visibility VARCHAR2(50) DEFAULT 'PUBLIC',
    show_progress_photos NUMBER(1) DEFAULT 1,
    allow_trainer_access NUMBER(1) DEFAULT 1,
    CONSTRAINT fk_privacy_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Indexes
CREATE INDEX idx_member_prefs_user ON member_preferences(user_id);
CREATE INDEX idx_notif_settings_user ON notification_settings(user_id);
CREATE INDEX idx_privacy_settings_user ON privacy_settings(user_id);
