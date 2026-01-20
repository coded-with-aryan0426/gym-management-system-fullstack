# Titan Protocol: Backend Security Architecture Report

## 🛡️ Executive Summary
This report analyzes the current backend security posture and outlines the necessary transformations to achieve a **"Titan-Grade" (Bank-Level) Security** standard appropriate for a B2B SaaS platform.

**Current Status**: ⚠️ **HIGH RISK** (Development Mode configurations present in production path)

---

## 1. Critical Vulnerabilities (Must Fix Immediately)

### 🚨 Broken Authentication
*   **Issue**: `SecurityConfig.java` uses `NoOpPasswordEncoder`.
*   **Risk**: Passwords are stored in plain text or unsalted. If the DB is compromised, *all* user accounts are lost.
*   **Fix**: Switch to **BCryptPasswordEncoder** (Strength 12).
    ```java
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    ```

### 🚨 Missing Rate Limiting (DDoS Risk)
*   **Issue**: No mechanism to limit request volume per tenant/IP.
*   **Risk**: A malicious tenant or bot can crash the API by flooding `POST /api/auth/login`.
*   **Fix**: Implement **Bucket4j** with Redis.
    *   **Rule**: Limit login attempts to 5 per minute per IP.
    *   **Rule**: Limit API usage to 1000 requests per minute per Tenant.

### 🚨 Lack of Input Sanitization
*   **Issue**: While JPA prevents SQL Injection, search inputs are not sanitized against XSS payloads before storage.
*   **Fix**: Implement an `XSSFilter` interceptor that strips `<script>` tags from incoming JSON requests.

---

## 2. SaaS Architecture Upgrades

### 🔐 Multi-Tenant Data Isolation
*   **Strategy**: **Logical Isolation** via `gym_id`.
*   **Enforcement**: Use AOP (Aspect Oriented Programming) or Hibernate Filters.
    *   **NEVER** rely on frontend to send `gym_id`.
    *   **ALWAYS** extract `gym_id` from the JWT token in the `SecurityContext`.

### 🔑 API Key Management
*   **Feature**: Allow Gym Owners to generate "Read-Only" API Keys for their own integrations.
*   **Implementation**: Create an `ApiKey` entity linked to `Gym`. Verify hash on every request filter.

---

## 3. Compliance & Monitoring

### 📜 Audit Logging
*   **Requirement**: B2B clients need to know *who* changed *what*.
*   **Implementation**: Create an **Audit Log Service**.
    *   Record: `Who` (User ID), `When` (Timestamp), `What` (Action: "Deleted Member"), `IP Address`.
    *   Store in a separate table/database (immutable).

### 🛡️ Dependency Scanning
*   **Action**: Add **OWASP Dependency Check** plugin to `pom.xml`.
*   **Why**: Automatically block build if a library (e.g., `jjwt`) has a known CVE.

---

## ✅ Implementation Checklist

- [ ] **Phase 1**: Enable `BCrypt` hashing. (Time: 1 hour)
- [ ] **Phase 2**: Add `Bucket4j` Rate Limiting. (Time: 4 hours)
- [ ] **Phase 3**: Implement Tenant Awareness in JWT. (Time: 6 hours)
- [ ] **Phase 4**: Set up Audit Logging table. (Time: 1 day)
