# UML Diagrams - Gym Management System

## Class Diagram - Core User & Auth

```mermaid
classDiagram
    direction LR
    class User {
        +Long userId
        +String username
        +String email
        +String fullName
        +String phone
        +String avatarId
        +Boolean twoFactorEnabled
        +Set~Role~ roles
    }

    class Role {
        +Long roleId
        +String roleName
        +Set~Permission~ permissions
    }

    class Permission {
        +Long id
        +String module
        +String action
    }

    User "1" --> "*" Role : has
    Role "*" --> "*" Permission : grants
```

---

## Class Diagram - Gym & Membership

```mermaid
classDiagram
    direction LR
    class Gym {
        +Long gymId
        +String name
        +String address
        +String city
        +User owner
        +Boolean isPublic
    }

    class Membership {
        +Long id
        +Gym gym
        +User user
        +Package package
        +Status status
        +Date start
        +Date end
    }

    class MembershipPackage {
        +Long id
        +String name
        +Double price
        +Integer days
        +Integer sessions
    }

    Gym "1" --> "*" Membership : has
    Membership "*" --> "1" MembershipPackage : uses
```

---

## Class Diagram - Training & Sessions

```mermaid
classDiagram
    class PTSession {
        +Long sessionId
        +User trainer
        +User member
        +DateTime sessionDate
        +Integer duration
        +String status
        +String notes
    }

    class Equipment {
        +Long id
        +String name
        +String category
        +Integer quantity
        +String status
    }

    class GymClass {
        +Long classId
        +String name
        +User instructor
        +Integer capacity
        +DateTime startTime
    }

    PTSession "*" --> "1" User : trainer
    PTSession "*" --> "1" User : member
    GymClass "*" --> "1" User : instructor
```

---

## Class Diagram - Communication

```mermaid
classDiagram
    class Conversation {
        +Long id
        +String name
        +Boolean isGroup
        +User createdBy
    }

    class Message {
        +Long id
        +Conversation conversation
        +User sender
        +String content
        +Boolean isEdited
        +DateTime createdAt
    }

    class Notification {
        +Long id
        +User user
        +String title
        +String message
        +String type
        +Boolean isRead
    }

    Conversation "1" --> "*" Message : contains
    Message "*" --> "1" User : sender
    Notification "*" --> "1" User : recipient
```

---

## Use Case Diagram

```mermaid
flowchart TB
    subgraph Actors
        M((Member))
        T((Trainer))
        O((Owner))
        S((System))
    end

    subgraph Auth[Authentication]
        UC1[Register]
        UC2[Login]
        UC3[OAuth]
        UC4[2FA]
    end

    subgraph MemberActions[Member Functions]
        UC5[Dashboard]
        UC6[Book Session]
        UC7[Track Progress]
        UC8[Membership]
        UC9[Chat]
    end

    subgraph TrainerActions[Trainer Functions]
        UC10[Schedule]
        UC11[View Members]
        UC12[Create Plans]
        UC13[Add Notes]
    end

    subgraph OwnerActions[Owner Functions]
        UC14[Settings]
        UC15[Manage Staff]
        UC16[Equipment]
        UC17[Analytics]
        UC18[Approve Members]
    end

    subgraph SystemActions[System Functions]
        UC19[Notifications]
        UC20[Auto-Expire]
        UC21[Reports]
    end

    M --> Auth
    M --> MemberActions
    T --> UC2
    T --> TrainerActions
    T --> UC9
    O --> UC2
    O --> OwnerActions
    S --> SystemActions
```

---

## Sequence Diagrams

### User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as AuthController
    participant S as AuthService
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /api/auth/login
    A->>S: authenticate()
    S->>D: findByUsername()
    D-->>S: User entity
    S->>S: validatePassword()
    alt Valid
        S-->>A: JWT Token
        A-->>F: 200 OK
        F-->>U: Dashboard
    else Invalid
        S-->>A: 401 Error
        A-->>F: Unauthorized
        F-->>U: Error message
    end
```

### Membership Purchase Flow

```mermaid
sequenceDiagram
    participant M as Member
    participant F as Frontend
    participant C as Controller
    participant S as Service
    participant D as Database

    M->>F: Select Package
    F->>C: GET /api/packages
    C->>S: getActivePackages()
    S->>D: findActive()
    D-->>S: List
    S-->>C: PackageDTOs
    C-->>F: Packages
    F-->>M: Display

    M->>F: Confirm Purchase
    F->>C: POST /api/memberships
    C->>S: createMembership()
    S->>D: save()
    S-->>C: Created
    C-->>F: 201 Success
    F-->>M: Confirmation
```

### PT Session Booking Flow

```mermaid
sequenceDiagram
    participant M as Member
    participant F as Frontend
    participant C as Controller
    participant S as Service
    participant N as NotificationService
    participant D as Database

    M->>F: Select Trainer & Time
    F->>C: POST /api/pt-sessions
    C->>S: bookSession()
    S->>D: checkAvailability()
    D-->>S: Available
    S->>D: save(session)
    S->>N: notifyTrainer()
    S-->>C: SessionDTO
    C-->>F: 201 Created
    F-->>M: Booking Confirmed
```

---

## Activity Diagrams

### User Registration Process

```mermaid
flowchart TB
    A[Start] --> B{Auth Method}
    B -->|Email| C[Enter Details]
    B -->|OAuth| D[Select Provider]
    
    C --> E{Valid?}
    E -->|No| F[Show Errors] --> C
    E -->|Yes| G{Email Exists?}
    
    D --> H[Authorize]
    H --> I{User Exists?}
    I -->|Yes| J[Link Account]
    I -->|No| K[Create User]
    
    G -->|Yes| L[Email Error] --> C
    G -->|No| M[Hash Password]
    M --> N[Create User]
    N --> O[Assign Role]
    
    J --> O
    K --> O
    
    O --> P[Welcome Email]
    P --> Q[Dashboard]
    Q --> R[End]
```

### Membership Approval Workflow

```mermaid
flowchart TB
    A[New Request] --> B[Status: PENDING]
    B --> C{Owner Decision}
    
    C -->|Approve| D[Status: ACTIVE]
    D --> E[Calculate End Date]
    E --> F[Assign Benefits]
    F --> G[Approval Email]
    G --> H[Access Granted]
    
    C -->|Reject| I[Status: REJECTED]
    I --> J[Log Reason]
    J --> K[Rejection Email]
    K --> L[Notified]
    
    C -->|Need Info| M[Status: PENDING_INFO]
    M --> N[Request Info]
    N --> O[Member Responds]
    O --> C
    
    H --> P[End]
    L --> P
```

### Chat Message Flow

```mermaid
flowchart TB
    A[Type Message] --> B[Click Send]
    B --> C{Valid?}
    C -->|Empty| D[Error] --> A
    C -->|OK| E{Attachments?}
    
    E -->|Yes| F[Upload Files]
    F --> G[Get URLs]
    G --> H[Create Message]
    
    E -->|No| H
    
    H --> I[Save to DB]
    I --> J[Broadcast WS]
    J --> K[Update Sender UI]
    J --> L[Push to Recipients]
    L --> M[Show Notification]
    M --> N[Update Badge]
    N --> O[End]
    K --> O
```
