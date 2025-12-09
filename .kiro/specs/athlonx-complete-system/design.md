# Design Document - AthlonX Gym Management System

## Overview

The AthlonX Gym Management System is a full-stack enterprise application built with React (TypeScript) frontend and Spring Boot (Java) backend, using Oracle database for persistence. The system extends the existing gym management platform to include comprehensive PT scheduling, staff performance tracking, member management, and administrative configuration capabilities.

The design follows a layered architecture pattern with clear separation between presentation (React), business logic (Spring Boot services), and data persistence (Oracle DB with JPA). The system will maintain the existing three-tier architecture while adding new domain models, services, and UI components for the enhanced features.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer (React)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │  Staff   │  │ Members  │  │ Settings │   │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           API Service Layer (Axios)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    REST API (JSON)
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Backend Layer (Spring Boot)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers (REST Endpoints)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Service Layer (Business Logic)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Repository Layer (JPA/Hibernate)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                         JDBC
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (Oracle Database)                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ Users  │  │PT      │  │Staff   │  │Settings│           │
│  │        │  │Sessions│  │Perf    │  │        │           │
│  └────────┘  └────────┘  └────────┘  └────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19.2.0 with TypeScript
- React Router for navigation
- Axios for HTTP requests
- Lucide React for SVG icons
- Vite for build tooling
- Vitest for testing

**Backend:**
- Spring Boot 3.2.3
- Spring Data JPA
- Oracle JDBC Driver (ojdbc11)
- Lombok for boilerplate reduction
- Java 17

**Database:**
- Oracle Database
- JPA/Hibernate ORM

## Components and Interfaces

### Frontend Components

#### 1. Staff Performance Components

**StaffPerformanceCard**
- Displays individual staff member performance metrics
- Props: `staffId`, `sessionsCount`, `attendanceRate`, `satisfactionScore`
- Renders metrics with visual indicators (progress bars, badges)

**StaffAttendanceTable**
- Shows monthly attendance records
- Props: `staffId`, `month`, `year`
- Displays present/absent/late status with color coding

**ShiftAllocationList**
- Displays assigned shifts for staff member
- Props: `staffId`, `shifts[]`
- Shows date, start time, end time for each shift

#### 2. PT Scheduling Components

**PTScheduleCalendar**
- Calendar view for PT sessions
- Props: `trainerId`, `month`, `year`, `onSessionClick`, `onSlotClick`
- Supports day/week/month views
- Highlights available and booked slots

**SessionBookingModal**
- Form for creating/editing PT sessions
- Props: `trainerId`, `session?`, `onSave`, `onCancel`
- Fields: member selection, date, time slot, duration, recurring options

**SessionDetailModal**
- Displays session information and allows updates
- Props: `sessionId`, `onUpdate`, `onCancel`
- Shows member info, trainer notes, workout/diet plans
- Allows marking attendance and adding progress notes

**UpcomingSessionsList**
- List of upcoming PT sessions
- Props: `userId`, `userRole`, `limit`
- Shows next N sessions with countdown timers
- Highlights sessions within 24 hours

#### 3. Settings Components

**SettingsTabs**
- Tab navigation for settings sections
- Tabs: Gym Hours, Trainer Availability, PT Configuration, Packages, Theme

**GymHoursConfig**
- Configure gym operating hours
- Day-by-day time picker
- Mark blackout days

**PTSessionConfig**
- Set default session duration
- Set max sessions per day per trainer
- Configure session slot intervals

**MembershipPackageManager**
- CRUD interface for membership packages
- Table view with add/edit/delete actions
- Form fields: name, price, duration, PT sessions included

**ThemeSelector**
- Toggle between light/dark mode
- Preview of theme colors
- Persists to localStorage

#### 4. Enhanced Data Table Component

**DataTable**
- Generic reusable table component
- Props: `columns[]`, `data[]`, `sortable`, `filterable`, `paginated`
- Features:
  - Column sorting (asc/desc)
  - Per-column filters
  - Pagination with configurable page size
  - Row selection for bulk operations
  - Grid/list view toggle

### Backend Components

#### 1. Domain Models

**PTSession**
```java
@Entity
@Table(name = "pt_sessions")
public class PTSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;
    
    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;
    
    @ManyToOne
    @JoinColumn(name = "member_id")
    private User member;
    
    private LocalDateTime sessionDate;
    private Integer durationMinutes;
    private SessionStatus status; // SCHEDULED, COMPLETED, MISSED, CANCELLED
    private String progressNotes;
    private String workoutPlan;
    private String dietPlan;
    private Boolean isRecurring;
    private RecurringFrequency recurringFrequency; // WEEKLY, BIWEEKLY
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**StaffPerformance**
```java
@Entity
@Table(name = "staff_performance")
public class StaffPerformance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long performanceId;
    
    @ManyToOne
    @JoinColumn(name = "staff_id")
    private User staff;
    
    private Integer sessionsCompleted;
    private Double attendanceRate;
    private Double satisfactionScore;
    private Integer presentDays;
    private Integer absentDays;
    private Integer lateDays;
    private YearMonth recordMonth;
}
```

**StaffShift**
```java
@Entity
@Table(name = "staff_shifts")
public class StaffShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shiftId;
    
    @ManyToOne
    @JoinColumn(name = "staff_id")
    private User staff;
    
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ShiftStatus status; // SCHEDULED, COMPLETED, MISSED
}
```

**GymSettings**
```java
@Entity
@Table(name = "gym_settings")
public class GymSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settingId;
    
    private String settingKey;
    private String settingValue;
    private String settingType; // GYM_HOURS, PT_CONFIG, etc.
}
```

**MembershipPackage**
```java
@Entity
@Table(name = "membership_packages")
public class MembershipPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long packageId;
    
    private String packageName;
    private Double price;
    private Integer durationDays;
    private Integer includedPTSessions;
    private Boolean isActive;
}
```

**BlackoutDay**
```java
@Entity
@Table(name = "blackout_days")
public class BlackoutDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blackoutId;
    
    private LocalDate date;
    private String reason;
}
```

#### 2. Service Layer

**PTSessionService**
- `createSession(PTSessionDTO)`: Create new PT session
- `updateSession(Long sessionId, PTSessionDTO)`: Update session details
- `cancelSession(Long sessionId)`: Cancel a session
- `markSessionComplete(Long sessionId, String notes)`: Mark session as completed
- `getTrainerSessions(Long trainerId, LocalDate start, LocalDate end)`: Get trainer's sessions
- `getMemberSessions(Long memberId)`: Get member's sessions
- `getAvailableSlots(Long trainerId, LocalDate date)`: Get available time slots
- `createRecurringSessions(PTSessionDTO, RecurringConfig)`: Create recurring sessions

**StaffPerformanceService**
- `getPerformanceMetrics(Long staffId, YearMonth month)`: Get performance data
- `updateAttendance(Long staffId, LocalDate date, AttendanceStatus)`: Record attendance
- `calculateSatisfactionScore(Long staffId)`: Calculate satisfaction from feedback
- `getShifts(Long staffId, LocalDate start, LocalDate end)`: Get staff shifts
- `assignShift(StaffShiftDTO)`: Assign shift to staff member

**GymSettingsService**
- `getGymHours()`: Get gym operating hours
- `updateGymHours(GymHoursDTO)`: Update gym hours
- `getPTConfiguration()`: Get PT session configuration
- `updatePTConfiguration(PTConfigDTO)`: Update PT config
- `getBlackoutDays()`: Get list of blackout days
- `addBlackoutDay(LocalDate, String reason)`: Add blackout day

**MembershipPackageService**
- `getAllPackages()`: Get all packages
- `createPackage(MembershipPackageDTO)`: Create new package
- `updatePackage(Long packageId, MembershipPackageDTO)`: Update package
- `deletePackage(Long packageId)`: Delete package (with validation)
- `getActivePackages()`: Get only active packages

#### 3. REST Controllers

**PTSessionController**
- `POST /api/pt-sessions`: Create session
- `PUT /api/pt-sessions/{id}`: Update session
- `DELETE /api/pt-sessions/{id}`: Cancel session
- `GET /api/pt-sessions/trainer/{trainerId}`: Get trainer sessions
- `GET /api/pt-sessions/member/{memberId}`: Get member sessions
- `GET /api/pt-sessions/{id}/available-slots`: Get available slots
- `POST /api/pt-sessions/{id}/complete`: Mark session complete

**StaffPerformanceController**
- `GET /api/staff/{staffId}/performance`: Get performance metrics
- `GET /api/staff/{staffId}/attendance`: Get attendance records
- `POST /api/staff/{staffId}/attendance`: Record attendance
- `GET /api/staff/{staffId}/shifts`: Get shifts
- `POST /api/staff/shifts`: Assign shift

**GymSettingsController**
- `GET /api/settings/gym-hours`: Get gym hours
- `PUT /api/settings/gym-hours`: Update gym hours
- `GET /api/settings/pt-config`: Get PT configuration
- `PUT /api/settings/pt-config`: Update PT configuration
- `GET /api/settings/blackout-days`: Get blackout days
- `POST /api/settings/blackout-days`: Add blackout day

**MembershipPackageController**
- `GET /api/packages`: Get all packages
- `POST /api/packages`: Create package
- `PUT /api/packages/{id}`: Update package
- `DELETE /api/packages/{id}`: Delete package

## Data Models

### Database Schema Extensions

The existing schema has:
- `users` table
- `roles` table
- `user_role_map` table
- `trainer_customer_map` table

New tables to be added:

```sql
-- PT Sessions table
CREATE TABLE pt_sessions (
    session_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    trainer_id NUMBER NOT NULL,
    member_id NUMBER NOT NULL,
    session_date TIMESTAMP NOT NULL,
    duration_minutes NUMBER NOT NULL,
    status VARCHAR2(20) NOT NULL,
    progress_notes CLOB,
    workout_plan CLOB,
    diet_plan CLOB,
    is_recurring NUMBER(1) DEFAULT 0,
    recurring_frequency VARCHAR2(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pts_trainer FOREIGN KEY (trainer_id) REFERENCES users(user_id),
    CONSTRAINT fk_pts_member FOREIGN KEY (member_id) REFERENCES users(user_id),
    CONSTRAINT chk_status CHECK (status IN ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED'))
);

CREATE INDEX idx_pts_trainer ON pt_sessions(trainer_id);
CREATE INDEX idx_pts_member ON pt_sessions(member_id);
CREATE INDEX idx_pts_date ON pt_sessions(session_date);

-- Staff Performance table
CREATE TABLE staff_performance (
    performance_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    staff_id NUMBER NOT NULL,
    sessions_completed NUMBER DEFAULT 0,
    attendance_rate NUMBER(5,2),
    satisfaction_score NUMBER(3,2),
    present_days NUMBER DEFAULT 0,
    absent_days NUMBER DEFAULT 0,
    late_days NUMBER DEFAULT 0,
    record_month VARCHAR2(7) NOT NULL, -- Format: YYYY-MM
    CONSTRAINT fk_sp_staff FOREIGN KEY (staff_id) REFERENCES users(user_id),
    CONSTRAINT uk_staff_month UNIQUE (staff_id, record_month)
);

-- Staff Shifts table
CREATE TABLE staff_shifts (
    shift_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    staff_id NUMBER NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR2(20) DEFAULT 'SCHEDULED',
    CONSTRAINT fk_ss_staff FOREIGN KEY (staff_id) REFERENCES users(user_id),
    CONSTRAINT chk_shift_status CHECK (status IN ('SCHEDULED', 'COMPLETED', 'MISSED'))
);

CREATE INDEX idx_ss_staff ON staff_shifts(staff_id);
CREATE INDEX idx_ss_date ON staff_shifts(shift_date);

-- Gym Settings table
CREATE TABLE gym_settings (
    setting_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    setting_key VARCHAR2(100) NOT NULL UNIQUE,
    setting_value CLOB NOT NULL,
    setting_type VARCHAR2(50) NOT NULL
);

-- Membership Packages table
CREATE TABLE membership_packages (
    package_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    package_name VARCHAR2(100) NOT NULL,
    price NUMBER(10,2) NOT NULL,
    duration_days NUMBER NOT NULL,
    included_pt_sessions NUMBER DEFAULT 0,
    is_active NUMBER(1) DEFAULT 1
);

-- Blackout Days table
CREATE TABLE blackout_days (
    blackout_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    blackout_date DATE NOT NULL UNIQUE,
    reason VARCHAR2(255)
);
```

### Data Transfer Objects (DTOs)

**PTSessionDTO**
```typescript
interface PTSessionDTO {
  sessionId?: number;
  trainerId: number;
  memberId: number;
  sessionDate: string; // ISO 8601
  durationMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  progressNotes?: string;
  workoutPlan?: string;
  dietPlan?: string;
  isRecurring: boolean;
  recurringFrequency?: 'WEEKLY' | 'BIWEEKLY';
}
```

**StaffPerformanceDTO**
```typescript
interface StaffPerformanceDTO {
  staffId: number;
  staffName: string;
  sessionsCompleted: number;
  attendanceRate: number;
  satisfactionScore: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  recordMonth: string; // YYYY-MM
}
```

**MembershipPackageDTO**
```typescript
interface MembershipPackageDTO {
  packageId?: number;
  packageName: string;
  price: number;
  durationDays: number;
  includedPTSessions: number;
  isActive: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework analysis, several redundancies were identified:

- Properties 1.2, 1.4, 1.5, 3.2, 4.2, 8.3, 12.2 all test that data structures contain required fields - these can be consolidated into comprehensive data validation properties
- Properties 4.1 and 3.1 both test that schedules are displayed in detail views - can be combined
- Properties 8.1 and 7.5 both test data synchronization between trainer and member views - can be combined
- Properties 2.2 and 15.2 both test column sorting - can be combined into one sorting property

After consolidation, the following unique properties provide comprehensive validation coverage:

Property 1: Performance metrics completeness
Property 2: Attendance data completeness  
Property 3: Session data completeness
Property 4: Trainer availability validation
Property 5: Session sorting by date
Property 6: Reminder generation for upcoming sessions
Property 7: Recurring session creation
Property 8: Daily session limit enforcement
Property 9: Available slot calculation
Property 10: Data synchronization between views
Property 11: Foreign key constraint enforcement
Property 12: Package deletion validation
Property 13: Package update isolation
Property 14: Theme switching without reload
Property 15: Table sorting correctness
Property 16: Filter application correctness
Property 17: Summary metrics calculation

### Correctness Properties

Property 1: Performance metrics completeness
*For any* staff member performance data, the rendered output should include sessions conducted, attendance rate, and member satisfaction score
**Validates: Requirements 1.2**

Property 2: Attendance data completeness
*For any* staff attendance record, it should contain present days, absent days, and late arrivals counts
**Validates: Requirements 1.4**

Property 3: Session data completeness
*For any* PT session displayed to trainers or members, it should include date, time, participant name (trainer or member), and session status
**Validates: Requirements 3.2, 4.2, 8.3**

Property 4: Trainer availability validation
*For any* PT session assignment, if the trainer has a conflicting session at that time slot, the assignment should be rejected
**Validates: Requirements 3.4**

Property 5: Session sorting by date
*For any* list of upcoming sessions, they should be sorted in chronological order (earliest first)
**Validates: Requirements 5.2**

Property 6: Reminder generation for upcoming sessions
*For any* PT session scheduled within 24 hours, a reminder notification should be generated
**Validates: Requirements 5.1**

Property 7: Recurring session creation
*For any* recurring session configuration (weekly or bi-weekly), creating it should generate multiple session records at the correct intervals
**Validates: Requirements 6.3**

Property 8: Daily session limit enforcement
*For any* trainer and date, the number of scheduled sessions should not exceed the configured maximum sessions per day
**Validates: Requirements 6.4**

Property 9: Available slot calculation
*For any* trainer and date, the available time slots should exclude all times where the trainer has existing sessions
**Validates: Requirements 6.5**

Property 10: Data synchronization between views
*For any* PT session created or updated by a trainer, it should immediately appear in the corresponding member's view with the same data
**Validates: Requirements 7.5, 8.1**

Property 11: Foreign key constraint enforcement
*For any* PT session, attempting to create it with a non-existent trainer ID or member ID should be rejected by the database
**Validates: Requirements 9.3**

Property 12: Package deletion validation
*For any* membership package with active subscriptions, attempting to delete it should be rejected
**Validates: Requirements 12.5**

Property 13: Package update isolation
*For any* membership package update, existing memberships should retain their original package parameters
**Validates: Requirements 12.4**

Property 14: Theme switching without reload
*For any* theme change (light to dark or dark to light), the UI should update immediately without requiring a page reload
**Validates: Requirements 14.3**

Property 15: Table sorting correctness
*For any* data table and sortable column, clicking the column header should sort all rows by that column's values in ascending or descending order
**Validates: Requirements 2.2, 15.2**

Property 16: Filter application correctness
*For any* filter criteria applied to a data table, the displayed rows should only include records that match all active filter conditions
**Validates: Requirements 2.4**

Property 17: Summary metrics calculation
*For any* staff data set, the summary metrics (total staff, active trainers, attendance rate) should accurately reflect the aggregated values from the data
**Validates: Requirements 2.5**

## Error Handling

### Frontend Error Handling

**API Request Errors**
- All API calls wrapped in try-catch blocks
- Network errors display user-friendly messages
- 401/403 errors redirect to login
- 404 errors show "not found" messages
- 500 errors show "server error" messages
- Retry mechanism for transient failures

**Form Validation Errors**
- Client-side validation before API calls
- Display field-level error messages
- Prevent submission with invalid data
- Clear error messages on field correction

**State Management Errors**
- Graceful handling of missing data
- Default values for undefined properties
- Error boundaries to catch React errors
- Fallback UI for component failures

### Backend Error Handling

**Validation Errors**
- Input validation using Bean Validation annotations
- Return 400 Bad Request with detailed error messages
- Validate business rules before persistence

**Database Errors**
- Handle constraint violations (foreign keys, unique constraints)
- Transaction rollback on errors
- Return 409 Conflict for constraint violations
- Log database errors for debugging

**Not Found Errors**
- Return 404 for non-existent resources
- Include resource type and ID in error message

**Authorization Errors**
- Return 403 Forbidden for unauthorized actions
- Validate user roles before operations

**Server Errors**
- Catch unexpected exceptions
- Return 500 Internal Server Error
- Log full stack traces
- Hide implementation details from clients

### Error Response Format

```typescript
interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
```

## Testing Strategy

### Unit Testing

**Frontend Unit Tests (Vitest)**
- Component rendering tests
- User interaction tests (button clicks, form submissions)
- State management tests
- Utility function tests
- Mock API responses for isolated testing
- Test coverage target: 70%

**Backend Unit Tests (JUnit 5)**
- Service layer business logic tests
- Repository query tests
- Validation logic tests
- Utility method tests
- Mock dependencies using Mockito
- Test coverage target: 80%

### Property-Based Testing

**Testing Framework**
- Frontend: fast-check (JavaScript/TypeScript property-based testing library)
- Backend: jqwik (Java property-based testing library)

**Property Test Configuration**
- Minimum 100 iterations per property test
- Each property test tagged with format: `**Feature: athlonx-complete-system, Property {number}: {property_text}**`
- Generators for domain objects (User, PTSession, StaffPerformance, etc.)
- Shrinking enabled to find minimal failing examples

**Property Test Implementation**

Property tests will be implemented for all 17 correctness properties:

1. **Property 1-3 (Data Completeness)**: Generate random domain objects and verify all required fields are present in serialized/rendered output
2. **Property 4 (Availability Validation)**: Generate random session schedules and verify conflicts are detected
3. **Property 5 (Sorting)**: Generate random session lists and verify chronological ordering
4. **Property 6 (Reminders)**: Generate random session dates and verify reminders for sessions within 24 hours
5. **Property 7 (Recurring Sessions)**: Generate random recurring configurations and verify correct number of sessions at correct intervals
6. **Property 8 (Session Limits)**: Generate random session assignments and verify daily limits are enforced
7. **Property 9 (Available Slots)**: Generate random trainer schedules and verify available slots exclude booked times
8. **Property 10 (Synchronization)**: Generate random session updates and verify data consistency across views
9. **Property 11 (Foreign Keys)**: Generate invalid IDs and verify database rejects them
10. **Property 12-13 (Package Management)**: Generate random package operations and verify business rules
11. **Property 14 (Theme Switching)**: Generate theme changes and verify UI updates
12. **Property 15-16 (Table Operations)**: Generate random data sets and verify sorting/filtering correctness
13. **Property 17 (Metrics)**: Generate random staff data and verify aggregation calculations

**Test Data Generators**

```typescript
// Frontend generators (fast-check)
const userArbitrary = fc.record({
  userId: fc.integer({ min: 1 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('ADMIN', 'TRAINER', 'MEMBER')
});

const ptSessionArbitrary = fc.record({
  sessionId: fc.integer({ min: 1 }),
  trainerId: fc.integer({ min: 1 }),
  memberId: fc.integer({ min: 1 }),
  sessionDate: fc.date(),
  durationMinutes: fc.integer({ min: 30, max: 120 }),
  status: fc.constantFrom('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED')
});
```

```java
// Backend generators (jqwik)
@Provide
Arbitrary<User> users() {
    return Combinators.combine(
        Arbitraries.integers().greaterOrEqual(1),
        Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(50),
        Arbitraries.emails()
    ).as((id, name, email) -> new User(id, name, email));
}

@Provide
Arbitrary<PTSession> ptSessions() {
    return Combinators.combine(
        users(),
        users(),
        Arbitraries.localDateTimes(),
        Arbitraries.integers().between(30, 120)
    ).as((trainer, member, date, duration) -> 
        new PTSession(trainer, member, date, duration));
}
```

### Integration Testing

**API Integration Tests**
- Test complete request-response cycles
- Verify controller-service-repository integration
- Use test database (H2 or Oracle test instance)
- Test authentication and authorization flows
- Verify error responses

**End-to-End Tests**
- Critical user flows (login, create session, view schedule)
- Cross-browser testing (Chrome, Firefox, Safari)
- Responsive design testing (mobile, tablet, desktop)
- Use Playwright or Cypress for automation

### Test Execution Strategy

**Development Phase**
- Run unit tests on every code change
- Run property tests before commits
- Fast feedback loop (< 30 seconds for unit tests)

**CI/CD Pipeline**
- Run all unit tests on pull requests
- Run property tests (100 iterations) on pull requests
- Run integration tests on merge to main
- Block merge if any tests fail

**Pre-Release**
- Run property tests with 1000 iterations
- Run full E2E test suite
- Performance testing
- Security scanning

### Test Organization

**Frontend Test Structure**
```
frontend/src/
  components/
    StaffPerformanceCard/
      StaffPerformanceCard.tsx
      StaffPerformanceCard.test.tsx
      StaffPerformanceCard.properties.test.tsx
  services/
    api.ts
    api.test.ts
  test/
    generators/
      userGenerators.ts
      sessionGenerators.ts
```

**Backend Test Structure**
```
backend/src/
  main/java/com/gym/management/
    service/
      PTSessionService.java
  test/java/com/gym/management/
    service/
      PTSessionServiceTest.java
      PTSessionServiceProperties.java
    generators/
      UserGenerator.java
      PTSessionGenerator.java
```

## Implementation Notes

### Phased Rollout

**Phase 1: Database and Backend Core**
- Create new database tables
- Implement domain models
- Implement repository layer
- Implement service layer
- Implement REST controllers
- Write unit tests for services

**Phase 2: PT Scheduling**
- Implement PT session CRUD
- Implement availability checking
- Implement recurring sessions
- Write property tests for scheduling logic
- Create frontend PT scheduling components
- Integrate with backend APIs

**Phase 3: Staff Performance**
- Implement staff performance tracking
- Implement attendance recording
- Implement shift management
- Create frontend staff performance components
- Write property tests for performance calculations

**Phase 4: Settings and Configuration**
- Implement gym settings management
- Implement membership packages
- Create frontend settings page
- Write property tests for configuration logic

**Phase 5: UI Enhancements**
- Implement enhanced data tables
- Implement theme switching
- Apply consistent styling across all pages
- Write property tests for UI components

**Phase 6: Testing and Polish**
- Complete all property-based tests
- Run integration tests
- Perform E2E testing
- Fix bugs and refine UX
- Performance optimization

### Migration Strategy

**Database Migration**
- Create migration scripts for new tables
- Run migrations in test environment first
- Backup production database before migration
- Run migrations during maintenance window
- Verify data integrity after migration

**Backward Compatibility**
- Existing features continue to work during rollout
- New features added incrementally
- No breaking changes to existing APIs
- Graceful degradation if new features unavailable

### Performance Considerations

**Database Optimization**
- Indexes on frequently queried columns
- Pagination for large result sets
- Lazy loading for related entities
- Connection pooling

**Frontend Optimization**
- Code splitting for route-based loading
- Lazy loading for heavy components
- Memoization for expensive calculations
- Virtual scrolling for large lists

**Caching Strategy**
- Cache gym settings (rarely change)
- Cache membership packages (rarely change)
- Invalidate cache on updates
- Use ETags for conditional requests
