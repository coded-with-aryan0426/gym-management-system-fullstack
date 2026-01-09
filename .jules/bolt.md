## 2026-01-09 - N+1 on Self-Referencing ManyToMany
**Learning:** The `User` entity had `FetchType.EAGER` on `customers` and `trainers` (self-reference). This causes massive N+1 issues when fetching lists of users, as each user fetches their related users.
**Action:** Always use `FetchType.LAZY` for collection relationships, especially self-referencing ones, and use `JOIN FETCH` or `EntityGraph` when the data is actually needed.
