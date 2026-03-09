# System Architecture - Gym Management System

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client Layer
        WEB[Web Browser]
        MOB[Mobile App]
    end

    subgraph Frontend ["Frontend (React + TypeScript)"]
        UI[UI Components]
        CTX[Context Providers]
        SVC[API Services]
        WS[WebSocket Client]
    end

    subgraph API Gateway ["API Gateway (Spring Boot)"]
        AUTH[Auth Filter]
        CORS[CORS Config]
        CTRL[REST Controllers]
    end

    subgraph Business Layer ["Business Logic Layer"]
        SRVC[Services]
        SEC[Security]
        EVT[Event Publisher]
    end

    subgraph Data Access ["Data Access Layer"]
        REPO[JPA Repositories]
        CACHE[Spring Cache]
    end

    subgraph External Services
        OAUTH[OAuth Providers]
        EMAIL[Email Service]
        SMS[SMS Service]
    end

    subgraph Database
        ORACLE[(Oracle DB)]
    end

    WEB & MOB --> UI
    UI --> CTX
    CTX --> SVC
    SVC --> CTRL
    UI <--> WS

    AUTH --> CORS --> CTRL
    CTRL --> SRVC
    SRVC --> SEC
    SRVC --> EVT
    
    SRVC --> REPO
    REPO --> CACHE
    CACHE --> ORACLE

    SEC <--> OAUTH
    EVT --> EMAIL & SMS
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Vite** | 5.x | Build Tool |
| **React Router** | 6.x | Client Routing |
| **Axios** | 1.x | HTTP Client |
| **Socket.io Client** | 4.x | Real-time Communication |
| **Framer Motion** | 10.x | Animations |
| **Lucide React** | - | Icons |
| **Recharts** | 2.x | Data Visualization |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.x | Application Framework |
| **Java** | 17+ | Programming Language |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | Data Access |
| **Spring WebSocket** | - | Real-time Messaging |
| **Hibernate** | 6.x | ORM |
| **Lombok** | 1.18.x | Boilerplate Reduction |
| **JJWT** | 0.11.x | JWT Handling |

### Database & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Oracle Database** | Primary Data Store |
| **Spring Cache** | Response Caching |
| **HikariCP** | Connection Pooling |

### External Services

| Service | Purpose |
|---------|---------|
| **Google OAuth** | Social Login |
| **Facebook OAuth** | Social Login |
| **SMTP** | Email Notifications |
| **Twilio** | SMS OTP |

---

## Component Architecture

```mermaid
flowchart LR
    subgraph Frontend Components
        subgraph Pages
            LP[Landing Page]
            AUTH[Auth Pages]
            MD[Member Dashboard]
            TD[Trainer Dashboard]
            OD[Owner Dashboard]
        end

        subgraph Shared
            NAV[Navigation]
            CHAT[Chat Widget]
            NOTIF[Notifications]
        end

        subgraph Contexts
            AC[AuthContext]
            TC[ThemeContext]
            NC[NotificationContext]
        end
    end

    subgraph Backend Services
        subgraph Controllers
            AuthC[AuthController]
            UserC[UserController]
            MemC[MembershipController]
            PTc[PTSessionController]
            ChatC[ChatController]
        end

        subgraph Services
            AuthS[AuthService]
            UserS[UserService]
            MemS[MembershipService]
            PTs[PTSessionService]
            ChatS[ChatService]
        end

        subgraph Security
            JWT[JwtProvider]
            RBAC[PermissionService]
        end
    end

    LP & AUTH & MD & TD & OD --> NAV
    MD & TD --> CHAT & NOTIF
    
    AC --> AuthC
    AuthC --> AuthS --> JWT
    UserC --> UserS --> RBAC
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant G as API Gateway
    participant A as AuthService
    participant J as JwtProvider
    participant D as Database

    C->>F: Login Request
    F->>G: POST /api/auth/login
    G->>A: authenticate()
    A->>D: findUser()
    D-->>A: User
    A->>A: validatePassword()
    A->>J: generateToken(user, roles)
    J-->>A: JWT Token
    A-->>G: AuthResponse
    G-->>F: {token, user, roles}
    F->>F: Store in localStorage
    F-->>C: Redirect to Dashboard

    Note over F,G: Subsequent Requests
    F->>G: Request + Bearer Token
    G->>J: validateToken()
    J-->>G: Claims
    G->>G: Check Permissions
    G-->>F: Protected Resource
```

---

## Database Architecture

```mermaid
flowchart TB
    subgraph Core Tables
        USERS[(users)]
        ROLES[(roles)]
        PERMS[(permissions)]
    end

    subgraph Gym Tables
        GYMS[(gyms)]
        SETTINGS[(gym_settings)]
        STAFF[(gym_staff)]
    end

    subgraph Membership Tables
        MEMBERSHIPS[(memberships)]
        PACKAGES[(membership_packages)]
    end

    subgraph Training Tables
        SESSIONS[(pt_sessions)]
        TRAINERS[(trainer_details)]
        RATINGS[(session_ratings)]
    end

    subgraph Communication Tables
        CONVOS[(conversations)]
        MESSAGES[(messages)]
        NOTIFS[(notifications)]
    end

    USERS --> ROLES
    USERS --> GYMS
    GYMS --> SETTINGS
    GYMS --> STAFF
    USERS --> MEMBERSHIPS
    MEMBERSHIPS --> PACKAGES
    USERS --> SESSIONS
    SESSIONS --> RATINGS
    USERS --> CONVOS
    CONVOS --> MESSAGES
    USERS --> NOTIFS
```

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Client
        BROWSER[Web Browser]
    end

    subgraph Frontend Hosting
        STATIC[Static Files - Vercel/Netlify]
    end

    subgraph Backend Hosting
        API[Spring Boot App]
        WS[WebSocket Server]
    end

    subgraph Database Tier
        DB[(Oracle Database)]
    end

    subgraph External
        GOOGLE[Google OAuth]
        FB[Facebook OAuth]
        MAIL[SMTP Server]
    end

    BROWSER --> STATIC
    BROWSER --> API
    BROWSER <--> WS
    API --> DB
    API <--> GOOGLE & FB
    API --> MAIL
```

---

## Security Architecture

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| **Transport** | TLS/HTTPS | SSL Certificate |
| **Authentication** | JWT | Spring Security + JJWT |
| **Authorization** | RBAC | Custom Permission Service |
| **Password** | BCrypt | Spring Security |
| **Session** | Stateless | JWT Tokens |
| **2FA** | OTP | Email/SMS Verification |
| **Data** | Soft Deletes | Entity Annotations |
| **CORS** | Whitelist | Spring CORS Config |

---

## Scalability Considerations

1. **Multi-Tenancy**: Each gym is a separate tenant with isolated data
2. **Caching**: Spring Cache for frequently accessed data
3. **Connection Pooling**: HikariCP for database connections
4. **Lazy Loading**: JPA relationship optimization
5. **Stateless Auth**: JWT enables horizontal scaling
6. **WebSocket**: Dedicated connection management for real-time features
