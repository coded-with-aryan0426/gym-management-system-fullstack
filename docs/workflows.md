# System Workflows - Gym Management System

## 1. User Registration & Authentication

### 1.1 Registration Flow

```mermaid
flowchart LR
    subgraph Input
        A[Start] --> B{Method}
    end
    
    subgraph EmailPath[Email Registration]
        B -->|Email| C[Form]
        C --> D{Valid?}
        D -->|No| C
        D -->|Yes| E{Exists?}
        E -->|Yes| C
        E -->|No| F[Hash PWD]
    end
    
    subgraph OAuthPath[OAuth]
        B -->|Google| G[Google]
        B -->|Facebook| H[Facebook]
        G --> I[Auth]
        H --> I
        I --> J{Linked?}
        J -->|No| F
        J -->|Yes| K[Login]
    end
    
    subgraph Finish
        F --> L[Create User]
        L --> M[Assign Role]
        M --> N[Save]
        N --> O[JWT]
        K --> O
        O --> P[Dashboard]
    end
```

### 1.2 Login with 2FA

```mermaid
flowchart LR
    A[Credentials] --> B{Valid?}
    B -->|No| A
    B -->|Yes| C{Locked?}
    C -->|Yes| D[Blocked]
    C -->|No| E{2FA?}
    E -->|No| F[JWT]
    E -->|Yes| G[Send OTP]
    G --> H[Enter OTP]
    H --> I{Verify}
    I -->|No| J{Retry?}
    J -->|Yes| H
    J -->|No| K[Lock]
    I -->|Yes| F
    F --> L[Dashboard]
```

---

## 2. Membership Management

### 2.1 Purchase Flow

```mermaid
flowchart LR
    A[Login] --> B[Browse]
    B --> C[Select]
    C --> D{Member?}
    D -->|Active| E[Upgrade]
    D -->|No| F[Request]
    E --> F
    F --> G[Pending]
    G --> H[Notify Owner]
    H --> I{Decision}
    I -->|Approve| J[Active]
    I -->|Reject| K[Rejected]
    J --> L[Confirm]
```

### 2.2 Expiry Handling

```mermaid
flowchart LR
    A[Scheduler] --> B[Query All]
    B --> C{Expired?}
    C -->|No| D[Skip]
    C -->|Yes| E[Update Status]
    E --> F[Revoke]
    F --> G[Notify]
    G --> H{Grace Period?}
    H -->|Yes| I[Limited Access]
    H -->|No| J[Full Block]
```

---

## 3. Trainer-Member Interaction

### 3.1 Trainer Assignment

```mermaid
flowchart LR
    A[Browse Trainers] --> B[View Profile]
    B --> C[Request]
    C --> D[Notify Trainer]
    D --> E{Response}
    E -->|Accept| F[Add Client]
    F --> G[Enable Chat]
    G --> H[Notify Member]
    E -->|Decline| I[Suggest Others]
    E -->|Timeout| I
```

### 3.2 Progress Tracking

```mermaid
flowchart LR
    A[Trainer Views] --> B[Dashboard]
    B --> C{Action}
    C -->|Measure| D[Metrics]
    C -->|Note| E[Progress Note]
    C -->|Photo| F[Upload]
    C -->|Goal| G[Set Target]
    D --> H[Update Chart]
    E --> H
    F --> H
    G --> H
```

---

## 4. PT Session Booking

### 4.1 Session Creation

```mermaid
flowchart LR
    A[Select Trainer] --> B[Calendar]
    B --> C[Pick Slot]
    C --> D{Available?}
    D -->|No| B
    D -->|Yes| E[Confirm]
    E --> F[Create]
    F --> G[Deduct Credits]
    G --> H[Notify Both]
    H --> I[Add to Calendar]
```

### 4.2 Session Lifecycle

```mermaid
flowchart LR
    A[Created] --> B[Scheduled]
    B --> C{Action}
    C -->|Cancel| D{Notice?}
    D -->|24h+| E[Refund]
    D -->|Less| F[No-Show]
    C -->|Start| G[In Progress]
    G --> H[Complete]
    H --> I[Notes]
    I --> J[Rate]
    J --> K[Update Rating]
```

---

## 5. Chat/Messaging

### 5.1 Conversation

```mermaid
flowchart LR
    A[Open Chat] --> B{Exists?}
    B -->|Yes| C[Load]
    B -->|No| D[Select User]
    D --> E{Allowed?}
    E -->|No| F[Error]
    E -->|Yes| G[Create]
    C --> H[WebSocket]
    G --> H
    H --> I[Chat UI]
```

### 5.2 Message Sending

```mermaid
flowchart LR
    A[Type Msg] --> B{File?}
    B -->|Yes| C[Upload]
    C --> D[Get URL]
    D --> E[Create Msg]
    B -->|No| E
    E --> F[Save DB]
    F --> G[Broadcast]
    G --> H[Update UI]
    G --> I{Online?}
    I -->|Yes| J[Show]
    I -->|No| K[Notify]
```

### 5.3 Real-time Updates

**Sender Side:**

```mermaid
flowchart LR
    A[Send] --> B[Pending] --> C{OK?}
    C -->|Yes| D[Done]
    C -->|No| E[Retry] --> A
```

**Server Side:**

```mermaid
flowchart LR
    A[Receive] --> B[Validate] --> C[Save] --> D[Broadcast]
```

**Recipient Side:**

```mermaid
flowchart LR
    A[WS Event] --> B[Parse] --> C{Open?}
    C -->|Yes| D[Show] --> E[Read]
    C -->|No| F[Badge] --> G[Toast]
```

## 6. Notifications

```mermaid
flowchart LR
    A[Event] --> B{Type}
    B -->|Session| C[Session Notif]
    B -->|Message| D[Msg Notif]
    B -->|Member| E[Member Notif]
    C --> F[Save DB]
    D --> F
    E --> F
    F --> G{Online?}
    G -->|Yes| H[Push WS]
    G -->|No| I{Email?}
    I -->|Yes| J[Send Email]
    I -->|No| K[Queue]
```
