-- Add new columns to progress_notes table for rich content
ALTER TABLE progress_notes
ADD COLUMN session_date DATE,
ADD COLUMN session_time TIME,
ADD COLUMN session_type VARCHAR(255),
ADD COLUMN category VARCHAR(50),
ADD COLUMN mood VARCHAR(20),
ADD COLUMN highlights_json CLOB,
ADD COLUMN concerns_json CLOB,
ADD COLUMN goals_json CLOB,
ADD COLUMN stats_json CLOB,
ADD COLUMN attachments_json CLOB,
ADD COLUMN tags_json CLOB,
ADD COLUMN follow_up CLOB,
ADD COLUMN is_private NUMBER(1) DEFAULT 0;

-- Update existing records to have defaults if needed
UPDATE progress_notes SET 
    session_date = CURRENT_DATE,
    session_time = CURRENT_TIME,
    session_type = 'General Session',
    category = 'general',
    mood = 'good',
    is_private = 0
WHERE session_date IS NULL;
