# Database Transformation Plan: Multi-Tenant to Single-Gym Deployment

## Document Information

- **Version**: 3.0 (Final)
- **Date**: 2026-04-09
- **Status**: Ready for Implementation
- **Goal**: Transform to single-gym deployable architecture

---

## 1. TRANSFORMATION GOAL

### 1.1 Objective
Convert the gym management system from a **multi-tenant architecture** to a **single-gym per deployment architecture**.

### 1.2 Target Architecture

```
BEFORE (Multi-Tenant):
┌─────────────────────────────────────────────────────────┐
│  ONE deployment serving MULTIPLE gyms                   │
│  Shared database with gym_id isolation                   │
│  User → UserGymRole → Gym (many-to-many)               │
└─────────────────────────────────────────────────────────┘

AFTER (Single-Gym):
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  GYM A          │   │  GYM B          │   │  GYM C          │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │ Backend JAR │ │   │ │ Backend JAR │ │   │ │ Backend JAR │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │ DB (GymA)  │ │   │ │ DB (GymB)   │ │   │ │ DB (GymC)   │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
└─────────────────┘   └─────────────────┘   └─────────────────┘
       SAME CODEBASE - Different .env/config per deployment
```

### 1.3 Benefits
- Complete data isolation (one database per gym)
- Independent deployment/upgrades per gym
- Simplified code (no tenant context needed)
- Better security (no data leakage between gyms)
- Easier troubleshooting

---

## 2. DECISIONS (Final)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Table name `gyms` vs `gym_profiles`? | `gyms` | Match entity `@Table(name = "gyms")` |
| SuperAdmin endpoints? | REMOVE | No platform admin in single-gym |
| Database schema? | Fresh `SCHEMA_SINGLE_GYM.sql` | Clean schema without gym_id |
| Existing multi-gym data? | Migrate to single gym | Keep one gym's data, strip gym_id |

---

## 3. COMPLETE FILE CHANGES

### 3.1 FILES TO DELETE (9 files)

| # | File Path | Purpose |
|---|----------|---------|
| 1 | `context/TenantContext.java` | ThreadLocal holder for tenant ID |
| 2 | `context/TenantAwareEntity.java` | Base entity with tenant support |
| 3 | `context/TenantNotSetException.java` | Custom exception |
| 4 | `filter/TenantIsolationFilter.java` | HTTP filter sets tenant from header |
| 5 | `filter/TenantFilter.java` | Additional tenant filter |
| 6 | `interceptor/TenantAccessInterceptor.java` | Service layer tenant enforcement |
| 7 | `interceptor/NoTenantRequired.java` | Annotation bypass tenant check |
| 8 | `repository/TenantAwareRepository.java` | Base repo with auto tenant scoping |
| 9 | `database/MULTI_TENANT_ARCHITECTURE.md` | Multi-tenant documentation |

### 3.2 ENTITIES TO MODIFY (10 entities - Remove gymId)

| # | Entity File | Field to Remove | Line |
|---|------------|-----------------|------|
| 1 | `MemberPoints.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 21-22 |
| 2 | `FinancialTransaction.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 39-40 |
| 3 | `Transaction.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 29-30 |
| 4 | `TrainerClass.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 25-26 |
| 5 | `RoleChangeAudit.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 27-28 |
| 6 | `ProgressNote.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 14-15 |
| 7 | `Invoice.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 31-32 |
| 8 | `Equipment.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 25-26 |
| 9 | `CheckIn.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 16-17 |
| 10 | `BillingSettings.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 30-31 |
| 11 | `GymTask.java` | `private Long gymId;` + `@Column(name = "gym_id")` | 52-53 |

### 3.3 ENTITIES TO KEEP AS-IS

| # | Entity File | Reason |
|---|------------|--------|
| 1 | `Gym.java` | This IS the single gym config entity |
| 2 | `User.java` | gymId is @Transient (not persisted), no changes needed |
| 3 | `GymClass.java` | Does NOT have gymId field |
| 4 | `Membership.java` | Does NOT have gymId field |
| 5 | `PTSession.java` | Does NOT have gymId field |
| 6 | `ClassBooking.java` | Does NOT have gymId field |
| 7 | `Notification.java` | Does NOT have gymId field |

### 3.4 SERVICES TO MODIFY (4 services)

| # | Service File | Changes Required |
|---|-------------|------------------|
| 1 | `SuperAdminDashboardService.java` | Remove multi-gym aggregation, remove UserGymRole usage |
| 2 | `PermissionService.java` | Remove gym scoping from role/permission checks |
| 3 | `ChatUserService.java` | Remove gym scoping from user lookup |
| 4 | `AttendanceService.java` | Replace `findAll().get(0)` with single gym config |

### 3.5 CONTROLLERS TO MODIFY (4 controllers)

| # | Controller File | Changes Required |
|---|---------------|------------------|
| 1 | `SuperAdminController.java` | REMOVE all multi-gym endpoints (`/gyms/**`) |
| 2 | `GymController.java` | Simplify to single gym config |
| 3 | `ChatController.java` | Remove "search across all gyms" logic |
| 4 | `SecurityConfig.java` | Remove TenantIsolationFilter from filter chain |

### 3.6 CONFIG/INITIALIZER TO MODIFY (2 files)

| # | File | Changes Required |
|---|------|------------------|
| 1 | `TrainerReportsDataSeeder.java` | Remove UserGymRole usage (lines 346-347) |
| 2 | `AuditDataInitializer.java` | Remove first-gym logic, use single gym config |

### 3.7 NEW FILES TO CREATE (1 file)

| # | File | Purpose |
|---|------|---------|
| 1 | `database/SCHEMA_SINGLE_GYM.sql` | Clean single-gym schema without gym_id |

---

## 4. DATABASE CHANGES

### 4.1 TABLES TO DROP ENTIRELY

| # | Table | Purpose |
|---|-------|---------|
| 1 | `tenants` | Multi-tenant master table |
| 2 | `user_gym_roles` | Junction table (replaced by user_role_map) |
| 3 | `gym_branches` | Branch management (single gym = no branches) |

### 4.2 TABLES TO MODIFY (Remove gym_id column)

| # | Table | gym_id Column |
|---|-------|--------------|
| 1 | `users` | `gym_id NUMBER NOT NULL` → REMOVE |
| 2 | `user_roles` | `gym_id NUMBER NOT NULL` → REMOVE |
| 3 | `user_role_assignments` | `gym_id NUMBER NOT NULL` → REMOVE |
| 4 | `members` | `gym_id NUMBER NOT NULL` → REMOVE |
| 5 | `member_documents` | `gym_id NUMBER NOT NULL` → REMOVE |
| 6 | `member_health_metrics` | `gym_id NUMBER NOT NULL` → REMOVE |
| 7 | `membership_plans` | `gym_id NUMBER NOT NULL` → REMOVE |
| 8 | `plan_pricing_tiers` | `gym_id NUMBER NOT NULL` → REMOVE |
| 9 | `checkin_records` | `gym_id NUMBER NOT NULL` → REMOVE |
| 10 | `daily_attendance` | `gym_id NUMBER` → REMOVE |
| 11 | `equipment` | `gym_id NUMBER NOT NULL` → REMOVE |
| 12 | `equipment_maintenance` | `gym_id NUMBER NOT NULL` → REMOVE |
| 13 | `staff` | `gym_id NUMBER NOT NULL` → REMOVE |
| 14 | `staff_attendance` | `gym_id NUMBER NOT NULL` → REMOVE |
| 15 | `staff_payroll` | `gym_id NUMBER NOT NULL` → REMOVE |
| 16 | `member_memberships` | `gym_id NUMBER NOT NULL` → REMOVE |
| 17 | `payment_transactions` | `gym_id NUMBER NOT NULL` → REMOVE |
| 18 | `invoices` | `gym_id NUMBER NOT NULL` → REMOVE |
| 19 | `group_classes` | `gym_id NUMBER NOT NULL` → REMOVE |
| 20 | `class_schedules` | `gym_id NUMBER NOT NULL` → REMOVE |
| 21 | `class_bookings` | `gym_id NUMBER NOT NULL` → REMOVE |
| 22 | `pt_assignments` | `gym_id NUMBER NOT NULL` → REMOVE |
| 23 | `pt_sessions` | `gym_id NUMBER NOT NULL` → REMOVE |
| 24 | `financial_transactions` | `gym_id NUMBER NOT NULL` → REMOVE |
| 25 | `audit_logs` | `gym_id NUMBER NOT NULL` → REMOVE |
| 26 | `notifications` | `gym_id NUMBER NOT NULL` → REMOVE |

### 4.3 SCHEMA FILE ACTIONS

| # | File | Action |
|---|------|--------|
| 1 | `gym_management_schema.sql` | REPLACE with SCHEMA_SINGLE_GYM.sql |
| 2 | `setup_complete.sql` | REPLACE with SCHEMA_SINGLE_GYM.sql |
| 3 | `migration_single_to_multi_tenant.sql` | DELETE (not needed) |
| 4 | `MULTI_TENANT_ARCHITECTURE.md` | DELETE |
| 5 | `SCHEMA_SINGLE_GYM.sql` | CREATE NEW |

---

## 5. IMPLEMENTATION PHASES

### PHASE 1: Database Schema (CRITICAL - Do First)
**Time: 45 minutes**

```
Phase 1: Database Schema
├── 1.1 Create SCHEMA_SINGLE_GYM.sql (clean schema)
├── 1.2 Update gym_management_schema.sql (or replace)
├── 1.3 Update setup_complete.sql (or replace)
├── 1.4 Delete migration_single_to_multi_tenant.sql
├── 1.5 Delete MULTI_TENANT_ARCHITECTURE.md
└── 1.6 Database migration/recreation
```

### PHASE 2: Delete Multi-Tenant Core Files
**Time: 10 minutes**

```bash
rm -f backend/src/main/java/com/gym/management/context/TenantContext.java
rm -f backend/src/main/java/com/gym/management/context/TenantAwareEntity.java
rm -f backend/src/main/java/com/gym/management/context/TenantNotSetException.java
rm -f backend/src/main/java/com/gym/management/filter/TenantIsolationFilter.java
rm -f backend/src/main/java/com/gym/management/filter/TenantFilter.java
rm -f backend/src/main/java/com/gym/management/interceptor/TenantAccessInterceptor.java
rm -f backend/src/main/java/com/gym/management/interceptor/NoTenantRequired.java
rm -f backend/src/main/java/com/gym/management/repository/TenantAwareRepository.java
rm -f database/MULTI_TENANT_ARCHITECTURE.md
```

### PHASE 3: Security Config Update
**Time: 5 minutes**

**File:** `security/SecurityConfig.java`

Changes:
- Line 47-50: DELETE `@Autowired TenantIsolationFilter tenantIsolationFilter;`
- Line 174: DELETE `http.addFilterBefore(tenantIsolationFilter, RateLimitFilter.class);`

### PHASE 4: Entity Cleanup (Remove gymId from 10 entities)
**Time: 30 minutes**

For each entity, remove:
```java
@Column(name = "gym_id", nullable = false)
private Long gymId;
```

Entities to modify:
1. MemberPoints.java
2. FinancialTransaction.java
3. Transaction.java
4. TrainerClass.java
5. RoleChangeAudit.java
6. ProgressNote.java
7. Invoice.java
8. Equipment.java
9. CheckIn.java
10. BillingSettings.java
11. GymTask.java

### PHASE 5: Service Layer Updates
**Time: 60 minutes**

| Service | Specific Changes |
|---------|------------------|
| SuperAdminDashboardService.java | Remove UserGymRole usage, remove multi-gym aggregation |
| PermissionService.java | Change `getUserRolesForGym(userId, gymId)` → `getUserRoles(userId)`, remove gymId parameter |
| ChatUserService.java | Change `findByGymGymId()` → `findAll()`, remove gym scoping |
| AttendanceService.java | Replace line 299-300: `gymRepository.findAll().get(0)` → single gym config |

### PHASE 6: Controller Updates
**Time: 45 minutes**

| Controller | Specific Changes |
|------------|------------------|
| SuperAdminController.java | REMOVE all `/gyms/**` endpoints |
| GymController.java | Simplify to return single gym config (not list) |
| ChatController.java | Remove line 408 multi-gym search comment |
| AuditDataInitializer.java | Remove lines 59-64, 185-190 first-gym logic |

### PHASE 7: Seeder/Initializer Updates
**Time: 30 minutes**

| File | Changes |
|------|---------|
| TrainerReportsDataSeeder.java | Remove UserGymRole usage at lines 346-347 |
| AppDataLoader.java | Verify no changes needed (already no gymId) |

### PHASE 8: Configuration & Properties
**Time: 30 minutes**

**application.properties changes:**
- Keep: `spring.jpa.hibernate.ddl-auto=none`
- Add: `app.gym.name=${GYM_NAME:My Gym}`
- Add: `app.gym.owner-email=${GYM_OWNER_EMAIL:admin@gym.com}`
- Add: `app.gym.db-password=${GYM_DB_PASSWORD:}`
- Remove: Any tenant-related configs

### PHASE 9: Frontend Cleanup (If Frontend Exists)
**Time: 30 minutes**

| Item | Change |
|------|--------|
| X-Gym-Id header | Remove from all API calls |
| Gym selector UI | Remove from frontend |
| Multi-gym dropdown | Remove |
| Login response | Remove gym selection step |

---

## 6. VALIDATION CHECKLIST

After transformation, verify:

- [ ] No `TenantContext.getTenantId()` calls remain
- [ ] No `UserGymRole` usage in any service
- [ ] No `gym_id` column in any table (except Gym.gymId)
- [ ] `Gym` entity maps correctly to `gyms` table
- [ ] Login works without gym selection
- [ ] All role-based access works (OWNER, ADMIN, TRAINER, MEMBER)
- [ ] Application starts without errors
- [ ] Database schema validates correctly

---

## 7. ROLES & PERMISSIONS AFTER TRANSFORMATION

### 7.1 User Types (No Gym Association)
```
OWNER   - Full gym access (like admin)
ADMIN   - Gym management
TRAINER - Trainer access
MEMBER  - Member access
```

### 7.2 Simple Role Mapping
```sql
-- Before (with user_gym_roles):
User (1) → UserGymRole → Gym (A)
User (1) → UserGymRole → Gym (B)  -- Same user, multiple gyms

-- After (with user_role_map):
User (1) → UserRoleMap → Role (OWNER)  -- Single role per user
```

---

## 8. DEPLOYMENT CONFIGURATION

### 8.1 Per-Gym Environment Variables
```properties
# Gym A Deployment
GYM_NAME="FitLife Gym Mumbai"
GYM_DB_PASSWORD="GymAPass123"
GYM_OWNER_EMAIL="owner@fitlife.com"
SERVER_PORT=8081

# Gym B Deployment
GYM_NAME="PowerHouse Gym Delhi"
GYM_DB_PASSWORD="GymBPass123"
GYM_OWNER_EMAIL="owner@powerhouse.com"
SERVER_PORT=8081
```

### 8.2 Deployment Structure
```
/opt/gym-a/
├── gym-management.jar
├── application.properties
└── uploads/

/opt/gym-b/
├── gym-management.jar
├── application.properties
└── uploads/
```

---

## 9. FILES SUMMARY

| Category | Count |
|----------|-------|
| Files to DELETE | 9 |
| Entities to MODIFY | 10 |
| Services to MODIFY | 4 |
| Controllers to MODIFY | 4 |
| Config files to MODIFY | 2 |
| Schema files to REPLACE | 2 |
| Files to CREATE | 1 |

---

## 10. ESTIMATED TIME

| Phase | Time |
|-------|------|
| Phase 1: Database Schema | 45 min |
| Phase 2: Delete Files | 10 min |
| Phase 3: Security Config | 5 min |
| Phase 4: Entity Cleanup | 30 min |
| Phase 5: Service Updates | 60 min |
| Phase 6: Controller Updates | 45 min |
| Phase 7: Seeder Updates | 30 min |
| Phase 8: Configuration | 30 min |
| Phase 9: Frontend | 30 min |
| **TOTAL** | **~4.5 hours** |

---

## 11. IMPORTANT NOTES

1. **Schema Conflict**: `Gym.java` has `@Table(name = "gyms")` but database schemas use `gym_profiles`. This MUST be resolved:
   - Option A: Rename database table `gym_profiles` → `gyms`
   - Option B: Change entity annotation to `@Table(name = "gym_profiles")`
   - **Decision: Use `gyms` table name** (matches entity)

2. **Data Migration**: If database has existing data:
   - Keep only one gym's data
   - Remove all `gym_id` column values (set to NULL or use single gym ID)
   - Delete `user_gym_roles` entries (replace with `user_role_map`)

3. **SuperAdmin Features**: All multi-gym features are being removed. If platform admin is needed later, it should be a separate service.

4. **Test After Each Phase**: Build/compile after each phase to catch issues early.

---

*Document Version 3.0 - Final Transformation Roadmap*
