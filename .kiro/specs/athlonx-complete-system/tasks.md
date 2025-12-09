# Implementation Plan - AthlonX Gym Management System

- [x] 1. Database schema setup and migrations



  - Create SQL migration scripts for all new tables (pt_sessions, staff_performance, staff_shifts, gym_settings, membership_packages, blackout_days)
  - Add indexes for performance optimization
  - Run migrations in development environment
  - Verify schema creation and constraints
  - _Requirements: 9.1, 9.2, 9.3, 9.5_





- [ ] 2. Backend domain models and enums
  - [ ] 2.1 Create PTSession entity with JPA annotations
    - Define entity fields, relationships, and constraints
    - Add SessionStatus enum (SCHEDULED, COMPLETED, MISSED, CANCELLED)


    - Add RecurringFrequency enum (WEEKLY, BIWEEKLY)
    - _Requirements: 6.2, 6.3, 7.2_



  - [ ] 2.2 Create StaffPerformance entity
    - Define entity fields and relationships
    - Add YearMonth handling for record_month


    - _Requirements: 1.1, 1.2, 1.4_



  - [ ] 2.3 Create StaffShift entity
    - Define entity fields and relationships




    - Add ShiftStatus enum (SCHEDULED, COMPLETED, MISSED)


    - _Requirements: 1.5_

  - [x] 2.4 Create GymSettings entity


    - Define entity fields for key-value configuration storage
    - _Requirements: 10.1, 10.2, 10.4_



  - [x] 2.5 Create MembershipPackage entity


    - Define entity fields for package management
    - _Requirements: 12.2_



  - [x] 2.6 Create BlackoutDay entity



    - Define entity fields for gym closure dates
    - _Requirements: 10.5_

- [ ] 3. Backend repository layer
  - [ ] 3.1 Create PTSessionRepository interface
    - Add custom query methods for finding sessions by trainer, member, and date range
    - Add method to find conflicting sessions for availability checking
    - _Requirements: 3.1, 4.1, 6.1_

  - [ ] 3.2 Create StaffPerformanceRepository interface
    - Add query methods for finding performance by staff and month
    - _Requirements: 1.1_

  - [ ] 3.3 Create StaffShiftRepository interface
    - Add query methods for finding shifts by staff and date range
    - _Requirements: 1.5_

  - [ ] 3.4 Create GymSettingsRepository interface
    - Add query methods for finding settings by key and type
    - _Requirements: 10.1_

  - [ ] 3.5 Create MembershipPackageRepository interface
    - Add query methods for finding active packages
    - _Requirements: 12.1_

  - [ ] 3.6 Create BlackoutDayRepository interface
    - Add query methods for finding blackout days by date range
    - _Requirements: 10.5_

- [x] 4. Backend DTOs and request/response objects


  - Create PTSessionDTO, StaffPerformanceDTO, StaffShiftDTO, GymSettingsDTO, MembershipPackageDTO
  - Add validation annotations (@NotNull, @Min, @Max, etc.)
  - _Requirements: 3.2, 4.2, 12.2_



- [ ] 5. Backend service layer - PT Session management
  - [ ] 5.1 Implement PTSessionService core CRUD operations
    - Implement createSession method with validation
    - Implement updateSession method
    - Implement cancelSession method
    - Implement getTrainerSessions and getMemberSessions methods
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 6.2_

  - [x] 5.2 Write property test for trainer availability validation


    - **Property 4: Trainer availability validation**
    - **Validates: Requirements 3.4**

  - [ ] 5.3 Implement session availability checking
    - Implement getAvailableSlots method
    - Check for conflicting sessions
    - Check against blackout days
    - Check against gym hours
    - _Requirements: 3.4, 6.5_


  - [ ] 5.4 Write property test for available slot calculation
    - **Property 9: Available slot calculation**
    - **Validates: Requirements 6.5**

  - [x] 5.5 Implement recurring session creation

    - Implement createRecurringSessions method
    - Generate sessions based on frequency (weekly/bi-weekly)
    - Validate each generated session
    - _Requirements: 6.3_

  - [ ] 5.6 Write property test for recurring session creation
    - **Property 7: Recurring session creation**
    - **Validates: Requirements 6.3**

  - [x] 5.7 Implement session completion and progress tracking


    - Implement markSessionComplete method
    - Add progress notes, workout plan, diet plan updates
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 5.8 Implement daily session limit enforcement


    - Add validation in createSession to check daily limits
    - Retrieve max sessions per day from settings
    - _Requirements: 6.4_

  - [ ] 5.9 Write property test for daily session limit enforcement


    - **Property 8: Daily session limit enforcement**
    - **Validates: Requirements 6.4**

- [ ] 6. Backend service layer - Staff performance management
  - [x] 6.1 Implement StaffPerformanceService


    - Implement getPerformanceMetrics method
    - Implement updateAttendance method
    - Implement calculateSatisfactionScore method
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 6.2 Write property test for performance metrics completeness
    - **Property 1: Performance metrics completeness**
    - **Validates: Requirements 1.2**

  - [ ] 6.3 Write property test for attendance data completeness
    - **Property 2: Attendance data completeness**
    - **Validates: Requirements 1.4**

  - [x] 6.4 Implement shift management


    - Implement getShifts method
    - Implement assignShift method
    - _Requirements: 1.5_

- [ ] 7. Backend service layer - Settings and configuration
  - [x] 7.1 Implement GymSettingsService


    - Implement getGymHours and updateGymHours methods
    - Implement getPTConfiguration and updatePTConfiguration methods
    - Implement getBlackoutDays and addBlackoutDay methods
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [x] 7.2 Implement MembershipPackageService


    - Implement getAllPackages and getActivePackages methods
    - Implement createPackage and updatePackage methods
    - Implement deletePackage with validation
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 7.3 Write property test for package deletion validation
    - **Property 12: Package deletion validation**
    - **Validates: Requirements 12.5**

  - [ ] 7.4 Write property test for package update isolation
    - **Property 13: Package update isolation**
    - **Validates: Requirements 12.4**

- [ ] 8. Backend REST controllers
  - [x] 8.1 Implement PTSessionController


    - Add POST /api/pt-sessions endpoint
    - Add PUT /api/pt-sessions/{id} endpoint
    - Add DELETE /api/pt-sessions/{id} endpoint
    - Add GET /api/pt-sessions/trainer/{trainerId} endpoint
    - Add GET /api/pt-sessions/member/{memberId} endpoint
    - Add GET /api/pt-sessions/available-slots endpoint
    - Add POST /api/pt-sessions/{id}/complete endpoint
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 6.2, 6.5, 7.2_

  - [x] 8.2 Implement StaffPerformanceController


    - Add GET /api/staff/{staffId}/performance endpoint
    - Add GET /api/staff/{staffId}/attendance endpoint
    - Add POST /api/staff/{staffId}/attendance endpoint
    - Add GET /api/staff/{staffId}/shifts endpoint
    - Add POST /api/staff/shifts endpoint
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 8.3 Implement GymSettingsController


    - Add GET /api/settings/gym-hours endpoint
    - Add PUT /api/settings/gym-hours endpoint
    - Add GET /api/settings/pt-config endpoint
    - Add PUT /api/settings/pt-config endpoint
    - Add GET /api/settings/blackout-days endpoint
    - Add POST /api/settings/blackout-days endpoint
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [x] 8.4 Implement MembershipPackageController



    - Add GET /api/packages endpoint
    - Add POST /api/packages endpoint
    - Add PUT /api/packages/{id} endpoint
    - Add DELETE /api/packages/{id} endpoint
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

  - [ ] 8.5 Write property test for foreign key constraint enforcement
    - **Property 11: Foreign key constraint enforcement**
    - **Validates: Requirements 9.3**

- [ ] 9. Checkpoint - Backend core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend TypeScript types and interfaces


  - Create PTSessionDTO, StaffPerformanceDTO, StaffShiftDTO, GymSettingsDTO, MembershipPackageDTO interfaces
  - Create SessionStatus, RecurringFrequency, ShiftStatus type unions
  - _Requirements: 3.2, 4.2, 6.2, 12.2_

- [ ] 11. Frontend API service layer
  - [x] 11.1 Add PT session API methods to api.ts


    - Add createPTSession, updatePTSession, cancelPTSession methods
    - Add getTrainerSessions, getMemberSessions methods
    - Add getAvailableSlots, markSessionComplete methods
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 6.2, 6.5, 7.2_

  - [x] 11.2 Add staff performance API methods

    - Add getStaffPerformance, getStaffAttendance, recordAttendance methods
    - Add getStaffShifts, assignShift methods
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 11.3 Add settings API methods

    - Add getGymHours, updateGymHours methods
    - Add getPTConfig, updatePTConfig methods
    - Add getBlackoutDays, addBlackoutDay methods
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

  - [x] 11.4 Add membership package API methods


    - Add getPackages, createPackage, updatePackage, deletePackage methods
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

- [ ] 12. Frontend reusable DataTable component
  - [x] 12.1 Create DataTable component with sorting and filtering


    - Implement column sorting (ascending/descending)
    - Implement per-column filters
    - Implement pagination
    - Add grid/list view toggle
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 15.1, 15.2, 15.3, 15.4_

  - [ ] 12.2 Write property test for table sorting correctness
    - **Property 15: Table sorting correctness**
    - **Validates: Requirements 2.2, 15.2**

  - [ ] 12.3 Write property test for filter application correctness
    - **Property 16: Filter application correctness**
    - **Validates: Requirements 2.4**

- [ ] 13. Frontend Staff page enhancements
  - [ ] 13.1 Update Staff page to use DataTable component
    - Replace existing table with DataTable
    - Add sorting and filtering capabilities
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 13.2 Add staff summary metrics display
    - Calculate and display total staff, active trainers, attendance rate
    - _Requirements: 2.5_

  - [ ] 13.3 Write property test for summary metrics calculation
    - **Property 17: Summary metrics calculation**
    - **Validates: Requirements 2.5**

  - [x] 13.4 Create StaffPerformanceCard component



    - Display sessions conducted, attendance rate, satisfaction score
    - Add visual indicators (progress bars, badges)
    - _Requirements: 1.1, 1.2_

  - [ ] 13.5 Write property test for session data completeness
    - **Property 3: Session data completeness**
    - **Validates: Requirements 3.2, 4.2, 8.3**

  - [ ] 13.6 Create StaffAttendanceTable component
    - Display monthly attendance with color coding
    - Show present/absent/late status
    - _Requirements: 1.4_

  - [ ] 13.7 Create ShiftAllocationList component
    - Display assigned shifts with date and times
    - _Requirements: 1.5_

- [ ] 14. Frontend PT Scheduling components
  - [ ] 14.1 Create PTScheduleCalendar component
    - Implement calendar view (day/week/month)
    - Highlight available and booked slots
    - Handle slot click events
    - _Requirements: 6.1_

  - [ ] 14.2 Create SessionBookingModal component
    - Add form for creating/editing PT sessions
    - Add member selection, date/time picker, duration input
    - Add recurring session options (weekly/bi-weekly)
    - _Requirements: 6.2, 6.3_

  - [ ] 14.3 Create SessionDetailModal component
    - Display session information
    - Allow marking attendance and adding progress notes
    - Add fields for workout plan and diet plan updates
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ] 14.4 Create UpcomingSessionsList component
    - Display next N sessions with countdown timers
    - Highlight sessions within 24 hours
    - Sort sessions chronologically
    - _Requirements: 4.1, 4.4, 5.1, 5.2_

  - [ ] 14.5 Write property test for session sorting by date
    - **Property 5: Session sorting by date**
    - **Validates: Requirements 5.2**

  - [ ] 14.6 Write property test for reminder generation
    - **Property 6: Reminder generation for upcoming sessions**
    - **Validates: Requirements 5.1**

- [ ] 15. Frontend Members page enhancements
  - [ ] 15.1 Update Members page to display PT schedules
    - Show each member's upcoming and past PT sessions
    - Display session details (date, time, trainer, status)
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 15.2 Add session detail view for members
    - Display progress notes from trainer
    - Show workout and diet plans
    - _Requirements: 4.3_

  - [ ] 15.3 Write property test for data ssynchronization
    - **Property 10: Data synchronization between views**
    - **Validates: Requirements 7.5, 8.1**

- [ ] 16. Frontend Settings page implementation
  - [ ] 16.1 Create SettingsTabs component
    - Implement tab navigation (Gym Hours, PT Config, Packages, Theme)
    - _Requirements: 11.1, 11.2_

  - [ ] 16.2 Create GymHoursConfig component
    - Add day-by-day time pickers for gym hours
    - Add blackout day management
    - _Requirements: 10.1, 10.2, 10.5_

  - [ ] 16.3 Create PTSessionConfig component
    - Add inputs for default session duration
    - Add input for max sessions per day per trainer
    - _Requirements: 10.4_

  - [ ] 16.4 Create MembershipPackageManager component
    - Display packages in table format
    - Add create/edit/delete functionality
    - Add form fields for package parameters
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 16.5 Create ThemeSelector component
    - Add light/dark mode toggle
    - Persist theme preference to localStorage
    - Apply theme immediately without reload
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ]* 16.6 Write property test for theme switching
    - **Property 14: Theme switching without reload**
    - **Validates: Requirements 14.3**

- [ ] 17. Global UI consistency improvements
  - [ ] 17.1 Update all pages to use AthlonX brand colors
    - Apply consistent color scheme across Dashboard, Staff, Members, Settings
    - _Requirements: 13.2_

  - [ ] 17.2 Replace emoji icons with professional SVG icons
    - Use Lucide React icons throughout the application
    - _Requirements: 11.4, 13.3_

  - [ ] 17.3 Apply consistent spacing and styling
    - Standardize card layouts, shadows, and elevation
    - Ensure consistent button styles and hover states
    - _Requirements: 13.4, 13.5_

  - [ ] 17.4 Ensure consistent header and navigation
    - Maintain same header/nav across all pages
    - _Requirements: 13.1_

- [ ] 18. Checkpoint - Frontend core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Integration and end-to-end testing
  - [ ]* 19.1 Write integration tests for PT session workflows
    - Test complete flow: create session → view in trainer schedule → view in member schedule → mark complete
    - _Requirements: 3.1, 4.1, 6.2, 7.2_

  - [ ]* 19.2 Write integration tests for staff performance workflows
    - Test complete flow: record attendance → calculate metrics → display on staff page
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 19.3 Write integration tests for settings workflows
    - Test complete flow: update gym hours → verify availability calculation uses new hours
    - _Requirements: 10.1, 10.2, 6.5_

- [ ] 20. Final checkpoint - All tests passing
  - Ensure all tests pass, ask the user if questions arise.
