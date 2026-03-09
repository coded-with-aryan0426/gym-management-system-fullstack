# System Workflows - Gym Management System

## User Registration & Authentication

### Registration Flow

```mermaid
flowchart TB
    A[Start] --> B{Method}
    
    B -->|Email| C[Fill Form]
    B -->|Google| D[OAuth]
    B -->|Facebook| D
    
    C --> E{Valid?}
    E -->|No| C
    E -->|Yes| F{Exists?}
    F -->|Yes| C
    F -->|No| G[Hash Password]
    
    D --> H{Linked?}
    H -->|Yes| I[Login]
    H -->|No| G
    
    G --> J[Create User]
    J --> K[Assign Role]
    K --> L[Generate JWT]
    I --> L
    L --> M[Dashboard]
```

### Login with 2FA

```mermaid
flowchart TB
    A[Enter Credentials] --> B{Valid?}
    B -->|No| A
    B -->|Yes| C{Locked?}
    C -->|Yes| D[Account Blocked]
    C -->|No| E{2FA Enabled?}
    E -->|No| F[Generate JWT]
    E -->|Yes| G[Send OTP]
    G --> H[Enter OTP]
    H --> I{Verify}
    I -->|No| J{Retry?}
    J -->|Yes| H
    J -->|No| K[Lock Account]
    I -->|Yes| F
    F --> L[Go to Dashboard]
```

---

## Membership Management

### Purchase Flow

```mermaid
flowchart TB
    A[Login] --> B[Browse Packages]
    B --> C[Select Package]
    C --> D{Active Member?}
    D -->|Yes| E[Upgrade Request]
    D -->|No| F[New Request]
    E --> G[Pending Approval]
    F --> G
    G --> H[Notify Owner]
    H --> I{Decision}
    I -->|Approve| J[Activate Membership]
    I -->|Reject| K[Send Rejection]
    J --> L[Confirmation Email]
```

### Expiry Handling

```mermaid
flowchart TB
    A[Daily Scheduler] --> B[Query All Memberships]
    B --> C{Expired?}
    C -->|No| D[Skip]
    C -->|Yes| E[Update Status]
    E --> F[Revoke Access]
    F --> G[Notify Member]
    G --> H{Grace Period?}
    H -->|Yes| I[Limited Access]
    H -->|No| J[Full Block]
```

---

## Trainer-Member Interaction

### Trainer Assignment

```mermaid
flowchart TB
    A[Browse Trainers] --> B[View Profile]
    B --> C[Send Request]
    C --> D[Notify Trainer]
    D --> E{Response}
    E -->|Accept| F[Add to Client List]
    E -->|Decline| G[Suggest Others]
    E -->|Timeout| G
    F --> H[Enable Chat]
    H --> I[Notify Member]
```

### Progress Tracking

```mermaid
flowchart TB
    A[Trainer Opens Dashboard] --> B{Select Action}
    B -->|Metrics| C[Record Measurements]
    B -->|Notes| D[Add Progress Notes]
    B -->|Photos| E[Upload Photos]
    B -->|Goals| F[Set Targets]
    C --> G[Update Chart]
    D --> G
    E --> G
    F --> G
    G --> H[Save to DB]
```

---

## PT Session Booking

### Session Creation

```mermaid
flowchart TB
    A[Select Trainer] --> B[Open Calendar]
    B --> C[Pick Time Slot]
    C --> D{Available?}
    D -->|No| B
    D -->|Yes| E[Confirm Booking]
    E --> F[Create Session]
    F --> G[Deduct Credits]
    G --> H[Notify Both]
    H --> I[Add to Calendar]
```

### Session Lifecycle

```mermaid
flowchart TB
    A[Created] --> B[Scheduled]
    B --> C{Action}
    C -->|Cancel| D{24h Notice?}
    D -->|Yes| E[Full Refund]
    D -->|No| F[Mark No-Show]
    C -->|Start| G[In Progress]
    G --> H[Mark Complete]
    H --> I[Add Notes]
    I --> J[Request Rating]
    J --> K[Update Trainer Rating]
```

---

## Chat/Messaging

### Conversation

```mermaid
flowchart TB
    A[Open Chat] --> B{Exists?}
    B -->|Yes| C[Load History]
    B -->|No| D[Select User]
    D --> E{Allowed?}
    E -->|No| F[Show Error]
    E -->|Yes| G[Create Conversation]
    C --> H[Connect WebSocket]
    G --> H
    H --> I[Show Chat UI]
```

### Message Flow

```mermaid
flowchart TB
    A[Type Message] --> B{Has Attachment?}
    B -->|Yes| C[Upload File]
    C --> D[Get URL]
    D --> E[Create Message]
    B -->|No| E
    E --> F[Save to DB]
    F --> G[Broadcast via WS]
    G --> H{Recipient Online?}
    H -->|Yes| I[Show in Chat]
    H -->|No| J[Send Push Notification]
```

### Message Delivery Status

```mermaid
flowchart TB
    subgraph Sender
        S1[Send] --> S2[Pending]
        S2 --> S3{ACK?}
        S3 -->|Yes| S4[Delivered]
        S3 -->|No| S5[Retry]
        S5 --> S1
    end
    
    subgraph Server
        V1[Receive] --> V2[Validate]
        V2 --> V3[Persist]
        V3 --> V4[Broadcast]
    end
    
    subgraph Recipient
        R1[WS Event] --> R2{Chat Open?}
        R2 -->|Yes| R3[Display]
        R2 -->|No| R4[Badge + Toast]
    end
```

---

## Notifications

```mermaid
flowchart TB
    A[System Event] --> B{Event Type}
    B -->|Session| C[Session Notification]
    B -->|Message| D[Message Notification]
    B -->|Membership| E[Membership Notification]
    C --> F[Save to DB]
    D --> F
    E --> F
    F --> G{User Online?}
    G -->|Yes| H[Push via WebSocket]
    G -->|No| I{Email Enabled?}
    I -->|Yes| J[Send Email]
    I -->|No| K[Queue for Later]
```
