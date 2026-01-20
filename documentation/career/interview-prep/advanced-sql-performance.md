# Module 2: Advanced SQL & Performance Warfare 🚀

## 1. Indexing: The Art of Speed

Indexing is not just "adding an index." It's about choosing the *right* weapon for the terrain.

### The Index Types
| Type | Use Case | How it Works | Limitation |
|------|----------|--------------|------------|
| **B-Tree** (Default) | `=`, `>`, `<`, `BETWEEN`, `ORDER BY` | Balanced Tree structure. O(log n) lookup. | Slows down inserts (tree re-balancing). |
| **Hash Index** | Only `=` (Exact Match) | Key -> Memory Address mapping. O(1) lookup. | Cannot handle ranges (`> 50`) or sorting. |
| **Composite Index**| Multiple columns (`last_name`, `first_name`) | optimized for "Leftmost Prefix" queries. | Order matters! Index on (A, B) won't help query on B alone. |

### The "Leftmost Prefix" Rule (Interview Gold)
If you have an index on `(gym_id, status, created_at)`:
*   ✅ Query on `gym_id` -> **Uses Index**
*   ✅ Query on `gym_id` AND `status` -> **Uses Index**
*   ❌ Query on `status` only -> **Index Scan (Slow)** or **Full Table Scan (Deadly)**, because the tree is sorted by `gym_id` first.

---

## 2. Query Optimization Strategies

### A. The "N+1" Problem (The Silent Killer)
**Scenario:** You want to load 10 trainers and their profile pictures.
*   **The Bad Code (ORM/Hibernate default):**
    1.  `SELECT * FROM trainers LIMIT 10` (1 Query)
    2.  For each trainer, `SELECT * FROM images WHERE trainer_id = ?` (10 Queries)
    *   **Total:** 11 Queries for 1 screen.
    *   **Scale:** 1000 trainers = 1001 queries. Database dies.
*   **The Fix:** **JOIN FETCH**
    ```sql
    SELECT t FROM Trainer t JOIN FETCH t.images
    ```
    *   **Total:** 1 Query.

### B. Understanding `EXPLAIN PLAN`
Before running a heavy query, ask the DB how it usually plans to execute it.
*   **Table Scan:** The DB reads every single row. (Bad, unless table is tiny).
*   **Index Scan:** The DB scans the index keys but not the data. (Better).
*   **Index Seek / Unique Scan:** The DB jumps directly to the row. (Best).

**Interview Answer:**
"I always check `EXPLAIN ANALYZE` on my complex queries. If I see a `Seq Scan` (Sequential scan) on a large table, I know I'm missing an index or my query is non-sargable (e.g., using `LIKE '%term'` starting with a wildcard)."

---

## 3. Transaction Management (ACID)

**ACID** is the promise relational databases make to you.

*   **A - Atomicity:** "All or Nothing." If you transfer money and the "Deposit" fails, the "Withdrawal" must typically rollback.
*   **C - Consistency:** The DB follows rules (Constraints, FKs). It won't let you save an invalid state.
*   **I - Isolation:** "What happens in Vegas stays in Vegas." My transaction shouldn't see your half-finished transaction.
*   **D - Durability:** Once you say `COMMIT`, it's saved on disk. Even if the power goes out 1ms later.

### Isolation Levels (The Danger Zone)
Trade-off between Performance and Safety.

1.  **Read Uncommitted:** You can see dirty data (uncommitted changes). Fast but dangerous.
2.  **Read Committed:** (Default for Postgres/Oracle). You only see committed data.
3.  **Repeatable Read:** (Default for MySQL). If I read a row, nobody else can modify it until I'm done. Prevents "Non-repeatable reads".
4.  **Serializable:** Strict Line. One at a time. Slowest, but safest.

---

## 4. Advanced SQL Patterns

### Common Table Expressions (CTEs)
Makes complex queries readable.

```sql
WITH TopGyms AS (
    SELECT gym_id, COUNT(*) as member_count 
    FROM members 
    GROUP BY gym_id 
    HAVING COUNT(*) > 100
),
Revenue AS (
    SELECT gym_id, SUM(amount) as total_rev
    FROM transactions
    GROUP BY gym_id
)
SELECT g.name, r.total_rev
FROM gyms g
JOIN TopGyms t ON g.id = t.gym_id
JOIN Revenue r ON g.id = r.gym_id;
```

### Window Functions
Perform calculations across a set of rows related to the current row.

```sql
-- "Show me the top 3 trainers per gym based on revenue"
SELECT * FROM (
    SELECT 
        trainer_name, 
        gym_id, 
        revenue,
        RANK() OVER (PARTITION BY gym_id ORDER BY revenue DESC) as rank
    FROM trainer_stats
) WHERE rank <= 3;
```
