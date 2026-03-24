-- Create Beta Feedback table for collecting user feedback during beta testing
CREATE TABLE IF NOT EXISTS beta_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tester_name VARCHAR(255),
    tester_email VARCHAR(255) NOT NULL,
    tester_role VARCHAR(50),
    page_route VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    section VARCHAR(255),
    browser VARCHAR(255),
    screen_size VARCHAR(50),
    severity VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    description LONGTEXT,
    steps_to_reproduce LONGTEXT,
    screenshot_url VARCHAR(1000),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    admin_notes LONGTEXT,
    priority_score INT DEFAULT 0,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    session_id VARCHAR(100),
    beta_version VARCHAR(50) DEFAULT '1.0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for optimized queries
    INDEX idx_page_route (page_route),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_tester_email (tester_email),
    INDEX idx_category (category),
    INDEX idx_user_id (user_id),

    -- Foreign key constraint
    CONSTRAINT fk_beta_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create composite indexes for common filter combinations
CREATE INDEX idx_status_submitted_at ON beta_feedback(status, submitted_at DESC);
CREATE INDEX idx_severity_submitted_at ON beta_feedback(severity, submitted_at DESC);
CREATE INDEX idx_page_route_status ON beta_feedback(page_route, status);
