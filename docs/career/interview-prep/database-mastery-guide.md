# Database Interview Mastery: The Complete Destruction Manual 🔥

## 1. Database Fundamentals — The Foundation

| Concept | Definition | Gym System Example |
|---------|------------|-------------------|
| **Table** | A structured collection of records | `members`, `trainers`, `equipment` |
| **Primary Key (PK)** | Unique identifier for each record | `member_id`, `equipment_id` |
| **Foreign Key (FK)** | Reference to another table's PK | `trainer_id` in `training_sessions` referencing `trainers.id` |
| **Index** | Data structure for faster lookups | Index on `members.email` for login queries |

### Normalization Forms

| Form | Rule | Example Violation -> Fix |
|------|------|-------------------------|
| **1NF** | **Atomic Values** (No Lists) | `phone="555-1234, 555-5678"` -> Create `phone_numbers` table |
| **2NF** | **Full Dependency** (No Partial Keys) | `(gym_id, member_id) -> gym_name` -> Move `gym_name` to `gyms` table |
| **3NF** | **No Transitive Dependency** | `member -> trainer_id -> trainer_name` -> Remove `trainer_name` from `members` |

---

## 2. The Big Three: PK, FK, and Cascade (Deep Dive)

These features solve specific chaos problems in data management.

### 1. Primary Key (PK)
*   **The Problem:** **Identity Crisis.**
    *   "Which 'John Smith' do you mean?"
    *   Without a PK, you risk deleting multiple records by accident.
*   **The Solution:**
    *   A unique ID (e.g., `member_id = 101`).
    *   Ensures exact precision for UPDATE and DELETE operations.

### 2. Foreign Key (FK)
*   **The Problem:** **Ghost Data.**
    *   A message points to `user_id = 99`, but User 99 has been deleted.
    *   Result: Application crashes (NullPtr) when trying to load the user.
*   **The Solution:**
    *   The Database acts as a **Gatekeeper**.
    *   It rejects any data that points to a non-existent record.
    *   It ensures **Referential Integrity**.

### 3. ON DELETE CASCADE
*   **The Problem:** **The Cleanup Nightmare.**
    *   You want to delete a Gym, but it has 5,000 members and 20,000 sessions.
    *   The DB blocks the delete because of Foreign Keys.
    *   You are forced to write complex scripts to delete children first.
*   **The Solution:**
    *   **The Suicide Pact.**
    *   "If the Gym dies, automatically kill all 25,000 related records."
    *   Allows you to delete complex hierarchies with a single command.

---

## 3. Many-to-Many Relationships & Junction Tables

In a Many-to-Many relationship (e.g., **Users** and **Gyms**), you cannot link tables directly. You need a middleman called a **Junction Table**.

### Example from Your Code: `user_gym_roles`

```sql
CREATE TABLE user_gym_roles (
    user_id NUMBER,  -- Parent 1
    gym_id  NUMBER,  -- Parent 2
    
    -- THE SUICIDE PACTS (Cascade):
    CONSTRAINT fk_ugr_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE,

    CONSTRAINT fk_ugr_gym 
        FOREIGN KEY (gym_id) 
        REFERENCES gyms(gym_id) 
        ON DELETE CASCADE
);
```

*   **Junction Table:** Connects two parents.
*   **ON DELETE CASCADE:** Essential here. If a User is deleted, their "link" to the gym is instantly removed. If the Gym is deleted, the "link" is also removed. No orphaned records.

---

## 4. SQL Proficiency — Killer Queries

### Complex JOIN Example
Finding members with their assigned trainer and session count:

```sql
SELECT 
    m.full_name AS member_name,
    t.full_name AS trainer_name,
    COUNT(ts.id) AS sessions_this_month
FROM members m
LEFT JOIN trainer_member_assignments tma ON m.id = tma.member_id
LEFT JOIN trainers t ON tma.trainer_id = t.id
LEFT JOIN training_sessions ts ON m.id = ts.member_id 
GROUP BY m.id, m.full_name, t.id, t.full_name;
```

---

## 5. Performance & Security

### Indexing Strategy
*   **B-Tree:** Default. Great for exact matches (`email = '...'`) and ranges (`date > '...'`).
*   **Bitmap:** good for low cardinality (Status: Active/Inactive), common in Oracle/Data Warehouses.
*   **Rule:** Always index columns used in `JOIN`, `WHERE`, and `ORDER BY`.

### Security: SQL Injection Prevention
*   **❌ BAD:** `String query = "SELECT * FROM users WHERE email = '" + input + "'";`
*   **✅ GOOD:** `@Query("SELECT u FROM User u WHERE u.email = :email")` (Parameterized)

---

## 6. Real-World Interview Questions

**Q: "How do you handle a Many-to-Many relationship?"**
**A:** "I use a junction table. For example, in my project, `user_gym_roles` links `users` and `gyms`. I apply `ON DELETE CASCADE` to the foreign keys so that removing a user or gym automatically cleans up the association."

**Q: "Why do we index Foreign Keys?"**
**A:** "To prevent table scans during deletions. If I delete a Parent, the DB needs to check the Child table. Without an index, it has to scan the *entire* child table to find matches, which can lock the table and kill performance."
