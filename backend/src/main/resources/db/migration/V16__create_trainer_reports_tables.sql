-- V16: Create trainer reports infrastructure tables
-- SessionRating: Real ratings for sessions (no mocks)
-- TrainerCompensationRule: Owner-configurable trainer rates
-- TrainerAchievement: Persistent, idempotent achievement tracking

-- Session Ratings table
CREATE TABLE session_ratings (
    id NUMBER(19) GENERATED AS IDENTITY PRIMARY KEY,
    session_id NUMBER(19),
    class_id NUMBER(19),
    trainer_id NUMBER(19) NOT NULL,
    member_id NUMBER(19) NOT NULL,
    rating NUMBER(10) NOT NULL,
    rating_comment VARCHAR2(500),
    session_type VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_rating_trainer FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_member FOREIGN KEY (member_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_rating_trainer ON session_ratings(trainer_id);
CREATE INDEX idx_rating_member ON session_ratings(member_id);
CREATE INDEX idx_rating_session ON session_ratings(session_id);
CREATE INDEX idx_rating_created ON session_ratings(created_at);

-- Trainer Compensation Rules table
CREATE TABLE trainer_compensation_rules (
    id NUMBER(19) GENERATED AS IDENTITY PRIMARY KEY,
    trainer_id NUMBER(19) NOT NULL,
    per_session_rate NUMBER(10, 2),
    per_hour_rate NUMBER(10, 2),
    per_class_rate NUMBER(10, 2),
    per_attendee_rate NUMBER(10, 2),
    commission_percent NUMBER(5, 2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_compensation_trainer FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_compensation_trainer ON trainer_compensation_rules(trainer_id);
CREATE INDEX idx_compensation_effective ON trainer_compensation_rules(effective_from);

-- Trainer Achievements table
CREATE TABLE trainer_achievements (
    id NUMBER(19) GENERATED AS IDENTITY PRIMARY KEY,
    trainer_id NUMBER(19) NOT NULL,
    achievement_type VARCHAR2(50) NOT NULL,
    achievement_key VARCHAR2(100) NOT NULL,
    label VARCHAR2(200) NOT NULL,
    icon_name VARCHAR2(50),
    color_hex VARCHAR2(10),
    achieved_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_achievement_trainer FOREIGN KEY (trainer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_trainer_achievement UNIQUE (trainer_id, achievement_type, achievement_key)
);

CREATE INDEX idx_achievement_trainer ON trainer_achievements(trainer_id);
CREATE INDEX idx_achievement_type ON trainer_achievements(achievement_type);
