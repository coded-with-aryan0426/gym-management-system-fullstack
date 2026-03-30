"use client"

import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import type { User } from '../types/user'
import { useAuth } from './AuthContext'

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

/**
 * TrainerProvider - Now powered by React Query for optimized caching
 * 
 * Stage 1 Optimization:
 * - Replaced useState/useEffect with React Query
 * - Automatic caching (2min stale, 15min gc)
 * - Background refetching on window focus
 * - Deduplication of concurrent requests
 * - No more cascading re-renders on every fetch
 */
export const TrainerProvider: React.FC<TrainerProviderProps> = ({ children }) => {
    const { isAuthenticated } = useAuth()
    const queryClient = useQueryClient()

    // Use React Query instead of useState/useEffect
    const { data: trainersData, isLoading } = useQuery({
        queryKey: ['trainers', 'context-all'],
        queryFn: () => api.getUsers('TRAINER'),
        enabled: isAuthenticated,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 15 * 60 * 1000,   // 15 minutes
        refetchOnWindowFocus: true,
        placeholderData: [],
    })

    const trainers = useMemo(() => {
        return Array.isArray(trainersData) ? trainersData : []
    }, [trainersData])

    // Memoized stats calculation
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

    // refreshTrainers now invalidates React Query cache
    const refreshTrainers = async () => {
        await queryClient.invalidateQueries({ queryKey: ['trainers'] })
    }

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        trainers,
        loading: isLoading,
        stats,
        refreshTrainers,
    }), [trainers, isLoading, stats])

    return (
        <TrainerContext.Provider value={value}>
            {children}
        </TrainerContext.Provider>
    )
}

export default TrainerContext
