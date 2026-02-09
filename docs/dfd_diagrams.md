# Data Flow Diagrams - Gym Management System

## Level 0: Context Diagram

```mermaid
flowchart LR
    M((Member))
    T((Trainer))
    O((Owner))
    P((Payment))
    E((Email))
    
    S[Gym Management System]
    
    M -->|Register, Book| S
    S -->|Dashboard, Notify| M
    
    T -->|Sessions, Notes| S
    S -->|Schedule, Data| T
    
    O -->|Config, Staff| S
    S -->|Analytics, Reports| O
    
    S -->|Pay Request| P
    P -->|Status| S
    
    S -->|Emails| E
    E -->|Delivery| S
```

---

## Level 1: Main Processes

```mermaid
flowchart LR
    subgraph Actors
        M((Member))
        T((Trainer))
        O((Owner))
    end

    subgraph Core[Core Processes]
        P1[1.0 Auth]
        P2[2.0 Membership]
        P3[3.0 Training]
        P4[4.0 Chat]
        P5[5.0 Analytics]
        P6[6.0 Admin]
    end

    subgraph Storage[Data Stores]
        D1[(Users)]
        D2[(Members)]
        D3[(Sessions)]
        D4[(Messages)]
    end

    M --> P1
    T --> P1
    O --> P1
    P1 --> D1
    
    M --> P2
    P2 --> D2
    
    M --> P3
    T --> P3
    P3 --> D3
    
    M --> P4
    T --> P4
    P4 --> D4
    
    O --> P5
    O --> P6
```

---

## Level 2: Detailed Sub-Processes

### 2.1 Authentication (Process 1.0)

```mermaid
flowchart LR
    U((User)) --> V[Validate]
    OA((OAuth)) --> H[Handler]
    
    V --> D1[(Users)]
    H --> V
    V --> R[Roles]
    R --> D2[(Roles)]
    R --> TFA[2FA]
    TFA --> D3[(OTP)]
    TFA --> J[JWT Gen]
    J --> U
```

### 2.2 Membership (Process 2.0)

```mermaid
flowchart LR
    M((Member)) --> B[Browse]
    O((Owner)) --> A[Approve]
    PG((Payment)) --> PR[Process]
    
    B --> D1[(Packages)]
    B --> C[Create]
    C --> D2[(Memberships)]
    C --> PR
    PR --> D3[(Transactions)]
    PR --> A
    A --> D2
    A --> ACT[Activate]
    ACT --> M
```

### 2.3 Training (Process 3.0)

```mermaid
flowchart LR
    M((Member)) --> DIS[Discover]
    T((Trainer)) --> EX[Execute]
    
    DIS --> D1[(Trainers)]
    DIS --> BK[Book]
    BK --> CHK[Check Avail]
    CHK --> D1
    BK --> D2[(Sessions)]
    BK --> T
    
    EX --> D2
    EX --> TR[Track]
    TR --> D3[(Progress)]
    
    M --> RT[Rate]
    RT --> D4[(Ratings)]
```

### 2.4 Communication (Process 4.0)

```mermaid
flowchart LR
    U1((User1)) --> CM[Conv Mgr]
    U2((User2))
    
    CM --> D1[(Conversations)]
    CM --> MH[Msg Handler]
    MH --> D2[(Messages)]
    MH --> AT[Attachments]
    AT --> D3[(Files)]
    MH --> WS[WebSocket]
    WS --> U2
    MH --> NE[Notify]
    NE --> D4[(Notifications)]
    NE --> U2
```

### 2.5 Analytics (Process 5.0)

```mermaid
flowchart LR
    O((Owner)) --> RG[Report Gen]
    T((Trainer)) --> TP[Performance]
    
    AG[Aggregator] --> D1[(Transactions)]
    AG --> D2[(Memberships)]
    AG --> D3[(Sessions)]
    
    AG --> RC[Revenue Calc]
    AG --> MS[Member Stats]
    AG --> TP
    
    RC --> RG
    MS --> RG
    TP --> RG
    RG --> D4[(Cache)]
    RG --> O
    TP --> T
```

---

## Data Dictionary

| Store | Description | Key Fields |
|-------|-------------|------------|
| Users | System users | user_id, email, roles |
| Memberships | Subscriptions | id, user_id, status |
| Sessions | PT records | id, trainer_id, date |
| Messages | Chat messages | id, content |
| Transactions | Payments | id, amount, status |
