# Entity-Relationship Diagram - Gym Management System

## 1. User & Authentication Entities

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

## 2. Gym Management Entities

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

## 3. Membership Entities

```mermaid
erDiagram
    MEMBERSHIP_PACKAGES {
        bigint package_id PK
        bigint gym_id FK
        varchar package_name
        decimal price
        integer duration_days
        integer pt_sessions
        boolean is_active
    }

    MEMBERSHIPS {
        bigint membership_id PK
        bigint gym_id FK
        bigint user_id FK
        bigint package_id FK
        varchar status
        date start_date
        date end_date
        timestamp created_at
    }

    TRANSACTIONS {
        bigint transaction_id PK
        bigint membership_id FK
        bigint user_id FK
        decimal amount
        varchar type
        varchar status
        timestamp created_at
    }

    MEMBERSHIP_PACKAGES ||--o{ MEMBERSHIPS : used_in
    MEMBERSHIPS ||--o{ TRANSACTIONS : generates
```

---

## 4. Training & Session Entities

```mermaid
erDiagram
    TRAINER_ASSIGNMENTS {
        bigint assignment_id PK
        bigint trainer_id FK
        bigint member_id FK
        varchar status
        timestamp assigned_at
    }

    PT_SESSIONS {
        bigint session_id PK
        bigint trainer_id FK
        bigint member_id FK
        bigint gym_id FK
        timestamp session_date
        integer duration_min
        varchar status
        clob progress_notes
        clob workout_plan
    }

    SESSION_RATINGS {
        bigint rating_id PK
        bigint session_id FK
        bigint trainer_id FK
        bigint member_id FK
        integer rating
        varchar feedback
    }

    PROGRESS_TRACKING {
        bigint progress_id PK
        bigint member_id FK
        bigint trainer_id FK
        date record_date
        decimal weight
        decimal body_fat
        clob notes
    }

    TRAINER_ASSIGNMENTS ||--o{ PT_SESSIONS : schedules
    PT_SESSIONS ||--o| SESSION_RATINGS : rated
```

---

## 5. Communication Entities

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

## 6. Notification Entities

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

## 7. Analytics Entities

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
