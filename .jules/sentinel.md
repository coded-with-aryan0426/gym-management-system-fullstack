# Sentinel's Journal

## 2026-01-09 - Plain Text Password Exposure via API
**Vulnerability:** The `User` entity's `password` field was being serialized in API responses (e.g., `GET /api/users`), exposing plain-text passwords to anyone who could query the API.
**Learning:** Even if `User` entities are just Data Transfer Objects in some contexts, JPA Entities often double as DTOs in simple Spring Boot apps. Without explicit exclusion, Jackson serializes all fields. The lack of Spring Security meant these endpoints were publicly accessible, compounding the risk.
**Prevention:** Always use `@JsonIgnore` or `@JsonProperty(access = Access.WRITE_ONLY)` on sensitive fields in Entities. Ideally, use separate DTOs for API responses that strictly define what data is exposed.
