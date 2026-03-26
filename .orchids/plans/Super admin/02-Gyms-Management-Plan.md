# 02: Super Admin Gyms Management Plan

## 1. Ultimate Goal

Transform `SAGyms.tsx` from a simple address book of gyms into a **Deep-Diagnostic Surveillance Tool**. As the platform operator, you should see instant visual cues on financial leakage, user churn, feature adoption, and technical errors happening per specific gym, all in a buttery-smooth UI.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SAGyms.tsx`

### 2.2 Current Implementation
- Basic gym list with search and status filter
- Simple table layout without virtualization
- Detail modal/drawer for individual gym view
- Suspend/Activate gym actions
- Export functionality

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| No gym health scores | High | Can't prioritize support |
| No revenue leakage alerts | High | Missing billing issues |
| No inline sparklines | Medium | Can't see activity trends |
| No owner login tracking | Medium | Can't identify abandoned gyms |
| Table not virtualized | High | Performance issue with 500+ gyms |

---

## 3. Enhanced Features Specification

### 3.1 The "Gym Health Score" (0-100)

#### Composite Score Calculation
```
Health Score = (Revenue Growth × 0.3) + (Member Retention × 0.3) + (Owner Activity × 0.2) + (Error Rate × 0.2)
```

#### Visual Implementation
- **Component:** Circular progress ring using SVG
- **Size:** 48x48px inline with gym name
- **Colors:**
  - Green (`#10B981`) for score > 80
  - Amber (`#F59E0B`) for score 50-79
  - Red (`#EF4444`) for score < 50
- **Animation:** Smooth stroke-dashoffset transition on load

```typescript
interface GymHealthScore {
  gymId: number;
  score: number; // 0-100
  breakdown: {
    revenueGrowth: number;
    memberRetention: number;
    ownerActivity: number;
    errorRate: number;
  };
}
```

### 3.2 Revenue Leakage Alert Badge

#### Detection Criteria
- >5 failed member payments in last 7 days
- >3 consecutive billing failures
- Stripe webhook failure rate >10%

#### Visual Implementation
- **Icon:** `AlertTriangle` with pulsing animation
- **Color:** Amber/orange gradient
- **Tooltip:** "Revenue Leakage: ₹X stuck in failed payments"
- **Position:** Right side of gym row

### 3.3 7-Day Check-in Sparkline

#### Implementation
- **Chart Type:** Inline sparkline (Recharts or visx)
- **Size:** 60x20px inline in table row
- **Data Points:** 7 integers (one per day)
- **Rendering:** Canvas-based for performance

```typescript
interface SparklineData {
  gymId: number;
  values: number[]; // 7 values, one per day
  trend: 'up' | 'down' | 'flat';
}
```

### 3.4 Owner Activity Tracking

#### Display Format
- `< 1 hour` - Green dot
- `< 24 hours` - Blue dot
- `< 7 days` - Amber dot
- `> 7 days` - Red dot with "Abandoned" badge

### 3.5 Deep Dive Right Drawer

#### Interaction
- **Trigger:** Click on gym row
- **Animation:** Slide from right, 600px width
- **Overlay:** Dark backdrop (opacity 0.5)
- **Close:** Click X, click backdrop, or press Escape

#### Drawer Tabs
| Tab | Content | Data Endpoint |
|-----|---------|---------------|
| Overview | MRR, members, plan, health score | `/gyms/{id}` |
| Telemetry | API errors specific to this gym | `/gyms/{id}/errors` |
| Billing | Stripe Connect status, payouts | `/gyms/{id}/billing` |
| Members | Member list with activity | `/gyms/{id}/members` |
| Quick Actions | Force sync, broadcast, impersonate | - |

---

## 4. UI/UX Layout Specification

### 4.1 Gyms Table Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ SEARCH [________________________________] [Status ▾] [+ Add Gym] [Export ▾]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌────┬──────────────┬───────┬───────┬────────┬─────────┬────────────────┐ │
│ │ H  │ Gym Name      │ Owner │ Plan  │ Members│ Revenue │ Last Active    │ │
│ │ S  │ Health Score  │       │       │        │         │ Owner Login    │ │
│ ├────┼──────────────┼───────┼───────┼────────┼─────────┼────────────────┤ │
│ │ 87▓│ FitZone Elite │ Rahul │ Pro   │ 234    │ ₹45,000 │ 2h ago ●      │ │
│ │ 72▓│ IronForge     │ Amit  │ Ent   │ 456    │ ₹89,000 │ 14d ago ○     │ │
│ │ 45○│ Ghost Gym     │ John  │ Starter│ 12    │ ₹1,200  │ Abandoned ○   │ │
│ └────┴──────────────┴───────┴───────┴────────┴─────────┴────────────────┘ │
│                                                                              │
│ [← Prev] [1] [2] [3] ... [50] [Next →]                    Showing 1-50 of 2,847 │
└──────────────────────────────────────────────────────────────────────────────┘

Legend: ● Active ○ Warning ○ Critical/H
```

### 4.2 Quick Actions (God-Mode)

#### Action Buttons in Drawer Footer
| Action | Icon | Color | Confirmation |
|--------|------|-------|---------------|
| Force Sync Billing | `RefreshCw` | Blue | None (instant) |
| Broadcast Message | `Send` | Amber | Modal with message |
| Impersonate Owner | `LogIn` | Green | Type gym name |
| Suspend Gym | `Ban` | Red | Type gym name + confirm |

#### Impersonation Flow
1. Click "Impersonate Owner"
2. Modal appears requiring typing gym name
3. Backend generates 5-minute JWT with `is_impersonated: true` claim
4. New tab opens with impersonated session
5. All actions logged to audit trail

---

## 5. Frontend Implementation

### 5.1 Table Virtualization

**Required:** `@tanstack/react-virtual` for 60fps scrolling with 500+ gyms

```typescript
// Implementation Pattern
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: filteredGyms.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 56, // Row height in px
  overscan: 10,
});
```

### 5.2 Drawer Lazy Loading

```typescript
// Only fetch when drawer opens
const { data: gymDetail, isLoading } = useQuery({
  queryKey: ['superadmin', 'gym', selectedGymId, activeTab],
  queryFn: () => superAdminApi.getGymDeepDive(selectedGymId, activeTab),
  enabled: selectedGymId !== null, // Only fetch when drawer open
});
```

### 5.3 Optimistic Updates

```typescript
// Suspend gym - optimistic update
const suspendMutation = useMutation({
  mutationFn: (gymId: number) => superAdminApi.suspendGym(gymId),
  onMutate: async (gymId) => {
    await queryClient.cancelQueries(['superadmin', 'gyms']);
    const previous = queryClient.getQueryData(['superadmin', 'gyms']);
    queryClient.setQueryData(['superadmin', 'gyms'], (old) =>
      old.map(g => g.id === gymId ? { ...g, status: 'suspended' } : g)
    );
    return { previous };
  },
  onError: (err, gymId, context) => {
    queryClient.setQueryData(['superadmin', 'gyms'], context.previous);
    toast.error('Failed to suspend gym');
  },
  onSuccess: () => toast.success('Gym suspended successfully'),
});
```

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/gyms` | List gyms with pagination |
| GET | `/api/superadmin/gyms/{id}` | Gym overview |
| GET | `/api/superadmin/gyms/{id}/deep-dive` | Full telemetry, errors, billing |
| GET | `/api/superadmin/gyms/{id}/members` | Paginated member list |
| POST | `/api/superadmin/gyms/{id}/broadcast` | Send message to gym users |
| POST | `/api/superadmin/gyms/{id}/impersonate` | Generate impersonation token |
| PUT | `/api/superadmin/gyms/{id}/suspend` | Suspend gym |
| PUT | `/api/superadmin/gyms/{id}/activate` | Activate gym |

### 6.2 Gym List DTO

```java
public class GymListDTO {
    private Long id;
    private String name;
    private String ownerName;
    private String ownerEmail;
    private String plan;
    private String status;
    private Integer memberCount;
    private BigDecimal revenue;
    private String healthScore; // "87" - just the number for sorting
    private SparklineData sparkline;
    private String lastOwnerLogin;
    private Boolean hasRevenueLeakage;
    private BigDecimal stuckAmount;
}
```

### 6.3 Sparkline Query (Optimized)

```sql
-- Pre-aggregated for performance
CREATE TABLE gym_daily_stats (
    gym_id BIGINT NOT NULL,
    stat_date DATE NOT NULL,
    total_checkins INTEGER,
    total_revenue DECIMAL(12,2),
    UNIQUE(gym_id, stat_date)
);

CREATE INDEX idx_gym_daily_stats ON gym_daily_stats (gym_id, stat_date DESC);
```

---

## 7. Testing Procedures

### 7.1 Unit Tests
```typescript
describe('GymHealthScore', () => {
  it('displays correct color for score > 80', () => {
    render(<GymHealthScore score={87} />);
    expect(screen.getByText('87')).toHaveAttribute('fill', '#10B981');
  });

  it('displays correct color for score < 50', () => {
    render(<GymHealthScore score={45} />);
    expect(screen.getByText('45')).toHaveAttribute('fill', '#EF4444');
  });
});
```

### 7.2 Integration Tests
- Test pagination with 1000+ gyms
- Test drawer lazy loading
- Test optimistic suspend/activate
- Test search with special characters

### 7.3 E2E Tests
1. Load gyms list
2. Search for "FitZone"
3. Click gym row
4. Verify drawer opens with tabs
5. Click "Suspend" action
6. Confirm suspension

---

## 8. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Table scroll FPS | 60fps | Chrome DevTools Performance |
| Initial load (100 gyms) | < 500ms | Network tab |
| Drawer open latency | < 200ms | Performance mark |
| Search response | < 100ms | Debounced input |
| Accessibility | WCAG 2.1 AA | axe-core |

---

## 9. Deliverables Checklist

- [ ] `SAGyms.tsx` with virtualized table
- [ ] GymHealthScore component with SVG ring
- [ ] RevenueLeakageBadge with pulse animation
- [ ] Inline sparkline charts
- [ ] Owner activity status indicators
- [ ] Deep-dive drawer with lazy loading tabs
- [ ] Optimistic suspend/activate mutations
- [ ] Broadcast message functionality
- [ ] Owner impersonation flow
- [ ] Backend endpoints for all operations
- [ ] Unit tests >80% coverage
