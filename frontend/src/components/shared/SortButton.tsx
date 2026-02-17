import React from 'react'
import type { SortOrder } from '../../hooks'

interface SortButtonProps {
    sortOrder: SortOrder
    onToggle: () => void
    className?: string
}

/**
 * Sort toggle button (A-Z / Z-A)
 * Uses same styling as filter button for consistency
 */
export const SortButton: React.FC<SortButtonProps> = ({ sortOrder, onToggle, className = '' }) => {
    const getLabel = () => {
        if (sortOrder === 'desc') return 'Z → A'
        return 'A → Z'
    }

    const getTitle = () => {
        if (sortOrder === 'desc') return 'Sorted Z-A, click for A-Z'
        return 'Sorted A-Z, click for Z-A'
    }

    return (
        <button
            className={`btn-filters ${className}`}
            onClick={onToggle}
            title={getTitle()}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sortOrder === 'desc' ? (
                    <>
                        <path d="M3 9l4-4 4 4" />
                        <path d="M7 5v14" />
                        <path d="M21 15l-4 4-4-4" />
                        <path d="M17 19V5" />
                    </>
                ) : (
                    <>
                        <path d="M3 15l4 4 4-4" />
                        <path d="M7 19V5" />
                        <path d="M21 9l-4-4-4 4" />
                        <path d="M17 5v14" />
                    </>
                )}
            </svg>
            {getLabel()}
        </button>
    )
}

export default SortButton
