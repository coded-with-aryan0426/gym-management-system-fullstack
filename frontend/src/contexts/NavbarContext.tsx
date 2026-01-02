"use client"

import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

// Types for navbar configuration
export type MetricType = 'members' | 'staff' | 'financial' | 'sessions' | 'none'

export interface NavbarMetric {
    key: string
    label: string
    prefix?: string // e.g., "+" for today's joins, "₹" for revenue
}

export interface NavbarConfig {
    pageTitle: string
    metricType: MetricType
    metrics: NavbarMetric[]
    showFiltersButton?: boolean
    showExportButton?: boolean
    showDateRange?: boolean
    showAlerts?: boolean
}

// Page-specific configurations
const navbarConfigs: Record<string, NavbarConfig> = {
    '/dashboard': {
        pageTitle: 'Dashboard',
        metricType: 'none',  // No stats on dashboard as requested
        metrics: [],
    },
    '/members': {
        pageTitle: 'Members',
        metricType: 'members',
        metrics: [
            { key: 'total', label: 'Total' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Expired' },
            { key: 'expiringSoon', label: 'Expiring' },
            { key: 'newThisMonth', label: 'New' },
        ],
    },
    '/staff': {
        pageTitle: 'Staff',
        metricType: 'staff',
        metrics: [
            { key: 'total', label: 'Total Trainers' },
            { key: 'active', label: 'Active' },
            { key: 'assignedToday', label: 'Assigned Today' },
        ],
    },
    '/trainers': {
        pageTitle: 'Trainers',
        metricType: 'staff',
        metrics: [
            { key: 'total', label: 'Total Trainers' },
            { key: 'active', label: 'Active' },
            { key: 'assignedToday', label: 'Assigned Today' },
        ],
    },
    '/classes': {
        pageTitle: 'Classes',
        metricType: 'none',
        metrics: [], // Minimal navbar - no stats
    },
    '/financials': {
        pageTitle: 'Financials',
        metricType: 'financial',
        metrics: [
            { key: 'todayRevenue', label: "Today's Revenue", prefix: '₹' },
            { key: 'pending', label: 'Pending' },
            { key: 'monthlyRevenue', label: 'Monthly', prefix: '₹' },
        ],
        showExportButton: true,
    },
    '/pt-sessions': {
        pageTitle: 'PT Sessions',
        metricType: 'sessions',
        metrics: [
            { key: 'todaySessions', label: "Today's Sessions" },
            { key: 'activeSessions', label: 'Active' },
        ],
    },
    '/reports': {
        pageTitle: 'Reports',
        metricType: 'none',
        metrics: [],
        showDateRange: true,
        showExportButton: true,
    },
    '/settings': {
        pageTitle: 'Settings',
        metricType: 'none',
        metrics: [],
    },
}

// Default config for unknown routes - no stats
const defaultConfig: NavbarConfig = {
    pageTitle: 'Dashboard',
    metricType: 'none',
    metrics: [],
}

interface NavbarContextType {
    config: NavbarConfig
    currentPath: string
}

const NavbarContext = createContext<NavbarContextType>({
    config: defaultConfig,
    currentPath: '/dashboard',
})

export const useNavbar = () => useContext(NavbarContext)

interface NavbarProviderProps {
    children: ReactNode
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
    const location = useLocation()

    const value = useMemo(() => {
        const path = location.pathname
        // Find matching config or use default
        const config = navbarConfigs[path] || defaultConfig

        return {
            config,
            currentPath: path,
        }
    }, [location.pathname])

    return (
        <NavbarContext.Provider value={value}>
            {children}
        </NavbarContext.Provider>
    )
}

export default NavbarContext
