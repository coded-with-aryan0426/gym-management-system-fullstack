"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import api from '../services/api'
import type { User } from '../types/user'

interface StaffContextType {
    staff: User[]
    loading: boolean
    stats: {
        total: number
        active: number
        assignedToday: number
    }
    refreshStaff: () => Promise<void>
}

const StaffContext = createContext<StaffContextType>({
    staff: [],
    loading: true,
    stats: { total: 0, active: 0, assignedToday: 0 },
    refreshStaff: async () => { },
})

export const useStaff = () => useContext(StaffContext)

interface StaffProviderProps {
    children: ReactNode
}

export const StaffProvider: React.FC<StaffProviderProps> = ({ children }) => {
    const [staff, setStaff] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    const fetchStaff = useCallback(async () => {
        // Only show loading indicator on initial fetch
        if (staff.length === 0) {
            setLoading(true)
        }

        try {
            const data = await api.getUsers('TRAINER')
            setStaff(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load staff', error)
            setStaff([])
        } finally {
            setLoading(false)
        }
    }, [staff.length])

    // Initial fetch
    useEffect(() => {
        fetchStaff()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Calculate stats from staff array
    const stats = useMemo(() => {
        const total = staff.length

        // Consider trainer "active" if not marked inactive
        const active = staff.filter(s => {
            const status = s.status?.toLowerCase() || 'active'
            return status !== 'inactive' && status !== 'expired'
        }).length

        // For assignedToday, we'll count all active trainers as a placeholder
        // In production, this would query assignment timestamps from backend
        const assignedToday = active

        return { total, active, assignedToday }
    }, [staff])

    const value = useMemo(() => ({
        staff,
        loading,
        stats,
        refreshStaff: fetchStaff,
    }), [staff, loading, stats, fetchStaff])

    return (
        <StaffContext.Provider value={value}>
            {children}
        </StaffContext.Provider>
    )
}

export default StaffContext
