# 03: Super Admin Users Management Plan

## 1. Ultimate Goal

Transform `SAUsers.tsx` into an all-seeing global directory capable of instant search, deep behavioral analysis, non-destructive interventions (password resets), and GDPR-compliant deletions. As the platform operator, you need to identify power users versus struggling accounts at a glance.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SAUsers.tsx`

### 2.2 Current Implementation
- Basic user list with search and role filter
- User detail drawer with tabs (profile, security, activity)
- Ban/Unban user functionality
- Create user modal
- Loading and error states

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| No user engagement scoring | Medium | Can't identify power users |
| No cross-gym affiliation | Medium | Can't see trainer multi-gym work |
| No ghost account filter | Low | Hard to find inactive users |
| No activity heatmap | Medium | Can't visualize user engagement |
| Backend 500 error | High | API not working |

---

## 3. Enhanced Features Specification

### 3.1 Power User Badge (Engagement Score)

#### Score Calculation (0-100)
```
Engagement Score = (loginFrequency × 0.3) + (featureUsage × 0.4) + (sessionDuration × 0.3)
```

#### Visual Implementation
- **High (80+):** Glowing purple hexagon badge
- **Medium (50-79):** Blue circle badge
- **Low (<50):** Gray faded circle

```typescript
interface UserEngagementScore {
  userId: number;
  score: number;
  breakdown: {
    loginFrequency: number;
    featureUsage: number;
    sessionDuration: number;
  };
  tier: 'power' | 'active' | 'casual' | 'dormant';
}
```

### 3.2 Cross-Gym Affiliation Tag

#### Display
- **Trainers at multiple gyms:** Linked pill badges `[Titan HQ] [Iron Forge]`
- **Click behavior:** Filters view to show their activities at selected gym

```typescript
interface CrossGymAffiliation {
  userId: number;
  gymRoles: Array<{
    gymId: number;
    gymName: string;
    role: 'OWNER' | 'TRAINER' | 'ADMIN';
  }>;
}
```

### 3.3 Ghost Accounts Filter

#### Definition
- Users with no login in >90 days
- Users who registered but never completed onboarding
- Users with 0 check-ins in 30 days

#### Filter Toggle
- One-click filter: `[Show Inactive > 90 Days]`
- Shows count badge: `Ghost Accounts: 234`
- Bulk actions: Export, Re-engagement email, Delete

### 3.4 Activity Heatmap (GitHub-style)

#### Implementation
- **Library:** `react-chartics` or custom SVG
- **Display:** 52-week calendar grid (365 days)
- **Color Scale:** Light gray (0) → Green (5+ activities)
- **Tooltip:** "Jan 15: 3 check-ins, 2 class bookings"

```typescript
interface ActivityHeatmap {
  userId: number;
  data: Array<{
    date: string; // ISO date
    count: number;
  }>;
  totalContributions: number;
}
```

### 3.5 User Deep-Dive Drawer

#### Drawer Sections
| Section | Content |
|---------|---------|
| Header | Avatar, name, role badge, created date |
| Activity Heatmap | GitHub-style contribution calendar |
| Device Fingerprint | Last login IP, device, OS, app version |
| Session History | Last 10 sessions with duration, location |
| Gym Affiliations | All gyms with roles |
| Quick Actions | Reset password, impersonate, ban |

---

## 4. UI/UX Layout Specification

### 4.1 Users Table Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search [_______________________] [Role ▾] [Status ▾] [Ghost 🔻] [Export] │
├────────────────────────────────────────────────────────────────────────────────┤
│ ┌────┬──────────────┬────────────────┬────────┬────────────┬────────────────┐ │
│ │ ES │ Name         │ Email          │ Role   │ Gyms      │ Last Active    │ │
│ │    │ Hexagon/Score│               │        │ Affiliations │             │ │
│ ├────┼──────────────┼────────────────┼────────┼────────────┼────────────────┤ │
│ │ 💎 │ Rahul Sharma │ rahul@fit.com  │ OWNER  │ [FitZone] │ 2h ago ●     │ │
│ │ 🔵 │ Neha Gupta   │ neha@flex.fit  │ TRAINER│ [Flex][Titan] │ 4h ago ●   │ │
│ │ ⚪ │ Ghost User   │ ghost@mail.com │ MEMBER │ -         │ 94d ago ○    │ │
│ └────┴──────────────┴────────────────┴────────┴────────────┴────────────────┘ │
│                                                                                │
│ [← Prev] [1] [2] [3] ... [500] [Next →]                Showing 1-50 of 25,000 │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Search Bar Behavior

- **Icon:** Search icon (`#888888`)
- **Debounce:** 400ms
- **Focus:** Input expands from 250px to 400px
- **Border glow:** Purple (`#8B5CF6`) on focus
- **Empty results:** Animated `<UserX />` icon with message

---

## 5. Frontend Implementation

### 5.1 Infinite Scrolling with React Query

```typescript
// useInfiniteQuery for users list
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['superadmin', 'users', search, roleFilter],
  queryFn: ({ pageParam = 0 }) => superAdminApi.getUsers({
    cursor: pageParam,
    search,
    role: roleFilter,
  }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### 5.2 React Window Virtualization

```typescript
// For 50,000 users at 60fps
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: flattenedPages.length,
  getScrollElement: () => tableRef.current,
  estimateSize: () => 56,
  overscan: 10,
});
```

### 5.3 Force Password Reset Flow

1. Click "Force Reset" button (yellow key icon)
2. Confirmation modal appears
3. Admin types "RESET" to confirm
4. Backend generates single-use JWT (15 min expiry)
5. Toast: "Reset email dispatched"
6. Optional: Copy reset link to clipboard

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/users` | Paginated user list |
| GET | `/api/superadmin/users/{id}` | User details |
| GET | `/api/superadmin/users/{id}/telemetry` | Heatmap, devices, sessions |
| GET | `/api/superadmin/users/search?q=` | Fast fuzzy search |
| POST | `/api/superadmin/users/{id}/force-reset` | Generate reset token |
| DELETE | `/api/superadmin/users/{id}` | GDPR-compliant delete |
| PUT | `/api/superadmin/users/{id}/ban` | Ban user |
| PUT | `/api/superadmin/users/{id}/unban` | Unban user |

### 6.2 User Search DTO

```java
public class UserSearchResultDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String status;
    private EngagementScore engagementScore;
    private List<GymAffiliation> gymAffiliations;
    private String lastActive;
    private Long daysSinceLastLogin;
}
```

### 6.3 Fuzzy Search with pg_trgm

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for fast fuzzy search
CREATE INDEX trgm_users_search ON users USING GIN
((first_name || ' ' || last_name || ' ' || email) gin_trgm_ops);

-- Example query
SELECT * FROM users
WHERE (first_name || ' ' || last_name || ' ' || email) ILIKE '%rahul%'
LIMIT 50;
```

---

## 7. GDPR Compliance

### 7.1 Right to Deletion

```typescript
interface GDPRDeleteRequest {
  userId: number;
  reason: 'user_request' | 'policy_violation' | 'inactive';
  anonymize: boolean; // Keep stats, delete PII
}

// Deletion workflow:
// 1. Backup user data to cold storage
// 2. Anonymize PII (email → hash, name → "Deleted User")
// 3. Revoke all sessions
// 4. Delete from active tables
// 5. Log deletion to audit trail
```

---

## 8. Testing Procedures

### 8.1 Unit Tests
```typescript
describe('EngagementBadge', () => {
  it('displays hexagon for score > 80', () => {
    render(<EngagementBadge score={85} />);
    expect(screen.getByText('💎')).toBeInTheDocument();
  });
});
```

### 8.2 Performance Tests
- Load 50,000 users with virtualization
- Verify 60fps scroll
- Test search response < 100ms with pg_trgm

### 8.3 E2E Tests
1. Search for user "Rahul"
2. Click user row
3. Verify drawer opens
4. View activity heatmap
5. Force password reset

---

## 9. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Initial load (50 users) | < 500ms | Network tab |
| Search response | < 100ms | With pg_trgm index |
| Scroll FPS | 60fps | Virtualization |
| Heatmap render | < 200ms | Performance mark |
| Accessibility | WCAG 2.1 AA | axe-core |

---

## 10. Deliverables Checklist

- [ ] `SAUsers.tsx` with infinite scroll
- [ ] Engagement score badge component
- [ ] Cross-gym affiliation pills
- [ ] Ghost accounts filter
- [ ] Activity heatmap (365-day calendar)
- [ ] User drawer with lazy loading
- [ ] Force password reset flow
- [ ] GDPR delete functionality
- [ ] Backend fuzzy search with pg_trgm
- [ ] Unit tests >80% coverage
