# Multi-Tenancy & Database Isolation Plan
## Enterprise-Grade: 500+ Gyms, Complete Data Isolation

---

## Current State Audit

### What Exists
- `Gym` model EXISTS with fields: `gymId`, `name`, `address`, `city`, `state`, `country`, `phone`, `email`, `logoUrl`, `subscriptionPlan`, `isPublic`, `inviteCode`, `owner`
- `SubscriptionPlan` enum exists (STARTER tier visible)
- `UserGymRole` model links users to gyms with roles
- **16 models reference `gym_id`**: Transaction, Membership, CheckIn, Invoice, Equipment, AuditLog, BillingSettings, GymStaff, TrainerClass, ProgressNote, UserSession, RoleApplication, RoleChangeAudit

### What's MISSING for 500+ Gym Scale

| Gap | Severity | Description |
|-----|----------|-------------|
| **Tables without `gym_id`** | 🔴 CRITICAL | `pt_sessions`, `staff_performance`, `staff_shifts`, `notifications`, `messages`, `conversations`, `progress_metrics`, `progress_photos`, `body_measurements`, `personal_bests`, `member_goals`, `workout_logs`, `class_bookings`, `gym_classes`, `member_preferences`, `notification_settings`, `privacy_settings` — ALL of these store data without gym isolation |
| **No database-per-gym** | 🔴 CRITICAL | Single database, single schema — all gyms share tables. One gym's data query touches ALL rows |
| **No tenant context filter** | 🔴 CRITICAL | No Hibernate filter or Spring interceptor to auto-filter queries by `gym_id` |
| **No tenant resolver** | 🟡 HIGH | No mechanism to determine current gym from JWT/session/subdomain |
| **No data migration tool** | 🟡 HIGH | No way to move a gym's data to its own database if needed |
| **No tenant admin panel** | 🟡 HIGH | No super-admin to manage all 500+ gyms |
| **No rate limiting per gym** | 🟡 HIGH | Rate limiting exists but not per-tenant |
| **No storage isolation** | 🟡 HIGH | File uploads go to single directory, not gym-specific folders |
| **No backup per gym** | 🟠 MEDIUM | Can't backup/restore individual gym data |

---

## Multi-Tenancy Architecture Options

### Option A: Schema-Based Isolation (RECOMMENDED for 500 gyms)
```
Database Server (PostgreSQL)
├── public schema (shared: users, subscription_plans, super_admin)
├── gym_001 schema (gym 1's data: memberships, classes, etc.)
├── gym_002 schema (gym 2's data)
├── gym_003 schema (gym 3's data)
└── ... up to gym_500+
```

**Pros:** True data isolation per gym, easy backup/restore per gym, can comply with data residency laws  
**Cons:** Schema creation automation needed, connection pool management more complex

### Option B: Row-Level Security with `gym_id` (SIMPLER, Good for 100-500 gyms)
```
Single Database, Single Schema
├── All tables have gym_id column
├── Hibernate @Filter auto-applies WHERE gym_id = ?
├── PostgreSQL Row-Level Security (RLS) as database-level enforcement
└── Spring interceptor injects gym_id from JWT into every query
```

**Pros:** Simpler infrastructure, easier to monitor, single migration path  
**Cons:** Shared tables can get large, accidental data leaks possible without careful query writing

### Option C: Hybrid (BEST for 500+ scale)
```
Tier 1: Free/Starter gyms → Shared database with RLS (Row-Level Security)
Tier 2: Pro gyms → Separate schema within shared DB
Tier 3: Enterprise gyms → Dedicated database instance
```

---

## Recommended Implementation: Option C (Hybrid)

### Phase 1: Add `gym_id` to ALL Tables (P0 — Must Do First)

Tables that need `gym_id` added:
```sql
-- PT Sessions
ALTER TABLE pt_sessions ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Staff Performance
ALTER TABLE staff_performance ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Staff Shifts
ALTER TABLE staff_shifts ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Notifications
ALTER TABLE notifications ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Messages & Conversations
ALTER TABLE messages ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE conversations ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Progress tracking
ALTER TABLE progress_metrics ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE progress_photos ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE body_measurements ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE personal_bests ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE member_goals ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE workout_logs ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Classes & Bookings
ALTER TABLE gym_classes ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE class_bookings ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- User preferences
ALTER TABLE member_preferences ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE notification_settings ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
ALTER TABLE privacy_settings ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Blackout days (gym-specific holidays)
ALTER TABLE blackout_days ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);

-- Membership packages (gym-specific pricing)
ALTER TABLE membership_packages ADD COLUMN gym_id BIGINT NOT NULL REFERENCES gyms(gym_id);
```

### Phase 2: Tenant Context System

#### Backend Changes
```
NEW FILES:
├── config/TenantContext.java          — ThreadLocal storage for current gym_id
├── filter/TenantFilter.java           — Extract gym_id from JWT, set in TenantContext
├── aop/TenantAspect.java              — Auto-inject gym_id into all repository queries
├── config/TenantHibernateFilter.java  — Hibernate @FilterDef for automatic WHERE clause
├── service/TenantService.java         — Resolve tenant from JWT/subdomain/header
├── dto/TenantInfo.java                — DTO for tenant context
```

#### JWT Enhancement
```json
// Current JWT payload
{
  "sub": "user@email.com",
  "roles": ["OWNER"]
}

// Enhanced JWT with gym context
{
  "sub": "user@email.com",
  "roles": ["OWNER"],
  "gym_id": 42,
  "gym_name": "FitZone Mumbai",
  "subscription_tier": "PRO"
}
```

### Phase 3: Super Admin Panel

For managing 500+ gyms:
```
NEW PAGES:
├── /super-admin/dashboard      — Total gyms, total users, revenue, system health
├── /super-admin/gyms           — List all gyms, search, filter by plan/status
├── /super-admin/gym/:id        — Individual gym detail, usage stats, billing
├── /super-admin/users          — Global user search across all gyms
├── /super-admin/billing        — Subscription management, invoices
├── /super-admin/monitoring     — System health, error rates, performance
├── /super-admin/settings       — Platform-level settings, feature flags
```

### Phase 4: Storage Isolation
```
uploads/
├── gym_001/
│   ├── avatars/
│   ├── progress_photos/
│   ├── certifications/
│   └── documents/
├── gym_002/
│   └── ...
```

---

## Database Design for 500+ Gyms

### Shared Tables (Platform-Level)
- `users` — Global user accounts (one user can be member at multiple gyms)
- `gyms` — Gym registry
- `subscription_plans` — Platform pricing plans
- `user_gym_roles` — Which user has what role at which gym
- `super_admin_audit` — Platform-level audit logs
- `platform_notifications` — System-wide announcements

### Per-Gym Tables (Tenant-Scoped, all have `gym_id`)
- Everything else: memberships, classes, sessions, equipment, financials, messages, progress, etc.

### Indexing Strategy
```sql
-- Every tenant-scoped table needs composite index starting with gym_id
CREATE INDEX idx_memberships_gym ON memberships(gym_id, status);
CREATE INDEX idx_pt_sessions_gym ON pt_sessions(gym_id, trainer_id, session_date);
CREATE INDEX idx_notifications_gym ON notifications(gym_id, user_id, is_read);
CREATE INDEX idx_invoices_gym ON invoices(gym_id, status, due_date);
-- etc.
```

---

## Implementation Priority

| Phase | Timeline | Items |
|-------|----------|-------|
| **Phase 1** | Week 1-2 | Add `gym_id` to all tables, create migration scripts |
| **Phase 2** | Week 3-4 | TenantContext, TenantFilter, Hibernate filters |
| **Phase 3** | Week 5-6 | Update ALL repository queries to filter by `gym_id` |
| **Phase 4** | Week 7-8 | Super admin panel, storage isolation |
| **Phase 5** | Week 9-10 | Testing with multiple gyms, data integrity verification |
