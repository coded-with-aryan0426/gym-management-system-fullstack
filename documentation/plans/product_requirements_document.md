# Product Requirements Document (PRD)
## AthlonX Gym Management System

### 1. Overview
**AthlonX** is a comprehensive full-stack gym management solution designed to streamline operations for gym owners, staff, and members. It facilitates member management, personal training (PT) scheduling, financial tracking, and live floor monitoring. The system supports multi-gym environments and role-based access control.

### 2. Goals
*   **Operational Efficiency**: Automate check-ins, session tracking, and reporting.
*   **User Experience**: Provide a seamless, modern interface for members to book sessions and for staff to manage the facility.
*   **Scalability**: Support multiple gym locations and growing member bases.
*   **Data-Driven**: Offer real-time dashboards and financial insights.

### 3. User Profiles
*   **Admin / Gym Owner**: Full access to all settings, financials, staff management, and system configuration.
*   **Staff (Front Desk)**: Manages member check-ins/outs, handles new signups, and oversees daily floor operations.
*   **Trainer**: Manages PT sessions, sets availability, marks attendance, and views their specific schedule.
*   **Member**: Views class/PT schedules, book sessions, tracks their own membership status and history.

### 4. Technical Stack
*   **Frontend**: React (Vite), TypeScript, CSS Modules / Tailwind (migrating), Lucide Icons.
*   **Backend**: Java (Spring Boot), Spring Security (JWT), Spring Data JPA.
*   **Database**: Oracle Database (SQL).
*   **Design**: Dark-themed, enterprise-grade UI.

### 5. Feature Breakdown

#### 5.1 Authentication & Access Control
*   **Login/Signup**: Secure JWT-based authentication.
*   **Context Switching**: Users with multiple roles (e.g., Member at Gym A, Staff at Gym B) can switch contexts seamlessly.
*   **Role-Based Access**:
    *   *Staff/Admin*: Access to Dashboard, Members, Staff, Financials, Reports, Settings.
    *   *Member*: Access to Profile, Bookings, Public Gym Directory.

#### 5.2 Dashboard (Staff/Admin)
*   **Live Metrics**: Real-time count of active members on the floor, daily revenue, and joining stats.
*   **Floor Status**: List of currently checked-in members.
*   **Quick Actions**: Fast check-in/check-out functionality.
*   **Alerts**: System notifications (e.g., billing issues, capacity warnings).

#### 5.3 Member Management
*   **Member List**: Searchable, filterable list of all members.
*   **Member Profile**: Detailed view including:
    *   Personal info (Email, Phone).
    *   Membership status (Active, Pending, Expired).
    *   Attendance history.
    *   Transaction history.
*   **Actions**: Approve pending signups, ban/suspend members, renew memberships.

#### 5.4 Personal Training (PT) & Classes
*   **Session Management**: Create, update, and cancel PT sessions.
*   **Recurring Sessions**: Option to schedule repeating sessions (weekly/monthly).
*   **Availability**: Trainers can define available slots; Members can view and book.
*   **Tracking**: Mark sessions as 'Completed' or 'No Show'.
*   **Calendar View**: Visual schedule for trainers and members.

#### 5.5 Financials & Reports
*   **Transaction Logs**: Comprehensive record of all payments (memberships, PT packs).
*   **Revenue Reports**: Visual charts (Bar/Line) showing income over time.
*   **Export**: (Planned) export capability for accounting.

#### 5.6 Settings (Admin)
*   **Gym Profile**: Update gym name, location, and info.
*   **Membership Packages**: Create and edit standard plans (e.g., "Gold Monthly", "Student Year").
*   **Staff Management**: Add new staff, assign roles (Trainer vs Front Desk).

### 6. Non-Functional Requirements
*   **Performance**: Dashboards must load within 2 seconds. Live status updates should be near real-time.
*   **Security**: All API endpoints secured via JWT. Passwords hashed.
*   **Usability**: "Premium" dark mode aesthetic, WCAG accessible contrast (in progress).

### 7. Edge Cases & Exception Handling
*   **Context Loss**: If a user refreshes and `activeGymId` is lost, prompt to re-select or default to primary gym.
*   **Simultaneous Logins**: Validated via JWT, but no concurrent session limit currently enforced.
*   **Booking Conflicts**: If two users book the same PT slot simultaneously, use optimistic locking; second request fails with specific error message.
*   **Offline Mode**: Currently not supported; app requires active internet connection.

### 8. Dependencies
*   **Oracle JDBC Driver**: Required for database connectivity.
*   **Shadcn/UI**: Primary UI component library (installation required in frontend).
*   **Google Fonts**: Inter/Outfit fonts fetched from CDN.

### 9. Future Roadmap / Pending
*   **Hardware Integration**: RFID/Biometric scanner integration for check-ins.
*   **Mobile App**: Dedicated mobile app for members.
*   **Payment Gateway**: Direct integration with Stripe/Razorpay (currently manual entry/logging).

