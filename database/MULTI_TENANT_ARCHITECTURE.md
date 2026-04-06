# Gym Management System - Multi-Tenant Database Architecture

## Overview

This document describes the comprehensive database schema for a multi-tenant gym management application supporting two deployment models:

1. **Shared Database Model** - All gym operators share a single database with tenant isolation via `tenant_id` columns
2. **Separate Database Model** - Each gym operator gets their own dedicated database instance

---

## Architecture Comparison

| Aspect | Shared Database | Separate Database |
|--------|----------------|-------------------|
| **Cost** | Lower (single DB) | Higher (multiple DBs) |
| **Isolation** | Application-level | Complete |
| **Scaling** | Vertical | Horizontal |
| **Complexity** | Lower | Higher |
| **Data Recovery** | All tenants affected | Single tenant |
| **Performance** | Shared resources | Dedicated resources |
| **Compliance** | Needs RLS/VPD | Natural isolation |

---

## Multi-Tenant Model 1: Shared Database

### Implementation Strategy

In this model, all tenants share a single Oracle database instance with tenant isolation enforced at the application level and optionally using Oracle VPD (Virtual Private Database).

### Key Components

#### 1. Tenant Identification
Every table includes a `tenant_id` column that:
- Identifies the owner of each record
- Enables data segmentation
- Supports cross-tenant queries for super-admin reporting

#### 2. Schema Structure
```sql
tenants              -- Master tenant registry
  └── tenant_id (PK)
      └── Other tables
           └── tenant_id (FK) → tenants.tenant_id
```

#### 3. Indexing Strategy
All foreign key columns are indexed for performance:
```sql
CREATE INDEX idx_<table>_tenant ON <table>(tenant_id);
```

#### 4. Unique Constraints
Composite unique constraints ensure tenant-scoped uniqueness:
```sql
CONSTRAINT uk_users_username UNIQUE (tenant_id, username)
```

### Security Implementation

#### Row-Level Security (RLS)
Oracle VPD or application-level filtering ensures users can only access their own tenant's data.

#### Application-Level Enforcement
- All queries must include `tenant_id` filter
- API middleware validates tenant access
- Connection pool manages tenant context

### Example Queries

#### Single Tenant Query
```sql
SELECT * FROM members
WHERE tenant_id = 123
AND membership_status = 'ACTIVE';
```

#### Cross-Tenant Report (Super Admin)
```sql
SELECT
    t.tenant_name,
    COUNT(m.member_id) as total_members,
    SUM(pt.amount) as total_revenue
FROM tenants t
LEFT JOIN members m ON t.tenant_id = m.tenant_id
LEFT JOIN payment_transactions pt ON t.tenant_id = pt.tenant_id
GROUP BY t.tenant_id, t.tenant_name;
```

---

## Multi-Tenant Model 2: Separate Database

### Implementation Strategy

Each tenant gets their own Oracle database containing a subset of the complete schema. This provides complete data isolation and dedicated resources.

### Key Components

#### 1. Tenant Registry Database
A central registry tracks all tenant databases:
```sql
CREATE TABLE tenants (
    tenant_id NUMBER PRIMARY KEY,
    tenant_code VARCHAR2(50),
    database_name VARCHAR2(100),  -- Points to tenant's DB
    is_active CHAR(1)
);
```

#### 2. Database Linking
Oracle Database Links connect to tenant-specific databases:
```sql
CREATE DATABASE LINK tenant_ABC
CONNECT TO system IDENTIFIED BY password
USING 'tenant_abc_database';
```

#### 3. Cross-Database Queries
```sql
SELECT * FROM members@tenant_ABC;
```

### Migration Path

The migration script `migration_single_to_multi_tenant.sql` provides:
1. Add `tenant_id` columns to all tables
2. Backfill existing data with default tenant
3. Add composite unique constraints
4. Create tenant registry entries
5. Provision new databases for each tenant
6. Export/import tenant data

---

## Schema Modules

### 1. Tenant Management (`tenants`)
| Column | Type | Description |
|--------|------|-------------|
| tenant_id | NUMBER | Primary key |
| tenant_code | VARCHAR2 | Unique code |
| tenant_name | VARCHAR2 | Display name |
| database_name | VARCHAR2 | Separate DB name |
| subscription_tier | VARCHAR2 | Plan level |
| max_members | NUMBER | Usage limits |

### 2. User Management (`users`, `user_roles`)
- Authentication and authorization
- Role-based access control
- Multi-factor authentication support

### 3. Gym Profile (`gym_profiles`, `gym_branches`)
- Multi-location support
- Branch management
- Operating hours

### 4. Member Management (`members`, `member_documents`, `member_health_metrics`)
- Personal information
- Health records
- Document storage
- Referral tracking

### 5. Membership Plans (`membership_plans`, `plan_pricing_tiers`)
- Configurable plans
- Multiple billing cycles
- GST/Tax calculation
- Feature flags

### 6. Check-in/Out (`checkin_records`, `daily_attendance`)
- QR code scanning
- Manual check-in
- Attendance analytics
- Peak hour tracking

### 7. Equipment (`equipment`, `equipment_categories`, `equipment_maintenance`)
- Inventory tracking
- Maintenance schedules
- Warranty management
- Condition monitoring

### 8. Staff Management (`staff`, `staff_attendance`, `staff_payroll`)
- Employee records
- Attendance tracking
- Payroll processing
- Role management

### 9. Billing & Payments (`member_memberships`, `payment_transactions`, `invoices`)
- Membership subscriptions
- Payment tracking
- Invoice generation
- GST compliance

### 10. Group Classes (`group_classes`, `class_schedules`, `class_bookings`)
- Class definitions
- Recurring schedules
- Booking management
- Waitlist handling

### 11. Personal Training (`pt_assignments`, `pt_sessions`)
- Trainer assignments
- Session tracking
- Workout logging
- Progress monitoring

### 12. Financial Transactions (`financial_transactions`)
- Unified income/expense
- Multi-currency support
- Tax calculation
- Exchange rates

### 13. Audit Logs (`audit_logs`)
- Complete audit trail
- User activity tracking
- Change history
- Compliance reporting

### 14. Notifications (`notifications`)
- Multi-channel delivery
- Scheduled notifications
- Priority handling
- Delivery tracking

---

## Data Integrity Constraints

### Check Constraints
```sql
-- Payment status
CHECK (payment_status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'))

-- Membership status
CHECK (membership_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED'))

-- Transaction types
CHECK (transaction_type IN ('INCOME', 'EXPENSE'))

-- Gender options
CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say'))
```

### Foreign Keys
All relationships are enforced with foreign key constraints:
- `tenant_id` references `tenants.tenant_id`
- Business relationships enforced (e.g., `member_id` → `members`)

### Trigger-Based Integrity
- Auto-generate member codes
- Auto-generate membership codes
- Update gym member counts
- Track daily attendance

---

## Performance Optimization

### Indexing Strategy
1. All foreign keys indexed
2. Composite indexes for common queries
3. Partial indexes for filtered queries (e.g., unfinished check-ins)

### Partitioning (For Large Tenants)
```sql
-- Partition by tenant for shared database model
CREATE TABLE members PARTITION BY LIST (tenant_id) (
    PARTITION p_tenant_1 VALUES (1),
    PARTITION p_tenant_2 VALUES (2),
    PARTITION p_tenant_others VALUES (DEFAULT)
);
```

### Materialized Views
Pre-computed aggregations for reporting:
```sql
CREATE MATERIALIZED VIEW mv_monthly_revenue
REFRESH COMPLETE ON DEMAND AS
SELECT
    tenant_id,
    TRUNC(transaction_date, 'MONTH') as month,
    SUM(amount) as total_revenue
FROM payment_transactions
GROUP BY tenant_id, TRUNC(transaction_date, 'MONTH');
```

---

## Security Implementation

### PCI-DSS Compliance
- No card data stored (gateway tokens only)
- Encrypted transmission (TLS 1.3)
- Access logging for all payment data

### Data Encryption
```sql
-- Transparent Data Encryption (TDE)
CREATE TABLESPACE gym_data
ENCRYPTION DEFAULT STORAGE(ENCRYPT);
```

### Audit Trail
All data modifications logged:
- User ID
- Action (INSERT/UPDATE/DELETE)
- Old and new values
- Timestamp
- IP address
- Session information

---

## GST/Tax Compliance

### Tax Calculation
- Automatic GST calculation (18% default)
- HSN/SAC codes for services
- Tax breakdown in invoices

### Tax Reporting
```sql
-- GST Summary Query
SELECT
    tenant_id,
    TRUNC(transaction_date, 'MONTH') as month,
    SUM(CASE WHEN transaction_type = 'INCOME' THEN tax_amount ELSE 0 END) as output_gst,
    SUM(CASE WHEN expense_category = 'PURCHASES' THEN tax_amount ELSE 0 END) as input_gst,
    SUM(CASE WHEN transaction_type = 'INCOME' THEN tax_amount ELSE 0 END) -
    SUM(CASE WHEN expense_category = 'PURCHASES' THEN tax_amount ELSE 0 END) as net_gst
FROM financial_transactions
WHERE transaction_date BETWEEN :start_date AND :end_date
GROUP BY tenant_id, TRUNC(transaction_date, 'MONTH');
```

---

## Reporting Views

### Pre-Built Views
| View | Purpose |
|------|---------|
| `vw_active_members` | Member status summary |
| `vw_daily_revenue` | Revenue by day |
| `vw_membership_expiry` | Upcoming expirations |
| `vw_equipment_status` | Asset summary |
| `vw_staff_attendance` | Attendance report |

---

## Migration Scripts

### Phase 1: Add Tenant Columns (Non-Breaking)
```sql
ALTER TABLE members ADD COLUMN tenant_id NUMBER;
```

### Phase 2: Backfill Data
```sql
UPDATE members SET tenant_id = 1 WHERE tenant_id IS NULL;
```

### Phase 3: Add Constraints
```sql
ALTER TABLE members
ADD CONSTRAINT fk_members_tenant
FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
```

### Phase 4: Enable RLS
```sql
-- Oracle VPD or application-level filtering
```

---

## Backup & Recovery

### Shared Database Model
- Full database backups
- Point-in-time recovery affects all tenants
- Consider tenant-level export for critical data

### Separate Database Model
- Independent backup schedules per tenant
- Faster recovery (single tenant)
- Compliance isolation

---

## API Endpoints

### Tenant Management
- `GET /api/v1/tenants` - List all tenants
- `POST /api/v1/tenants` - Create tenant
- `GET /api/v1/tenants/:id` - Get tenant details
- `PUT /api/v1/tenants/:id` - Update tenant
- `DELETE /api/v1/tenants/:id` - Deactivate tenant

### Data Access (Tenant-Scoped)
All data endpoints automatically filter by authenticated user's tenant.

---

## Deployment Checklist

### Pre-Deployment
- [ ] Create Oracle database instance
- [ ] Create tablespaces
- [ ] Run schema creation script
- [ ] Create application user
- [ ] Grant necessary privileges
- [ ] Create sequence objects
- [ ] Insert initial data

### Post-Deployment
- [ ] Test tenant isolation
- [ ] Verify audit logging
- [ ] Test backup/restore
- [ ] Configure monitoring
- [ ] Set up alerting
- [ ] Document connection strings

---

## File Structure

```
database/
├── gym_management_schema.sql          # Complete schema
├── migration_single_to_multi_tenant.sql # Migration script
├── SEED_DATA.sql                      # Sample data
├── VIEWS.sql                          # Reporting views
└── STORED_PROCEDURES.sql             # Business logic
```

---

## Support

For implementation support:
1. Review Oracle documentation on VPD
2. Test migration scripts in staging
3. Verify backup/restore procedures
4. Enable audit logging before go-live
