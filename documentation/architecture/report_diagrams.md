# System Architecture & Database Diagrams

This document contains comprehensive UML and Database diagrams for the **Gym Management System**. These diagrams are generated using **Mermaid.js**, which renders directly in most modern Markdown viewers (GitHub, GitLab, VS Code).

## 1. Entity-Relationship (ER) Diagram
This diagram represents the database schema, showing the tables (Entities) and their relationships (Foreign Keys).

```mermaid
erDiagram
    %% Core Users and Roles
    USERS {
        Long user_id PK
        String username
        String password
        String full_name
        String email
        String phone
        DateTime created_at
    }
    ROLES {
        Long role_id PK
        String name
    }
    USER_ROLE_MAP {
        Long user_id FK
        Long role_id FK
    }

    %% Memberships and Gyms
    GYMS {
        Long gym_id PK
        String name
        String subscription_plan
        String invite_code
        Boolean is_public
    }
    MEMBERSHIP_PACKAGES {
        Long package_id PK
        String package_name
        Double price
        Integer duration_days
        Integer included_pt_sessions
    }
    MEMBERSHIPS {
        Long membership_id PK
        Long user_id FK
        Long gym_id FK
        Long package_id FK
        String status
        LocalDate start_date
        LocalDate end_date
    }

    %% Operations
    CHECK_INS {
        Long check_in_id PK
        Long user_id FK
        DateTime check_in_time
        DateTime check_out_time
        String status
    }

    %% Relationships
    USERS ||--o{ USER_ROLE_MAP : "assigned"
    ROLES ||--o{ USER_ROLE_MAP : "defines"
    
    USERS ||--o{ MEMBERSHIPS : "holds"
    GYMS ||--o{ MEMBERSHIPS : "issues"
    MEMBERSHIP_PACKAGES ||--o{ MEMBERSHIPS : "defines terms"
    
    USERS ||--o{ CHECK_INS : "performs"
    
    %% Recursive relationships (Trainers/Customers)
    USERS ||--o{ USERS : "trains/is trained by"
```

## 2. Class Diagram (Backend Architecture)
This diagram illustrates the Java class structure, highlighting keys attributes and methods in the domain model.

```mermaid
classDiagram
    direction LR
    
    class User {
        +Long userId
        +String fullName
        +String email
        +Set~Role~ roles
        +Set~User~ customers
        +Set~User~ trainers
        +String getPhoneNumber()
    }

    class Role {
        +Long roleId
        +String name
    }

    class Gym {
        +Long gymId
        +String name
        +String inviteCode
        +Boolean isPublic
    }

    class Membership {
        +Long id
        +MembershipStatus status
        +LocalDate startDate
        +LocalDate endDate
        +boolean isActive()
    }
    
    class MembershipPackage {
        +Long packageId
        +String packageName
        +Double price
        +Integer includedPTSessions
    }

    class CheckIn {
        +Long checkInId
        +LocalDateTime checkInTime
        +String status
        +void checkOut()
    }

    User "*" *-- "*" Role : has
    User "1" -- "*" Membership : owns
    Gym "1" -- "*" Membership : provides
    Membership "*" -- "1" MembershipPackage : based on
    User "1" -- "*" CheckIn : logs
```

## 3. High-Level Use Case Diagram
This diagram visualizes the primary interactions available to different types of users (Actors) in the system.

```mermaid
flowchart TD
    %% Actors
    Admin((Admin/Manager))
    Staff((Staff/Trainer))
    Member((Member))

    %% System Boundary
    subgraph Gym Management System
        direction TB
        
        %% Common
        Login[Login / Auth]
        Dash[View Dashboard]
        
        %% Member Actions
        CheckIn[Check In / Out]
        ViewSched[View Schedule]
        BookClass[Book Class]
        
        %% Staff Actions
        ManageMem[Register Member]
        AssignPlan[Assign Membership Plan]
        ViewAtt[View Attendance]
        
        %% Admin Actions
        ManageGym[Configure Gym Settings]
        ViewFin[View Financial Reports]
        ManageStaff[Manage Staff]
    end

    %% Connections
    Member --> Login
    Member --> Dash
    Member --> CheckIn
    Member --> ViewSched
    Member --> BookClass
    
    Staff --> Login
    Staff --> Dash
    Staff --> ManageMem
    Staff --> AssignPlan
    Staff --> ViewAtt
    
    Admin --> Login
    Admin --> Dash
    Admin --> ManageGym
    Admin --> ViewFin
    Admin --> ManageStaff
```

## 4. Sequence Diagram: Member Check-In Process
This diagram details the step-by-step logic flow when a member performs a check-in.

```mermaid
sequenceDiagram
    actor Member
    participant Frontend as React UI
    participant Controller as CheckInController
    participant Service as CheckInService
    participant DB as Database

    Member->>Frontend: Click "Check In"
    Frontend->>Controller: POST /api/check-ins
    Controller->>Service: performCheckIn(userId)
    
    Service->>DB: Find Active Membership(userId)
    activate DB
    DB-->>Service: Membership Details
    deactivate DB
    
    alt Membership Active
        Service->>DB: Save New CheckIn Record
        DB-->>Service: CheckIn Saved
        Service-->>Controller: Success (200 OK)
        Controller-->>Frontend: { status: "Checked In", time: "..." }
        Frontend-->>Member: Show Success Message
    else Membership Expired
        Service-->>Controller: Error (403 Forbidden)
        Controller-->>Frontend: Alert: "Membership Expired"
        Frontend-->>Member: Show Error Message
    end
```
