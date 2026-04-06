-- Create MEMBER_POINTS table
CREATE TABLE member_points (
    id NUMBER PRIMARY KEY,
    member_id NUMBER NOT NULL,
    gym_id NUMBER NOT NULL,
    points NUMBER NOT NULL,
    points_type VARCHAR2(50),
    description VARCHAR2(500),
    transaction_date TIMESTAMP,
    reference_id VARCHAR2(100),
    created_at TIMESTAMP
);

COMMIT;