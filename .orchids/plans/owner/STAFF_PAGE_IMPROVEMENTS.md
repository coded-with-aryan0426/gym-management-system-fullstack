# Staff Page - Improvement Plan

## Current State Analysis

**What exists:**
- Paginated staff table with: #, Name/Email, Employee ID, Role, Join Date, Status
- Sort: newest or alphabetical (from backend)
- Filters: role (Trainer/Admin/Manager), status (Active/Inactive)
- Search by name
- Stats pills: Active count, Inactive count, Total
- Mobile card view
- Staff action modal (EnhancedStaffActionModal): edit profile, view details

**Note:** Staff page is separate from Trainers page. Staff = all employees (admins, managers, receptionists, cleaners, etc.). Trainers has its own dedicated page.

---

## Issues Found

### Critical
1. **Status is hardcoded to "Active"** - Line 186: `const status = 'Active'` - never reads actual status
2. **No staff creation** - Can only view/edit existing staff, no "Add Staff" button
3. **No salary/payroll info** - No salary, payment history, tax deductions
4. **No attendance** - No check-in/check-out tracking for staff
5. **No department/designation** - Only "role" (Trainer/Admin/Manager) - no HR hierarchy
6. **Inactive count hardcoded to 0** - Line 315: `<span>0 Inactive</span>`

### Missing Real-World Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Fix hardcoded status & inactive count | Read actual status from backend |
| **P0** | Add Staff button | Create new staff member with role assignment |
| **P0** | Department & designation | HR structure: Department (Operations, Training, Admin), Designation (Senior Trainer, Front Desk) |
| **P0** | Staff attendance/check-in | Daily check-in/check-out with timestamps |
| **P0** | Salary & compensation | Monthly salary, hourly rate, commission structure |
| **P1** | Shift management | Define shifts (Morning 6-2, Evening 2-10), assign to staff |
| **P1** | Leave management | Leave balance, apply/approve leave, leave types (sick, casual, annual) |
| **P1** | Payroll processing | Monthly payslip generation: base + overtime + commission - deductions |
| **P1** | Performance reviews | Periodic review form, KPIs, rating, manager comments |
| **P1** | Emergency contact | Required HR info for all employees |
| **P1** | Document management | ID proof, certificates, contracts, offer letters |
| **P2** | Staff onboarding checklist | New hire: collect documents, assign locker, create login, training schedule |
| **P2** | Overtime tracking | Auto-detect overtime based on shift end time vs check-out time |
| **P2** | Staff communication | Internal messages, announcements, task assignments |
| **P2** | KPI dashboard per staff | Attendance %, tasks completed, member feedback score |
| **P2** | Exit/termination flow | Resignation, termination, exit interview, final settlement |
| **P3** | Staff scheduling calendar | Visual calendar showing who works when |
| **P3** | Multi-branch staff transfer | Transfer staff between branches |
| **P3** | Training & certification tracking | Required certifications, training completed, renewals due |

---

## Detailed Feature Specifications

### 1. Fix Hardcoded Values (P0)

**Current bugs:**
```typescript
// Line 186 - Status is always "Active"
render: () => {
  const status = 'Active';  // BUG: should read from member data
  return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
},

// Line 315 - Inactive count is always 0
<span>0 Inactive</span>  // BUG: should be from backend
```

**Fix:** Backend should return `status` field on User. Frontend reads it.
Backend should return counts in pagination response: `{ content, totalCount, activeCount, inactiveCount }`.

### 2. Add Staff Creation (P0)

**UI:** "Add Staff" button in header → opens creation modal:
- Full name, email, phone
- Role: Admin / Manager / Trainer / Receptionist / Maintenance / Custom
- Department
- Designation
- Employment type: Full-time / Part-time / Contract
- Start date
- Salary details
- Auto-generates employee ID

### 3. Department & Designation (P0)

```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(100) NOT NULL, -- Operations, Training, Administration, Maintenance
  head_id INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE designations (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(100) NOT NULL, -- Senior Trainer, Front Desk Executive, Gym Manager
  department_id INTEGER REFERENCES departments(id),
  level INTEGER DEFAULT 1, -- hierarchy level
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE users ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE users ADD COLUMN designation_id INTEGER REFERENCES designations(id);
ALTER TABLE users ADD COLUMN employment_type VARCHAR(20); -- FULL_TIME, PART_TIME, CONTRACT, FREELANCE
ALTER TABLE users ADD COLUMN reporting_to INTEGER REFERENCES users(id);
```

**UI:** Add Department and Designation columns to staff table. Filter by department.

### 4. Staff Attendance (P0)

```sql
CREATE TABLE staff_attendance (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  status VARCHAR(20) DEFAULT 'PRESENT', -- PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE, HOLIDAY
  late_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  notes TEXT,
  marked_by INTEGER REFERENCES users(id), -- who marked (self/admin)
  UNIQUE(staff_id, date)
);
```

**UI:**
- "Today's Attendance" summary card in header: Present/Absent/Late/On Leave
- Each staff row shows today's check-in status (green dot = checked in, red = absent)
- Click staff → Attendance tab → monthly calendar grid (like Reports attendance tab)
- Bulk mark attendance for all staff

### 5. Salary & Compensation (P0)

```sql
CREATE TABLE staff_compensation (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  base_salary DECIMAL(12,2), -- monthly
  hourly_rate DECIMAL(8,2), -- for part-time
  commission_rate DECIMAL(4,2), -- percentage on PT/sales
  overtime_rate_multiplier DECIMAL(3,1) DEFAULT 1.5, -- 1.5x hourly
  payment_frequency VARCHAR(20) DEFAULT 'MONTHLY', -- MONTHLY, BI_WEEKLY, WEEKLY
  bank_account VARCHAR(30),
  bank_name VARCHAR(100),
  ifsc_code VARCHAR(15),
  pan_number VARCHAR(15),
  effective_from DATE NOT NULL,
  effective_until DATE, -- NULL = current
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payroll (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  month DATE NOT NULL, -- first day of month
  base_amount DECIMAL(12,2),
  overtime_amount DECIMAL(10,2) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  tax_deducted DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, APPROVED, PAID
  paid_date DATE,
  payment_method VARCHAR(20), -- BANK_TRANSFER, CASH, UPI
  transaction_ref VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(staff_id, month)
);
```

### 6. Leave Management (P1)

```sql
CREATE TABLE leave_types (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(50) NOT NULL, -- Casual, Sick, Annual, Maternity, Unpaid
  days_per_year INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  carry_forward BOOLEAN DEFAULT false,
  max_carry_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE leave_balances (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  leave_type_id INTEGER REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER GENERATED ALWAYS AS (total_days - used_days) STORED,
  UNIQUE(staff_id, leave_type_id, year)
);

CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  leave_type_id INTEGER REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI:**
- Staff modal → "Leave" tab → balance table, request history, "Apply Leave" button
- Owner dashboard: pending leave requests for approval
- Calendar view: show who's on leave

### 7. Shift Management (P1)

```sql
CREATE TABLE shifts (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(50) NOT NULL, -- "Morning", "Evening", "Night", "Split"
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 30,
  color VARCHAR(7), -- for calendar display
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE staff_shift_assignments (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  shift_id INTEGER REFERENCES shifts(id),
  day_of_week INTEGER, -- NULL means every day
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true
);
```

---

## New Columns for Staff Table

| Column | Description |
|--------|-------------|
| Department | Operations, Training, Admin |
| Designation | Senior Trainer, Front Desk |
| Phone | Quick contact |
| Today's Status | Check-in dot (green/red/yellow) |
| Shift | Morning / Evening / Night |
| Employment Type | Full-time / Part-time / Contract |

---

## Backend API Design

```
-- Staff CRUD
POST   /api/staff                                   -- Create staff
GET    /api/staff?page=0&size=20&dept=&status=      -- Paginated with real counts
PUT    /api/staff/{id}/status                       -- Activate/deactivate

-- Attendance
POST   /api/staff/attendance/check-in               -- Staff checks in
POST   /api/staff/attendance/check-out              -- Staff checks out
GET    /api/staff/{id}/attendance?month=2026-02      -- Monthly attendance
GET    /api/staff/attendance/today                   -- Today's summary
POST   /api/staff/attendance/bulk                    -- Bulk mark attendance

-- Leave
GET    /api/staff/{id}/leave-balance                -- Leave balances
POST   /api/staff/leave-requests                    -- Apply for leave
GET    /api/staff/leave-requests?status=PENDING     -- Pending approvals
PUT    /api/staff/leave-requests/{id}               -- Approve/reject

-- Payroll
GET    /api/staff/{id}/compensation                 -- Salary details
PUT    /api/staff/{id}/compensation                 -- Update salary
GET    /api/payroll?month=2026-02                   -- Monthly payroll
POST   /api/payroll/generate?month=2026-02          -- Generate payslips
PUT    /api/payroll/{id}/approve                    -- Approve payslip
PUT    /api/payroll/{id}/mark-paid                  -- Mark as paid

-- Departments & Shifts
GET    /api/departments                              -- List departments
POST   /api/departments                              -- Create department
GET    /api/shifts                                   -- List shifts
POST   /api/shifts                                   -- Create shift
POST   /api/staff/{id}/shift-assignment             -- Assign shift
```

---

## Implementation Priority

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase 1** | Fix hardcoded status/counts, add "Add Staff" button | Backend bug fix |
| **Phase 2** | Department & designation, new table columns | DB migration |
| **Phase 3** | Staff attendance with check-in/check-out | Phase 2 |
| **Phase 4** | Salary & compensation tracking | Phase 2 |
| **Phase 5** | Leave management (types, balances, requests) | Phase 3 |
| **Phase 6** | Shift management | Phase 3 |
| **Phase 7** | Payroll processing & payslip generation | Phase 4+5 |
| **Phase 8** | Performance reviews, onboarding, exit flow | Phase 2-5 |
