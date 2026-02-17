import React, { createContext, useContext, useState, useEffect, type ReactNode, useMemo, useCallback } from 'react';
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

    const fetchMembers = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        // Keep loading true only on initial fetch or full refresh if needed
        // Usually we might want silent refresh, but for now specific loading state is OK
        // Start loading only if we have no members (initial load) to avoid Flicker
        if (members.length === 0) setLoading(true);

        try {
            const data = await api.getMembers();
            setMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.warn("Failed to load members", error);
            setMembers([]); // Fallback
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, members.length]);

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
            if (m.startDate && m.planDuration) {
                const startDate = new Date(m.startDate);
                const durationStr = m.planDuration.toLowerCase();
                let expiryDate = new Date(startDate);

                if (durationStr.includes('year')) {
                    const years = parseInt(durationStr) || 1;
                    expiryDate.setMonth(expiryDate.getMonth() + years * 12);
                } else if (durationStr.includes('month')) {
                    const months = parseInt(durationStr) || 1;
                    expiryDate.setMonth(expiryDate.getMonth() + months);
                } else if (durationStr.includes('day')) {
                    const days = parseInt(durationStr) || 30;
                    expiryDate.setDate(expiryDate.getDate() + days);
                }

                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
                    expiringSoon++;
                }

                if (startDate >= monthStart) {
                    newThisMonth++;
                }
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
