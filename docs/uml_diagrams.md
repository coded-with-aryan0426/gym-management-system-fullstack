# UML Diagrams - Gym Management System

## 1. Class Diagram (Core Entities)

```mermaid
classDiagram
    class User {
        +Long userId
        +String username
        +String password
        +String fullName
        +String email
        +String phone
        +String avatarId
        +AuthProvider authProvider
        +Boolean twoFactorEnabled
        +LocalDateTime createdAt
        +String status
        +Set~Role~ roles
        +Set~User~ trainers
        +Set~User~ customers
    }

    class Gym {
        +Long gymId
        +String name
        +String address
        +String city
        +String phone
        +String email
        +SubscriptionPlan subscriptionPlan
        +Boolean isPublic
        +String inviteCode
        +User owner
    }

    class Membership {
        +Long id
        +Gym gym
        +User user
        +MembershipPackage package
        +MembershipStatus status
        +LocalDate startDate
        +LocalDate endDate
        +isActive() boolean
    }

    class MembershipPackage {
        +Long packageId
        +String packageName
        +Double price
        +Integer durationDays
        +Integer includedPTSessions
        +Boolean isActive
    }

    class PTSession {
        +Long sessionId
        +User trainer
        +User member
        +LocalDateTime sessionDate
        +Integer durationMinutes
        +SessionStatus status
        +String progressNotes
        +String workoutPlan
        +Boolean isRecurring
    }

    class Role {
        +Long roleId
        +String roleName
    }

    class Permission {
        +Long permissionId
        +String module
        +RoleAction action
        +String description
    }

    class Conversation {
        +Long conversationId
        +String name
        +Boolean isGroup
        +User createdBy
        +Set~Message~ messages
    }

    class Message {
        +Long messageId
        +Conversation conversation
        +User sender
        +String content
        +Boolean isEdited
        +Boolean isDeleted
        +LocalDateTime createdAt
    }

    class Equipment {
        +Long equipmentId
        +String name
        +String category
        +Integer quantity
        +String status
        +LocalDate purchaseDate
        +LocalDate lastMaintenance
    }

    class GymClass {
        +Long classId
        +String name
        +String description
        +User instructor
        +Integer capacity
        +LocalDateTime startTime
        +Integer durationMinutes
    }

    class Notification {
        +Long notificationId
        +User user
        +String title
        +String message
        +String type
        +Boolean isRead
    }

    %% Relationships
    User "1" --> "*" Role : has
    User "1" --> "*" User : trains
    User "*" --> "*" User : customers
    Gym "1" --> "1" User : owner
    Gym "1" --> "*" Membership : memberships
    Membership "*" --> "1" User : member
    Membership "*" --> "1" MembershipPackage : package
    PTSession "*" --> "1" User : trainer
    PTSession "*" --> "1" User : member
    Conversation "*" --> "*" User : participants
    Conversation "1" --> "*" Message : messages
    Message "*" --> "1" User : sender
    GymClass "*" --> "1" User : instructor
    Notification "*" --> "1" User : recipient
    Role "*" --> "*" Permission : has
```

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    subgraph Users[Actors]
        M((Member))
        T((Trainer))
        O((Owner))
        S((System))
    end

    subgraph Auth[Authentication]
        UC1[Register]
        UC2[Login]
        UC3[OAuth]
        UC4[Reset PWD]
        UC5[2FA]
    end

    subgraph MemberUC[Member Functions]
        UC6[Dashboard]
        UC7[Browse Trainers]
        UC8[Book Session]
        UC9[Track Progress]
        UC10[Membership]
        UC11[Chat]
    end

    subgraph TrainerUC[Trainer Functions]
        UC12[Schedule]
        UC13[View Members]
        UC14[Plans]
        UC15[Notes]
        UC16[Reports]
    end

    subgraph OwnerUC[Owner Functions]
        UC17[Settings]
        UC18[Staff]
        UC19[Equipment]
        UC20[Analytics]
        UC21[Packages]
        UC22[Approve]
    end

    subgraph SysUC[System Functions]
        UC23[Notify]
        UC24[Payments]
        UC25[Reports]
        UC26[Auto-Expire]
    end

    M --> Auth
    M --> MemberUC
    T --> UC2
    T --> TrainerUC
    T --> UC11
    O --> UC2
    O --> OwnerUC
    S --> SysUC
```

---

## 3. Sequence Diagrams

### 3.1 User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as AuthController
    participant S as AuthService
    participant J as JwtProvider
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /api/auth/login
    A->>S: authenticate(username, password)
    S->>D: findByUsername()
    D-->>S: User entity
    S->>S: validatePassword()
    alt Password Valid
        S->>J: generateToken(user)
        J-->>S: JWT Token
        S-->>A: AuthResponse(token, user)
        A-->>F: 200 OK + JWT
        F->>F: Store token in localStorage
        F-->>U: Redirect to Dashboard
    else Password Invalid
        S-->>A: AuthException
        A-->>F: 401 Unauthorized
        F-->>U: Show Error
    end
```

### 3.2 Membership Purchase Flow

```mermaid
sequenceDiagram
    participant M as Member
    participant F as Frontend
    participant C as MembershipController
    participant S as MembershipService
    participant P as MembershipPackageService
    participant D as Database

    M->>F: Select Package
    F->>C: GET /api/packages
    C->>P: getActivePackages()
    P->>D: findActivePackages()
    D-->>P: List<Package>
    P-->>C: PackageDTOs
    C-->>F: Available Packages
    F-->>M: Display Packages

    M->>F: Confirm Purchase
    F->>C: POST /api/memberships
    C->>S: createMembership(userId, packageId)
    S->>D: save(membership)
    D-->>S: Saved Membership
    S-->>C: MembershipDTO
    C-->>F: 201 Created
    F-->>M: Success Notification
```

### 3.3 PT Session Booking Flow

```mermaid
sequenceDiagram
    participant M as Member
    participant F as Frontend
    participant C as PTSessionController
    participant S as PTSessionService
    participant N as NotificationService
    participant D as Database

    M->>F: Select Trainer & Time
    F->>C: POST /api/pt-sessions
    C->>S: bookSession(trainerId, memberId, dateTime)
    S->>D: checkTrainerAvailability()
    D-->>S: Available
    S->>D: save(ptSession)
    D-->>S: Saved Session
    S->>N: notifyTrainer(session)
    N->>D: save(notification)
    S-->>C: PTSessionDTO
    C-->>F: 201 Created
    F-->>M: Booking Confirmed
```

---

## 4. Activity Diagrams

### 4.1 User Registration Process

```mermaid
flowchart TD
    A[Start] --> B{Choose Auth Method}
    B -->|Email/Password| C[Enter Registration Details]
    B -->|OAuth| D[Select Provider]
    
    C --> E{Validate Input}
    E -->|Invalid| F[Show Errors]
    F --> C
    E -->|Valid| G[Check Email Exists]
    
    D --> H[Redirect to Provider]
    H --> I[Authorize & Return]
    I --> J{User Exists?}
    J -->|Yes| K[Link Account]
    J -->|No| L[Create New User]
    
    G -->|Exists| M[Show Email Exists Error]
    M --> C
    G -->|Not Exists| N[Hash Password]
    N --> O[Create User]
    O --> P[Assign Default Role]
    
    K --> P
    L --> P
    
    P --> Q[Send Welcome Email]
    Q --> R[Redirect to Dashboard]
    R --> S[End]
```

### 4.2 Membership Approval Workflow

```mermaid
flowchart TD
    A[New Membership Request] --> B[Status: PENDING]
    B --> C{Owner Reviews}
    
    C -->|Approve| D[Update Status: ACTIVE]
    D --> E[Calculate End Date]
    E --> F[Assign Package Benefits]
    F --> G[Send Approval Email]
    G --> H[Member Gets Access]
    
    C -->|Reject| I[Update Status: REJECTED]
    I --> J[Log Rejection Reason]
    J --> K[Send Rejection Email]
    K --> L[Member Notified]
    
    C -->|Request Info| M[Status: PENDING_INFO]
    M --> N[Send Info Request]
    N --> O[Member Provides Info]
    O --> C
    
    H --> P[End]
    L --> P
```

### 4.3 Chat Message Flow

```mermaid
flowchart TD
    A[User Types Message] --> B[Click Send]
    B --> C{Validate Content}
    C -->|Empty| D[Show Error]
    D --> A
    C -->|Valid| E{Has Attachments?}
    
    E -->|Yes| F[Upload Files]
    F --> G[Get File URLs]
    G --> H[Create Message]
    
    E -->|No| H
    
    H --> I[Save to Database]
    I --> J[Broadcast via WebSocket]
    J --> K[Update UI for Sender]
    J --> L[Push to Recipients]
    L --> M[Show Notification]
    M --> N[Update Unread Count]
    N --> O[End]
    K --> O
```
