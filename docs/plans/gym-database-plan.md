# Gym Database Migration Plan: Single DB → Multi-Tenant SaaS (Isolated Oracle DB per Gym)

## 1) Executive Summary

This document defines the end-to-end migration from the current shared-database architecture to a strict multi-tenant SaaS model where each gym runs in its own isolated Oracle database (`{gym_name}_db`).  

Primary outcomes:

- Zero cross-gym data leakage
- Independent scaling and failure domains per gym
- Auditable tenant boundaries with strong RBAC and encryption
- 99.9% uptime target during migration

---

## 2) Target Architecture Overview

### 2.1 High-Level Components

- **Control Plane (Master/Platform DB)**  
  Stores tenant metadata, provisioning state, connection descriptors, billing/subscription state, and platform-level audit events.

- **Tenant Data Plane (Per-Gym Oracle DB)**  
  One Oracle database per gym, named `{gym_name}_db` (normalized to lowercase snake_case + unique suffix for collisions).

- **Tenant Router Layer (API Middleware + Connection Factory)**  
  Resolves gym context from auth token/request, fetches tenant connection config, and routes requests to correct DB.

- **Observability Plane**  
  Centralized metrics/logging/tracing, per-tenant health and performance telemetry.

---

## 3) Database Architecture

### 3.1 Master Database Template (Schema Blueprint)

A single canonical schema template (`schema_master_v1`) will be maintained in version-controlled migrations and used to provision every new gym DB with identical structure.

Core table domains (minimum):

- **Identity & Access**
  - `users`
  - `roles`
  - `permissions`
  - `user_role_map`
  - `sessions`
  - `otp_codes`

- **Gym Core**
  - `gym_profile`
  - `gym_settings`
  - `business_hours`
  - `feature_flags`

- **People**
  - `owners`
  - `staff`
  - `trainers`
  - `members`
  - `member_preferences`
  - `emergency_contacts`

- **Operations**
  - `memberships`
  - `membership_packages`
  - `attendance`
  - `check_ins`
  - `trainer_assignments`
  - `classes`
  - `bookings`

- **Financial**
  - `transactions`
  - `invoices`
  - `payment_methods`
  - `billing_settings`

- **Communication & Auditing**
  - `notifications`
  - `messages`
  - `audit_logs`
  - `outbox_events`

All tenant DBs must be created only from this migration chain (Flyway/Liquibase) to guarantee identical schema and deterministic versioning.

### 3.2 Automated Database Provisioning on Owner Signup

When owner signup is completed (including OTP verification):

1. Create tenant record in control plane with status `PROVISIONING`
2. Normalize gym name and compute DB name:
   - `db_name = "{gym_name_normalized}_db"`
   - collision handling: append numeric/ULID suffix
3. Trigger provisioning workflow:
   - Create Oracle pluggable database (PDB) or isolated instance (environment-based)
   - Apply `schema_master_v1` migrations
   - Create app service account + least privilege grants
   - Store encrypted connection metadata in control plane
4. Run tenant bootstrap seed:
   - owner user
   - default roles/permissions
   - gym settings
5. Mark tenant status `ACTIVE`
6. Return success + tenant context to app

Provisioning must be asynchronous with idempotent retry support and dead-letter handling.

### 3.3 Connection Pooling Strategy

Use a **pool-per-tenant with bounded lifecycle**:

- Global registry: `tenant_id -> HikariDataSource`
- Lazy initialization on first request
- LRU eviction for idle tenants (e.g., idle > 30 min)
- Max active pools cap with backpressure
- Per-pool settings:
  - `maximumPoolSize`: 10–30 (tier-based)
  - `minimumIdle`: 1–3
  - `connectionTimeout`: 2s
  - `validationTimeout`: 1s
  - `maxLifetime`: < Oracle server timeout
- Circuit breaker disables unhealthy tenant pool temporarily

---

## 4) API Layer Modifications

### 4.1 Gym Identification Middleware

Add middleware/filter in backend request pipeline:

- Extract `gymId` from signed JWT claim (`activeGymId`) as primary source
- Optional fallback to header `X-Gym-ID` only for privileged admin endpoints
- Validate gym ownership/membership in control plane
- Attach `TenantContext` to request scope/thread context

Reject request if:

- Missing gym context
- Gym not active
- User not authorized for that gym

### 4.2 Database Connection Factory

Create `TenantConnectionFactory` service:

- Input: `tenantId` or `gymId`
- Lookup encrypted DSN/credentials from control plane
- Decrypt via KMS/HSM
- Return pooled datasource from registry
- On cache miss, instantiate pool and register

Integrate with:

- Dynamic `AbstractRoutingDataSource`
- Tenant-aware transaction manager
- Repository layer context propagation

### 4.3 Validation + Retry Logic

For each DB interaction:

- Pre-flight `isValid()` check for stale connections
- Retry policy (transient failures only):
  - max attempts: 3
  - exponential backoff: 100ms, 300ms, 900ms
- Circuit breaker opens after threshold failures
- Graceful API responses:
  - `503 TENANT_DB_UNAVAILABLE`
  - include correlation id for support

---

## 5) Security Requirements

### 5.1 RBAC Isolation

- Owner role scoped to one gym/tenant only
- JWT must include:
  - `tenantId`
  - `activeGymId`
  - role claims
- Middleware verifies token tenant matches requested context
- No cross-tenant query path in application code

### 5.2 Encryption

- **At rest**:
  - Oracle TDE for all tenant databases
  - encrypted backup storage
- **In transit**:
  - TLS 1.2+ app ↔ DB
  - mTLS for internal service-to-service where feasible
- **Field-level encryption/tokenization**:
  - payment references
  - government IDs / PII sensitive fields

### 5.3 Cross-Database Access Audit

Central audit log (control plane) for:

- tenant resolution events
- denied tenant access attempts
- privileged admin operations
- connection failures and retries

Audit fields:

- timestamp, userId, tenantId, resolvedTenantId, endpoint, action, decision, reason, requestId, sourceIP

Alerting:

- immediate security alert on cross-tenant mismatch attempts

---

## 6) Migration Strategy

### 6.1 Data Split Plan

Current shared DB → N tenant DBs:

1. Inventory all tables and tenant key columns (`gym_id`, owner references)
2. Build export mapping per gym
3. For each gym:
   - provision target DB
   - run schema migrations
   - import tenant-scoped data subset
4. Validate row counts/checksums per table
5. Execute dual-write shadow window (optional but recommended)
6. Cut over tenant traffic gradually

### 6.2 Migration Scripts

Script families:

- `extract_shared_to_tenant.sql` (parameterized by gym_id)
- `transform_reference_integrity.sql`
- `load_tenant_schema.sql`
- `post_load_validation.sql`
- `reconcile_reports.sql`

Execution orchestration:

- controlled batch runner with idempotent checkpoints
- progress persisted in control plane (`migration_jobs`)

### 6.3 Rollback Procedures

Per-tenant rollback (preferred):

1. Route affected tenant back to shared DB read/write path
2. Restore latest tenant pre-cutover snapshot
3. Replay buffered writes (if dual-write enabled)
4. Mark tenant migration state `ROLLED_BACK`

Global rollback:

- switch traffic routing flag at gateway/API layer
- disable tenant routing middleware in safe mode

Rollback RTO target: < 30 minutes per tenant.

### 6.4 Testing with Cloned Production Data

- Create sanitized production clone
- Perform full dry-run migrations in staging
- Capture:
  - data integrity diffs
  - performance delta
  - failure and rollback timings

No production cutover until dry-run success threshold met.

---

## 7) Infrastructure Changes

### 7.1 Oracle RAC / HA Design

- Tenant DBs hosted on Oracle RAC-backed cluster pools
- Service-level placement policy:
  - premium tenants: dedicated resource class
  - standard tenants: shared RAC pools
- Automatic failover and service relocation enabled

### 7.2 Backup and DR

- Per-tenant snapshots:
  - hourly incremental
  - daily full
- Cross-region replication:
  - async replication to DR region
- Retention:
  - point-in-time recovery (PITR) 30 days
  - monthly archives 12 months

Restore objectives:

- RPO ≤ 15 minutes
- RTO ≤ 60 minutes (per tenant)

### 7.3 Monitoring Setup

Metrics per tenant:

- connection pool utilization
- query latency p50/p95/p99
- error rates by endpoint/tenant
- DB CPU/IO/session counts

Dashboards:

- platform SRE dashboard
- per-tenant health dashboard

Alerting:

- latency SLA breach
- connection failures > threshold
- replication lag
- failed backup jobs

---

## 8) Frontend Adaptations

### 8.1 Auth Flow Updates

- During login/signup, resolve and validate gym context
- If user has multi-gym access (future), enforce explicit gym selection
- Persist `activeGymId` in auth state and token refresh flow

### 8.2 API Contract Changes

- Include gym identifier in request metadata:
  - primary: JWT claim
  - header: `X-Gym-ID` for explicit context endpoints
- Add automatic interceptor validation for missing gym context

### 8.3 Gym Owner Database Status Dashboard

Owner-facing UI panel:

- current DB health status
- replication/backup timestamp
- incident notices
- maintenance windows

Status sources come from control-plane health APIs, not direct DB introspection from frontend.

---

## 9) Testing Requirements

### 9.1 Isolation Integration Tests

Must verify:

- owner A cannot read/write owner B data
- API token for tenant A cannot resolve tenant B connection
- rejected cross-tenant attempts are audited

Test suite types:

- API integration tests
- repository-level tenant routing tests
- security penetration tests for tenant boundary bypass attempts

### 9.2 Performance Benchmarks

Target: sub-100ms API p95 for common read operations with 1000+ concurrent gyms.

Benchmark design:

- synthetic load across 1000 tenant contexts
- realistic read/write mix (70/30)
- warm and cold pool scenarios

Acceptance:

- p95 < 100ms for key endpoints
- error rate < 0.5%

### 9.3 Chaos Engineering

Scenarios:

- tenant DB node failure
- network partition to subset of tenant DBs
- credential decryption service degradation
- connection pool exhaustion

Expected behavior:

- tenant-scoped degradation (not platform-wide)
- graceful 503 responses
- automatic recovery after dependency restoration

---

## 10) Timeline Estimates

## Phase 0: Discovery & Design (2 weeks)
- schema audit, tenant key mapping, dependency graph
- final architecture and security sign-off

## Phase 1: Control Plane + Provisioning (3 weeks)
- tenant registry, provisioning workflows, secret management
- schema template automation

## Phase 2: API Routing + Connection Factory (3 weeks)
- tenant middleware, routing datasource, retries/circuit breaker

## Phase 3: Security + Auditing Hardening (2 weeks)
- RBAC enforcement, encryption rollout, central audit trail

## Phase 4: Migration Tooling + Dry Runs (3 weeks)
- extract/load scripts, validation, rollback orchestration

## Phase 5: Frontend + Observability (2 weeks)
- auth/gym context updates, owner DB status dashboard

## Phase 6: Production Rollout (2 weeks)
- pilot tenants, canary waves, monitored full cutover

**Total estimated duration: 17 weeks**

---

## 11) Resource Requirements

### Engineering Team

- 1 Solution Architect
- 2 Backend Engineers (tenant routing, provisioning)
- 1 Database Engineer (Oracle RAC, migration scripts, tuning)
- 1 DevOps/SRE Engineer (infra, monitoring, DR)
- 1 Security Engineer (encryption, RBAC, audit controls)
- 1 Frontend Engineer (auth flow + owner status dashboard)
- 1 QA/Automation Engineer (integration/perf/chaos)

### Infrastructure/Tooling

- Oracle RAC capacity for projected tenant count + headroom
- Secrets manager (KMS/HSM-backed)
- Load testing infrastructure
- Centralized logging/metrics/tracing stack

---

## 12) Risk Assessment Matrix

| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Cross-tenant data leakage due to routing bug | Medium | Critical | Tenant middleware enforcement, integration tests, security gates, audit alerts | Security + Backend |
| Provisioning delays during signup spikes | Medium | High | Async provisioning queue, worker autoscaling, retries | Backend + SRE |
| Oracle resource exhaustion with many pools | Medium | High | LRU pool eviction, tiered pool limits, capacity forecasting | DBE + SRE |
| Migration data mismatch per tenant | Medium | High | checksums, row-count validation, dry-runs, reconciliation scripts | DBE + QA |
| Rollback complexity during cutover | Low | High | rehearsed rollback runbooks, dual-write buffer strategy | Architect + SRE |
| Latency regression under 1000+ tenants | Medium | Medium | benchmark gates, query tuning, cache optimization | Backend + DBE |
| Secret/key misconfiguration | Low | High | IaC validation, secrets rotation tests, least privilege policies | Security + DevOps |
| Audit logging gaps | Low | Medium | mandatory middleware hooks, log schema contract tests | Security |

---

## 13) Success Criteria

### Security & Isolation

- **Zero data leakage between gyms** (validated by automated isolation tests + security audit)
- 100% cross-tenant access attempts logged with correlation IDs

### Availability & Reliability

- **99.9% uptime during migration window**
- Tenant failover works within defined RTO/RPO targets

### Performance

- p95 API latency < 100ms on key endpoints at 1000+ concurrent gyms
- error rate < 0.5% during steady state

### Migration Quality

- 100% tenant row-count/checksum parity after cutover
- < 1% tenants requiring rollback during rollout waves

---

## 14) Implementation Governance

### Change Control

- Architecture Review Board approvals at end of Phases 0, 2, and 4
- Security sign-off before production wave rollout
- Go/No-Go checklist for each migration wave

### Documentation Deliverables

- runbooks (provisioning, failover, rollback)
- tenant onboarding SOP
- incident response playbooks
- migration wave reports

---

## 15) Recommended Rollout Model

1. **Pilot (5–10 gyms)** with low-risk profiles  
2. **Canary waves (10%, 25%, 50%)** with soak periods  
3. **Full rollout (100%)** after all SLOs meet target for two consecutive canary waves

Hard stop conditions:

- any confirmed cross-tenant access defect
- sustained uptime below target
- unresolved data reconciliation variance

---

## 16) Immediate Next Actions (First 2 Weeks)

- finalize tenant identity model (`tenantId` vs `gymId` mapping)
- build control plane schema and provisioning state machine
- define canonical schema migration baseline (`schema_master_v1`)
- implement tenant middleware and request context contract
- prepare staging with production-like cloned data

---

## 17) Gap Closure Addendum (Critical Items Added After Review)

This addendum closes important execution and governance gaps to reduce ambiguity during implementation.

### 17.1 Explicit Assumptions

- Oracle deployment model supports either PDB-per-gym or instance-per-gym with equivalent isolation guarantees.
- Existing data has a reliable tenant discriminator (`gym_id`) across all gym-scoped tables, or can be backfilled.
- Control plane remains highly available and is not tenant-local.
- Application supports JWT claim extension for `tenantId` + `activeGymId`.

### 17.2 Out of Scope (Phase 1)

- Cross-tenant analytics warehouse redesign
- Multi-region active-active write topology
- End-user self-service tenant restore portal
- Legacy API version retirement (handled in later phase)

### 17.3 Tenant Lifecycle Operations

Must include operational workflows for:

- **Suspend tenant** (billing/security events)
- **Reactivate tenant**
- **Tenant rename handling** (DB alias preserved, display name mutable)
- **Tenant deprovisioning** with legal hold support
- **Data retention and purge** by jurisdiction

Each lifecycle event must be auditable and idempotent.

### 17.4 Compliance and Regulatory Controls

- Define control set and evidence collection for:
  - PCI DSS scope boundaries (payment fields/tokenization)
  - GDPR/DPDP data subject rights workflows
  - SOC2 audit trail retention and integrity
- Add quarterly access recertification for privileged roles.
- Add key/secret rotation policy:
  - DB credential rotation every 90 days
  - KMS key rotation at least annually (or cloud-managed default cadence)

### 17.5 Schema Drift Prevention and DDL Governance

- All tenant schema changes via migration tooling only (no manual prod DDL).
- Pre-deploy schema compatibility check across representative tenant sample.
- Drift detector job compares tenant schema versions nightly.
- Block rollout if drift exceeds threshold.

### 17.6 Capacity Model and Cost Guardrails

Add a sizing model by tenant tier:

- small gyms, medium gyms, enterprise gyms
- expected connections, storage growth, IOPS per tier

Define cost controls:

- per-tenant resource quotas
- alerts for abnormal DB growth and connection churn
- monthly cost report by tenant/tier

### 17.7 Detailed Rollback Triggers

Trigger rollback for a wave if any of:

- cross-tenant access defect (automatic hard stop)
- p95 latency regression > 30% for 15 min sustained
- error rate > 2% for 10 min sustained
- data reconciliation mismatch > 0.1% on critical tables
- replication lag beyond RPO threshold

### 17.8 DR Drills and Backup Validation

- Monthly restore drill for random tenant snapshots
- Quarterly regional failover game day
- Backup integrity checks with checksum validation before archival

Success criteria for DR drills:

- restore within target RTO
- no unrecoverable tenant data loss

### 17.9 API Contract Versioning and Compatibility

- Introduce versioned tenant-context contract (`v1`):
  - required claims: `tenantId`, `activeGymId`
  - request correlation id header mandatory
- Maintain backward compatibility window for legacy clients.
- Add deprecation calendar and enforcement dates.

### 17.10 Release and Change Governance

- Define canary wave promotion criteria:
  - 24h soak period minimum per wave
  - SLO pass + security signal green
- Mandatory stakeholder sign-off:
  - engineering, security, SRE, product owner
- Freeze window around major billing cycles.

### 17.11 Operational KPIs (Expanded)

Track and report weekly:

- tenant provisioning success rate
- mean provisioning latency
- failed tenant routing decisions
- cross-tenant access denied count
- rollback frequency and reasons
- backup job success rate
- tenant DB saturation index (CPU/IO/conn)

---

## 18) Readiness Checklist Before Production Wave 1

- [ ] Tenant middleware enabled in staging and passing isolation suite
- [ ] Connection factory load-tested at projected tenant count
- [ ] Migration scripts validated on production-like clone with parity checks
- [ ] Rollback runbook executed successfully in rehearsal
- [ ] DR restore drill passed for at least 3 sample tenants
- [ ] Security sign-off completed (RBAC, encryption, audit)
- [ ] Monitoring dashboards and alerts verified end-to-end
- [ ] Support/on-call runbook and escalation matrix published
