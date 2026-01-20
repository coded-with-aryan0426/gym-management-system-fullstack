"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import api from '../services/api'
import type { User } from '../types/user'

interface TrainerContextType {
    trainers: User[]
    loading: boolean
    stats: {
        total: number
        active: number
        inactive: number
        newThisMonth: number
        assignedToday: number
    }
    refreshTrainers: () => Promise<void>
}

const TrainerContext = createContext<TrainerContextType>({
    trainers: [],
    loading: true,
    stats: { total: 0, active: 0, inactive: 0, newThisMonth: 0, assignedToday: 0 },
    refreshTrainers: async () => { },
})

export const useTrainers = () => useContext(TrainerContext)

interface TrainerProviderProps {
    children: ReactNode
}

export const TrainerProvider: React.FC<TrainerProviderProps> = ({ children }) => {
    const [trainers, setTrainers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTrainers = useCallback(async () => {
        // Only show loading indicator on initial fetch
        if (trainers.length === 0) {
            setLoading(true)
        }

        try {
            const data = await api.getUsers('TRAINER')
            setTrainers(Array.isArray(data) ? data : [])
        } catch (error) {
            console.warn('Failed to load trainers', error)
            setTrainers([])
        } finally {
            setLoading(false)
        }
    }, [trainers.length])

    // Initial fetch
    useEffect(() => {
        fetchTrainers()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const stats = useMemo(() => {
        const total = trainers.length

        const active = trainers.filter(t => {
            const status = (t.status || 'active').toLowerCase()
            return status === 'active'
        }).length

        const inactive = total - active

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const newThisMonth = trainers.filter(t => {
            if (!t.createdAt) return false
            const joinDate = new Date(t.createdAt)
            return joinDate >= monthStart
        }).length

        const assignedToday = active

        return { total, active, inactive, newThisMonth, assignedToday }
    }, [trainers])

    const value = useMemo(() => ({
        trainers,
        loading,
        stats,
        refreshTrainers: fetchTrainers,
    }), [trainers, loading, stats, fetchTrainers])

    return (
        <TrainerContext.Provider value={value}>
            {children}
        </TrainerContext.Provider>
    )
}

export default TrainerContext
