import React, { createContext, useContext, useState, useEffect, type ReactNode, useMemo, useCallback, useRef } from 'react';
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

export const MembersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [members, setMembers] = useState<MemberDTO[]>([]);
    const [loading, setLoading] = useState(true);
    // Use ref to track initial load - avoids circular dependency issue
    const isInitialLoadRef = useRef(true);

    const fetchMembers = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        // Only show loading spinner on initial load to avoid flicker
        if (isInitialLoadRef.current) {
            setLoading(true);
        }

        try {
            const data = await api.getMembers();
            setMembers(Array.isArray(data) ? data : []);
            isInitialLoadRef.current = false;
        } catch (error) {
            console.warn("Failed to load members", error);
            setMembers([]); // Fallback
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]); // Removed members.length dependency - fixes circular issue

    useEffect(() => {
        if (isAuthenticated) {
            fetchMembers();
        } else {
            setMembers([]);
            setLoading(false);
        }
    }, [isAuthenticated, fetchMembers]);

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
            } catch (e) { return false; }
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
                let expiryDate = new Date(startDate);
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

    return (
        <MembersContext.Provider value={{ members, loading, refreshMembers: fetchMembers, stats }}>
            {children}
        </MembersContext.Provider>
    );
};

export const useMembers = () => {
    const context = useContext(MembersContext);
    if (!context) throw new Error("useMembers must be used within MembersProvider");
    return context;
};
