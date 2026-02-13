# Trainer Page Improvements Plan

## Current State

### Trainer List Page
- Name, Role, Assigned Members count, Performance sparkline, Revenue, Status
- Search, filter, batch actions, stat cards, tabs

### Trainer Detail Modal (Tabs)
1. **Edit Profile** - name, email, phone, role, join/leaving date, status, avatar
2. **Assigned Members** - add/remove members
3. **Schedule** - placeholder only ("coming soon")
4. **Performance** - all hardcoded/fake data (92%, 48 sessions, 4.8 rating)
5. **Message** - send message
6. **Delete** - remove trainer

---

## Improvements Needed

### A. Trainer List Page - New Columns

| # | Column | Description | Example |
|---|--------|-------------|---------|
| 1 | Specialization | Primary expertise tags | `Yoga`, `CrossFit`, `Weight Training` |
| 2 | Phone | Quick contact number | `+91 98765 43210` |
| 3 | Client Capacity | Current vs max clients | `12/20` with progress bar |
| 4 | Today's Status | Check-in status for the day | `Checked In 9:02 AM` / `Not Yet` / `Day Off` |
| 5 | Shift Time | Today's working hours | `6:00 AM - 2:00 PM` |

### B. Trainer Detail Modal - New Tabs & Enhancements

---

#### B1. Specializations & Certifications (New Tab)

**Purpose**: Track what each trainer is qualified to teach and when certs expire.

**Fields**:
- Specialization tags (multi-select): Yoga, CrossFit, Weight Training, Cardio, HIIT, Pilates, Zumba, Boxing, Swimming, Functional Training, Rehabilitation, Nutrition
- Certification list (table):
  - Certificate Name (e.g., "ACE Certified Personal Trainer")
  - Issuing Body (e.g., "ACE", "NASM", "ISSA")
  - Issue Date
  - Expiry Date
  - Status: `Valid` / `Expiring Soon` / `Expired`
  - Document upload (PDF/image)
- Add/Edit/Delete certifications
- Alert indicator when a certification is expiring within 30 days

**UI**: Two sections stacked - Tags section on top, Certifications table below.

---

#### B2. Salary & Commission (New Tab)

**Purpose**: Manage trainer compensation and track earnings.

**Fields**:
- Employment Type: `Full-Time` / `Part-Time` / `Freelance` / `Contract`
- Base Salary (monthly)
- Commission Rate (% per session or per new member signup)
- Commission Structure: `Per Session` / `Per Member Signup` / `Revenue Share`
- Bank Details: Account holder name, Bank name, Account number, IFSC code

**Monthly Earnings Table**:
| Month | Base Salary | Sessions | Commission | Bonus | Deductions | Total Payout | Status |
|-------|-------------|----------|------------|-------|------------|--------------|--------|
| Jan 2026 | 25,000 | 48 | 9,600 | 2,000 | 0 | 36,600 | Paid |
| Feb 2026 | 25,000 | 42 | 8,400 | 0 | 1,500 | 31,900 | Pending |

**Actions**:
- Mark as Paid
- Generate payslip
- Edit salary structure
- View payout history

---

#### B3. Attendance Tracking (New Tab)

**Purpose**: Monitor trainer punctuality and attendance.

**Fields**:
- Monthly calendar view with color-coded days:
  - Green: Present & On Time
  - Yellow: Late (arrived after shift start)
  - Red: Absent (no show, no leave)
  - Blue: On Leave (approved)
  - Gray: Day Off / Holiday
- Daily log table:
  - Date
  - Shift Time (scheduled)
  - Check-In Time (actual)
  - Check-Out Time (actual)
  - Hours Worked
  - Status: `On Time` / `Late by X min` / `Absent` / `On Leave` / `Half Day`

**Summary Stats**:
- Total Working Days this month
- Present Days
- Late Arrivals
- Absences
- Attendance Rate (%)

---

#### B4. Schedule & Availability (Replace Placeholder)

**Purpose**: Manage trainer's weekly schedule and session bookings.

**Weekly Availability Grid**:
- 7 columns (Mon-Sun) x time slots (6 AM - 10 PM, 1-hour blocks)
- Each slot: `Available` / `Booked` / `Blocked` / `Off`
- Click to toggle availability
- Drag to select multiple slots

**Upcoming Sessions List**:
| Date & Time | Member Name | Session Type | Duration | Status |
|-------------|-------------|--------------|----------|--------|
| Today 10:00 AM | Rahul Sharma | Weight Training | 1 hr | Confirmed |
| Today 2:00 PM | Priya Patel | Yoga | 45 min | Confirmed |
| Tomorrow 9:00 AM | Amit Kumar | CrossFit | 1 hr | Pending |

**Actions**:
- Set recurring weekly schedule
- Block specific dates (vacation, sick day)
- Reschedule/Cancel sessions
- View past sessions history

---

#### B5. Contract Details (New Section in Edit Profile)

**Purpose**: Track employment terms and contract status.

**Fields**:
- Employment Type: `Full-Time` / `Part-Time` / `Freelance` / `Contract`
- Contract Start Date
- Contract End Date (if applicable)
- Probation Period: Yes/No, End Date
- Notice Period: 15 days / 30 days / 60 days / 90 days
- Working Hours/Week: e.g., 40 hrs
- Contract Document Upload (PDF)
- Auto-alert when contract is expiring within 30 days

---

#### B6. Emergency Contact (New Section in Edit Profile)

**Purpose**: Legal requirement for employee records.

**Fields**:
- Contact Name
- Relationship (Spouse, Parent, Sibling, Friend, Other)
- Phone Number
- Alternate Phone Number
- Address (optional)

---

#### B7. Owner Notes (New Section in Modal)

**Purpose**: Private notes about the trainer visible only to gym owner/admin.

**Fields**:
- Notes list with:
  - Note text (rich text)
  - Created by (admin name)
  - Created date
  - Category tag: `General` / `Performance` / `Warning` / `Appreciation` / `Follow-up`
- Add/Edit/Delete notes
- Pin important notes to top

---

#### B8. Fix Performance Tab (Replace Fake Data)

**Current Problem**: All data is hardcoded (92% attendance, 48 sessions, 4.8 rating).

**Should Show Real Data**:
- Session count (from schedule/booking data)
- Client retention rate (how many clients stay month over month)
- Attendance rate (from attendance tracking)
- Member satisfaction (from feedback/ratings)
- Revenue generated (from commission/session data)

**Charts**:
- Monthly sessions completed (bar chart)
- Revenue trend (line chart)
- Client growth over time (line chart)
- Rating trend (line chart)

---

#### B9. Document Management (New Tab)

**Purpose**: Store all trainer-related documents in one place.

**Document Types**:
- ID Proof (Aadhar, PAN, Passport)
- Certificates & Qualifications
- Employment Contract
- Medical Fitness Certificate
- Background Verification
- Resume/CV
- Other

**Fields per Document**:
- Document name
- Type (from above list)
- Upload date
- Expiry date (if applicable)
- File (PDF/Image upload)
- Status: `Valid` / `Expiring` / `Expired`

---

## Implementation Priority

| Priority | Feature | Impact | Complexity |
|----------|---------|--------|------------|
| P0 | Specializations & Certifications | High - core trainer identity | Medium |
| P0 | Schedule & Availability (fix placeholder) | High - daily operations | High |
| P1 | Attendance Tracking | High - payroll & accountability | Medium |
| P1 | Salary & Commission | High - financial management | Medium |
| P2 | Contract Details | Medium - HR compliance | Low |
| P2 | Emergency Contact | Medium - legal requirement | Low |
| P2 | Fix Performance Tab (real data) | Medium - insights | Medium |
| P3 | Document Management | Low - nice to have | Medium |
| P3 | Owner Notes | Low - nice to have | Low |
| P3 | List page new columns | Low - convenience | Low |

---

## Data Model Changes Needed

### New Fields on Trainer Object
```typescript
interface Trainer {
  // ... existing fields ...

  // Specializations
  specializations: string[];

  // Contract
  employmentType: 'full-time' | 'part-time' | 'freelance' | 'contract';
  contractStartDate: string;
  contractEndDate?: string;
  probationEndDate?: string;
  noticePeriod: number; // days
  weeklyHours: number;

  // Salary
  baseSalary: number;
  commissionRate: number;
  commissionType: 'per-session' | 'per-signup' | 'revenue-share';

  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    altPhone?: string;
    address?: string;
  };

  // Capacity
  maxClients: number;
  currentClients: number;
}
```

### New Collections/Tables
```
certifications       - trainer_id, name, issuer, issue_date, expiry_date, document_url
attendance_logs      - trainer_id, date, shift_start, shift_end, check_in, check_out, status
salary_records       - trainer_id, month, base, sessions, commission, bonus, deductions, total, status
trainer_schedules    - trainer_id, day_of_week, start_time, end_time, is_available
trainer_sessions     - trainer_id, member_id, date, time, type, duration, status
trainer_documents    - trainer_id, name, type, upload_date, expiry_date, file_url, status
trainer_notes        - trainer_id, text, created_by, created_at, category, pinned
```
