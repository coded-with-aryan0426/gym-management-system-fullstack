# Settings Page - Improvement Plan

## Current State Analysis

**What exists (9 sections):**
1. **Owner Profile** - Personal & gym details
2. **Appearance** - Theme & display (light/dark)
3. **Security & Access** - Login & data safety
4. **Roles & Permissions** - Access control matrix
5. **Billing Rules** - Taxes & late fees
6. **Membership Policies** - Freezes & cancellations
7. **User Rules** - Staff, Trainer & Member policies
8. **Notifications** - Alerts & reminders
9. **Audit Logs** - System activity history

---

## Issues Found

### Critical
1. **No gym profile/branding** - No gym name, logo, address, contact, social media, business hours
2. **No multi-branch support** - Single gym assumed - no branch management
3. **No backup/data export** - Owner can't export their data or create backups
4. **No subscription/plan management** - No way to manage the SaaS subscription for the app itself
5. **Settings may not persist to backend** - Need to verify each section actually saves to database

### Missing Real-World Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Gym profile & branding | Gym name, logo, address, phone, email, website, social media links, business hours |
| **P0** | Business hours configuration | Set opening/closing hours per day, holidays |
| **P0** | Currency & locale settings | Currency symbol, date format, timezone, language |
| **P0** | Membership plan management | Create/edit/deactivate membership plans with pricing |
| **P0** | Payment gateway configuration | Razorpay/Stripe API keys, UPI settings, payment modes |
| **P1** | Multi-branch management | Add branches, assign staff, view per-branch reports |
| **P1** | Email/SMS templates | Customize welcome email, reminder texts, receipt templates |
| **P1** | Data export/backup | Export all data as JSON/CSV, schedule automated backups |
| **P1** | Receipt/Invoice customization | Logo, header, footer, terms, GST number on receipts |
| **P1** | Check-in settings | QR code check-in, biometric, manual, grace period |
| **P1** | Late fee rules | Auto-apply late fees after N days, amount/percentage, grace period |
| **P1** | Freeze/hold policies | Max freeze days per year, min membership age for freeze, fees |
| **P2** | API keys / Integrations | Third-party integrations (WhatsApp, Google Calendar, accounting software) |
| **P2** | Staff shift configuration | Define shift timings, auto-assign, rotation rules |
| **P2** | Automated workflows | "When membership expires → send renewal reminder → wait 3 days → send follow-up" |
| **P2** | Custom fields | Owner can add custom fields to member/trainer profiles |
| **P2** | Terms & conditions | Membership agreement text, liability waiver, house rules |
| **P3** | White-label settings | Custom domain, remove app branding |
| **P3** | Mobile app settings | Push notification preferences, app theme |
| **P3** | Referral program settings | Referral reward amount, conditions, tracking |

---

## Detailed Feature Specifications

### 1. Gym Profile & Branding (P0)

**New section: "Gym Profile"** (should be first in the sidebar)

**Fields:**
```
- Gym Name (required)
- Tagline / Slogan
- Logo (image upload)
- Cover Photo
- Address (line 1, line 2, city, state, PIN, country)
- Phone (primary, secondary)
- Email (primary)
- Website URL
- Social Media: Instagram, Facebook, YouTube, Twitter
- Google Maps Link
- Description / About (rich text)
- Founded Date
- GST / Tax Registration Number
- Business Registration Number
```

```sql
CREATE TABLE gym_profile (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id) UNIQUE,
  name VARCHAR(200) NOT NULL,
  tagline VARCHAR(300),
  logo_url VARCHAR(500),
  cover_photo_url VARCHAR(500),
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  country VARCHAR(50) DEFAULT 'India',
  phone_primary VARCHAR(20),
  phone_secondary VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),
  instagram VARCHAR(200),
  facebook VARCHAR(200),
  youtube VARCHAR(200),
  twitter VARCHAR(200),
  google_maps_link VARCHAR(500),
  description TEXT,
  founded_date DATE,
  gst_number VARCHAR(30),
  business_registration VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Business Hours Configuration (P0)

```sql
CREATE TABLE business_hours (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  is_open BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME,
  UNIQUE(gym_id, day_of_week)
);

CREATE TABLE holidays (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  date DATE NOT NULL,
  name VARCHAR(100),
  is_recurring BOOLEAN DEFAULT false, -- repeat every year
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI:** 7-row table (Mon-Sun) with toggle + time pickers. Holiday calendar below.

### 3. Membership Plan Management (P0)

**New section: "Plans & Pricing"**

```sql
CREATE TABLE membership_plans (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(100) NOT NULL, -- "Monthly Basic", "Annual Premium"
  duration_months INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  features TEXT[], -- ["Gym access", "Locker", "Group classes"]
  max_freeze_days INTEGER DEFAULT 0,
  is_transferable BOOLEAN DEFAULT false,
  enrollment_fee DECIMAL(10,2) DEFAULT 0, -- one-time joining fee
  auto_renew BOOLEAN DEFAULT false,
  discount_percentage DECIMAL(4,1) DEFAULT 0, -- e.g., 10% off annual
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI:** Card grid of plans with:
- Name, price, duration
- Feature list (add/remove)
- Active/Inactive toggle
- Drag to reorder
- "X active members on this plan" count

### 4. Payment Gateway Configuration (P0)

```sql
CREATE TABLE payment_config (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  provider VARCHAR(50) NOT NULL, -- RAZORPAY, STRIPE, MANUAL
  api_key_encrypted VARCHAR(500),
  api_secret_encrypted VARCHAR(500),
  webhook_secret VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  test_mode BOOLEAN DEFAULT false,
  accepted_methods JSONB DEFAULT '["UPI", "CARD", "NET_BANKING", "CASH"]',
  auto_receipt BOOLEAN DEFAULT true,
  receipt_prefix VARCHAR(10) DEFAULT 'RCP',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Email/SMS Templates (P1)

```sql
CREATE TABLE message_templates (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(100) NOT NULL, -- "welcome_email", "payment_reminder", "birthday_wish"
  channel VARCHAR(20) NOT NULL, -- EMAIL, SMS, WHATSAPP, PUSH
  subject VARCHAR(200), -- for email
  body TEXT NOT NULL, -- supports {{member_name}}, {{plan_name}}, {{amount}} variables
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Default templates:**
- Welcome (new member)
- Payment receipt
- Payment reminder (1 day before due)
- Payment overdue (1/3/7/14 days)
- Membership expiry warning (7/3/1 days)
- Membership expired
- Birthday wish
- Class booking confirmation
- Class cancellation
- Session reminder (1 hour before)
- Freeze confirmation
- Account deactivation

**UI:** Template editor with:
- Variable picker: `{{member_name}}`, `{{amount}}`, `{{due_date}}`, etc.
- Preview with sample data
- Send test email/SMS

### 6. Receipt/Invoice Customization (P1)

**Fields:**
- Company name (auto from gym profile)
- Logo (auto from gym profile)
- GST number
- Invoice prefix (e.g., "INV-")
- Receipt prefix (e.g., "RCP-")
- Header text
- Footer text (terms & conditions)
- Bank details for manual transfer
- Digital signature image

### 7. Data Export & Backup (P1)

**UI:** "Data Management" section:
- Export all members (CSV)
- Export all transactions (CSV)
- Export all sessions (CSV)
- Full backup (JSON) - all data
- Schedule automated backup (daily/weekly)
- Download history (last 10 exports)

**Backend:**
```
POST /api/settings/export?type=members&format=csv
POST /api/settings/export?type=full-backup&format=json
GET  /api/settings/exports                          -- List past exports
```

---

## Backend API Design

```
-- Gym Profile
GET  /api/settings/gym-profile
PUT  /api/settings/gym-profile
POST /api/settings/gym-profile/logo               -- Upload logo

-- Business Hours
GET  /api/settings/business-hours
PUT  /api/settings/business-hours
GET  /api/settings/holidays
POST /api/settings/holidays
DELETE /api/settings/holidays/{id}

-- Plans
GET  /api/settings/plans
POST /api/settings/plans
PUT  /api/settings/plans/{id}
DELETE /api/settings/plans/{id}

-- Payment Config
GET  /api/settings/payment-config
PUT  /api/settings/payment-config
POST /api/settings/payment-config/test             -- Test connection

-- Templates
GET  /api/settings/templates
PUT  /api/settings/templates/{id}
POST /api/settings/templates/{id}/test             -- Send test

-- Export
POST /api/settings/export
GET  /api/settings/exports
```

---

## Implementation Priority

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase 1** | Gym profile & branding, business hours | DB tables, file upload |
| **Phase 2** | Membership plan management | Plan DB table |
| **Phase 3** | Payment gateway configuration | Encryption for API keys |
| **Phase 4** | Currency/locale settings, receipt customization | Gym profile |
| **Phase 5** | Email/SMS templates | Template engine, email/SMS service |
| **Phase 6** | Data export/backup | Backend export endpoints |
| **Phase 7** | Multi-branch, integrations, workflows | Phase 1-4 |
