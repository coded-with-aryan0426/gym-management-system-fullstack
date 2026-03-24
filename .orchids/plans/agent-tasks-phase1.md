# Phase 1 Development Agent Tasks
## Beta Testing System Improvements

> **Instructions**: Each agent should follow ONLY their assigned tasks. Read the beta-testing-plan.md for complete context. All code must integrate with existing codebase structure.

---

## Agent 1: Backend - Feature Toggle System

### Task Overview
Implement the global feature toggle system that allows enabling/disabling features without redeployment.

### Files to Create/Modify
- `backend/src/main/java/com/gym/model/FeatureFlag.java` (NEW)
- `backend/src/main/java/com/gym/repository/FeatureFlagRepository.java` (NEW)
- `backend/src/main/java/com/gym/service/FeatureFlagService.java` (NEW)
- `backend/src/main/java/com/gym/controller/FeatureFlagController.java` (NEW)
- `backend/src/main/java/com/gym/dto/FeatureFlagDTO.java` (NEW)
- `backend/src/main/java/com/gym/dto/UpdateFeatureFlagRequest.java` (NEW)
- `backend/src/main/resources/application.properties` (MODIFY - add feature flag configs)
- `backend/src/main/resources/db/migration/V__add_feature_flags.sql` (NEW - Flyway migration)

### Agent Prompt

```
You are Backend Agent 1 responsible for implementing the Feature Toggle System.

## YOUR TASKS

1. **Create FeatureFlag Entity** (`model/FeatureFlag.java`)
   - Fields: id (Long, auto-generated), featureKey (String, unique, not null), enabled (Boolean, not null), description (String), allowedRoles (String - comma-separated), updatedAt (LocalDateTime)
   - Use JPA annotations (@Entity, @Table, @Id, @GeneratedValue, @Column)
   - Add @PrePersist to set updatedAt

2. **Create FeatureFlagRepository** (`repository/FeatureFlagRepository.java`)
   - extends JpaRepository<FeatureFlag, Long>
   - Add method: Optional<FeatureFlag> findByFeatureKey(String featureKey)

3. **Create DTOs**
   - `FeatureFlagDTO.java`: id, featureKey, enabled, description, allowedRoles, updatedAt
   - `UpdateFeatureFlagRequest.java`: enabled (Boolean), description (String), allowedRoles (String)

4. **Create FeatureFlagService** (`service/FeatureFlagService.java`)
   - getByKey(String featureKey): Get single flag by key
   - getAllFlagsForUser(UserDetails user): Get all flags user has access to (check allowedRoles)
   - isAllowedForUser(FeatureFlag flag, UserDetails user): Check if user's role is in allowedRoles
   - update(String featureKey, UpdateFeatureFlagRequest request): Update flag settings
   - Method to seed default flags on startup if not exist

5. **Create FeatureFlagController** (`controller/FeatureFlagController.java`)
   - GET /api/features/{featureKey} - Get single flag (authenticated users)
   - PUT /api/features/{featureKey} - Update flag (ADMIN only, use @PreAuthorize)
   - GET /api/features/all - Get all flags user has access to
   - All endpoints return FeatureFlagDTO

6. **Create Database Migration** (`resources/db/migration/V__add_feature_flags.sql`)
   - Create feature_flags table matching the entity
   - Insert seed data:
     * feedback_widget | false | Global feedback widget toggle | ADMIN,OWNER,TRAINER,MEMBER
     * beta_mode | false | Enable beta-specific features | ADMIN,OWNER
     * new_ui | false | New UI/UX improvements | ADMIN
     * debug_mode | false | Developer debug information | ADMIN

7. **Update application.properties**
   - Add any necessary configuration for feature flag system

## IMPORTANT RULES
- Follow existing codebase patterns (package structure, naming, imports)
- Use proper Java 21 syntax
- All endpoints should be JWT-protected
- Controller should use @RestController, proper @RequestMapping
- Service should have @Service annotation
- Return proper HTTP status codes (200, 400, 403, 404)
- No hardcoded values - use application.properties
- Write production-ready code with proper error handling

## VERIFICATION
- All endpoints should be testable via curl or Postman
- Feature flags should persist across app restarts
- Non-admin users should only see flags they have access to
```

---

## Agent 2: Backend - Feedback System

### Task Overview
Implement the backend for the beta feedback system that collects, stores, and retrieves feedback from testers.

### Files to Create/Modify
- `backend/src/main/java/com/gym/model/BetaFeedback.java` (NEW)
- `backend/src/main/java/com/gym/repository/BetaFeedbackRepository.java` (NEW)
- `backend/src/main/java/com/gym/service/BetaFeedbackService.java` (NEW)
- `backend/src/main/java/com/gym/controller/BetaFeedbackController.java` (NEW)
- `backend/src/main/java/com/gym/dto/BetaFeedbackDTO.java` (NEW)
- `backend/src/main/java/com/gym/dto/UpdateFeedbackStatusRequest.java` (NEW)
- `backend/src/main/java/com/gym/dto/FeedbackStatsDTO.java` (NEW)
- `backend/src/main/resources/db/migration/V__add_beta_feedback.sql` (NEW)

### Agent Prompt

```
You are Backend Agent 2 responsible for implementing the Beta Feedback System Backend.

## YOUR TASKS

1. **Create BetaFeedback Entity** (`model/BetaFeedback.java`)
   - Fields:
     * id (Long, auto-generated, primary key)
     * userId (Long) - tester user ID
     * testerName (String)
     * testerEmail (String)
     * testerRole (String) - OWNER, TRAINER, MEMBER
     * pageRoute (String, max 500) - URL path like "/trainer/members"
     * pageTitle (String, max 255) - Human-readable page name
     * section (String, max 255) - Specific section within page
     * browser (String, max 255) - User agent string
     * screenSize (String, max 50) - e.g., "1440x900"
     * severity (String) - BUG, UI_ISSUE, SUGGESTION, IMPROVEMENT, QUESTION
     * category (String) - UI, PERFORMANCE, LOGIC, FEATURE, SECURITY, DATA
     * subject (String, max 500)
     * description (String, CLOB/Text)
     * stepsToReproduce (String, CLOB/Text)
     * screenshotUrl (String, max 1000)
     * status (String, default 'NEW') - NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, WONT_FIX
     * adminNotes (String, CLOB/Text)
     * priorityScore (Integer, default 0) - 0-10
     * submittedAt (LocalDateTime, auto-generated)
     * resolvedAt (LocalDateTime, nullable)
     * sessionId (String, max 100)
     * betaVersion (String, default '1.0')
   - Use JPA annotations
   - Add proper column constraints

2. **Create BetaFeedbackRepository** (`repository/BetaFeedbackRepository.java`)
   - extends JpaRepository<BetaFeedback, Long>
   - Add custom queries:
     * List<BetaFeedback> findByStatus(String status)
     * List<BetaFeedback> findByPageRouteContaining(String pageRoute)
     * List<BetaFeedback> findByTesterEmail(String email)
     * List<BetaFeedback> findBySeverity(String severity)
     * @Query for stats: count by severity, count by status
     * List<BetaFeedback> findBySubmittedAtBetween(LocalDateTime start, LocalDateTime end)

3. **Create DTOs**
   - `BetaFeedbackDTO.java`: All fields for API responses
   - `UpdateFeedbackStatusRequest.java`: status (String), adminNotes (String), priorityScore (Integer)
   - `FeedbackStatsDTO.java`: totalCount, bugCount, uiIssueCount, suggestionCount, improvementCount, questionCount, openCount, resolvedCount, byPage (Map<String, Long>), byCategory (Map<String, Long>)

4. **Create BetaFeedbackService** (`service/BetaFeedbackService.java`)
   - submitFeedback(BetaFeedbackDTO dto): Save new feedback
   - getAllFeedback(): Get all feedback (for SuperAdmin)
   - getFeedbackById(Long id): Get single feedback
   - updateStatus(Long id, UpdateFeedbackStatusRequest request): Update status, notes, priority
   - getStats(): Get aggregated statistics
   - getFeedbackByFilters(Map<String, Object> filters): Filter by page, severity, status, tester, date range
   - exportToCSV(List<BetaFeedback> feedback): Generate CSV string

5. **Create BetaFeedbackController** (`controller/BetaFeedbackController.java`)
   - POST /api/beta/feedback - Submit feedback (any authenticated user)
   - GET /api/beta/feedback - List all feedback with pagination (SuperAdmin only)
   - GET /api/beta/feedback/{id} - Get single item (SuperAdmin only)
   - PATCH /api/beta/feedback/{id}/status - Update status (SuperAdmin only)
   - GET /api/beta/feedback/export - Export to CSV (SuperAdmin only)
   - GET /api/beta/feedback/stats - Get aggregated stats (SuperAdmin only)
   - All SuperAdmin endpoints use @PreAuthorize("hasRole('ADMIN')")
   - POST endpoint should accept BetaFeedbackDTO and save feedback

6. **Create Database Migration** (`resources/db/migration/V__add_beta_feedback.sql`)
   - Create beta_feedback table matching the entity
   - Add indexes on: page_route, status, severity, submitted_at, tester_email

## IMPORTANT RULES
- Follow existing codebase patterns
- Use proper Java 21 syntax with records where appropriate
- All endpoints should be JWT-protected
- POST endpoint accepts feedback from ANY authenticated user (not just admin)
- GET/PATCH endpoints are ADMIN only
- Use @Valid for request body validation
- Return proper HTTP status codes
- CSV export should include all fields in proper format
- Write production-ready code with proper error handling
- Controller advice for consistent error responses
```

---

## Agent 3: Frontend - Feature Toggle UI

### Task Overview
Implement the frontend feature toggle UI with provider, hook, and SuperAdmin management page.

### Files to Create/Modify
- `frontend/src/contexts/FeatureContext.tsx` (NEW)
- `frontend/src/hooks/useFeature.ts` (NEW)
- `frontend/src/pages/superadmin/SAFeatures.tsx` (NEW)
- `frontend/src/components/superadmin/FeatureToggle.tsx` (NEW - reusable toggle component)
- `frontend/src/services/api.ts` (MODIFY - add feature endpoints)
- `frontend/src/App.tsx` (MODIFY - add FeatureProvider wrapper)
- `frontend/src/types/feature.types.ts` (NEW)

### Agent Prompt

```
You are Frontend Agent 1 responsible for implementing the Feature Toggle UI System.

## YOUR TASKS

1. **Create Feature Types** (`types/feature.types.ts`)
   - FeatureFlag: { id, featureKey, enabled, description, allowedRoles, updatedAt }
   - UpdateFeatureRequest: { enabled?, description?, allowedRoles? }

2. **Create FeatureContext** (`contexts/FeatureContext.tsx`)
   - React Context for feature flags
   - State: features (Record<string, boolean>), isLoading, error
   - Provider value: { features, isLoading, error, refetchFeatures }
   - Fetch features on mount from GET /api/features/all
   - Store in localStorage as 'features' cache
   - Poll every 5 minutes for updates (setInterval)
   - On app load, load cached features immediately, then fetch fresh
   - Error handling: if fetch fails, use cached values

3. **Create useFeature Hook** (`hooks/useFeature.ts`)
   - Custom hook: useFeature(featureKey: string): boolean
   - Returns features[featureKey] ?? false
   - Use useContext(FeatureContext)
   - Export from context barrel export

4. **Create FeatureToggle Component** (`components/superadmin/FeatureToggle.tsx`)
   - Props: feature: FeatureFlag, onToggle: (key: string, enabled: boolean) => void, isUpdating: boolean
   - Display: feature name, description, allowed roles
   - Badge showing ENABLED (green) / DISABLED (gray)
   - Switch component to toggle
   - Loading spinner when updating
   - Use existing UI component patterns from codebase

5. **Create SAFeatures Page** (`pages/superadmin/SAFeatures.tsx`)
   - Page for managing all feature flags
   - Fetch all features on mount
   - Display in table/list format
   - Each row: Feature key, Description, Status badge, Allowed roles, Toggle switch
   - Toggle calls PUT /api/features/{featureKey} with { enabled: boolean }
   - Show toast on success/error
   - Loading state while fetching
   - Error state if fetch fails
   - Page title: "Feature Toggles"
   - Add to superadmin routes in App.tsx

6. **Update API Service** (`services/api.ts`)
   - Add feature-related API calls:
     * getAllFeatures(): GET /api/features/all
     * getFeature(key: string): GET /api/features/{key}
     * updateFeature(key: string, data: UpdateFeatureRequest): PUT /api/features/{key}

7. **Update App.tsx**
   - Wrap app with FeatureProvider (at top level, after AuthProvider)
   - Add route for /superadmin/features

## IMPORTANT RULES
- Follow existing React/TypeScript patterns in codebase
- Use functional components with hooks
- TypeScript with proper types (no 'any' without reason)
- Use existing UI components (Button, Switch, Toast, etc.) from codebase
- CSS: Use existing styling approach (CSS modules or styled-components as per codebase)
- FeatureProvider should NOT cause hydration errors
- All API calls should include JWT token in headers
- Handle loading and error states properly
- Make it look consistent with existing SuperAdmin pages
```

---

## Agent 4: Frontend - Feedback Widget Component

### Task Overview
Implement the floating feedback widget that testers use to submit feedback on any page.

### Files to Create/Modify
- `frontend/src/components/feedback/FeedbackWidget.tsx` (NEW)
- `frontend/src/components/feedback/FeedbackButton.tsx` (NEW)
- `frontend/src/components/feedback/FeedbackModal.tsx` (NEW)
- `frontend/src/components/feedback/FeedbackForm.tsx` (NEW)
- `frontend/src/components/feedback/ValidationIcon.tsx` (NEW - reuse if exists)
- `frontend/src/types/feedback.types.ts` (NEW)
- `frontend/src/services/api.ts` (MODIFY - add feedback endpoints)
- `frontend/src/App.tsx` (MODIFY - add widget to all routes)
- `frontend/src/utils/feedback.utils.ts` (NEW - helpers)

### Agent Prompt

```
You are Frontend Agent 2 responsible for implementing the Feedback Widget Component.

## YOUR TASKS

1. **Create Feedback Types** (`types/feedback.types.ts`)
   - Severity: 'BUG' | 'UI_ISSUE' | 'SUGGESTION' | 'IMPROVEMENT' | 'QUESTION'
   - Category: 'UI' | 'PERFORMANCE' | 'LOGIC' | 'FEATURE' | 'SECURITY' | 'DATA'
   - Status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'WONT_FIX'
   - FeedbackPayload: { pageRoute, pageTitle, section, browser, screenSize, severity, category, subject, description, stepsToReproduce, screenshotUrl }
   - BetaFeedback: extends FeedbackPayload + { id, userId, testerName, testerEmail, testerRole, status, priorityScore, adminNotes, submittedAt, sessionId }

2. **Create FeedbackButton Component** (`components/feedback/FeedbackButton.tsx`)
   - Floating button: bottom-right corner, fixed position
   - z-index: 9999
   - Style: circular or pill-shaped, primary color
   - Icon: chat bubble or feedback icon
   - Size: 48x48px minimum for touch target
   - Shadow and hover effects
   - On click: open modal
   - Show badge/indicator if there are pending unsent feedback

3. **Create FeedbackForm Component** (`components/feedback/FeedbackForm.tsx`)
   - Auto-filled fields (read-only display):
     * Page: {pageRoute}
     * Section: {section}
     * Browser: {browser}
     * Screen: {screenSize}
   - Manual input fields:
     * Severity (chip/radio buttons): BUG, UI ISSUE, SUGGESTION, IMPROVEMENT, QUESTION
     * Category (dropdown): UI, PERFORMANCE, LOGIC, FEATURE, SECURITY, DATA
     * Subject (text input, max 200 chars, required)
     * Description (textarea, max 2000 chars, required)
     * Steps to Reproduce (textarea, shown only when severity=BUG)
     * Screenshot (optional file upload or html2canvas capture)
   - Submit button: "Submit Feedback"
   - Cancel button: "Cancel"
   - Validation: subject and description required

4. **Create FeedbackModal Component** (`components/feedback/FeedbackModal.tsx`)
   - Modal overlay with centered content
   - Close button (X) top-right
   - Title: "Submit Feedback"
   - Contains FeedbackForm
   - On successful submit: show success toast, close modal
   - On error: show error toast, keep form data
   - Close on: X button, click outside, Escape key
   - Accessibility: focus trap, aria-modal, proper labeling

5. **Create FeedbackWidget Main Component** (`components/feedback/FeedbackWidget.tsx`)
   - Use useFeature('feedback_widget') to check if enabled
   - If NOT enabled: return null (don't render)
   - If enabled: render FeedbackButton
   - On button click: open FeedbackModal
   - Auto-capture context:
     * window.location.pathname → pageRoute
     * document.title → pageTitle
     * navigator.userAgent → browser
     * ${window.screen.width}x${window.screen.height} → screenSize
     * sessionId from localStorage (generate if not exists)
     * User info from JWT token (decode token)

6. **Implement localStorage Write-Ahead Log**
   - On submit: save to localStorage first with key `feedback_pending_{timestamp}`
   - Then POST to backend
   - On success: remove from localStorage
   - On failure: keep in localStorage, show "Saved locally - will retry" toast
   - On app load: retry any pending feedback (check for keys starting with `feedback_pending_`)

7. **Create Feedback Utils** (`utils/feedback.utils.ts`)
   - generateSessionId(): Generate UUID and store in localStorage
   - getPendingFeedback(): Get all pending feedback from localStorage
   - clearPendingFeedback(key: string): Remove from localStorage
   - captureScreenshot(element?: HTMLElement): Use html2canvas or return null

8. **Update API Service** (`services/api.ts`)
   - addFeedback(payload: FeedbackPayload): POST /api/beta/feedback
   - getAllFeedback(params?): GET /api/beta/feedback (with query params)
   - getFeedbackById(id): GET /api/beta/feedback/{id}
   - updateFeedbackStatus(id, data): PATCH /api/beta/feedback/{id}/status
   - getFeedbackStats(): GET /api/beta/feedback/stats
   - exportFeedback(filters?): GET /api/beta/feedback/export

9. **Update App.tsx**
   - Import and add FeedbackWidget to root level
   - Should appear on ALL routes (put outside Routes, at App level)
   - Only renders if feature toggle enabled

## IMPORTANT RULES
- Follow existing React/TypeScript patterns
- Use TypeScript with proper types
- Widget should be lightweight and not impact app performance
- localStorage WAL prevents feedback loss
- Auto-capture as much context as possible (reduces tester effort)
- Make sure screenshot capture handles errors gracefully
- All API calls include JWT token
- Show clear feedback submission states (loading, success, error)
- Toast notifications for user feedback
- Accessibility: keyboard navigable, screen reader friendly
- Widget should not interfere with app functionality (proper z-index stacking)
```

---

## Agent 5: Frontend - SuperAdmin Feedback Dashboard

### Task Overview
Build the comprehensive SuperAdmin dashboard for viewing, managing, and analyzing all beta feedback.

### Files to Create/Modify
- `frontend/src/pages/superadmin/SABetaFeedback.tsx` (NEW - main dashboard)
- `frontend/src/pages/superadmin/SABetaInsights.tsx` (NEW - analytics view)
- `frontend/src/components/superadmin/FeedbackTable.tsx` (NEW)
- `frontend/src/components/superadmin/FeedbackDetailDrawer.tsx` (NEW)
- `frontend/src/components/superadmin/FeedbackStats.tsx` (NEW)
- `frontend/src/components/superadmin/FeedbackFilters.tsx` (NEW)
- `frontend/src/types/feedback.types.ts` (MODIFY - add any missing types)
- `frontend/src/pages/superadmin/SAInsights.tsx` (NEW - optional page for page-wise breakdown)

### Agent Prompt

```
You are Frontend Agent 3 responsible for building the SuperAdmin Feedback Dashboard.

## YOUR TASKS

1. **Create SAInsights Page** (`pages/superadmin/SAInsights.tsx`)
   This page shows page-by-page breakdown of feedback.

   **Overview Section:**
   - Stats cards: Total Feedback, Open Issues, Resolved, Bugs
   - Quick view of most problematic pages

   **Page Breakdown Table:**
   - Columns: Page Route, Total Issues, Bugs, UI Issues, Suggestions, Health Score
   - Health Score: 100 - (bugs*5 + uiIssues*3 + suggestions*1), min 0
   - Sort by: Most Issues, Most Bugs, Lowest Health Score
   - Click row → Navigate to SABetaFeedback with page filter applied

   **Visual Heatmap (bonus):**
   - If you have many pages, show as colored grid
   - Red = high issues, Yellow = medium, Green = good

2. **Create SABetaFeedback Page** (`pages/superadmin/SABetaFeedback.tsx`)
   Main feedback management page with filtering and bulk actions.

   **Layout:**
   - Header: "Beta Feedback" title, Export CSV button, Refresh button
   - Stats bar: Total, By Severity (chips), By Status (chips)
   - Filter bar: Search, Severity dropdown, Category dropdown, Status dropdown, Page dropdown, Tester dropdown, Date range
   - Feedback table
   - Pagination (if many results)

   **Feedback Table Columns:**
   - ID, Tester Name, Role, Page, Section, Severity (chip), Category, Subject (truncated), Status, Submitted, Priority, Actions
   - Row click → Open detail drawer
   - Actions: Quick status change buttons

3. **Create FeedbackStats Component** (`components/superadmin/FeedbackStats.tsx`)
   - Fetch stats from GET /api/beta/feedback/stats
   - Display as stat cards or chips
   - Colors: Bugs=red, UI Issues=orange, Suggestions=blue, Improvements=green, Questions=gray
   - Click to filter by that type

4. **Create FeedbackFilters Component** (`components/superadmin/FeedbackFilters.tsx`)
   - Search by subject (text input)
   - Filter by: severity (multi-select), category (dropdown), status (dropdown), page (dropdown from unique pages), tester (dropdown), date range (two date pickers)
   - "Clear Filters" button
   - Filter changes update the table URL params for shareability

5. **Create FeedbackTable Component** (`components/superadmin/FeedbackTable.tsx`)
   - Reusable table for feedback list
   - Props: feedback[], isLoading, onRowClick, pagination
   - Columns as defined above
   - Severity chips with colors:
     * BUG: red background
     * UI_ISSUE: orange
     * SUGGESTION: blue
     * IMPROVEMENT: green
     * QUESTION: gray
   - Status badges:
     * NEW: blue
     * ACKNOWLEDGED: yellow
     * IN_PROGRESS: purple
     * RESOLVED: green
     * WONT_FIX: gray
   - Loading skeleton rows
   - Empty state: "No feedback found"

6. **Create FeedbackDetailDrawer Component** (`components/superadmin/FeedbackDetailDrawer.tsx`)
   - Slide-in drawer from right side
   - Shows full feedback details:
     * All captured info (page, browser, screen size, session)
     * Full subject and description
     * Steps to reproduce (if provided)
     * Screenshot preview (if provided)
     * Tester info
     * Submission timestamp
   - Edit section:
     * Status dropdown (NEW → ACKNOWLEDGED → IN_PROGRESS → RESOLVED)
     * Priority score input (0-10)
     * Admin notes textarea
     * "Save Changes" button
   - Action buttons:
     * "Mark as Resolved"
     * "Export This Item"
     * "Create Issue" (placeholder for future ticket integration)

7. **Add Routes to App.tsx**
   - /superadmin/feedback → SABetaFeedback
   - /superadmin/beta-insights → SAInsights

## IMPORTANT RULES
- Follow existing SuperAdmin page patterns in your codebase
- Use existing UI components (tables, buttons, modals, drawers)
- TypeScript with proper types
- Dashboard should be data-rich but not overwhelming
- Default sort: Most recent first
- Pagination for large datasets (20 items per page)
- All API calls include JWT token
- Show loading states for async operations
- Toast notifications for actions
- Export should trigger CSV download
- Responsive design for tablet/laptop viewing
- Chart libraries: Use existing ones in your codebase (Recharts, Chart.js, etc.)
```

---

## Agent 6: DevOps - Infrastructure Setup

### Task Overview
Set up database migrations, backend configurations, and prepare the infrastructure for Phase 1.

### Files to Create/Modify
- `backend/src/main/resources/db/migration/V__add_feature_flags.sql` (NEW)
- `backend/src/main/resources/db/migration/V__add_beta_feedback.sql` (NEW)
- `backend/src/main/resources/application-beta.properties` (NEW)
- `backend/src/main/resources/application-staging.properties` (NEW)
- `backend/src/main/java/com/gym/config/CorsConfig.java` (MODIFY - add tunnel URLs)
- `backend/src/main/java/com/gym/config/SecurityConfig.java` (MODIFY - add feature endpoints)
- `backend/src/main/java/com/gym/exception/GlobalExceptionHandler.java` (MODIFY - add feedback errors)
- Create deployment documentation

### Agent Prompt

```
You are DevOps Agent responsible for Infrastructure Setup.

## YOUR TASKS

1. **Create Database Migrations** (using Flyway)

   **V__add_feature_flags.sql:**
   ```sql
   CREATE TABLE feature_flags (
       id BIGINT AUTO_INCREMENT PRIMARY KEY,
       feature_key VARCHAR(100) UNIQUE NOT NULL,
       enabled BOOLEAN NOT NULL DEFAULT FALSE,
       description VARCHAR(500),
       allowed_roles VARCHAR(255),
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   INSERT INTO feature_flags (feature_key, enabled, description, allowed_roles) VALUES
   ('feedback_widget', FALSE, 'Global feedback widget toggle', 'ADMIN,OWNER,TRAINER,MEMBER'),
   ('beta_mode', FALSE, 'Enable beta-specific features', 'ADMIN,OWNER'),
   ('new_ui', FALSE, 'New UI/UX improvements', 'ADMIN'),
   ('debug_mode', FALSE, 'Developer debug information', 'ADMIN');
   ```

   **V__add_beta_feedback.sql:**
   ```sql
   CREATE TABLE beta_feedback (
       id BIGINT AUTO_INCREMENT PRIMARY KEY,
       user_id BIGINT,
       tester_name VARCHAR(255),
       tester_email VARCHAR(255),
       tester_role VARCHAR(50),
       page_route VARCHAR(500),
       page_title VARCHAR(255),
       section VARCHAR(255),
       browser VARCHAR(255),
       screen_size VARCHAR(50),
       severity VARCHAR(20),
       category VARCHAR(50),
       subject VARCHAR(500),
       description TEXT,
       steps_to_reproduce TEXT,
       screenshot_url VARCHAR(1000),
       status VARCHAR(20) DEFAULT 'NEW',
       admin_notes TEXT,
       priority_score INT DEFAULT 0,
       submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       resolved_at TIMESTAMP NULL,
       session_id VARCHAR(100),
       beta_version VARCHAR(20) DEFAULT '1.0'
   );

   CREATE INDEX idx_feedback_page ON beta_feedback(page_route);
   CREATE INDEX idx_feedback_status ON beta_feedback(status);
   CREATE INDEX idx_feedback_severity ON beta_feedback(severity);
   CREATE INDEX idx_feedback_submitted ON beta_feedback(submitted_at);
   CREATE INDEX idx_feedback_email ON beta_feedback(tester_email);
   ```

2. **Create application-beta.properties**
   - Copy from existing application.properties
   - Override: jwt.expiration=28800000 (8 hours)
   - Add: spring.jpa.hibernate.ddl-auto=validate
   - Database URL pointing to gym_beta schema

3. **Create application-staging.properties**
   - For staging environment
   - Similar to beta but with staging DB
   - Debug logging enabled

4. **Update CORS Configuration**
   - In WebMvcConfigurer or @CrossOrigin
   - Add to allowedOriginPatterns:
     * "http://localhost:*"
     * "https://*.trycloudflare.com"
     * "https://*.vercel.app"
     * "https://*.railway.app"
     * "https://*.up.railway.app"
   - Use setAllowedOriginPatterns (NOT setAllowedOrigins)

5. **Update Security Config**
   - Add /api/features/** to permitAll() or authenticated()
   - Add /api/beta/feedback POST to permitAll (authenticated users only)
   - Add /api/beta/feedback GET, PATCH to ADMIN only
   - Ensure OPTIONS requests are allowed for CORS preflight

6. **Update GlobalExceptionHandler**
   - Add handler for OptimisticLockException (return 409 with message)
   - Add handler for MethodArgumentNotValidException (return 400 with errors)
   - Add handler for AccessDeniedException (return 403)

7. **Create README.md in backend** with:
   - How to run with different profiles (./mvnw spring-boot:run -Dspring-boot.run.profiles=beta)
   - Database migration instructions
   - Required environment variables

## IMPORTANT RULES
- Follow existing Spring Boot configuration patterns
- Use Flyway for migrations (if currently using) or create SQL scripts
- All secrets should be in environment variables, not hardcoded
- CORS config must be correct or frontend won't work with tunnels
- Security config must allow feature flag checks without breaking auth
- Provide clear documentation for other agents
```

---

## Phase 1 Development Order

```
Week 1: Foundation
├── Day 1-2: Agent 6 (DevOps) - Infrastructure & Migrations
├── Day 1-2: Agent 1 (Backend) - Feature Toggle System
├── Day 3-4: Agent 2 (Backend) - Feedback System Backend
├── Day 3-4: Agent 3 (Frontend) - Feature Toggle UI
├── Day 5-6: Agent 4 (Frontend) - Feedback Widget
└── Day 5-6: Agent 5 (Frontend) - SuperAdmin Dashboard

Week 2: Integration & Testing
├── Integration Testing
├── Fix bugs from integration
├── Alpha testing (internal)
└── Prepare for Private Beta
```

---

## Communication Protocol

1. **Daily Standup**: Each agent reports progress in #dev-standup channel
2. **Blocking Issues**: Post immediately to #dev-help with @mention
3. **Completion**: Each agent marks their task as done and posts summary
4. **Integration**: Agent 5 (Frontend Dashboard) waits for Agent 2 (Backend) API completion

---

## Quality Standards

All agents must:
- ✅ Write production-ready code (no TODO comments in final code)
- ✅ Follow existing codebase patterns and conventions
- ✅ Use proper TypeScript/Java types (no 'any' or raw types)
- ✅ Handle errors gracefully with proper error messages
- ✅ Include JSDoc/JavaDoc comments for complex logic
- ✅ Test their code manually before marking complete
- ✅ Update Postman/curl collection with test requests
- ✅ Report any blockers immediately
