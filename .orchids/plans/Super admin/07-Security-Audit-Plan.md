# 07: Super Admin Security & Audit Plan

## 1. Ultimate Goal

Transform `SASecurity.tsx` into an impenetrable fortress that records every action taken by Super Admins with forensic precision. The UI must make audit trail exploration as easy as reading a newspaper, with instant suspicious activity alerts and GDPR compliance tools.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SASecurity.tsx`

### 2.2 Current Implementation
- Audit logs table with pagination
- Filter by action type, admin, date
- Expandable row details
- Session management
- Basic security settings

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| No real-time suspicious alerts | High | Breaches go undetected |
| No session hijacking detection | Critical | Can't see stolen sessions |
| No IP geolocation mapping | Medium | Can't identify VPN users |
| No bulk export for compliance | Medium | GDPR requests painful |
| No data retention scheduler | High | GDPR requires auto-deletion |

---

## 3. Enhanced Features Specification

### 3.1 Real-Time Threat Dashboard

#### Alert Cards (Pulsing on Detection)
| Alert | Icon | Color | Action |
|-------|------|-------|--------|
| Impossible Travel | `MapPin` | Red | Auto-logout + MFA prompt |
| Mass Data Export | `Download` | Amber | Immediate notification |
| Failed Login Cascade | `ShieldX` | Red | IP block after 3 fails |
| New Device Login | `Monitor` | Blue | Verification email sent |
| After-Hours Access | `Moon` | Amber | Admin notification |

### 3.2 Impossible Travel Detection

#### Logic
```
if (currentLoginCity != previousLoginCity &&
    timeBetweenLogins < 2 hours &&
    distanceBetweenCities > 500km) {
  → Flag as "IMPOSSIBLE_TRAVEL"
}
```

#### UI Treatment
- Row highlighted with red left border
- `[!]` badge with pulse animation
- "Investigate" button opens drawer
- "Dismiss" requires reason entry

### 3.3 Session Fingerprinting

#### Captured Signals
- IP address + ASN
- Device fingerprint (User-Agent hash)
- Browser canvas hash
- Geolocation (if permitted)
- Login timestamp

#### Session Table Columns
```
┌──────────┬────────────┬──────────────┬──────────┬──────────┬─────────┐
│ Admin    │ IP + City  │ Device       │ Login At │ Last Active │ Status │
├──────────┼────────────┼──────────────┼──────────┼──────────┼─────────┤
│ admin@   │ 192.168.x  │ Chrome/Win   │ 2:45 PM  │ 3:12 PM  │ ● Live │
│          │ Mumbai     │ Fingerprint  │          │          │         │
└──────────┴────────────┴──────────────┴──────────┴──────────┴─────────┘
```

### 3.4 GDPR Compliance Center

#### Data Subject Request Panel
| Request Type | SLA | Actions |
|--------------|-----|---------|
| Right to Access | 30 days | Export full data as JSON |
| Right to Deletion | 30 days | Anonymize + delete |
| Right to Portability | 30 days | Download as CSV/JSON |
| Consent Withdrawal | Immediate | Disable marketing flags |

---

## 4. UI/UX Layout Specification

### 4.1 Security Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ Security & Audit                        [+ New Admin] [Export] [Settings ⚙️] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ IMPOSSIBLE TRAVEL DETECTED: admin@ → Mumbai then New York in 45 min  [Act] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┬─────────────────┬─────────────────┬─────────────────────┐ │
│ │ Active Sessions │ Failed Logins    │ Suspicious      │ GDPR Pending        │ │
│ │ 12              │ 23 (24h)         │ 2               │ 1 Request           │ │
│ └─────────────────┴─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ AUDIT LOG                                    │ SESSION MANAGEMENT             │
│ [Search: _______________] [Date Range ▾]     │ Active Sessions Table           │
│ [Action ▾] [Admin ▾]                         │ [View All]                      │
│ ┌────────────────────────────────────────────┴────────────────────────────────┐ │
│ │ TIMESTAMP │ ADMIN        │ ACTION           │ TARGET      │ IP              │ │
│ ├───────────┼─────────────┼──────────────────┼─────────────┼─────────────────┤ │
│ │ 3:12:05   │ admin@      │ GYM_SUSPENDED    │ IronForge   │ 192.168.1.1    │ │
│ │ 2:45:33   │ super@      │ SESSION_CREATED  │ -           │ 10.0.0.5 Mumbai│ │
│ │ 1:22:11   │ admin@      │ USER_PASSWORD... │ rahul@...   │ 192.168.x      │ │
│ └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### 5.1 Audit Log Infinite Scroll

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ['superadmin', 'audit', filters],
  queryFn: ({ pageParam }) => superAdminApi.getAuditLogs({
    cursor: pageParam,
    ...filters,
  }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### 5.2 Suspicious Activity Alert Component

```typescript
interface SuspiciousActivity {
  id: string;
  type: 'IMPOSSIBLE_TRAVEL' | 'MASS_EXPORT' | 'CASCADE_FAIL' | 'NEW_DEVICE';
  severity: 'critical' | 'warning';
  detectedAt: string;
  adminId: string;
  details: Record<string, unknown>;
}

const SuspiciousAlert = ({ activity }: { activity: SuspiciousActivity }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`alert-banner alert-${activity.severity}`}
  >
    <Icon name={activity.type} className="pulse-animation" />
    <span>{activity.message}</span>
    <button onClick={() => investigate(activity)}>Investigate</button>
  </motion.div>
);
```

### 5.3 Session Revocation

```typescript
const revokeSession = async (sessionId: string, reason: string) => {
  try {
    await superAdminApi.revokeSession(sessionId, { reason });
    toast.success('Session revoked successfully');
    queryClient.invalidateQueries(['superadmin', 'sessions']);
  } catch (error) {
    toast.error('Failed to revoke session');
  }
};
```

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/audit` | Paginated audit logs |
| GET | `/api/superadmin/audit/{id}` | Single audit entry |
| GET | `/api/superadmin/sessions` | Active sessions |
| DELETE | `/api/superadmin/sessions/{id}` | Revoke session |
| POST | `/api/superadmin/gdpr/export` | GDPR data export |
| DELETE | `/api/superadmin/gdpr/delete` | GDPR deletion |
| GET | `/api/superadmin/threats` | Suspicious activities |
| PUT | `/api/superadmin/threats/{id}/resolve` | Resolve threat |

### 6.2 Audit AOP Annotation

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SuperAdminAudit {
    String action();          // e.g., "USER_SUSPENDED"
    String targetType();     // e.g., "USER", "GYM"
}

@Aspect
@Component
public class AuditAspect {
    @Around("@annotation(superAdminAudit)")
    public Object audit(ProceedingJoinPoint pjp, SuperAdminAudit audit) throws Throwable {
        // Capture before state
        String before = captureState(audit.targetType(), getTargetId(pjp));

        // Execute
        Object result = pjp.proceed();

        // Capture after state
        String after = captureState(audit.targetType(), getTargetId(pjp));

        // Save audit log
        auditLogService.log(
            action: audit.action(),
            targetType: audit.targetType(),
            targetId: getTargetId(pjp),
            adminId: getCurrentAdmin(),
            ipAddress: getClientIP(),
            beforeSnapshot: before,
            afterSnapshot: after,
            timestamp: LocalDateTime.now()
        );

        return result;
    }
}
```

### 6.3 Impossible Travel Detection

```java
@Service
public class ThreatDetectionService {

    public void detectImpossibleTravel(LoginEvent event) {
        LoginEvent previous = loginHistoryRepository
            .findLastSuccessfulLogin(event.getUserId());

        if (previous == null) return;

        Duration timeDiff = Duration.between(previous.getTimestamp(), event.getTimestamp());
        double distance = geoService.distanceKm(previous.getCity(), event.getCity());

        if (timeDiff.toMinutes() < 120 && distance > 500) {
            Threat threat = Threat.builder()
                .type(ThreatType.IMPOSSIBLE_TRAVEL)
                .userId(event.getUserId())
                .severity(Severity.CRITICAL)
                .details(Map.of(
                    "fromCity", previous.getCity(),
                    "toCity", event.getCity(),
                    "timeDiffMinutes", timeDiff.toMinutes(),
                    "distanceKm", distance
                ))
                .build();

            threatRepository.save(threat);
            notificationService.alertAdmins(threat);
        }
    }
}
```

---

## 7. Database Strategy

### 7.1 Audit Log Table

```sql
CREATE TABLE super_admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_entity_id VARCHAR(255),
    before_snapshot JSONB,
    after_snapshot JSONB,
    ip_address INET,
    user_agent TEXT,
    geo_location JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- BRIN index for blazing-fast chronological queries
CREATE INDEX idx_audit_created_at_brin ON super_admin_audit_logs
USING BRIN (created_at);

-- GIN index for JSONB payload searches
CREATE INDEX idx_audit_payload_gin ON super_admin_audit_logs
USING GIN (after_snapshot);
```

### 7.2 Session Table

```sql
CREATE TABLE admin_sessions (
    id BIGSERIAL PRIMARY KEY,
    admin_id VARCHAR(255) NOT NULL,
    session_token_hash VARCHAR(64) NOT NULL,
    ip_address INET,
    device_fingerprint VARCHAR(64),
    user_agent TEXT,
    geo_location JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sessions_token ON admin_sessions (session_token_hash);
CREATE INDEX idx_sessions_admin ON admin_sessions (admin_id, is_revoked);
```

---

## 8. Testing Procedures

### 8.1 Threat Detection Tests
```java
@Test
void impossibleTravel_within30min1000km_flaggedAsThreat() {
    LoginEvent fromMumbai = createLogin("Mumbai", Instant.now().minus(30, ChronoUnit.MINUTES));
    LoginEvent toNewYork = createLogin("New York", Instant.now());

    threatDetection.detectImpossibleTravel(toNewYork);

    verify(threatRepository).save(argThat(t ->
        t.getType() == ThreatType.IMPOSSIBLE_TRAVEL
    ));
}
```

### 8.2 Audit Trail Tests
```java
@Test
void auditAnnotation_onMethodCall_logsAction() {
    superAdminService.suspendGym(123L);

    AuditLog log = auditLogRepository.findLatestByAction("GYM_SUSPENDED");
    assertNotNull(log);
    assertEquals("GYM_SUSPENDED", log.getAction());
    assertEquals(123L, log.getTargetEntityId());
}
```

---

## 9. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Audit log write latency | < 50ms | Async, non-blocking |
| Impossible travel detection | < 1 min | Automated test |
| Session revocation | < 200ms | E2E test |
| GDPR export | < 30 days SLA | Dashboard counter |
| Data retention | 90-day auto-prune | Cron verification |

---

## 10. Deliverables Checklist

- [ ] `SASecurity.tsx` with threat dashboard
- [ ] Real-time suspicious activity alerts
- [ ] Impossible travel detection
- [ ] Session fingerprinting table
- [ ] GDPR compliance center
- [ ] Audit AOP annotation
- [ ] Threat detection service
- [ ] Session revocation endpoint
- [ ] BRIN-indexed audit table
- [ ] Unit tests >80% coverage
