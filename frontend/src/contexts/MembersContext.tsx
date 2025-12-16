import React, { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import api from '../services/api';
import { type MemberDTO } from '../types/user';

interface MembersContextType {
    members: MemberDTO[];
    loading: boolean;
    refreshMembers: () => Promise<void>;
    stats: {
        total: number;
        active: number;
        inactive: number;
        todaysJoins: number;
    };
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export const MembersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [members, setMembers] = useState<MemberDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        // Keep loading true only on initial fetch or full refresh if needed
        // Usually we might want silent refresh, but for now specific loading state is OK
        // Start loading only if we have no members (initial load) to avoid Flicker
        if (members.length === 0) setLoading(true);

        try {
            const data = await api.getMembers();
            console.log("[MembersContext] Loaded:", data);
            setMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load members", error);
            setMembers([]); // Fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const stats = useMemo(() => {
        const total = members.length;
        // Ensure case-insensitive or standardized check if needed. 
        // Assuming backend returns "Active" or "ACTIVE". We check "Active" based on typical frontend enum.
        // Robust Case-Insensitive Check
        const active = members.filter(m => (m.status || '').toUpperCase() === 'ACTIVE').length;
        const inactive = total - active;

        // Calculate Today's Joins
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

        return { total, active, inactive, todaysJoins };
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
