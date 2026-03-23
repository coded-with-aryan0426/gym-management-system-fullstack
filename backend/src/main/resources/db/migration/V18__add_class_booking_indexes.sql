-- Speed up "is member waitlisted/booked for class" lookups in GymClassService
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_class_bookings_class_member_status ON class_bookings(gym_class_id, user_id, status)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN -- -955 is "name is already used by an existing object"
            RAISE;
        END IF;
END;
/

-- Speed up today's classes query
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX idx_gym_classes_start_time ON gym_classes(start_time)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/
