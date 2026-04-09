# Phase 4: React Query Caching - Migration Guide

## ✅ Completed Steps

### 1. QueryClient Configuration
- **File**: `/frontend/src/services/queryClient.tsx`
- ✅ Enhanced with optimal caching settings
- ✅ Added React Query DevTools (development only)
- ✅ Extended invalidateQueries helper with dashboard-specific methods

### 2. Custom Query Hooks
- **File**: `/frontend/src/hooks/useQueries.ts` (NEW)
- ✅ Created comprehensive hooks for all major data fetching operations
- ✅ Includes hooks for:
  - Dashboard data (Member, Trainer, Owner)
  - Gym classes (available classes, bookings)
  - Membership and attendance
  - Trainer and member relationships
  - Notifications
  - Progress tracking
  - Utility hooks for prefetching and cache invalidation

### 3. QueryClientProvider
- **File**: `/frontend/src/contexts/AppProvider.tsx`
- ✅ Already wrapped with QueryProvider
- ✅ DevTools added to QueryProvider component

### 4. Exported Hooks
- **File**: `/frontend/src/hooks/index.ts`
- ✅ All new hooks exported for easy import

## 📋 Available Hooks

### Dashboard Hooks
```typescript
// Member Dashboard
const { data, isLoading, error, refetch } = useMemberDashboard(userId);

// Trainer Dashboard
const { data, isLoading, error, refetch } = useTrainerDashboard();

// Owner Dashboard
const { data, isLoading, error, refetch } = useOwnerDashboard();
```

### Class Management Hooks
```typescript
// Get available classes
const { data: classes, isLoading } = useAvailableClasses();

// Get member's bookings
const { data: bookings, isLoading } = useMyBookings(userId);

// Book a class (mutation)
const bookClass = useBookClass();
bookClass.mutate({ classId, memberId }, {
  onSuccess: () => toast.success('Class booked!'),
  onError: (error) => toast.error('Failed to book class')
});

// Cancel a booking (mutation)
const cancelBooking = useCancelBooking();
cancelBooking.mutate({ bookingId, memberId });
```

### Other Data Hooks
```typescript
// Membership
const { data: membership } = useMyMembership(userId);

// Attendance
const { data: attendance } = useMyAttendance(userId);

// Trainer
const { data: trainer } = useMyTrainer(userId);

// Trainer's Members
const { data: members } = useMyMembers();

// Notifications
const { data: notifications } = useNotifications();
const markAsRead = useMarkNotificationRead();

// Progress
const { data: progress } = useMyProgress(userId);
```

### Utility Hooks
```typescript
// Prefetch dashboard on login
const { prefetchMemberDashboard } = usePrefetchDashboard();
prefetchMemberDashboard(userId);

// Invalidate caches after updates
const { invalidateAll, invalidateMember } = useInvalidateDashboards();
invalidateAll();
```

## 🔄 Migration Examples

### Example 1: Member Dashboard Migration

**BEFORE (direct API call):**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const loadDashboard = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get("/member/dashboard", { 
            params: { memberId } 
        });
        setData(response.data);
    } catch (err) {
        setError(err);
    } finally {
        setLoading(false);
    }
}, [memberId]);

useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
}, [loadDashboard]);
```

**AFTER (React Query):**
```typescript
import { useMemberDashboard } from '../../hooks';

const { data, isLoading, error, refetch } = useMemberDashboard(memberId);

// That's it! React Query handles:
// - Loading states
// - Error states
// - Caching (5 minutes)
// - Automatic refetching
// - Deduplication
```

### Example 2: Booking Classes

**BEFORE:**
```typescript
const bookClass = async (classId) => {
    try {
        setLoading(true);
        await api.gymClassApi.bookClass(classId, memberId);
        // Manually refetch data
        await fetchBookings();
        await fetchClasses();
        toast.success('Booked!');
    } catch (error) {
        toast.error('Failed');
    } finally {
        setLoading(false);
    }
};
```

**AFTER:**
```typescript
import { useBookClass } from '../../hooks';

const bookClassMutation = useBookClass();

const handleBookClass = (classId) => {
    bookClassMutation.mutate({ classId, memberId }, {
        onSuccess: () => toast.success('Class booked!'),
        onError: (error) => toast.error('Failed to book class'),
    });
};

// React Query automatically:
// - Invalidates related queries (bookings, classes, dashboard)
// - Shows loading state via bookClassMutation.isLoading
// - Handles errors
```

## 🎯 Benefits

### Performance Improvements
- **Reduced API Calls**: Cached data reduces redundant requests
- **Instant Navigation**: Cached data shows immediately on route changes
- **Background Updates**: Stale data refetches in background
- **Deduplication**: Multiple components requesting same data = single request

### Developer Experience
- **Less Boilerplate**: No manual loading/error state management
- **Type Safety**: All hooks are fully typed
- **DevTools**: Visual inspection of cache and queries
- **Automatic Retries**: Failed requests retry automatically

### Cache Configuration
```typescript
Dashboard Data:  5 min stale, 10 min cache
Class Data:      2 min stale, 5 min cache
Bookings:        1 min stale, 5 min cache
Notifications:   30 sec stale, 2 min cache
Membership:      5 min stale, 15 min cache
Trainer Info:    10 min stale, 30 min cache
```

## 🚀 Next Steps (Optional Migration)

To fully leverage React Query caching, gradually migrate existing components:

### Priority 1: High-Traffic Pages
1. ✅ Member Dashboard (`MemberDashboard.tsx`)
2. ✅ Trainer Dashboard (`TrainerDashboard.tsx`)
3. ✅ Owner Dashboard (`Dashboard.tsx`)

### Priority 2: Frequently Updated Data
4. Available Classes page
5. My Bookings page
6. Notifications component

### Priority 3: Lower Priority
7. Membership details
8. Progress tracking
9. Attendance history

### Migration Pattern
```typescript
// 1. Import the hook
import { useMemberDashboard } from '../../hooks';

// 2. Replace useState + useEffect with hook
const { data, isLoading, error, refetch } = useMemberDashboard(userId);

// 3. Replace manual loading checks
if (isLoading) return <Loader />;
if (error) return <Error />;

// 4. Use the data
return <Dashboard data={data} onRefresh={refetch} />;
```

## 🔧 Troubleshooting

### DevTools Not Showing?
- Ensure you're in development mode (`npm run dev`)
- Look for floating React Query icon in bottom-right corner
- Toggle with button or set `initialIsOpen={true}` in queryClient.tsx

### Stale Data Issues?
- Adjust `staleTime` in hook options
- Call `refetch()` manually when needed
- Use `invalidateQueries` after mutations

### TypeScript Errors?
- Ensure api.ts exports are typed correctly
- Add type parameters to hooks if needed
- Check that apiClient responses match expected types

## 📊 Testing React Query

### View Cache in DevTools
1. Run app in development
2. Click React Query DevTools button (bottom-right)
3. See all queries, their status, and cached data
4. Manually invalidate or refetch queries

### Test Caching
1. Navigate to Member Dashboard
2. Navigate away
3. Navigate back - data shows instantly (from cache)
4. Wait for stale time - data refetches in background

## 📚 Documentation

- React Query Docs: https://tanstack.com/query/latest
- Caching Guide: https://tanstack.com/query/latest/docs/react/guides/caching
- Optimistic Updates: https://tanstack.com/query/latest/docs/react/guides/optimistic-updates
