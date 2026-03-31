# Titan Protocol: Database & Scalability Report

## 🗄️ Executive Summary
This report details the database strategy to scale from **1 Gym to 10,000 Gyms**. The current database setup is suitable for development but lacks the robustness required for a high-availability SaaS.

**Current Status**: ⚠️ **Fragile** (Missing schema management and tuning)

---

## 1. Schema Management (The Foundation)

### 🧱 Infrastructure as Code
*   **Issue**: Schema changes rely on `hibernate.ddl-auto` or manual SQL. This is disastrous in production (risk of accidental `DROP TABLE`).
*   **Fix**: Implement **Flyway** or **Liquibase**.
    *   Version controlled SQL scripts (e.g., `V1__init.sql`, `V2__add_gym_id.sql`).
    *   Guarantees all production nodes have the EXACT same schema.

---

## 2. Performance Tuning

### 🏊 Connection Pooling (HikariCP)
*   **Issue**: Relying on default settings.
*   **Optimization**:
    *   `maximum-pool-size`: Set based on CPU cores (e.g., `(core_count * 2) + effective_spindle_count`).
    *   `connection-timeout`: Fail fast (e.g., 3000ms) rather than hang.
    *   `idle-timeout`: Release unused connections (e.g., 60000ms).

### 🔍 Indexing Strategy
*   **Missing**: Indexes on frequently searched columns.
*   **Action**: Add B-Tree indexes on:
    *   `users(email)` (Login speed)
    *   `users(gym_id)` (Tenant filtering efficiency)
    *   `memberships(end_date)` (Expiring member queries)

---

## 3. Scalability Architecture

### 🕸️ Read/Write Splitting (Future)
*   **Design**: Use a **Primary DB** for Writes (INSERT/UPDATE) and **Read Replicas** for heavy Dashboards/Reports.
*   **Implementation**: Configure Spring's `AbstractRoutingDataSource` to route `@Transactional(readOnly = true)` queries to replicas.

### 🐘 Advanced Data Types (PostgreSQL Migration?)
*   **Proposal**: While Oracle is powerful, **PostgreSQL** is the SaaS industry standard for cost/performance.
*   **Why**: Native JSONB support allows storing flexible "Gym Configs" without altering schema.

---

## ✅ Implementation Checklist

- [ ] **Phase 1**: Add **Flyway** dependency and create baseline script. (Time: 3 hours)
- [ ] **Phase 2**: Add Indexes to `gym_id`, `email`, `role`. (Time: 1 hour)
- [ ] **Phase 3**: Tune HikariCP in `application.properties`. (Time: 30 mins)
- [ ] **Phase 4**: Implement Redis for Session/Cache storage. (Time: 4 hours)
