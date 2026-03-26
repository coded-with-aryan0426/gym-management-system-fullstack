# 06: Super Admin Features & Toggles Plan

## 1. Ultimate Goal

Transform `SAFeatureFlags.tsx` from simple boolean toggles into a mission-critical **Emergency Kill Switch** and **Gradual Rollout Center**. The operator must instantly disable catastrophically buggy features globally without redeploying, and safely roll out new features to percentage-based canaries.

---

## 2. Current Page Analysis

### 2.1 File Location
`/Users/aryan/Sem 8/Intership/frontend/src/pages/superadmin/SAFeatureFlags.tsx`

### 2.2 Current Implementation
- Feature flags list
- Toggle switches to enable/disable
- Feature descriptions
- Last updated timestamp

### 2.3 Identified Issues
| Issue | Severity | Impact |
|-------|----------|--------|
| No rollout percentages | High | Can't do canary releases |
| No blast radius counter | Medium | Don't know impact |
| No optimistic updates | Medium | UI feels laggy |
| No cache invalidation | High | Feature state may be stale |
| No audit trail | High | Who changed what? |

---

## 3. Enhanced Features Specification

### 3.1 iOS-Style Toggle Switch

#### Visual States
| State | Background | Thumb Position |
|-------|------------|----------------|
| Off | `#374151` | Left (2px) |
| On | `#10B981` | Right (22px) |
| Transition | 200ms ease-in-out | spring animation |

#### Interaction
- **Hover:** Thumb projects shadow
- **Click:** Spring animation to new state
- **Loading:** Thumb shows spinner, toggle disabled

### 3.2 Percentage Rollout Slider

#### UI
- Expandable toggle → reveals slider (0-100%)
- Slider shows live percentage
- "Active Users Impacted" counter updates in real-time

```typescript
interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number; // 0-100
  targetGymIds?: number[]; // For gym-specific rollout
  impactCount: number; // Live count of affected users
  updatedBy: string;
  updatedAt: string;
}
```

### 3.3 Phased Rollout Options

| Rollout Type | Description | Use Case |
|--------------|-------------|----------|
| Global ON/OFF | 100% or 0% | Emergency kill switch |
| Percentage | Random % of users | Canary release |
| Gym-specific | Target certain gyms | Beta testers |
| Admin-only | Platform team only | Internal testing |

### 3.4 Destructive Flag Confirmation

#### Critical Flag Warning
When toggling certain flags (marked critical), show confirmation modal:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Critical Feature Toggle                                  │
│                                                              │
│ You are about to disable:                                    │
│ "REQUIRE_PAYMENT_METHOD_FOR_SIGNUP"                         │
│                                                              │
│ This will allow users to sign up WITHOUT payment method.    │
│                                                              │
│ Type "DISABLE" to confirm: [__________]                     │
│                                                              │
│                        [Cancel]  [I Understand, Disable]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. UI/UX Layout Specification

### 4.1 Features Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🚩 Feature Flags                      [+ New Flag] [Export] [Settings ⚙️]      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ FEATURE NAME              │ STATUS      │ ROLLOUT   │ IMPACT  │ ACTIONS   │ │
│ ├────────────────────────────┼─────────────┼───────────┼─────────┼───────────┤ │
│ │ AI_WORKOUT_GENERATOR      │ [ON  ] ○    │ 15%       │ 1,402   │ [Edit][X] │ │
│ │ STRIPE_CHECKOUT_V2        │ [OFF ] ○    │ 0%        │ 0       │ [Edit][X] │ │
│ │ NEW_DASHBOARD_UI          │ [ON  ] ○    │ 100%      │ 12,847  │ [Edit][X] │ │
│ │ MAINTENANCE_MODE          │ [OFF ] ○    │ —         │ 0       │ [Edit][X] │ │
│ └────────────────────────────┴─────────────┴───────────┴─────────┴───────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Flag Edit Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Feature Flag                                     [X]  │
│                                                              │
│ Key: AI_WORKOUT_GENERATOR (read-only)                       │
│                                                              │
│ Name: [AI Workout Generator________________]                  │
│ Description: [Generates personalized workouts using AI___]     │
│                                                              │
│ Status: (ON/OFF toggle)                                      │
│                                                              │
│ Rollout:                                                     │
│ ○ Global (100%)                                             │
│ ○ Percentage: [====●====] 15%                               │
│ ○ Gym-specific: [Select gyms..._________________]           │
│                                                              │
│ Impact Preview: ~1,402 users will receive this feature       │
│                                                              │
│                        [Cancel]  [Save Changes]             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Implementation

### 5.1 Optimistic Toggle Update

```typescript
const toggleMutation = useMutation({
  mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
    superAdminApi.updateFeatureFlag(key, { enabled }),

  onMutate: async ({ key, enabled }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['superadmin', 'features']);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['superadmin', 'features']);

    // Optimistically update
    queryClient.setQueryData(['superadmin', 'features'], (old) =>
      old.map(f => f.key === key ? { ...f, isEnabled: enabled } : f)
    );

    return { previous };
  },

  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['superadmin', 'features'], context.previous);
    toast.error(`Failed to update: ${err.message}`);
  },

  onSuccess: () => {
    toast.success('Feature flag updated');
  },
});
```

### 5.2 Confirmation Modal for Critical Flags

```typescript
const handleCriticalToggle = async (flag: FeatureFlag, newValue: boolean) => {
  if (!flag.isCritical) {
    toggleMutation.mutate({ key: flag.key, enabled: newValue });
    return;
  }

  // Show confirmation modal
  const confirmed = await showConfirmModal({
    title: 'Critical Feature Toggle',
    message: `You are about to ${newValue ? 'ENABLE' : 'DISABLE'}: ${flag.name}`,
    requiredText: newValue ? 'ENABLE' : 'DISABLE',
    danger: !newValue,
  });

  if (confirmed) {
    toggleMutation.mutate({ key: flag.key, enabled: newValue });
  }
};
```

---

## 6. Backend Implementation

### 6.1 Required Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superadmin/features` | List all flags |
| GET | `/api/superadmin/features/{key}` | Flag details |
| PUT | `/api/superadmin/features/{key}` | Update flag |
| POST | `/api/superadmin/features` | Create new flag |
| POST | `/api/superadmin/features/{key}/toggle` | Quick toggle |

### 6.2 Cache Invalidation

```java
@CachePut(value = "featureFlags", key = "#key")
public FeatureFlag updateFeatureFlag(String key, FeatureFlagUpdateRequest request) {
    FeatureFlag flag = repository.findByKey(key);

    // Update flag
    flag.setEnabled(request.isEnabled());
    flag.setRolloutPercentage(request.getRolloutPercentage());
    flag.setUpdatedAt(LocalDateTime.now());
    flag.setUpdatedBy(getCurrentAdmin());

    // Save to DB
    FeatureFlag saved = repository.save(flag);

    // Invalidate Redis cache for ALL instances
    redisTemplate.delete("feature:*"); // Wildcard invalidation

    // Publish update event for active sessions
    applicationEventPublisher.publishEvent(
        new FeatureFlagChangedEvent(saved)
    );

    return saved;
}
```

### 6.3 Feature Flag Evaluation

```java
@Service
public class FeatureFlagService {

    public boolean isEnabled(String flagKey, Long userId) {
        FeatureFlag flag = getFlag(flagKey);

        if (!flag.isEnabled()) return false;

        // Percentage-based rollout
        if (flag.getRolloutPercentage() < 100) {
            int hash = (flagKey + userId).hashCode();
            return (Math.abs(hash) % 100) < flag.getRolloutPercentage();
        }

        return true;
    }
}
```

---

## 7. Database Schema

### 7.1 Feature Flags Table

```sql
CREATE TABLE feature_flags (
    id BIGSERIAL PRIMARY KEY,
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INT DEFAULT 100,
    target_gym_ids JSONB, -- For gym-specific rollout
    is_critical BOOLEAN DEFAULT FALSE,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_key ON feature_flags (flag_key);
```

---

## 8. Success Criteria

| Criterion | Target | Validation |
|-----------|--------|------------|
| Toggle response | < 100ms perceived | Optimistic update |
| Cache invalidation | < 500ms | Redis monitor |
| Rollout accuracy | ±1% of target | A/B test verification |
| Critical flag safety | 100% confirmation | Audit log review |
| Accessibility | WCAG 2.1 AA | axe-core |

---

## 9. Deliverables Checklist

- [ ] `SAFeatureFlags.tsx` with iOS-style toggles
- [ ] Percentage rollout slider
- [ ] Gym-specific targeting
- [ ] Critical flag confirmation modal
- [ ] Optimistic toggle updates
- [ ] Real-time impact counter
- [ ] Backend cache invalidation
- [ ] Redis pub/sub for cache
- [ ] Feature flag evaluation service
- [ ] Audit trail for changes
- [ ] Unit tests >80% coverage
