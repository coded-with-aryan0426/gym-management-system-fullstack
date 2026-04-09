# Oracle Database Backup Guide

## Backup Files

| File | Size | Description |
|-------|------|-------------|
| `gym_backup_SYSTEM_20260409.dmp` | 5.6MB | Oracle Data Pump dump (full SYSTEM schema export) |
| `gym_export_SYSTEM.log` | 7.2KB | Export log |

---

## What's Included in the Backup

All app tables and data under the `SYSTEM` schema:

- `USERS` (175 rows) — user accounts
- `ROLES`, `USER_ROLE_MAP`, `USER_GYM_ROLES` — roles & permissions
- `MEMBERSHIPS` (120 rows), `MEMBERSHIP_PLANS`, `MEMBERSHIP_PACKAGES` — membership data
- `EQUIPMENT`, `GROUP_CLASSES`, `TRAINER_CLASSES` — gym classes & equipment
- `CLASS_BOOKINGS`, `PT_SESSIONS` (1387 rows) — session bookings
- `TRANSACTIONS`, `INVOICES` — financial records
- `AUDIT_LOGS`, `NOTIFICATIONS`, `GYMS`, `TRAINER_DETAILS`
- Plus 40+ more supporting tables

---

## How to Restore on Any Device

### Step 1: Set Up Oracle (Same as Before)

Run Oracle FREE in Docker:

```bash
docker run -d \
  --name oracle-db \
  -p 1521:1521 \
  -e ORACLE_PWD=Oracle123 \
  gvenzl/oracle-free
```

Wait ~2-3 minutes for Oracle to initialize, then connect with:
- Host: `localhost`
- Port: `1521`
- Service Name: `FREE`
- Username: `system`
- Password: `Oracle123`

---

### Step 2: Copy Backup Files Into Container

```bash
# Copy the dump file into the container's Data Pump directory
docker cp gym_backup_SYSTEM_20260409.dmp oracle-db:/opt/oracle/admin/FREE/dpdump/
docker cp gym_export_SYSTEM.log oracle-db:/opt/oracle/admin/FREE/dpdump/
```

---

### Step 3: Import the Backup (Data Pump)

```bash
# Run the import (restore all SYSTEM schema objects)
docker exec -i oracle-db impdp \
  system/Oracle123@FREE \
  schemas=SYSTEM \
  directory=DATA_PUMP_DIR \
  dumpfile=gym_backup_SYSTEM_20260409.dmp \
  logfile=gym_restore.log
```

**If importing to a different schema name** (e.g. `GYMAPP` instead of `SYSTEM`):

```bash
docker exec -i oracle-db impdp \
  system/Oracle123@FREE \
  schemas=SYSTEM \
  directory=DATA_PUMP_DIR \
  dumpfile=gym_backup_SYSTEM_20260409.dmp \
  logfile=gym_restore.log \
  remap_schema=SYSTEM:GYMAPP
```

Then update `application.properties` to use `GYMAPP` as the username.

**If importing into an existing schema that already has objects**:

```bash
docker exec -i oracle-db impdp \
  system/Oracle123@FREE \
  schemas=SYSTEM \
  directory=DATA_PUMP_DIR \
  dumpfile=gym_backup_SYSTEM_20260409.dmp \
  logfile=gym_restore.log \
  TABLE_EXISTS_ACTION=REPLACE
```

---

### Step 4: Configure Backend to Connect

Edit `backend/src/main/resources/application.properties`:

```properties
# Oracle connection (adjust host/port if not local)
spring.datasource.url=jdbc:oracle:thin:@localhost:1521/FREE
spring.datasource.username=SYSTEM
spring.datasource.password=Oracle123

# Let Hibernate auto-update schema (or use 'none' if schema is complete)
spring.jpa.hibernate.ddl-auto=update
```

If you used a remapped schema, change `username=SYSTEM` to your new schema name.

---

### Step 5: Pull Code & Start Backend

```bash
cd backend
git pull origin main   # or your branch name
mvn spring-boot:run
```

Backend will start on port **8080** (or 8081 if 8080 is busy).

---

## Quick Reference

| Item | Value |
|------|-------|
| Docker Image | `gvenzl/oracle-free` |
| Container Name | `oracle-db` |
| Host Port | `1521` |
| Service Name | `FREE` |
| System User | `system` |
| System Password | `Oracle123` |
| Data Pump Directory | `DATA_PUMP_DIR` (path: `/opt/oracle/admin/FREE/dpdump`) |
| Backup Dump File | `gym_backup_SYSTEM_20260409.dmp` |

---

## Export Command (How This Backup Was Made)

```bash
docker exec -i oracle-db expdp \
  system/Oracle123@FREE \
  schemas=SYSTEM \
  directory=DATA_PUMP_DIR \
  dumpfile=gym_backup_SYSTEM_20260409.dmp \
  logfile=gym_export_SYSTEM.log
```

---

## Common Issues & Fixes

### "ORA-12514: TNS:listener does not currently know of service"
Oracle is still starting up. Wait 2-3 minutes and retry.

### "ORA-01017: invalid username/password"
Check credentials: `system` / `Oracle123` (case sensitive).

### "ORA-00959: tablespace 'USERS' does not exist"
Run before import:
```sql
CREATE TABLESPACE users DATAFILE 'users.dbf' SIZE 100M AUTOEXTEND ON;
```

### Import fails with "tables already exist"
Use `TABLE_EXISTS_ACTION=REPLACE` to overwrite.

### Want to export only specific tables?
```bash
docker exec -i oracle-db expdp \
  system/Oracle123@FREE \
  tables=USERS,MEMBERSHIPS,ROLES \
  directory=DATA_PUMP_DIR \
  dumpfile=gym_tables.dmp
```

---

## Backup on New Mac/Windows (SQL Developer GUI Alternative)

Instead of terminal commands, you can use SQL Developer on any device:

### Export (using SQL Developer Database Export Wizard)
1. Connect to your Oracle DB (system/Oracle123@localhost:1521/FREE)
2. Tools → Database Export
3. Select "DDL and Data"
4. Choose "Schemas" → select SYSTEM
5. Click Next → Finish
6. Save as `.sql` file

### Import (using SQL Developer Data Pump Import Wizard)
1. View → DBA → add a connection (system/Oracle123)
2. Data Pump → Import Jobs → right-click → Data Pump Import Wizard
3. Select the `.dmp` file
4. Start import

---

*Backup created: 2026-04-09*
*Backup tool: Oracle Data Pump (expdp/impdp)*
*Oracle version: Oracle AI Database 23.26.0.0.0 (FREE)*
