import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * React Query Configuration
 * Optimized for 24+ concurrent users with caching and deduplication
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data stays fresh for 2 minutes - reduces API calls
            staleTime: 2 * 60 * 1000,
            
            // Cache data for 10 minutes after it becomes unused
            gcTime: 10 * 60 * 1000,
            
            // Retry failed requests up to 2 times
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
            
            // Don't refetch on window focus for local testing
            refetchOnWindowFocus: false,
            
            // Don't refetch on reconnect for local testing
            refetchOnReconnect: false,
            
            // Network mode for local development
            networkMode: 'always',
        },
        mutations: {
            // Retry mutations once
            retry: 1,
            
            // Network mode
            networkMode: 'always',
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * Query Provider component to wrap the application
 */
export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

/**
 * Utility function to invalidate related queries
 */
export const invalidateQueries = {
    members: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
    trainers: () => queryClient.invalidateQueries({ queryKey: ['trainers'] }),
    sessions: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
    analytics: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    transactions: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    all: () => queryClient.invalidateQueries(),
};

/**
 * Prefetch commonly used data
 */
export const prefetchQueries = {
    dashboard: async () => {
        await queryClient.prefetchQuery({
            queryKey: ['dashboard', 'stats'],
            queryFn: () => import('./api').then(m => m.getDashboardStats()),
            staleTime: 60 * 1000,
        });
    },
};

export default queryClient;
