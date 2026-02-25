-- V17: Backfill membership timestamp fields from legacy date-only fields
-- Sets start_date_time to midnight of start_date where null
-- Sets end_date_time to 23:59:59 of end_date where null

UPDATE memberships
SET start_date_time = CAST(start_date AS TIMESTAMP)
WHERE start_date_time IS NULL
  AND start_date IS NOT NULL;

UPDATE memberships
SET end_date_time = start_date_time + INTERVAL '1' DAY - INTERVAL '1' SECOND
WHERE end_date_time IS NULL
  AND start_date_time IS NOT NULL
  AND end_date IS NULL;

UPDATE memberships
SET end_date_time = CAST(end_date AS TIMESTAMP) + INTERVAL '23:59:59' HOUR TO SECOND
WHERE end_date_time IS NULL
  AND end_date IS NOT NULL;
