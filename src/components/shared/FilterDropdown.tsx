import React, { useRef } from 'react'
import { useClickOutside } from '../../hooks'

export interface FilterOption {
    key: string
    label: string
    type: 'select' | 'multi-select'
    options: { value: string; label: string }[]
}

interface FilterDropdownProps {
    isOpen: boolean
    onClose: () => void
    filterOptions: FilterOption[]
    activeFilters: Record<string, string | string[]>
    onFilterChange: (key: string, value: string | string[]) => void
    onReset: () => void
    activeFilterCount: number
    className?: string
}

/**
 * Unified filter dropdown with click-outside behavior
 * Used consistently across Members and Staff pages
 */
export const FilterDropdown: React.FC<FilterDropdownProps> = ({
    isOpen,
    onClose,
    filterOptions,
    activeFilters,
    onFilterChange,
    onReset,
    activeFilterCount,
    className = '',
}) => {
    const panelRef = useRef<HTMLDivElement>(null)

    useClickOutside(panelRef as React.RefObject<HTMLElement>, onClose, isOpen)

    if (!isOpen) return null

    return (
        <div className={`filter-dropdown ${className}`} ref={panelRef}>
            <div className="filter-dropdown__header">
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <button className="filter-dropdown__clear" onClick={onReset}>
                        Clear all
                    </button>
                )}
            </div>

            <div className="filter-dropdown__content">
                {filterOptions.map((option) => (
                    <div key={option.key} className="filter-dropdown__group">
                        <label className="filter-dropdown__label">{option.label}</label>
                        <select
                            className="filter-dropdown__select"
                            value={Array.isArray(activeFilters[option.key])
                                ? (activeFilters[option.key] as string[])[0] || ''
                                : activeFilters[option.key] as string || ''}
                            onChange={(e) => onFilterChange(option.key, e.target.value)}
                        >
                            <option value="">All {option.label}</option>
                            {option.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FilterDropdown
