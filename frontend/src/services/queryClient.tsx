import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 3 * 60 * 1000, // 3 minutes default
            gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
            refetchOnWindowFocus: false, // Don't refetch on window focus to reduce API calls
            refetchOnReconnect: true, // Refetch when connection is restored
            refetchOnMount: true, // Refetch stale data on mount
            networkMode: 'always',
        },
        mutations: {
            retry: 1,
            networkMode: 'always',
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* React Query Devtools disabled unless dependency is installed */}
        </QueryClientProvider>
    );
}

export const invalidateQueries = {
    members: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
    trainers: () => queryClient.invalidateQueries({ queryKey: ['trainers'] }),
    sessions: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    analytics: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    transactions: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    dashboard: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    // Dashboard-specific invalidations (Phase 4)
    memberDashboard: () => queryClient.invalidateQueries({ queryKey: ['memberDashboard'] }),
    trainerDashboard: () => queryClient.invalidateQueries({ queryKey: ['trainerDashboard'] }),
    ownerDashboard: () => queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] }),
    // Class-related invalidations
    availableClasses: () => queryClient.invalidateQueries({ queryKey: ['availableClasses'] }),
    myBookings: () => queryClient.invalidateQueries({ queryKey: ['myBookings'] }),
    // Invalidate all
    all: () => queryClient.invalidateQueries(),
};

export default queryClient;
