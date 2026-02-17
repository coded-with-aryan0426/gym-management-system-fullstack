# Equipment Page - Improvement Plan

## Current State Analysis

**What exists:**
- Grid view with 3 density options (compact, comfortable, spacious)
- Equipment cards showing name, brand, category, status, location
- Add/Edit modal (name, brand, category, status, location)
- Maintenance panel (log maintenance events)
- Filters: search, category (6 types), status (Active/Maintenance/Out of Order), location
- Stats: Total, Active, Maintenance, Out of Order counts

**Categories:** CARDIO, STRENGTH, FUNCTIONAL, YOGA, RECOVERY

---

## Issues Found

### Critical
1. **No purchase/cost tracking** - No purchase date, cost, depreciation, warranty info
2. **No maintenance scheduling** - Can log maintenance but no proactive scheduling (e.g., "service every 3 months")
3. **No quantity tracking** - Each equipment is unique but gyms have "10 dumbbells of 20kg" - no quantity/set support
4. **No usage tracking** - No data on which equipment is used most/least
5. **Status is manually set** - Should auto-flag "overdue for maintenance" based on schedule

### Missing Real-World Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Purchase & warranty tracking | Purchase date, cost, vendor, warranty expiry, invoice upload |
| **P0** | Scheduled maintenance | Recurring maintenance calendar (oil treadmills every 30 days) |
| **P0** | Maintenance history log | Full history with cost, technician, parts replaced, before/after photos |
| **P0** | Asset value & depreciation | Total asset value, annual depreciation for accounting |
| **P1** | QR code per equipment | Scan QR to view details, report issues, log maintenance |
| **P1** | Issue reporting | Staff/members can report broken equipment with photo |
| **P1** | Maintenance cost tracking | Total spend on maintenance per equipment, per month |
| **P1** | Equipment sets/groups | "Dumbbell Rack" containing 10 pairs with individual weights |
| **P1** | Vendor management | Track vendors, contact info, service contracts |
| **P1** | Low stock alerts | Consumables like bands, mats - alert when stock is low |
| **P2** | Usage analytics | Which equipment is most/least used (from check-in data) |
| **P2** | Equipment lifecycle | Purchase → Active → Maintenance cycles → Retire → Dispose |
| **P2** | Insurance tracking | Equipment insurance policy, coverage amount, renewal date |
| **P2** | Floor plan view | Visual map of gym floor with equipment placement |
| **P2** | Bulk import/export | CSV import for initial setup, export for insurance claims |
| **P3** | Predictive maintenance | ML-based prediction of when equipment will need service |
| **P3** | Equipment utilization heatmap | Peak usage times per equipment |

---

## Detailed Feature Specifications

### 1. Purchase & Warranty Tracking (P0)

**New fields on equipment:**
```sql
ALTER TABLE equipment ADD COLUMN purchase_date DATE;
ALTER TABLE equipment ADD COLUMN purchase_cost DECIMAL(12,2);
ALTER TABLE equipment ADD COLUMN vendor_id INTEGER REFERENCES vendors(id);
ALTER TABLE equipment ADD COLUMN warranty_expiry DATE;
ALTER TABLE equipment ADD COLUMN serial_number VARCHAR(100);
ALTER TABLE equipment ADD COLUMN model_number VARCHAR(100);
ALTER TABLE equipment ADD COLUMN invoice_url VARCHAR(500);
ALTER TABLE equipment ADD COLUMN expected_lifespan_years INTEGER;
ALTER TABLE equipment ADD COLUMN disposal_date DATE;
ALTER TABLE equipment ADD COLUMN disposal_reason TEXT;
```

**UI in Equipment Modal - new "Asset Info" tab:**
- Purchase date, cost, vendor dropdown
- Serial number, model number
- Warranty expiry with "Expiring soon" / "Expired" badge
- Invoice file upload
- Depreciation calculation: `(cost - salvage) / lifespan * years_used`

### 2. Scheduled Maintenance (P0)

```sql
CREATE TABLE maintenance_schedules (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id),
  task_name VARCHAR(200) NOT NULL, -- "Oil belt", "Replace filter", "Full service"
  frequency_days INTEGER NOT NULL, -- every N days
  last_performed DATE,
  next_due DATE NOT NULL,
  assigned_to VARCHAR(100), -- technician/vendor name
  estimated_cost DECIMAL(10,2),
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE maintenance_logs (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id),
  schedule_id INTEGER REFERENCES maintenance_schedules(id), -- NULL for ad-hoc
  performed_date DATE NOT NULL,
  performed_by VARCHAR(100),
  task_description TEXT NOT NULL,
  parts_replaced TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  downtime_hours DECIMAL(5,1) DEFAULT 0,
  condition_before VARCHAR(20), -- GOOD, FAIR, POOR, CRITICAL
  condition_after VARCHAR(20),
  notes TEXT,
  photo_urls TEXT[], -- before/after photos
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI:**
- Dashboard: "5 equipment overdue for maintenance" alert card
- Equipment card: small wrench icon with "Due in 3 days" tooltip
- Maintenance calendar view showing upcoming tasks
- Auto-status change: if maintenance overdue > 7 days → auto-flag as MAINTENANCE

### 3. Asset Value Dashboard (P0)

**New KPI cards:**
- Total Asset Value: Sum of all equipment purchase costs
- Current Depreciated Value: After applying straight-line depreciation
- Monthly Maintenance Cost: Total spent this month
- Warranty Expiring Soon: Count of equipment with warranty expiring in 30 days

**New section:** Asset summary table for accounting:
```
| Category   | Count | Purchase Value | Current Value | Maintenance YTD |
|------------|-------|----------------|---------------|-----------------|
| Cardio     | 15    | ₹12,50,000     | ₹8,75,000     | ₹45,000         |
| Strength   | 30    | ₹8,00,000      | ₹6,40,000     | ₹12,000         |
```

### 4. QR Code System (P1)

**Flow:**
1. Each equipment auto-generates a QR code on creation
2. Print QR sticker → stick on equipment
3. Staff/member scans QR → sees equipment details page
4. Quick actions from scan: "Report Issue", "Log Maintenance", "View History"

**API:**
```
GET /api/equipment/{id}/qr -- Returns QR code image (SVG/PNG)
POST /api/equipment/{id}/issues -- Report an issue
```

### 5. Vendor Management (P1)

```sql
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  specialization VARCHAR(100), -- "Cardio equipment", "General maintenance"
  contract_start DATE,
  contract_end DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);
```

---

## Backend API Design

```
-- Maintenance
GET    /api/equipment/{id}/maintenance/schedule    -- Get maintenance schedules
POST   /api/equipment/{id}/maintenance/schedule    -- Create schedule
GET    /api/equipment/{id}/maintenance/history      -- Get maintenance logs
POST   /api/equipment/{id}/maintenance/log          -- Log maintenance event
GET    /api/maintenance/overdue                     -- All overdue maintenance
GET    /api/maintenance/upcoming?days=7             -- Upcoming maintenance

-- Assets
GET    /api/equipment/asset-summary                 -- Value/depreciation report
GET    /api/equipment/export?format=csv             -- Export for accounting

-- Vendors
GET    /api/vendors                                 -- List vendors
POST   /api/vendors                                 -- Create vendor
PUT    /api/vendors/{id}                            -- Update vendor

-- Issues
POST   /api/equipment/{id}/issues                   -- Report issue
GET    /api/equipment/issues?status=open            -- Open issues
PUT    /api/equipment/issues/{id}                   -- Resolve issue
```

---

## Implementation Priority

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase 1** | Add purchase/warranty fields, update modal | DB migration |
| **Phase 2** | Maintenance schedules & logs | Phase 1 |
| **Phase 3** | Asset value dashboard, depreciation calc | Phase 1 |
| **Phase 4** | Vendor management | Phase 1 |
| **Phase 5** | QR codes, issue reporting | Phase 2 |
| **Phase 6** | Maintenance calendar view, overdue alerts | Phase 2 |
| **Phase 7** | Analytics, floor plan, bulk import/export | Phase 1-3 |
