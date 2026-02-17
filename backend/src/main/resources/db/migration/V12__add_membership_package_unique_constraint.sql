-- Add unique constraint on membership_packages (package_name, duration_days)
-- This prevents duplicate plans with the same name and duration

-- First, remove any existing duplicates by keeping only the first occurrence
DELETE FROM membership_packages mp1
WHERE mp1.package_id NOT IN (
    SELECT MIN(mp2.package_id)
    FROM membership_packages mp2
    GROUP BY mp2.package_name, mp2.duration_days
);

-- Add unique constraint
ALTER TABLE membership_packages
ADD CONSTRAINT uk_membership_package_name_duration 
UNIQUE (package_name, duration_days);
