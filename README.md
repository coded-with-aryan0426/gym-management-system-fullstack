# AthlonX Gym Management System

A modern, full-stack gym management application built with React + TypeScript frontend and Spring Boot + Oracle backend.

---

## 📁 Project Structure

```
Version 1/
├── 📄 .env                          # Environment variables
├── � README.md                     # This documentation
├── �📁 backend/                      # Spring Boot Backend
├── 📁 database/                     # SQL Scripts
└── 📁 frontend/                     # React Frontend
```

---

## 🔧 Backend (`/backend`)

Spring Boot REST API with JPA/Hibernate and Oracle Database.

```
backend/
├── 📄 pom.xml                       # Maven dependencies
└── 📁 src/main/java/com/gym/management/
    │
    ├── � GymManagementApplication.java  # Main application entry
    │
    ├── �📁 config/                   # Application Configuration
    │   └── DataInitializer.java     # Seeds initial data (roles, users, sessions)
    │
    ├── 📁 controller/               # REST API Controllers
    │   ├── GymSettingsController.java     # GET/PUT /api/settings
    │   ├── MembershipPackageController.java # CRUD /api/membership-packages
    │   ├── PTSessionController.java       # CRUD /api/pt-sessions
    │   ├── StaffPerformanceController.java # GET /api/staff-performance
    │   ├── StatsController.java           # GET /api/stats
    │   └── UserController.java            # CRUD /api/users
    │
    ├── 📁 dto/                      # Data Transfer Objects
    │   ├── AttendanceRecordDTO.java
    │   ├── AvailableSlotDTO.java
    │   ├── BlackoutDayDTO.java
    │   ├── CompleteSessionRequest.java
    │   ├── GymHoursDTO.java
    │   ├── GymSettingsDTO.java
    │   ├── MembershipPackageDTO.java
    │   ├── PTConfigDTO.java
    │   ├── PTSessionDTO.java
    │   ├── RecurringSessionRequest.java
    │   ├── StaffPerformanceDTO.java
    │   ├── StaffShiftDTO.java
    │   └── StaffSummaryDTO.java
    │
    ├── 📁 model/                    # JPA Entity Models
    │   ├── BlackoutDay.java         # Holiday/closure dates
    │   ├── GymSettings.java         # Gym configuration entity
    │   ├── MembershipPackage.java   # Membership plans entity
    │   ├── PTSession.java           # Personal training sessions
    │   ├── RecurringFrequency.java  # Enum: WEEKLY, BIWEEKLY
    │   ├── Role.java                # User roles entity
    │   ├── SessionStatus.java       # Enum: SCHEDULED, COMPLETED, MISSED, CANCELLED
    │   ├── ShiftStatus.java         # Enum: SCHEDULED, COMPLETED, ABSENT
    │   ├── StaffPerformance.java    # Staff performance metrics
    │   ├── StaffShift.java          # Staff work schedules
    │   └── User.java                # Users entity (trainers, members, staff)
    │
    ├── 📁 repository/               # JPA Repositories
    │   ├── BlackoutDayRepository.java
    │   ├── GymSettingsRepository.java
    │   ├── MembershipPackageRepository.java
    │   ├── PTSessionRepository.java
    │   ├── RoleRepository.java
    │   ├── StaffPerformanceRepository.java
    │   ├── StaffShiftRepository.java
    │   └── UserRepository.java
    │
    └── 📁 service/                  # Business Logic Services
        ├── GymSettingsService.java
        ├── MembershipPackageService.java
        ├── PTSessionService.java
        ├── StaffPerformanceService.java
        ├── StaffShiftService.java
        └── UserService.java
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (filter by role) |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/pt-sessions/trainer/{id}` | Get trainer's sessions |
| GET | `/api/pt-sessions/member/{id}` | Get member's sessions |
| POST | `/api/pt-sessions` | Schedule new session |
| DELETE | `/api/pt-sessions/{id}` | Cancel session |
| POST | `/api/pt-sessions/{id}/complete` | Mark session complete |
| GET | `/api/settings` | Get gym settings |
| PUT | `/api/settings` | Update gym settings |
| GET | `/api/membership-packages` | Get all packages |
| GET | `/api/staff-performance` | Get staff metrics |
| GET | `/api/stats` | Get dashboard stats |

---

## ⚛️ Frontend (`/frontend`)

React 18 + TypeScript + Vite + Framer Motion

```
frontend/
├── 📄 index.html                    # HTML entry point
├── 📄 package.json                  # NPM dependencies
├── 📄 vite.config.ts                # Vite configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 .env                          # Frontend environment variables
│
└── 📁 src/
    │
    ├── 📄 main.tsx                  # React entry point
    ├── 📄 App.tsx                   # Root component with routing
    ├── 📄 App.css                   # Global app styles
    ├── 📄 index.css                 # Base CSS imports
    │
    ├── 📁 components/               # Reusable UI Components
    │   │
    │   ├── 📁 base/                 # Core UI primitives
    │   │   ├── Badge.tsx / .css     # Status badges
    │   │   ├── Button.tsx / .css    # Styled buttons
    │   │   ├── Card.tsx / .css      # Card containers
    │   │   ├── Input.tsx / .css     # Form inputs
    │   │   └── index.ts             # Barrel export
    │   │
    │   ├── 📁 utilities/            # Helper components
    │   │   ├── EmptyState.tsx / .css    # No data message
    │   │   ├── ErrorMessage.tsx / .css  # Error display
    │   │   ├── LoadingSpinner.tsx / .css # Loading indicator
    │   │   ├── Skeleton.tsx / .css      # Loading skeleton
    │   │   └── index.ts
    │   │
    │   ├── 📁 charts/               # Data visualization
    │   │   ├── MemberGrowthChart.tsx
    │   │   ├── RevenueChart.tsx
    │   │   └── SessionStatsChart.tsx
    │   │
    │   ├── 📁 Form/                 # Form components
    │   │   ├── Button.tsx
    │   │   ├── Form.css
    │   │   ├── Select.tsx / .css
    │   │   ├── TextInput.tsx
    │   │   ├── Toggle.tsx
    │   │   └── index.ts
    │   │
    │   ├── 📁 Modal/                # Base modal component
    │   │   ├── Modal.tsx
    │   │   └── Modal.css
    │   │
    │   ├── 📁 Navbar/               # Navigation bar
    │   │   ├── Navbar.tsx           # Search, notifications, profile
    │   │   └── Navbar.css
    │   │
    │   ├── 📁 ScheduleSessionModal/ # PT session booking
    │   │   ├── ScheduleSessionModal.tsx
    │   │   └── ScheduleSessionModal.css
    │   │
    │   ├── 📁 SessionDetailsModal/  # PT session details
    │   │   ├── SessionDetailsModal.tsx
    │   │   └── SessionDetailsModal.css
    │   │
    │   ├── 📁 StatCard/             # Dashboard stat cards
    │   │   ├── StatCard.tsx
    │   │   └── StatCard.css
    │   │
    │   ├── 📁 StatusBadge/          # Status indicators
    │   │   ├── StatusBadge.tsx
    │   │   ├── StatusBadge.css
    │   │   └── index.ts
    │   │
    │   ├── 📁 ActivityFeed/         # Activity feed component
    │   │   ├── ActivityFeed.tsx
    │   │   └── ActivityFeed.css
    │   │
    │   ├── 📁 SearchBar/            # Search component
    │   │   ├── SearchBar.tsx
    │   │   └── SearchBar.css
    │   │
    │   ├── 📁 UserCard/             # User display card
    │   │   ├── UserCard.tsx
    │   │   └── UserCard.css
    │   │
    │   ├── 📁 UserDetailModal/      # User profile modal
    │   │   ├── UserDetailModal.tsx
    │   │   └── UserDetailModal.css
    │   │
    │   └── 📄 index.ts              # Component exports
    │
    ├── 📁 contexts/                 # React Contexts
    │   └── ThemeContext.tsx         # Dark/Light mode state
    │
    ├── 📁 hooks/                    # Custom React Hooks
    │   ├── index.ts
    │   └── useApi.ts                # API call hook
    │
    ├── 📁 pages/                    # Page Components
    │   │
    │   ├── 📁 Dashboard/            # Home dashboard
    │   │   ├── Dashboard.tsx        # Stats, charts, activity
    │   │   └── Dashboard.css
    │   │
    │   ├── 📁 Members/              # Member management
    │   │   ├── Members.tsx          # List, add, edit members
    │   │   └── Members.css
    │   │
    │   ├── 📁 Staff/                # Staff management
    │   │   ├── Staff.tsx            # Trainers & staff
    │   │   └── Staff.css
    │   │
    │   ├── 📁 PTSessions/           # Personal training
    │   │   ├── PTSessions.tsx       # Schedule, view sessions
    │   │   └── PTSessions.css
    │   │
    │   └── 📁 Settings/             # Gym settings
    │       ├── Settings.tsx         # Configuration page
    │       └── Settings.css
    │
    ├── 📁 services/                 # API Services
    │   ├── api.ts                   # Axios instance & endpoints
    │   └── index.ts
    │
    ├── 📁 styles/                   # Global Styles
    │   ├── design-system.css        # CSS variables, colors, light/dark mode
    │   ├── premium-design-system.css # Glassmorphism, gradients
    │   ├── animations.css           # Keyframe animations
    │   ├── grid.css                 # Grid utilities
    │   ├── responsive.css           # Media queries
    │   └── performance.css          # Performance optimizations
    │
    ├── 📁 types/                    # TypeScript Types
    │   ├── api.ts                   # API response types
    │   ├── components.ts            # Component prop types
    │   ├── gymSettings.ts           # Settings interfaces
    │   ├── membershipPackage.ts     # Package interfaces
    │   ├── ptSession.ts             # PT session interfaces
    │   ├── settings.ts              # Settings types
    │   ├── staffPerformance.ts      # Performance types
    │   ├── staffShift.ts            # Shift interfaces
    │   ├── user.ts                  # User interfaces
    │   └── index.ts                 # Barrel export
    │
    └── 📁 utils/                    # Utility Functions
        ├── animations.ts            # Framer Motion variants
        ├── avatars.ts               # Avatar generation
        ├── search.ts                # Search utilities
        ├── toast.ts                 # Toast notifications
        └── index.ts
```

---

## 🗄️ Database (`/database`)

Oracle Database SQL scripts.

```
database/
├── 📄 schema.sql                    # Main database schema
├── 📄 migration_v2_athlonx_features.sql  # Feature migrations
├── 📄 verify_migration_v2.sql       # Migration verification
├── 📄 MIGRATION_GUIDE.md            # Migration instructions
├── 📄 README_DATABASE_SETUP.md      # Database setup guide
└── 📄 SETUP_INSTRUCTIONS.md         # Detailed setup steps
```

### Database Tables

| Table | Description |
|-------|-------------|
| `users` | All users (trainers, members, staff, owners) |
| `roles` | User roles (OWNER, TRAINER, STAFF, CUSTOMER) |
| `user_role_map` | User-role junction table |
| `trainer_customer_map` | Trainer-member assignments |
| `membership_packages` | Subscription plans |
| `pt_sessions` | Personal training sessions |
| `staff_shifts` | Staff work schedules |
| `staff_performance` | Staff metrics |
| `gym_settings` | Gym configuration |
| `blackout_days` | Holiday/closure dates |

---

## 🚀 Quick Start

### 1. Database Setup
```sql
-- Run in SQL*Plus or SQL Developer as SYSDBA
@database/schema.sql
@database/migration_v2_athlonx_features.sql
```

### 2. Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Key Features

| Feature | Location |
|---------|----------|
| Dashboard Analytics | `pages/Dashboard/` |
| Member Management | `pages/Members/` |
| Trainer Management | `pages/Staff/` |
| PT Session Booking | `pages/PTSessions/` |
| Gym Settings | `pages/Settings/` |
| Dark/Light Theme | `contexts/ThemeContext.tsx` |
| Global Search | `components/Navbar/` |
| Notifications | `components/Navbar/` |
| Toast Messages | `utils/toast.ts` |

---

## 🎨 Styling System

| File | Purpose |
|------|---------|
| `design-system.css` | CSS variables, colors, spacing, themes |
| `premium-design-system.css` | Glassmorphism, gradients, premium effects |
| `animations.css` | Keyframe animations |
| `responsive.css` | Mobile breakpoints |
| `grid.css` | Grid layout utilities |
| `performance.css` | GPU acceleration, lazy loading |

### Theme Variables
- **Dark Mode**: Default, `data-theme="dark"`
- **Light Mode**: Toggle via navbar, `data-theme="light"`
- Theme persists in localStorage

---

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase folder + file | `UserCard/UserCard.tsx` |
| Pages | PascalCase folder + file | `Dashboard/Dashboard.tsx` |
| Styles | Same name as component | `Dashboard.css` |
| Types | camelCase | `ptSession.ts` |
| Utils | camelCase | `animations.ts` |
| Contexts | PascalCase + Context | `ThemeContext.tsx` |
| Services | camelCase | `api.ts` |

---

## 🔍 Finding Files

| Looking for... | Location |
|----------------|----------|
| API endpoints | `frontend/src/services/api.ts` |
| Database models | `backend/src/.../model/` |
| REST controllers | `backend/src/.../controller/` |
| Business logic | `backend/src/.../service/` |
| Page components | `frontend/src/pages/` |
| Reusable UI | `frontend/src/components/` |
| Type definitions | `frontend/src/types/` |
| Global styles | `frontend/src/styles/` |
| Theme toggle | `frontend/src/contexts/ThemeContext.tsx` |
| Navigation | `frontend/src/components/Navbar/` |
| Form inputs | `frontend/src/components/Form/` |
| Base UI | `frontend/src/components/base/` |

---

## 🛠️ Technology Stack

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Framer Motion (animations)
- Axios (HTTP client)
- React Hot Toast (notifications)
- Lucide React (icons)

### Backend
- Spring Boot 3.2
- Java 17
- JPA/Hibernate
- Oracle Database
- Maven

---

## 📱 Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview with stats and charts |
| Staff | `/staff` | Manage trainers and staff |
| Members | `/members` | Manage gym members |
| PT Sessions | `/pt-sessions` | Schedule training sessions |
| Settings | `/settings` | Gym configuration |

---

*Last updated: December 2024*
