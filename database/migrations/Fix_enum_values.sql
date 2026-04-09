-- Fix_enum_values.sql - Run in SQL Developer
-- Normalize CHECK_INS STATUS column values to match Java enum conventions

-- Check current distinct values
SELECT DISTINCT STATUS FROM CHECK_INS;

-- Normalize values: replace hyphens with underscores
UPDATE CHECK_INS SET STATUS = 'CHECKED_OUT' WHERE STATUS = 'checked-out';
UPDATE CHECK_INS SET STATUS = 'CHECKED_IN' WHERE STATUS = 'check-in';

-- Verify the fix
SELECT DISTINCT STATUS FROM CHECK_INS;
