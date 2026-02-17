# Settings Page Backend Integration Plan

## Requirements

Connect the Owner Settings page sections to the backend API so all settings are persisted to the database. This includes:
1. Fix API paths (frontend currently uses `/api/gym-settings` but backend is at `/api/settings`)
2. Connect Owner Profile save to backend
3. Connect Security settings to backend
4. Wire up password change to actual API endpoint
5. Connect Audit Logs to read from localStorage (temporary) or create backend endpoint

## Current State Analysis

### Backend (Already Exists)
- **Controller**: `GymSettingsController.java` at `/api/settings`
- **Service**: `GymSettingsService.java` - key-value storage pattern
- **Model**: `GymSettings.java` - flexible key-value storage (settingKey, settingValue, settingType)
- **Repository**: `GymSettingsRepository.java`
- **Password Change**: `AuthController.java` has `/api/auth/change-password` endpoint

### Frontend Sections Status
| Section | Current API Path | Status |
|---------|-----------------|--------|
| OwnerProfileSection | `/api/settings` | **Already Connected** |
| SecuritySection | `/api/settings` + `/api/auth/change-password` | **Already Connected** |
| RolesSection | `/api/settings` | **Already Connected** |
| StaffRulesSection | `/api/settings` | **Already Connected** |
| TrainerRulesSection | `/api/settings` | **Already Connected** |
| AuditLogSection | localStorage | **Temporary Solution (Working)** |

### Key Finding
After thorough analysis, the frontend sections are **already correctly connected** to the backend:
- All sections use `api.get('/api/settings')` and `api.put('/api/settings', data)`
- The Vite proxy forwards `/api` to `http://127.0.0.1:8081`
- The backend `GymSettingsController` is at `/api/settings`
- Password change uses `/api/auth/change-password` which exists

## What Needs Implementation

### Phase 1: Backend - Audit Log Endpoint (Optional Enhancement)

Currently, audit logs are stored in localStorage. To persist them:

**1.1 Create AuditLog Model**
```java
// backend/src/main/java/com/gym/management/model/AuditLog.java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String action;
    private String target;
    private String userName;
    private String userRole;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
```

**1.2 Create AuditLogRepository**
```java
// backend/src/main/java/com/gym/management/repository/AuditLogRepository.java
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    Page<AuditLog> findByActionContainingIgnoreCaseOrUserNameContainingIgnoreCase(
        String action, String userName, Pageable pageable);
}
```

**1.3 Create AuditLogService**
```java
// backend/src/main/java/com/gym/management/service/AuditLogService.java
@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logAction(String action, String target, String userName, 
                          String role, String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setTarget(target);
        log.setUserName(userName);
        log.setUserRole(role);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }
    
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
```

**1.4 Create AuditLogController**
```java
// backend/src/main/java/com/gym/management/controller/AuditLogController.java
@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {
    @Autowired
    private AuditLogService auditLogService;
    
    @GetMapping
    public ResponseEntity<List<AuditLog>> getLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditLogService.getRecentLogs());
    }
    
    @PostMapping
    public ResponseEntity<AuditLog> createLog(@RequestBody AuditLogDTO dto) {
        auditLogService.logAction(dto.getAction(), dto.getTarget(), 
            dto.getUserName(), dto.getRole(), dto.getDetails(), dto.getIpAddress());
        return ResponseEntity.ok().build();
    }
}
```

### Phase 2: Frontend - Connect AuditLogSection to Backend (Optional)

**2.1 Update AuditLogSection.tsx**
```typescript
const fetchAuditLogs = async () => {
    try {
        setLoading(true)
        // Try backend first
        const response = await api.get('/api/audit-logs')
        if (response.data && response.data.length > 0) {
            const mappedLogs = response.data.map(mapBackendLog)
            setLogs(mappedLogs)
        } else {
            // Fallback to localStorage
            const storedLogs = JSON.parse(localStorage.getItem("auditLog") || "[]")
            // ... existing localStorage logic
        }
    } catch {
        // Fallback to localStorage on error
    }
}
```

### Phase 3: Verify Existing Integration Works

**3.1 Test Settings Save Flow**
1. Start backend: `cd backend && ./mvnw spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Login as Owner
4. Navigate to Settings
5. Modify any setting (e.g., Owner Profile name)
6. Click Save
7. Verify in database that `gym_settings` table has new entry

**3.2 Test Password Change Flow**
1. Navigate to Settings > Security
2. Click "Change Password"
3. Enter current password, new password, confirm
4. Verify API call to `/api/auth/change-password` succeeds

## Implementation Phases

### Phase 1: Verification (No Code Changes)
- [ ] Test existing Owner Profile save functionality
- [ ] Test existing Security settings save functionality
- [ ] Test existing password change functionality
- [ ] Test existing Roles section save functionality
- [ ] Verify data persists in database `gym_settings` table

### Phase 2: Backend Audit Logs (Optional - New Files)
- [ ] Create `AuditLog.java` model
- [ ] Create `AuditLogRepository.java`
- [ ] Create `AuditLogService.java`
- [ ] Create `AuditLogController.java`
- [ ] Create `AuditLogDTO.java`

### Phase 3: Frontend Audit Logs Integration (Optional)
- [ ] Update `AuditLogSection.tsx` to call backend API
- [ ] Keep localStorage fallback for offline/dev scenarios

## Files to Create (Phase 2 - Optional)

| File | Purpose |
|------|---------|
| `backend/src/main/java/com/gym/management/model/AuditLog.java` | Entity for audit logs |
| `backend/src/main/java/com/gym/management/repository/AuditLogRepository.java` | Data access |
| `backend/src/main/java/com/gym/management/service/AuditLogService.java` | Business logic |
| `backend/src/main/java/com/gym/management/controller/AuditLogController.java` | REST endpoints |
| `backend/src/main/java/com/gym/management/dto/AuditLogDTO.java` | Data transfer object |

## Files Already Working (No Changes Needed)

| File | Current Status |
|------|---------------|
| `frontend/src/pages/Settings/sections/OwnerProfileSection.tsx` | Uses `/api/settings` - Working |
| `frontend/src/pages/Settings/sections/SecuritySection.tsx` | Uses `/api/settings` + `/api/auth/change-password` - Working |
| `frontend/src/pages/Settings/sections/RolesSection.tsx` | Uses `/api/settings` - Working |
| `frontend/src/pages/Settings/sections/StaffRulesSection.tsx` | Uses `/api/settings` - Working |
| `frontend/src/pages/Settings/sections/TrainerRulesSection.tsx` | Uses `/api/settings` - Working |
| `frontend/src/pages/Settings/sections/AuditLogSection.tsx` | Uses localStorage - Working (temporary) |
| `backend/src/main/java/com/gym/management/controller/GymSettingsController.java` | Handles all settings - Working |
| `backend/src/main/java/com/gym/management/controller/AuthController.java` | Has change-password endpoint - Working |

## Key API Endpoints (Already Exist)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/settings` | GET | Get all settings as key-value map |
| `/api/settings` | PUT | Update/create settings (bulk) |
| `/api/auth/change-password` | POST | Change user password |
| `/api/settings/gym-hours` | GET/PUT | Gym operating hours |
| `/api/settings/pt-config` | GET/PUT | PT session configuration |
| `/api/settings/blackout-days` | GET/POST/DELETE | Holiday blackout days |

## Summary

**Good News**: The core integration is already complete! The frontend sections are correctly calling `/api/settings` and the backend is ready to handle these requests.

**What to Verify**: Run the application and test that settings actually persist to the database.

**Optional Enhancement**: Create a proper AuditLog backend to replace localStorage storage.
