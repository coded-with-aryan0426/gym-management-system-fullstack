-- Speed up "is member waitlisted/booked for class" lookups in GymClassService
CREATE INDEX IF NOT EXISTS idx_class_bookings_class_member_status
    ON class_bookings(gym_class_id, member_user_id, status);

-- Speed up today's classes query
CREATE INDEX IF NOT EXISTS idx_gym_classes_start_time
    ON gym_classes(start_time);
