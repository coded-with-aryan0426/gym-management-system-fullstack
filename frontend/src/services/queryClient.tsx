import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 3 * 60 * 1000,
            gcTime: 15 * 60 * 1000,
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
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
    all: () => queryClient.invalidateQueries(),
};

export default queryClient;