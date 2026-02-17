# User Flow Diagrams
## AthlonX Gym Management System

### 1. Authentication & Context Flow
**Scenario**: A user logs in and selects their active gym/role context.

```mermaid
flowchart TD
    A[Landing Page] -->|Click Login| B(Login Page)
    B -->|Enter Credentials| C{Auth Success?}
    C -- No --> B
    C -- Yes --> D[Fetch User Contexts]
    D --> E{Has Multiple Contexts?}
    E -- No (Single Role) --> F[Auto-Select Gym/Role]
    E -- Yes --> G[Role/Gym Selection Screen]
    G -->|Select Staff Context| H[Admin/Staff Dashboard]
    G -->|Select Member Context| I[Member Portal]
    F -->|Staff| H
    F -->|Member| I
```

### 2. Staff Check-In Flow
**Scenario**: Front desk staff checks in a member arriving at the gym.

```mermaid
flowchart LR
    A[Staff Dashboard] -->|View 'Live Floor'| B[Check-In Panel]
    B -->|Search Member Name/ID| C{Member Found?}
    C -- No --> D[Show 'Not Found' Error]
    C -- Yes --> E{Membership Active?}
    E -- No (Expired/Pending) --> F[Alert: Access Denied]
    E -- Yes --> G[Click 'Check In']
    G --> H[Update Live Floor Counter]
    H --> I[Add to 'Current Floor' List]
```

### 3. PT Session Booking Flow
**Scenario**: A member or staff schedules a new Personal Training session.

```mermaid
flowchart TD
    A[Sessions Module] -->|Click 'New Session'| B[Select Trainer]
    B -->|Select Date| C[Fetch Available Slots]
    C --> D[Select Time Slot]
    D -->|Optional| E[Set Recurring (Weekly/Monthly)]
    E --> F[Confirm Booking]
    F --> G{Slot Available?}
    G -- No --> H[Error: Slot Taken]
    G -- Yes --> I[Create Session Record]
    I --> J[Notify Trainer & Member]
    I --> K[Update Calendar]
```

### 4. New Member Onboarding (Staff Driven)
**Scenario**: A new user walks in and staff registers them.

```mermaid
flowchart TD
    A[Staff Dashboard] -->|Members Tab| B[Member List]
    B -->|'Add Member'| C[Signup Modal]
    C -->|Enter Personal Details| D[Next: Plan Selection]
    D -->|Select Membership Package| E[Payment Recording]
    E -->|Confirm| F[Create User Account]
    F --> G[Generate Membership Record]
    G --> H[Assign Active Status]
    H --> I[Redirect to Member Profile]
```

### 5. Financial Reporting Flow
**Scenario**: Admin views monthly revenue.

```mermaid
flowchart TD
    A[Financials Page] -->|Load| B[Fetch Transaction History]
    B --> C[Calculate Totals]
    C --> D[Render Revenue Charts]
    D -->|Filter by Date| E[Update Charts]
    D -->|Switch Tab| F[View Transaction List]
    F -->|Click Transaction| G[View Payment Details]
```

### 6. Member Portal Navigation (Member Side)
**Scenario**: A logged-in member manages their gym experience.

```mermaid
flowchart TD
    A[Member Home] --> B[My Classes/Sessions]
    A --> C[Gym Directory]
    A --> D[My Profile]
    B -->|View Upcoming| B1[Session Details]
    B -->|Button: Book New| B2[Booking Flow]
    C -->|Search Gyms| C1[View Gym Details]
    C1 -->|Action: Join| C2[Submit Join Request]
    D -->|View Status| D1{Status Active?}
    D1 -- No --> D2[Renew Button]
    D2 --> D3[Contact/Payment]
```
