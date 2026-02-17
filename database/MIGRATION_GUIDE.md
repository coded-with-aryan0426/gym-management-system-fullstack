# AthlonX Database Migration Guide

## Overview
This guide explains how to apply the v2 migration that adds PT Scheduling, Staff Performance, Settings, and Package Management features to the AthlonX Gym Management System.

## Prerequisites
- Oracle Database installed and running
- Base schema (schema.sql) already applied
- SQL*Plus or Oracle SQL Developer installed
- Database connection credentials

## Migration Files
1. `schema.sql` - Base schema (v1) - Should already be applied
2. `migration_v2_athlonx_features.sql` - New migration for v2 features

## Step-by-Step Migration Process

### Option 1: Using SQL*Plus (Command Line)

1. **Connect to your Oracle database:**
   \`\`\`bash
   sqlplus username/password@localhost:1521/XEPDB1
   \`\`\`

2. **Run the migration script:**
   \`\`\`sql
   @migration_v2_athlonx_features.sql
   \`\`\`

3. **Verify the migration:**
   The script includes verification queries at the end that will automatically run.

### Option 2: Using Oracle SQL Developer (GUI)

1. **Open Oracle SQL Developer**

2. **Connect to your database**
   - Right-click on your connection
   - Select "Connect"

3. **Open the migration script**
   - File → Open → Select `migration_v2_athlonx_features.sql`

4. **Execute the script**
   - Click the "Run Script" button (F5)
   - Or press F5 on your keyboard

5. **Review the output**
   - Check the Script Output panel for any errors
   - Verify the verification queries show expected results

## What Gets Created

### New Tables
1. **pt_sessions** - PT session scheduling and tracking
2. **staff_performance** - Staff performance metrics
3. **staff_shifts** - Staff shift allocation
4. **gym_settings** - Gym configuration settings
5. **membership_packages** - Membership package definitions
6. **blackout_days** - Gym closure dates

### Indexes
Performance indexes are created on:
- Foreign key columns
- Date columns
- Status columns
- Frequently queried columns

### Seed Data
The migration includes sample data:
- Default gym hours (Mon-Sun)
- PT configuration settings
- 5 membership packages
- Sample PT sessions
- Staff performance records
- Staff shifts
- Holiday blackout days

## Verification

After running the migration, verify success by checking:

### 1. Table Creation
\`\`\`sql
SELECT table_name FROM user_tables 
WHERE table_name IN (
    'PT_SESSIONS', 
    'STAFF_PERFORMANCE', 
    'STAFF_SHIFTS', 
    'GYM_SETTINGS', 
    'MEMBERSHIP_PACKAGES', 
    'BLACKOUT_DAYS'
) 
ORDER BY table_name;
\`\`\`
Expected: 6 tables

### 2. Row Counts
\`\`\`sql
SELECT 'PT_SESSIONS' as table_name, COUNT(*) as row_count FROM pt_sessions
UNION ALL
SELECT 'STAFF_PERFORMANCE', COUNT(*) FROM staff_performance
UNION ALL
SELECT 'STAFF_SHIFTS', COUNT(*) FROM staff_shifts
UNION ALL
SELECT 'GYM_SETTINGS', COUNT(*) FROM gym_settings
UNION ALL
SELECT 'MEMBERSHIP_PACKAGES', COUNT(*) FROM membership_packages
UNION ALL
SELECT 'BLACKOUT_DAYS', COUNT(*) FROM blackout_days;
\`\`\`
Expected: Data in all tables

### 3. Foreign Key Constraints
\`\`\`sql
SELECT constraint_name, table_name, constraint_type 
FROM user_constraints 
WHERE table_name IN (
    'PT_SESSIONS', 
    'STAFF_PERFORMANCE', 
    'STAFF_SHIFTS'
)
AND constraint_type = 'R';
\`\`\`
Expected: Foreign key constraints present

## Rollback (If Needed)

If you need to rollback the migration:

\`\`\`sql
-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE pt_sessions;
DROP TABLE staff_performance;
DROP TABLE staff_shifts;
DROP TABLE gym_settings;
DROP TABLE membership_packages;
DROP TABLE blackout_days;

COMMIT;
\`\`\`

## Troubleshooting

### Error: Table already exists
- The migration has already been run
- Check if tables exist: `SELECT table_name FROM user_tables WHERE table_name LIKE 'PT_%' OR table_name LIKE 'STAFF_%';`

### Error: Foreign key constraint violation
- Ensure base schema (schema.sql) has been applied first
- Verify users table exists and has data

### Error: Insufficient privileges
- Ensure your database user has CREATE TABLE, CREATE INDEX privileges
- Contact your DBA if needed

### Error: ORA-00001 unique constraint violated
- The seed data may already exist
- You can skip the INSERT statements or modify them

## Post-Migration Steps

1. **Update Backend Configuration**
   - Ensure Spring Boot application.properties has correct database connection
   - Restart the backend application

2. **Test the Migration**
   - Run backend tests to verify database connectivity
   - Check that new endpoints can access new tables

3. **Backup**
   - Create a backup of your database after successful migration
   \`\`\`bash
   exp username/password@localhost:1521/XEPDB1 file=athlonx_v2_backup.dmp full=y
   \`\`\`

## Support

If you encounter issues:
1. Check the Oracle alert log for detailed error messages
2. Verify database connection and credentials
3. Ensure sufficient tablespace is available
4. Review the migration script for any syntax errors specific to your Oracle version

## Database Schema Diagram

\`\`\`
users (existing)
  ├── pt_sessions (new) - trainer_id, member_id → users.user_id
  ├── staff_performance (new) - staff_id → users.user_id
  └── staff_shifts (new) - staff_id → users.user_id

gym_settings (new) - standalone configuration table
membership_packages (new) - standalone package definitions
blackout_days (new) - standalone holiday/closure dates
\`\`\`

## Next Steps

After successful migration:
1. Proceed with backend entity creation (Task 2)
2. Implement repository layer (Task 3)
3. Build service layer (Tasks 5-7)
4. Create REST controllers (Task 8)
