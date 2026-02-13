# Classes Page - Improvement Plan

## Current State Analysis

**What exists:**
- Weekly calendar view with time slots (click to create)
- Class creation/edit modal (name, type, trainer, time, room, capacity)
- Filters: class type, trainer, status
- Stats dashboard (today's count, occupancy, upcoming, in-progress, full classes)
- 6 class types: Yoga, HIIT, Cardio, Strength, Pilates, CrossFit
- Conflict detection (room + time overlap)
- Past-date validation

**Architecture concern:** Classes are stored as PT Sessions with metadata in `progressNotes` JSON. This is a workaround, not a proper data model.

---

## Issues Found

### Critical
1. **No proper Classes table** - Abusing PT Sessions table, storing metadata as JSON in `progressNotes`
2. **No member enrollment** - `enrolled` count is stored in metadata but no actual enrollment records
3. **No recurring classes** - Gym classes repeat weekly (e.g., "Yoga every Monday 9am") - no recurrence support
4. **No class cancellation/notification** - Can't cancel a class and notify enrolled members
5. **Room management doesn't exist** - Rooms are hardcoded strings, no actual room entity

### Missing Real-World Features

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Proper classes data model | Separate `classes` and `class_enrollments` tables |
| **P0** | Member enrollment | Members can enroll/unenroll, waitlist when full |
| **P0** | Recurring schedule | Create "Yoga every Monday 9-10am" as a template |
| **P0** | Class attendance marking | Trainer marks who attended after class ends |
| **P1** | Waitlist management | Auto-promote from waitlist when spot opens |
| **P1** | Substitute trainer | Assign replacement trainer when original is unavailable |
| **P1** | Class cancellation with notification | Cancel class → notify all enrolled members |
| **P1** | Multi-day view toggle | Day / 3-day / Week / Month calendar views |
| **P1** | Class templates | Save class configurations for reuse |
| **P1** | Drag-and-drop rescheduling | Drag a class block to new time slot |
| **P2** | Class packages | "10-class yoga pack" that members can purchase |
| **P2** | Class ratings & feedback | Members rate class after attending |
| **P2** | Instructor notes | Trainer adds post-class notes (what was covered, homework) |
| **P2** | Room management | Define rooms with capacity, equipment, availability |
| **P2** | Color-coded by type | Each class type gets a distinct color on calendar |
| **P3** | Booking deadline | "Book at least 2 hours before class starts" |
| **P3** | No-show policy | Track no-shows, auto-penalize after 3 no-shows |
| **P3** | Class popularity analytics | Most/least popular classes, peak demand times |

---

## Detailed Feature Specifications

### 1. Proper Classes Data Model (P0)

**Current hack:**
```typescript
progressNotes: JSON.stringify({ name, type, room, capacity, enrolled })
```

**Proper model:**
```sql
CREATE TABLE class_definitions (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- YOGA, HIIT, CARDIO, STRENGTH, PILATES, CROSSFIT
  description TEXT,
  default_trainer_id INTEGER REFERENCES users(id),
  default_room_id INTEGER REFERENCES rooms(id),
  default_capacity INTEGER DEFAULT 20,
  duration_minutes INTEGER DEFAULT 60,
  difficulty_level VARCHAR(20), -- BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS
  color VARCHAR(7), -- hex color for calendar
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE class_schedules (
  id SERIAL PRIMARY KEY,
  class_definition_id INTEGER REFERENCES class_definitions(id),
  trainer_id INTEGER REFERENCES users(id),
  room_id INTEGER REFERENCES rooms(id),
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity_override INTEGER, -- NULL means use default
  effective_from DATE NOT NULL,
  effective_until DATE, -- NULL = ongoing
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE class_instances (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES class_schedules(id),
  class_definition_id INTEGER REFERENCES class_definitions(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  trainer_id INTEGER REFERENCES users(id),
  room_id INTEGER REFERENCES rooms(id),
  capacity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  cancellation_reason TEXT,
  trainer_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE class_enrollments (
  id SERIAL PRIMARY KEY,
  class_instance_id INTEGER REFERENCES class_instances(id),
  member_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'ENROLLED', -- ENROLLED, WAITLISTED, ATTENDED, NO_SHOW, CANCELLED
  enrolled_at TIMESTAMP DEFAULT NOW(),
  checked_in_at TIMESTAMP,
  waitlist_position INTEGER,
  UNIQUE(class_instance_id, member_id)
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER REFERENCES gyms(id),
  name VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  equipment TEXT[], -- array of available equipment
  floor VARCHAR(20),
  is_active BOOLEAN DEFAULT true
);
```

### 2. Member Enrollment Flow (P0)

**API Endpoints:**
```
POST   /api/classes/{instanceId}/enroll       -- Enroll member
DELETE /api/classes/{instanceId}/enroll/{memberId} -- Unenroll
GET    /api/classes/{instanceId}/enrollments   -- List enrolled members
POST   /api/classes/{instanceId}/attendance    -- Mark attendance (batch)
```

**UI in class detail popup:**
- Enrolled members list with avatars
- "Add Member" search dropdown
- Attendance checkboxes (after class time)
- Enrollment count: "12/20 enrolled | 3 waitlisted"

### 3. Recurring Schedule (P0)

**UI:** When creating a class, toggle "Recurring" → select days of week, effective date range.
- System auto-generates `class_instances` for the next 4 weeks
- Cron job generates instances for future weeks
- Can edit single instance (this occurrence only) or all future instances

### 4. Class Attendance Marking (P0)

**UI:** After class end time, trainer or admin sees "Mark Attendance" button:
- Shows enrolled members with checkboxes
- Bulk "Mark All Present" / "Mark All Absent"
- No-show members auto-flagged
- Attendance data feeds into member's attendance history

---

## Backend API Design

```
GET    /api/classes/definitions                    -- All class types
POST   /api/classes/definitions                    -- Create class type
GET    /api/classes/schedules                       -- Recurring schedules
POST   /api/classes/schedules                       -- Create recurring schedule
GET    /api/classes/instances?from=&to=             -- Instances in date range
POST   /api/classes/instances                       -- Create one-off instance
PUT    /api/classes/instances/{id}                  -- Update instance
DELETE /api/classes/instances/{id}                  -- Cancel instance
POST   /api/classes/instances/{id}/enroll           -- Enroll member
DELETE /api/classes/instances/{id}/enroll/{memberId} -- Unenroll
POST   /api/classes/instances/{id}/attendance       -- Mark attendance
GET    /api/rooms                                   -- List rooms
POST   /api/rooms                                   -- Create room
```

---

## Implementation Priority

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase 1** | Create proper DB tables, migrate existing PT Session data to class_instances | Database migration |
| **Phase 2** | CRUD API for class definitions, instances, rooms | Phase 1 |
| **Phase 3** | Enrollment system with waitlist | Phase 2 |
| **Phase 4** | Recurring schedule with auto-generation | Phase 2 |
| **Phase 5** | Attendance marking, substitute trainer, cancellation notifications | Phase 3 |
| **Phase 6** | Drag-drop rescheduling, templates, multi-day views | Frontend-only |
| **Phase 7** | Packages, ratings, analytics | Phase 3+5 |
