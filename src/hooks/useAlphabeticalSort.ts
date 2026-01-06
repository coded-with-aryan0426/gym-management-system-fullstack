import { useState, useCallback, useMemo } from 'react'

export type SortOrder = 'asc' | 'desc' | null

interface UseAlphabeticalSortOptions {
    initialOrder?: SortOrder
}

interface UseAlphabeticalSortReturn<T> {
    sortOrder: SortOrder
    toggleSort: () => void
    sortItems: (items: T[], getKey: (item: T) => string) => T[]
    resetSort: () => void
}

/**
 * Hook for alphabetical sorting with toggle between asc/desc/none
 */
export function useAlphabeticalSort<T>(
    options: UseAlphabeticalSortOptions = {}
): UseAlphabeticalSortReturn<T> {
    const { initialOrder = null } = options
    const [sortOrder, setSortOrder] = useState<SortOrder>(initialOrder)

    const toggleSort = useCallback(() => {
        setSortOrder(prev => {
            // Only 2 states: asc <-> desc
            if (prev === 'asc') return 'desc'
            return 'asc'
        })
    }, [])

    const resetSort = useCallback(() => {
        setSortOrder(null)
    }, [])

    const sortItems = useCallback((items: T[], getKey: (item: T) => string): T[] => {
        if (!sortOrder) return items

        return [...items].sort((a, b) => {
            const keyA = getKey(a).toLowerCase()
            const keyB = getKey(b).toLowerCase()

            if (sortOrder === 'asc') {
                return keyA.localeCompare(keyB)
            } else {
                return keyB.localeCompare(keyA)
            }
        })
    }, [sortOrder])

    return {
        sortOrder,
        toggleSort,
        sortItems,
        resetSort,
    }
}

export default useAlphabeticalSort
