# Database Setup and Verification Instructions

## Overview

This guide provides step-by-step instructions to set up and verify the Gym Management System database.

## Prerequisites

Before starting, ensure you have:
- Oracle Database 11g XE (or compatible version) installed and running
- SQL*Plus or SQL Developer installed
- Access to the database with `system` user credentials
- The workspace files available

## Quick Start

### Option 1: Using SQL*Plus (Command Line)

#### 1. Connect to Oracle Database
\`\`\`bash
sqlplus system/Oracle123@localhost:1521:xe
\`\`\`

#### 2. Run the Schema Setup Script
\`\`\`sql
@database/schema.sql
\`\`\`

This will:
- Create all 4 tables (ROLES, USERS, USER_ROLE_MAP, TRAINER_CUSTOMER_MAP)
- Insert seed data (4 roles, 12+ users, role mappings, trainer-customer relationships)
- Commit all changes

#### 3. Verify the Setup
\`\`\`sql
@database/quick_verify.sql
\`\`\`

This will display:
- All tables that exist
- Record counts for each table
- All roles
- All users
- User-role mappings
- Trainer-customer mappings

#### 4. Exit SQL*Plus
\`\`\`sql
EXIT;
\`\`\`

### Option 2: Using SQL Developer (GUI)

1. Open SQL Developer
2. Create a new connection:
   - Connection Name: `Gym Management`
   - Username: `system`
   - Password: `Oracle123`
   - Hostname: `localhost`
   - Port: `1521`
   - SID: `xe`
3. Click "Test" to verify connection
4. Click "Connect"
5. Open `database/schema.sql` and execute it
6. Open `database/quick_verify.sql` and execute it to verify

## Detailed Verification Steps

### Step 1: Verify Oracle is Running

**On Windows:**
\`\`\`cmd
lsnrctl status
\`\`\`

**On Linux/Mac:**
\`\`\`bash
lsnrctl status
\`\`\`

Expected output should show:
\`\`\`
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=localhost)(PORT=1521)))
Services Summary...
Service "xe" has 1 instance(s).
\`\`\`

### Step 2: Test Database Connection

**Using SQL*Plus:**
\`\`\`bash
sqlplus system/Oracle123@localhost:1521:xe
\`\`\`

If successful, you'll see:
\`\`\`
SQL*Plus: Release 11.2.0.2.0 Production on ...
Connected to:
Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production
\`\`\`

### Step 3: Create Schema and Load Data

Run the schema script:
\`\`\`sql
@database/schema.sql
\`\`\`

Expected output:
\`\`\`
Table created.
Table created.
Table created.
Table created.
1 row created.
1 row created.
1 row created.
1 row created.
...
Commit complete.
\`\`\`

### Step 4: Verify All Tables Exist

\`\`\`sql
SELECT table_name FROM user_tables 
WHERE table_name IN ('ROLES', 'USERS', 'USER_ROLE_MAP', 'TRAINER_CUSTOMER_MAP')
ORDER BY table_name;
\`\`\`

Expected output:
\`\`\`
TABLE_NAME
------------------------------
ROLES
TRAINER_CUSTOMER_MAP
USER_ROLE_MAP
USERS
\`\`\`

### Step 5: Verify Data Counts

\`\`\`sql
SELECT 'ROLES' as table_name, COUNT(*) as record_count FROM roles
UNION ALL
SELECT 'USERS', COUNT(*) FROM users
UNION ALL
SELECT 'USER_ROLE_MAP', COUNT(*) FROM user_role_map
UNION ALL
SELECT 'TRAINER_CUSTOMER_MAP', COUNT(*) FROM trainer_customer_map;
\`\`\`

Expected output:
\`\`\`
TABLE_NAME           RECORD_COUNT
-----------          -----------
ROLES                           4
USERS                          12
USER_ROLE_MAP                  12
TRAINER_CUSTOMER_MAP            5
\`\`\`

### Step 6: Verify Roles

\`\`\`sql
SELECT role_id, role_name FROM roles ORDER BY role_id;
\`\`\`

Expected output:
\`\`\`
   ROLE_ID ROLE_NAME
---------- --------------------------------------------------
         1 OWNER
         2 TRAINER
         3 STAFF
         4 CUSTOMER
\`\`\`

### Step 7: Verify Users

\`\`\`sql
SELECT user_id, username, full_name, email FROM users ORDER BY user_id;
\`\`\`

Expected output (sample):
\`\`\`
   USER_ID USERNAME   FULL_NAME              EMAIL
---------- ---------- ---------------------- ----------------------
         1 admin      John Owner             owner@gym.com
         2 trainer1   Mike Tyson             mike@gym.com
         3 trainer2   Sarah Connor           sarah@gym.com
         4 staff1     Jim Halpert            jim@gym.com
         5 cust1      Alice Smith            alice@gym.com
         6 cust2      Bob Jones              bob@gym.com
         7 cust3      Charlie Brown          charlie@gym.com
         8 owner2     Jane Doe               jane.owner@gym.com
         9 trainer3   Rocky Balboa           rocky@gym.com
        10 staff2     Pam Beesly             pam@gym.com
        11 cust4      David Beckham          david@gym.com
        12 cust5      Serena Williams        serena@gym.com
\`\`\`

### Step 8: Verify User-Role Mappings

\`\`\`sql
SELECT u.user_id, u.username, r.role_name 
FROM user_role_map urm
JOIN users u ON urm.user_id = u.user_id
JOIN roles r ON urm.role_id = r.role_id
ORDER BY u.user_id;
\`\`\`

Expected output (sample):
\`\`\`
   USER_ID USERNAME   ROLE_NAME
---------- ---------- --------------------------------------------------
         1 admin      OWNER
         2 trainer1   TRAINER
         3 trainer2   TRAINER
         4 staff1     STAFF
         5 cust1      CUSTOMER
         6 cust2      CUSTOMER
         7 cust3      CUSTOMER
         8 owner2     OWNER
         9 trainer3   TRAINER
        10 staff2     STAFF
        11 cust4      CUSTOMER
        12 cust5      CUSTOMER
\`\`\`

### Step 9: Verify Trainer-Customer Mappings

\`\`\`sql
SELECT t.user_id as trainer_id, t.username as trainer_name, 
       c.user_id as customer_id, c.username as customer_name
FROM trainer_customer_map tcm
JOIN users t ON tcm.trainer_user_id = t.user_id
JOIN users c ON tcm.customer_user_id = c.user_id
ORDER BY t.user_id, c.user_id;
\`\`\`

Expected output (sample):
\`\`\`
TRAINER_ID TRAINER_NAME CUSTOMER_ID CUSTOMER_NAME
---------- ------------ ----------- ---------------
         2 trainer1              5 cust1
         2 trainer1              6 cust2
         2 trainer1             11 cust4
         3 trainer2              7 cust3
         9 trainer3             11 cust4
         9 trainer3             12 cust5
\`\`\`

## Troubleshooting

### Issue: Cannot Connect to Oracle

**Error:** `ORA-12514: TNS:listener does not currently know of service requested`

**Solution:**
1. Verify Oracle listener is running: `lsnrctl status`
2. Check the database instance name is `xe`
3. Verify the port is `1521`

### Issue: Invalid Username/Password

**Error:** `ORA-01017: invalid username/password`

**Solution:**
1. Verify credentials are correct: `system` / `Oracle123`
2. Check for typos in the connection string
3. Verify the user account is not locked

### Issue: Tables Already Exist

**Error:** `ORA-00955: name is already used by an existing object`

**Solution:**
1. Drop existing tables first:
   \`\`\`sql
   DROP TABLE trainer_customer_map;
   DROP TABLE user_role_map;
   DROP TABLE users;
   DROP TABLE roles;
   \`\`\`
2. Then run `@database/schema.sql` again

### Issue: Foreign Key Constraint Errors

**Error:** `ORA-02291: integrity constraint violated - parent key not found`

**Solution:**
1. Ensure tables are created in the correct order (ROLES, USERS, then mappings)
2. Verify the schema.sql script is run completely without interruption
3. Check that all INSERT statements reference valid parent records

### Issue: No Data Appears

**Error:** Tables exist but are empty

**Solution:**
1. Verify the schema.sql script completed successfully
2. Check for COMMIT statement at the end of the script
3. Run the script again, ensuring all statements execute

## Next Steps

After successful database verification:

1. **Start the Backend**: Run `mvn spring-boot:run` in the `backend` directory
2. **Verify Backend Connection**: Check that the backend starts without database errors
3. **Test API Endpoints**: Use curl or Postman to test `/api/stats` and `/api/users` endpoints
4. **Start the Frontend**: Run `npm run dev` in the `frontend` directory
5. **Verify Data Display**: Check that the frontend displays the stats and user data

## Requirements Satisfied

✓ **Requirement 3.1**: Database connection established and verified
✓ **Requirement 3.2**: User records retrieved with associated roles


## AthlonX v2 Migration (PT Scheduling & Advanced Features)

### Overview

The v2 migration adds comprehensive PT scheduling, staff performance tracking, settings management, and membership packages to the system.

### New Tables Added

1. **pt_sessions** - PT session scheduling and tracking
2. **staff_performance** - Staff performance metrics
3. **staff_shifts** - Staff shift allocation
4. **gym_settings** - Gym configuration settings
5. **membership_packages** - Membership package definitions
6. **blackout_days** - Gym closure dates

### Running the v2 Migration

#### Prerequisites
- Base schema (schema.sql) must be applied first
- Database must be running and accessible

#### Step 1: Apply the Migration

**Using SQL*Plus:**
\`\`\`bash
sqlplus system/Oracle123@localhost:1521:xe
\`\`\`

\`\`\`sql
@database/migration_v2_athlonx_features.sql
\`\`\`

**Using SQL Developer:**
1. Open `database/migration_v2_athlonx_features.sql`
2. Execute the script (F5)

#### Step 2: Verify the Migration

Run the verification script:
\`\`\`sql
@database/verify_migration_v2.sql
\`\`\`

This will check:
- All 6 new tables created
- Indexes created for performance
- Foreign key constraints established
- Check constraints in place
- Seed data loaded
- Data integrity verified

Expected output should show all checks passing with ✓ symbols.

#### Step 3: Verify New Data

**Check PT Sessions:**
\`\`\`sql
SELECT ps.session_id, u1.full_name as trainer, u2.full_name as member,
       TO_CHAR(ps.session_date, 'YYYY-MM-DD HH24:MI') as session_time,
       ps.status
FROM pt_sessions ps
JOIN users u1 ON ps.trainer_id = u1.user_id
JOIN users u2 ON ps.member_id = u2.user_id
ORDER BY ps.session_date;
\`\`\`

**Check Membership Packages:**
\`\`\`sql
SELECT package_name, price, duration_days, included_pt_sessions
FROM membership_packages
WHERE is_active = 1
ORDER BY price;
\`\`\`

**Check Gym Settings:**
\`\`\`sql
SELECT setting_key, setting_value, setting_type
FROM gym_settings
ORDER BY setting_type, setting_key;
\`\`\`

### Migration Rollback (If Needed)

If you need to rollback the v2 migration:

\`\`\`sql
DROP TABLE pt_sessions;
DROP TABLE staff_performance;
DROP TABLE staff_shifts;
DROP TABLE gym_settings;
DROP TABLE membership_packages;
DROP TABLE blackout_days;
COMMIT;
\`\`\`

### Troubleshooting v2 Migration

#### Issue: Tables Already Exist

**Error:** `ORA-00955: name is already used by an existing object`

**Solution:** The migration has already been applied. Verify with:
\`\`\`sql
SELECT table_name FROM user_tables 
WHERE table_name IN ('PT_SESSIONS', 'STAFF_PERFORMANCE', 'STAFF_SHIFTS');
\`\`\`

#### Issue: Foreign Key Constraint Errors

**Error:** `ORA-02291: integrity constraint violated`

**Solution:** Ensure base schema is applied first and users table has data:
\`\`\`sql
SELECT COUNT(*) FROM users;
\`\`\`

Should return at least 12 users.

#### Issue: Insufficient Privileges

**Error:** `ORA-01031: insufficient privileges`

**Solution:** Ensure you're connected as `system` or a user with CREATE TABLE privileges.

### Post-Migration Verification

After successful migration, verify the complete database state:

\`\`\`sql
-- Count all tables
SELECT COUNT(*) as total_tables 
FROM user_tables 
WHERE table_name IN (
    'ROLES', 'USERS', 'USER_ROLE_MAP', 'TRAINER_CUSTOMER_MAP',
    'PT_SESSIONS', 'STAFF_PERFORMANCE', 'STAFF_SHIFTS', 
    'GYM_SETTINGS', 'MEMBERSHIP_PACKAGES', 'BLACKOUT_DAYS'
);
\`\`\`

Expected: 10 tables

\`\`\`sql
-- Verify all data
SELECT 'ROLES' as table_name, COUNT(*) as records FROM roles
UNION ALL SELECT 'USERS', COUNT(*) FROM users
UNION ALL SELECT 'USER_ROLE_MAP', COUNT(*) FROM user_role_map
UNION ALL SELECT 'TRAINER_CUSTOMER_MAP', COUNT(*) FROM trainer_customer_map
UNION ALL SELECT 'PT_SESSIONS', COUNT(*) FROM pt_sessions
UNION ALL SELECT 'STAFF_PERFORMANCE', COUNT(*) FROM staff_performance
UNION ALL SELECT 'STAFF_SHIFTS', COUNT(*) FROM staff_shifts
UNION ALL SELECT 'GYM_SETTINGS', COUNT(*) FROM gym_settings
UNION ALL SELECT 'MEMBERSHIP_PACKAGES', COUNT(*) FROM membership_packages
UNION ALL SELECT 'BLACKOUT_DAYS', COUNT(*) FROM blackout_days;
\`\`\`

All tables should have data.

### Additional Resources

- **Migration Guide**: See `database/MIGRATION_GUIDE.md` for detailed migration instructions
- **Verification Script**: Use `database/verify_migration_v2.sql` for automated verification
- **Schema Documentation**: Review the design document at `.kiro/specs/athlonx-complete-system/design.md`

### Requirements Satisfied (v2)

✓ **Requirement 9.1**: Third Normal Form database normalization implemented
✓ **Requirement 9.2**: Dedicated pt_sessions table created
✓ **Requirement 9.3**: Foreign key constraints to users table established
✓ **Requirement 9.5**: Indexed columns for fast query retrieval
