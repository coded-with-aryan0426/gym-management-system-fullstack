export { useApi, default as useApiDefault } from './useApi';
export { useRealTimeData } from './useRealTimeData';
export { useOptimisticUpdates } from './useOptimisticUpdates';
export { useMicroInteractions } from './useMicroInteractions';
export { useClickOutside } from './useClickOutside';
export { useAlphabeticalSort, type SortOrder } from './useAlphabeticalSort';
export { useFeature } from './useFeature';

// React Query hooks (Phase 4: Performance & Polish)
export {
    useMemberDashboard,
    useTrainerDashboard,
    useOwnerDashboard,
    useAvailableClasses,
    useMyBookings,
    useAllClasses,
    useBookClass,
    useCancelBooking,
    useMyMembership,
    useMyAttendance,
    useMyTrainer,
    useMyMembers,
    useNotifications,
    useMarkNotificationRead,
    useMyProgress,
    usePrefetchDashboard,
    useInvalidateDashboards,
} from './useQueries';
