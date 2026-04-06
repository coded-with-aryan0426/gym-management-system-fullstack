-- Fix missing GENDER column in users table
ALTER TABLE users ADD (gender VARCHAR2(20));
