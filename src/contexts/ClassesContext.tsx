"use client"

import React, { createContext, useContext, useState, type ReactNode } from 'react'

export interface ClassStats {
    todayTotal: number
    todayEnrolled: number
    todayCapacity: number
    todayOccupancy: number
    weekTotal: number
    weekEnrolled: number
    weekCapacity: number
    occupancyRate: number
    upcomingToday: number
    inProgressNow: number
    availableSpots: number
    fullClasses: number
    uniqueTrainers: number
    mostPopularType: string
}

const defaultStats: ClassStats = {
    todayTotal: 0,
    todayEnrolled: 0,
    todayCapacity: 0,
    todayOccupancy: 0,
    weekTotal: 0,
    weekEnrolled: 0,
    weekCapacity: 0,
    occupancyRate: 0,
    upcomingToday: 0,
    inProgressNow: 0,
    availableSpots: 0,
    fullClasses: 0,
    uniqueTrainers: 0,
    mostPopularType: 'Yoga',
}

interface ClassesContextType {
    stats: ClassStats
    setStats: (stats: ClassStats) => void
}

const ClassesContext = createContext<ClassesContextType>({
    stats: defaultStats,
    setStats: () => {},
})

export const useClasses = () => useContext(ClassesContext)

interface ClassesProviderProps {
    children: ReactNode
}

export const ClassesProvider: React.FC<ClassesProviderProps> = ({ children }) => {
    const [stats, setStats] = useState<ClassStats>(defaultStats)

    return (
        <ClassesContext.Provider value={{ stats, setStats }}>
            {children}
        </ClassesContext.Provider>
    )
}

export default ClassesContext
