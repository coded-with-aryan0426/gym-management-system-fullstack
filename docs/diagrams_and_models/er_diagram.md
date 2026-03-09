# Entity-Relationship Diagram - Gym Management System

## User & Authentication Entities

```mermaid
erDiagram
    USERS {
        bigint user_id PK
        varchar username UK
        varchar password
        varchar full_name
        varchar email
        varchar phone
        varchar avatar_id
        varchar auth_provider
        boolean two_factor_enabled
        timestamp created_at
        varchar status
    }

    ROLES {
        bigint role_id PK
        varchar role_name UK
    }

    PERMISSIONS {
        bigint permission_id PK
        varchar module
        varchar action
    }

    USER_ROLE_MAP {
        bigint user_id FK
        bigint role_id FK
    }

    ROLE_PERMISSIONS {
        bigint role_id FK
        bigint permission_id FK
    }

    USERS ||--o{ USER_ROLE_MAP : has
    ROLES ||--o{ USER_ROLE_MAP : assigned
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : granted
```

---

## Gym Management Entities

```mermaid
erDiagram
    GYMS {
        bigint gym_id PK
        varchar name
        varchar address
        varchar city
        varchar phone
        varchar email
        varchar subscription_plan
        boolean is_public
        varchar invite_code UK
        bigint owner_id FK
    }

    GYM_SETTINGS {
        bigint gym_id PK
        varchar business_hours
        varchar notification_settings
        varchar branding
    }

    GYM_STAFF {
        bigint staff_id PK
        bigint gym_id FK
        bigint user_id FK
        varchar role
        varchar status
    }

    EQUIPMENT {
        bigint equipment_id PK
        bigint gym_id FK
        varchar name
        varchar category
        integer quantity
        varchar status
        date purchase_date
    }

    GYMS ||--|| GYM_SETTINGS : has
    GYMS ||--o{ GYM_STAFF : employs
    GYMS ||--o{ EQUIPMENT : owns
```

---

## Membership Entities

```mermaid
erDiagram
    MEMBERSHIP_PACKAGES ||--o{ MEMBERSHIPS : "used_in"
    MEMBERSHIPS ||--o{ TRANSACTIONS : "generates"

    MEMBERSHIP_PACKAGES {
        bigint package_id PK
        bigint gym_id FK
        varchar name
        decimal price
        int duration
        int sessions
    }

    MEMBERSHIPS {
        bigint id PK
        bigint gym_id FK
        bigint user_id FK
        bigint pkg_id FK
        varchar status
        date start
        date end
    }

    TRANSACTIONS {
        bigint id PK
        bigint member_id FK
        bigint user_id FK
        decimal amount
        varchar type
        varchar status
    }
```

---

## Training & Session Entities

```mermaid
erDiagram
    TRAINER_ASSIGNMENTS ||--o{ PT_SESSIONS : "schedules"
    PT_SESSIONS ||--o| SESSION_RATINGS : "rated"
    PT_SESSIONS ||--o{ PROGRESS_TRACKING : "tracks"

    TRAINER_ASSIGNMENTS {
        bigint id PK
        bigint trainer FK
        bigint member FK
        varchar status
        timestamp date
    }

    PT_SESSIONS {
        bigint id PK
        bigint trainer FK
        bigint member FK
        bigint gym FK
        timestamp date
        int duration
        varchar status
    }

    SESSION_RATINGS {
        bigint id PK
        bigint session FK
        int rating
        text feedback
    }

    PROGRESS_TRACKING {
        bigint id PK
        bigint member FK
        date date
        decimal weight
        decimal fat
    }
```

---

## Communication Entities

```mermaid
erDiagram
    CONVERSATIONS {
        bigint conversation_id PK
        varchar name
        boolean is_group
        bigint created_by FK
        timestamp created_at
    }

    CONVERSATION_PARTICIPANTS {
        bigint conversation_id FK
        bigint user_id FK
        timestamp joined_at
    }

    MESSAGES {
        bigint message_id PK
        bigint conversation_id FK
        bigint sender_id FK
        clob content
        boolean is_edited
        boolean is_deleted
        timestamp created_at
    }

    MESSAGE_ATTACHMENTS {
        bigint attachment_id PK
        bigint message_id FK
        varchar file_url
        varchar file_type
        bigint file_size
    }

    CONVERSATIONS ||--o{ CONVERSATION_PARTICIPANTS : has
    CONVERSATIONS ||--o{ MESSAGES : contains
    MESSAGES ||--o{ MESSAGE_ATTACHMENTS : has
```

---

## Notification Entities

```mermaid
erDiagram
    NOTIFICATIONS {
        bigint notification_id PK
        bigint user_id FK
        varchar title
        varchar message
        varchar type
        boolean is_read
        timestamp created_at
    }

    NOTIFICATION_SETTINGS {
        bigint user_id PK
        boolean email_enabled
        boolean push_enabled
        boolean sms_enabled
    }

    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--|| NOTIFICATION_SETTINGS : configures
```

---

## Analytics Entities

```mermaid
erDiagram
    GYM_ANALYTICS {
        bigint analytics_id PK
        bigint gym_id FK
        date period_date
        integer active_members
        decimal revenue
        integer new_members
        integer sessions_completed
    }

    TRAINER_STATS {
        bigint stats_id PK
        bigint trainer_id FK
        date period_date
        integer sessions_count
        decimal avg_rating
        integer active_clients
    }

    GYMS ||--o{ GYM_ANALYTICS : tracks
```

---

## Entity Summary Table

| Category | Entities | Key Relationships |
|----------|----------|-------------------|
| **Auth** | Users, Roles, Permissions | Many-to-many via mapping tables |
| **Gym** | Gyms, Settings, Staff, Equipment | Owner-owned, one-to-many |
| **Members** | Packages, Memberships, Transactions | Package → Membership → Transaction |
| **Training** | Assignments, Sessions, Ratings, Progress | Trainer-Member assignments |
| **Chat** | Conversations, Messages, Attachments | Conversation hierarchy |
| **Notify** | Notifications, Settings | User notifications |
| **Analytics** | Gym Analytics, Trainer Stats | Period-based aggregations |
