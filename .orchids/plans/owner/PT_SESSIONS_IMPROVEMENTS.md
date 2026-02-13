# PT Sessions Page - Improvement Plan

## Current State Analysis

**What exists:**
- Calendar view (monthly) + List view toggle
- Session creation modal (trainer, member, date, time, duration, recurring option)
- Session detail modal (view/update status)
- Filters: status, trainer, member, date
- Stats strip: Today, This Week, Upcoming, Done, Completion Rate, Missed, Trainers, Members
- Status types: SCHEDULED, COMPLETED, MISSED, CANCELLED
- Click calendar date to see sessions for that day

---

## Issues Found

### Critical
1. **No session pricing/billing** - No cost per session, no payment tracking, no packages
2. **No session type/focus area** - All sessions are generic "PT Session" - no weight training, cardio assessment, etc.
3. **No progress tracking** - `progressNotes` is a text field sometimes abused for class metadata
4. **No workout plan attachment** - Trainer can't attach the actual workout done in the session
5. **Loads ALL sessions for ALL trainers** - `Promise.all(trainers.map(...))` - N+1 query pattern, doesn't scale

### Missing Real-World Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Session packages & billing | "10-session pack for ₹15,000" - track remaining sessions |
| **P0** | Session types/categories | Weight training, cardio, flexibility, assessment, rehab |
| **P0** | Proper session notes/progress | Structured workout log: exercises, sets, reps, weight |
| **P0** | Bulk session scheduling | Schedule 12 sessions at once (e.g., MWF for 4 weeks) |
| **P0** | Backend pagination | Replace N+1 trainer query with single paginated endpoint |
| **P1** | Session reminders | Push/SMS/WhatsApp reminder 1 hour before session |
| **P1** | No-show management | Auto-mark as missed after 15 min, deduct from package |
| **P1** | Reschedule flow | Member requests reschedule → trainer approves → new slot |
| **P1** | Trainer availability | Show trainer's free slots when scheduling |
| **P1** | Session check-in | Member checks in for session (QR scan or manual) |
| **P1** | Body measurements per session | Record weight, body fat %, measurements at assessment sessions |
| **P2** | Session feedback/rating | Member rates session 1-5 stars with comment |
| **P2** | Before/after photos | Progress photos linked to sessions |
| **P2** | Workout plan templates | Trainer creates reusable workout plans, assigns to sessions |
| **P2** | Session revenue report | Revenue per trainer, per package type, per month |
| **P2** | Cancellation policy | Cancel > 24h: no charge, < 24h: deduct from package |
| **P3** | AI workout suggestions | Based on member's history, suggest next workout |
| **P3** | Video exercise demos | Link exercises to demo videos |
| **P3** | Member progress dashboard | Show member their progress over sessions (graphs) |

---

## Detailed Feature Specifications

### 1. Session Packages & Billing (P0)

```sql
CREATE TABLE pt_packages (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(100) NOT NULL, -- "12 Session Starter", "24 Session Pro"
  session_count INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  validity_days INTEGER NOT NULL, -- expires after N days from purchase
  session_duration_minutes INTEGER DEFAULT 60,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE member_pt_subscriptions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES users(id),
  trainer_id INTEGER REFERENCES users(id),
  package_id INTEGER REFERENCES pt_packages(id),
  purchase_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  total_sessions INTEGER NOT NULL,
  used_sessions INTEGER DEFAULT 0,
  remaining_sessions INTEGER GENERATED ALWAYS AS (total_sessions - used_sessions) STORED,
  amount_paid DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'PAID', -- PAID, PARTIAL, PENDING
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, EXHAUSTED, CANCELLED
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI:**
- When scheduling session, select member → auto-show remaining sessions from active package
- If 0 remaining, prompt to purchase new package
- Session completion auto-decrements remaining count
- Package expiry warning in member profile

### 2. Session Types & Categories (P0)

```sql
ALTER TABLE pt_sessions ADD COLUMN session_type VARCHAR(50) DEFAULT 'GENERAL';
-- Types: ASSESSMENT, WEIGHT_TRAINING, CARDIO, FLEXIBILITY, REHAB, HIIT, FUNCTIONAL, CUSTOM
ALTER TABLE pt_sessions ADD COLUMN focus_area VARCHAR(100);
-- Focus: UPPER_BODY, LOWER_BODY, CORE, FULL_BODY, CHEST, BACK, LEGS, ARMS, SHOULDERS
```

**UI:** Color-coded session types on calendar. Filter by type.

### 3. Structured Workout Logging (P0)

```sql
CREATE TABLE session_exercises (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES pt_sessions(id),
  exercise_name VARCHAR(100) NOT NULL,
  exercise_order INTEGER NOT NULL,
  sets_planned INTEGER,
  reps_planned INTEGER,
  weight_planned DECIMAL(6,1), -- in kg
  duration_planned INTEGER, -- in seconds (for cardio)
  sets_completed INTEGER,
  reps_completed INTEGER,
  weight_used DECIMAL(6,1),
  duration_completed INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exercise_library (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- COMPOUND, ISOLATION, CARDIO, STRETCH, BODYWEIGHT
  muscle_group VARCHAR(50), -- CHEST, BACK, LEGS, etc.
  equipment_needed VARCHAR(100),
  difficulty VARCHAR(20), -- BEGINNER, INTERMEDIATE, ADVANCED
  video_url VARCHAR(500),
  instructions TEXT,
  is_active BOOLEAN DEFAULT true
);
```

**UI in session detail:**
- Exercise list with sets/reps/weight table
- Quick-add from exercise library
- Compare to last session: "Bench Press: 80kg (prev: 75kg) +5kg"
- Total volume calculation: sets x reps x weight

### 4. Bulk Session Scheduling (P0)

**UI:** "Schedule Multiple" button opens wizard:
1. Select member + trainer
2. Select days of week (M, W, F)
3. Select time slot
4. Select date range (4 weeks / 8 weeks / custom)
5. Preview generated sessions on mini calendar
6. Conflict detection: highlight slots where trainer is busy
7. Confirm → creates all sessions at once

### 5. Trainer Availability View (P1)

```
GET /api/trainers/{id}/availability?date=2026-02-13
Response: {
  date: "2026-02-13",
  workingHours: { start: "07:00", end: "21:00" },
  bookedSlots: [
    { start: "09:00", end: "10:00", memberName: "John" },
    { start: "14:00", end: "15:00", memberName: "Jane" }
  ],
  availableSlots: ["07:00", "08:00", "10:00", "11:00", ...]
}
```

**UI:** When scheduling, show trainer's day as timeline with booked/free slots.

### 6. Reschedule Flow (P1)

**States:** `RESCHEDULE_REQUESTED` → `RESCHEDULED` / `RESCHEDULE_DENIED`

```sql
CREATE TABLE session_reschedule_requests (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES pt_sessions(id),
  requested_by INTEGER REFERENCES users(id), -- member or trainer
  original_date TIMESTAMP NOT NULL,
  requested_date TIMESTAMP NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, DENIED
  responded_by INTEGER REFERENCES users(id),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Backend API Design

```
-- Packages
GET    /api/pt/packages                            -- List available packages
POST   /api/pt/packages                            -- Create package
GET    /api/members/{id}/pt-subscriptions           -- Member's active packages
POST   /api/members/{id}/pt-subscriptions           -- Purchase package

-- Sessions (improved)
GET    /api/pt/sessions?page=0&size=20&from=&to=   -- Paginated sessions (replace N+1)
POST   /api/pt/sessions/bulk                        -- Bulk create sessions
PUT    /api/pt/sessions/{id}/status                 -- Update status
POST   /api/pt/sessions/{id}/check-in               -- Member check-in

-- Workout logging
GET    /api/pt/sessions/{id}/exercises              -- Get exercise log
POST   /api/pt/sessions/{id}/exercises              -- Add exercises
GET    /api/exercises/library                       -- Exercise library

-- Availability
GET    /api/trainers/{id}/availability?date=        -- Trainer's free slots

-- Reschedule
POST   /api/pt/sessions/{id}/reschedule-request     -- Request reschedule
PUT    /api/pt/reschedule-requests/{id}             -- Approve/deny
```

---

## Implementation Priority

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase 1** | Paginated sessions API, session types | Backend refactor |
| **Phase 2** | PT packages & billing | Payment system integration |
| **Phase 3** | Structured workout logging, exercise library | Phase 1 |
| **Phase 4** | Bulk scheduling, trainer availability | Phase 1 |
| **Phase 5** | Reschedule flow, cancellation policy, reminders | Phase 2 |
| **Phase 6** | Body measurements, progress photos, ratings | Phase 3 |
| **Phase 7** | Workout templates, member progress dashboard | Phase 3+6 |
