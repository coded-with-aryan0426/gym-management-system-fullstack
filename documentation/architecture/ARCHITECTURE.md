# Application Architecture & Documentation

## 1. Executive Summary
The application consists of two distinct components:
1.  **Backend System:** A robust, monolithic Spring Boot application providing the core logic for the Gym Management System (AthlonX). It exposes REST APIs for gym operations, member management, authentication, and reporting.
2.  **Frontend Application:** A Next.js-based marketing website designed to showcase the product ("AthlonX") to potential gym owners.

**Note:** The codebase currently contains the *backend logic* for the management system but the *frontend* for the actual dashboard (login, admin panel) appears to be separate or not yet implemented in this repository. The current frontend is a public landing page.

---

## 2. Backend Architecture (Gym Management System)

### 2.1 Technology Stack
*   **Framework:** Spring Boot 3.2.3
*   **Language:** Java 17
*   **Database:** 
    *   **Production/Dev:** Oracle Database (via `ojdbc11`)
    *   **Runtime:** H2 Database (optional/testing)
    *   **Migration:** Flyway
*   **Security:** Spring Security, JWT (JSON Web Tokens), OAuth2 Client (Google)
*   **Build Tool:** Maven

### 2.2 System Architecture Diagram
```mermaid
graph TD
    Client[Client Apps (Web/Mobile)] -->|REST API| LB[Load Balancer/Gateway]
    LB -->|HTTPS| API[Spring Boot Backend]
    
    subgraph "Backend Services"
        API --> Auth[Auth Controller]
        API --> Member[Member Controller]
        API --> Staff[Staff Controller]
        API --> Reporting[Analytics Controller]
    end
    
    subgraph "Data Layer"
        Auth -->|Read/Write| DB[(Oracle Database)]
        Member -->|Read/Write| DB
        Staff -->|Read/Write| DB
    end
    
    subgraph "External Services"
        API --> Email[SMTP / Email Service]
        API --> OAuth[Google OAuth2]
    end
```

### 2.3 Core Components & Interactions

#### A. Controller Layer (`com.gym.management.controller`)
Handles incoming HTTP requests, input validation, and maps requests to service methods.
*   **`AuthController`**: Handles login, registration, and token generation.
*   **`MembershipController`**: Manages member subscriptions and renewals.
*   **`DashboardController`**: Aggregates data for admin/staff dashboards.
*   **`PTSessionController`**: Manages Personal Training sessions.

#### B. Service Layer (`com.gym.management.service`)
Contains the business logic.
*   **`MembershipService`**:
    *   **Logic:** Calculates membership expiration based on packages.
    *   **Flow:** `renewMembership` -> Fetch User -> Fetch Package -> Calculate End Date -> Save.
*   **`UserService`**:
    *   **Logic:** Aggregates user data with membership status for the "All Members" view.
    *   **DTO Mapping:** Converts complex Entity graphs into flat DTOs (`MemberDTO`) for the frontend.
*   **`AuthService` / `CustomUserDetailsService`**:
    *   **Logic:** Validates credentials and loads user roles (`GymRole`, `StaffRole`).

#### C. Data Layer (`com.gym.management.repository`)
Uses Spring Data JPA to interact with the Oracle database.
*   **Entities:** `User`, `Gym`, `Membership`, `MembershipPackage`, `StaffPerformance`.
*   **Key Relationships:**
    *   `User` 1 -- * `Membership`
    *   `User` * -- * `Role` (via `UserGymRole`)
    *   `Gym` 1 -- * `Staff`

### 2.4 Data Flow
**Example: Membership Renewal**
1.  **Request:** POST `/api/membership/renew` (payload: `userId`, `packageId`).
2.  **Controller:** `MembershipController` validates input.
3.  **Service:** `MembershipService` verifies user existence.
    *   Checks for active membership.
    *   Calculates new `endDate` = `currentEndDate` + `packageDuration`.
4.  **Repository:** `MembershipRepository` saves the updated entity.
5.  **Database:** Record updated in `MEMBERSHIP` table.
6.  **Response:** Returns updated `Membership` object as JSON.

### 2.5 Security & Authentication
*   **Mechanism:** Stateless JWT Authentication.
*   **Flow:**
    1.  User POSTs credentials to `/auth/login`.
    2.  Server validates and returns a JWT.
    3.  Client sends JWT in `Authorization: Bearer <token>` header for subsequent requests.
*   **RBAC:** Annotations like `@PreAuthorize("hasRole('ADMIN')")` secure sensitive endpoints.

---

## 3. Frontend Architecture (Marketing Site)

### 3.1 Technology Stack
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, CSS Modules
*   **UI Components:** Radix UI (Primitives), Lucide React (Icons), Framer Motion (Animations)
*   **Libraries:** `axios` (HTTP), `react-hook-form` (Forms), `zod` (Validation)

### 3.2 Structure & Navigation
*   **`app/page.tsx`**: Main Landing Page. Renders `LandingPage` component.
*   **`app/member-app/page.tsx`**: "Mobile Experience" showcase page.
*   **`app/about/`**: Company information.
*   **`components/landing/`**: Contains marketing-specific sections (`Hero`, `Features`, `Footer`).
*   **`components/ui/`**: Reusable atomic components (Buttons, Inputs) based on Shadcn UI.

### 3.3 User Interface
*   **Design System:** Dark mode aesthetic (`#050505` background), neon accents (`#E63946`), clean typography (Inter, Jakarta Sans).
*   **Responsiveness:** Fully responsive grid using Tailwind breakpoints.

---

## 4. Key Business Logic & Decision Points

1.  **Membership Validity:**
    *   Logic: Access is granted only if `Membership.status == ACTIVE` AND `endDate >= today`.
    *   Edge Case: Grace periods for expired memberships (currently not implemented).

2.  **Role Management:**
    *   Users can have multiple roles (e.g., `TRAINER` and `MANAGER`).
    *   Permissions are aggregate.

3.  **Booking Conflicts:**
    *   (Inferred) `PTSessionService` likely checks for trainer availability before booking.

---

## 5. Known Limitations & Areas for Improvement

1.  **Missing Frontend Dashboard:** The React frontend for the *actual* management system (consuming the Backend APIs) is missing from this codebase.
2.  **Database Dependency:** Hard dependency on Oracle (`ojdbc11`). Consider making it database-agnostic or using Docker for easier dev setup.
3.  **Error Handling:**
    *   **Mechanism:** Centralized `GlobalExceptionHandler` (`@ControllerAdvice`).
    *   **Response Format:** Standardized `ErrorResponse` JSON:
        ```json
        {
          "success": false,
          "code": "NOT_FOUND",
          "message": "User not found",
          "traceId": "uuid-..."
        }
        ```
    *   **Handled Exceptions:**
        *   `EntityNotFoundException` -> 404 Not Found
        *   `MethodArgumentNotValidException` -> 400 Bad Request (Validation errors)
        *   `BadCredentialsException` -> 401 Unauthorized
        *   `AccessDeniedException` -> 403 Forbidden
        *   Generic `Exception` -> 500 Internal Server Error (Generic message to client, detailed log on server)

4.  **Test Coverage:**
    *   Backend has `spring-boot-starter-test`, but unit test coverage should be verified.

---

## 6. Application Startup & Data Seeding
The application includes a `DataInitializer` component (`CommandLineRunner`) that automatically seeds the database on startup if it's empty.
*   **Default Roles:** OWNER, TRAINER, STAFF, CUSTOMER.
*   **Default Packages:** Gold Plan (30 days, 4 PT sessions), Silver Plan (30 days).
*   **Sample Data:** Generates ~50 sample users and random PT sessions for testing/demo purposes.

## 7. API Documentation (Key Endpoints)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | Authenticate user & get Token | No |
| **POST** | `/auth/register` | Register new user | No |
| **GET** | `/api/members` | List all members (Admin) | Yes (Admin) |
| **POST** | `/api/memberships/renew` | Renew membership | Yes (Staff/Admin) |
| **GET** | `/api/dashboard/stats` | Get gym statistics | Yes (Admin) |

