# Cloud Deployment Scalability Guide

**For Gym Management System - High Scale Production Deployment**

---

## Pre-Deployment Checklist

### 1. Database Preparations

Run these migrations in order:

```sql
-- Step 1: Fix existing orphan records and add FK constraints
@V100__fix_orphan_records_and_add_constraints.sql

-- Step 2: Add performance indexes
@V101__add_performance_indexes.sql

-- Step 3: Add pagination and health monitoring
@V102__add_pagination_and_health.sql
```

### 2. Verify Database Health

```sql
-- Check for any remaining integrity issues
SELECT * FROM v_database_health;

-- Expected output: All rows should show HEALTHY status
```

---

## Cloud Database Configuration

### Oracle Cloud Autonomous Database (Recommended)

```properties
# application-production.properties

# Connection Pool - Scaled for production
spring.datasource.hikari.maximum-pool-size=100
spring.datasource.hikari.minimum-idle=20
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.pool-name=GymManagementPool-Prod
spring.datasource.hikari.connection-test-query=SELECT 1 FROM DUAL

# High Availability Configuration
spring.datasource.url=jdbc:oracle:thin:@(description=(address_list=(address=(protocol=tcps)(port=1522)(host=your-primary.db.cloud.oracle.com))(address=(protocol=tcps)(port=1522)(host=your-standby.db.cloud.oracle.com))(load_balance=yes)(failover=on))(connect_data=(service_name=yourpdb1))(wallet_location=your-wallet-location))

# JPA Optimizations
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.jdbc.fetch_size=100
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.OracleDialect
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### AWS RDS / Aurora Configuration

```properties
# For AWS Aurora MySQL/PostgreSQL
spring.datasource.url=jdbc:mysql:aws://your-cluster.cluster-abc123.us-east-1.rds.amazonaws.com:3306/gymdb?useSSL=true&requireSSL=true
spring.datasource.hikari.maximum-pool-size=100
spring.datasource.hikari.minimum-idle=20
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

---

## Kubernetes Deployment

### Backend Deployment (HPA - Horizontal Pod Autoscaler)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gym-management-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gym-backend
  template:
    metadata:
      labels:
        app: gym-backend
    spec:
      containers:
      - name: backend
        image: gym-management:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: JAVA_OPTS
          value: "-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Dspring.datasource.hikari.maximum-pool-size=50"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: gym-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gym-management-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Connection (Kubernetes Secret)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gym-db-credentials
type: Opaque
stringData:
  spring.datasource.username: gymapp
  spring.datasource.password: your-secure-password
  spring.datasource.url: jdbc:oracle:thin:@your-db-scan:1521/gymdb
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Database Connections | >70% | >90% | Scale connections, check leaks |
| Query Response Time | >500ms | >2000ms | Add indexes, optimize queries |
| Error Rate | >1% | >5% | Alert on-call |
| CPU Usage | >70% | >90% | Scale horizontally |
| Memory Usage | >75% | >90% | Increase limits |

### Health Check Endpoint

```java
@GetMapping("/api/public/health")
public ResponseEntity<Map<String, Object>> health() {
    Map<String, Object> health = new HashMap<>();
    health.put("status", "UP");
    health.put("timestamp", LocalDateTime.now());

    // Check database connectivity
    try {
        jdbcTemplate.queryForObject("SELECT 1 FROM DUAL", Integer.class);
        health.put("database", "UP");
    } catch (Exception e) {
        health.put("database", "DOWN");
        health.put("dbError", e.getMessage());
        return ResponseEntity.status(503).body(health);
    }

    // Check connection pool
    HikariPool pool = ((HikariDataSource) dataSource).getHikariPoolMXBean();
    health.put("activeConnections", pool.getActiveConnections());
    health.put("idleConnections", pool.getIdleConnections());
    health.put("totalConnections", pool.getTotalConnections());
    health.put("threadsAwaitingConnection", pool.getThreadsAwaitingConnection());

    return ResponseEntity.ok(health);
}
```

---

## Performance Testing

### Load Test Script (k6)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Steady state
    { duration: '2m', target: 200 },  // Stress test
    { duration: '5m', target: 200 },  // Steady state
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function() {
  const res = http.get('http://your-api/api/pt-sessions?page=0&size=50');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has content': (r) => r.body.length > 0,
  });
  sleep(1);
}
```

---

## Backup Strategy

### Oracle Cloud Backup

```bash
# Automated daily backups (enabled by default in Autonomous DB)
# Point-in-time recovery available for 60 days

# Manual backup verification
SELECT start_time, end_time, backup_type, status
FROM v$rman_backup_job_details
ORDER BY start_time DESC;
```

### Cross-Region DR

1. Enable Oracle Data Guard for automatic replication
2. Configure read replicas for reporting queries
3. Set up cross-region backup storage

---

## Scaling Guidelines

### When to Scale

| Indicator | Action |
|-----------|--------|
| Response time >2s consistently | Scale horizontally |
| DB connections >80% | Increase connection pool |
| Memory >85% | Increase pod memory limits |
| CPU >80% for >10 min | Add more replicas |
| Queue depth growing | Scale message consumers |

### Auto-Scaling Rules

```yaml
# Trigger scale-up when:
# - HTTP requests per second > 1000
# - Average response time > 1s
# - Queue depth > 100

# Maximum scale:
# - 20 backend pods
# - 100 DB connections per pod
# - 50GB memory per pod
```

---

## Security Hardening for Cloud

```properties
# Force HTTPS
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12

# Secure headers
server.servlet.headers.frame-options=DENY
server.servlet.headers.x-content-type-options=nosniff
server.servlet.headers.xss-protection=1; mode=block

# CORS for production
spring.web.cors.allowed-origins=https://yourdomain.com
```

---

## Deployment Verification

### Smoke Tests

```bash
# 1. Health check
curl https://api.yourdomain.com/api/public/health

# 2. Database connectivity
curl https://api.yourdomain.com/api/public/health | jq '.database'

# 3. Authentication
TOKEN=$(curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' | jq -r '.token')

# 4. Test paginated endpoint
curl "https://api.yourdomain.com/api/pt-sessions?page=0&size=50" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Rollback Plan

### If Issues After Deployment:

1. **Immediate Rollback**
```bash
kubectl rollout undo deployment/gym-management-backend
```

2. **Database Migration Rollback** (if migration caused issue)
```sql
-- Flyway allows rollback to previous version
-- Or manually drop new objects:
DROP INDEX idx_pt_sessions_trainer_date;
DROP TABLE pagination_cursors;
```

3. **Connection Pool Reset**
```bash
# Scale to 0, then back to 1
kubectl scale deployment/gym-management-backend --replicas=0
kubectl scale deployment/gym-management-backend --replicas=1
```

---

## Support Contacts

| Role | Contact |
|------|---------|
| DevOps Lead | [Your Email] |
| DBA | [DBA Email] |
| On-Call | [Paging Number] |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-30
**Next Review:** After first production deployment
