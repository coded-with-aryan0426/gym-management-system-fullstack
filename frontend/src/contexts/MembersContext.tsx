import React, { createContext, useContext, type ReactNode, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { type MemberDTO } from '../types/user';
import { useAuth } from './AuthContext';

interface MembersContextType {
    members: MemberDTO[];
    loading: boolean;
    refreshMembers: () => Promise<void>;
    stats: {
        total: number;
        active: number;
        inactive: number;
        todaysJoins: number;
        expiringSoon: number;
        newThisMonth: number;
    };
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

/**
 * MembersProvider - Now powered by React Query for optimized caching
 * 
 * Stage 1 Optimization:
 * - Replaced useState/useEffect with React Query
 * - Automatic caching (2min stale, 15min gc)
 * - Background refetching on window focus
 * - Deduplication of concurrent requests
 * - No more cascading re-renders on every fetch
 */
export const MembersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Use React Query instead of useState/useEffect
    const { data: membersData, isLoading } = useQuery({
        queryKey: ['members', 'context-all'],
        queryFn: () => api.getMembers(),
        enabled: isAuthenticated,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 15 * 60 * 1000,   // 15 minutes
        refetchOnWindowFocus: true,
        placeholderData: [],
    });

    const members = useMemo(() => {
        return Array.isArray(membersData) ? membersData : [];
    }, [membersData]);

    // Memoized stats calculation - only recalculates when members change
    const stats = useMemo(() => {
        const total = members.length;
        const active = members.filter(m => (m.status || '').toUpperCase() === 'ACTIVE').length;
        const inactive = total - active;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysJoins = members.filter(m => {
            const dateStr = m.joinDate || m.createdAt || m.startDate;
            if (!dateStr) return false;

            try {
                const d = new Date(dateStr);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            } catch { return false; }
        }).length;

        const now = new Date();
        let expiringSoon = 0;
        let newThisMonth = 0;

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        members.forEach(m => {
            const mAny = m as any;
            let expiryMs: number | null = null;

            if (mAny.endDateTime) {
                expiryMs = new Date(mAny.endDateTime).getTime() - now.getTime();
            } else if (m.endDate) {
                expiryMs = new Date(m.endDate).getTime() - now.getTime();
            } else if (m.startDate && m.planDuration) {
                const startDate = new Date(m.startDate);
                const durationStr = m.planDuration.toLowerCase();
                const expiryDate = new Date(startDate);
                if (durationStr.includes('year')) {
                    expiryDate.setMonth(expiryDate.getMonth() + (parseInt(durationStr) || 1) * 12);
                } else if (durationStr.includes('month')) {
                    expiryDate.setMonth(expiryDate.getMonth() + (parseInt(durationStr) || 1));
                } else if (durationStr.includes('day')) {
                    expiryDate.setDate(expiryDate.getDate() + (parseInt(durationStr) || 30));
                }
                expiryMs = expiryDate.getTime() - now.getTime();
            }

            if (expiryMs !== null) {
                const daysUntilExpiry = expiryMs / (1000 * 60 * 60 * 24);
                if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
                    expiringSoon++;
                }
            }

            const dateStr = m.startDate || m.joinDate || (m as any).createdAt;
            if (dateStr && new Date(dateStr) >= monthStart) {
                newThisMonth++;
            }
        });

        return { total, active, inactive, todaysJoins, expiringSoon, newThisMonth };
    }, [members]);

    // refreshMembers now invalidates React Query cache
    const refreshMembers = async () => {
        await queryClient.invalidateQueries({ queryKey: ['members'] });
    };

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        members,
        loading: isLoading,
        refreshMembers,
        stats,
    }), [members, isLoading, stats]);

    return (
        <MembersContext.Provider value={value}>
            {children}
        </MembersContext.Provider>
    );
};

export const useMembers = () => {
    const context = useContext(MembersContext);
    if (!context) throw new Error("useMembers must be used within MembersProvider");
    return context;
};
