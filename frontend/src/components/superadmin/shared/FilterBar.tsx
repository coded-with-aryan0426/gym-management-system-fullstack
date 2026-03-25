import React from 'react';
import { Search, X, Filter as FilterIcon } from 'lucide-react';
import './FilterBar.css';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    type: 'search' | 'select' | 'multiselect';
    label: string;
    placeholder?: string;
    options?: FilterOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
}

export interface FilterBarProps {
    filters: FilterConfig[];
    onClear?: () => void;
    variant?: 'default' | 'compact';
    className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    onClear,
    variant = 'default',
    className = ''
}) => {
    const hasActiveFilters = filters.some(f => 
        Array.isArray(f.value) ? f.value.length > 0 : f.value !== ''
    );

    return (
        <div className={`filter-bar filter-bar--${variant} ${className}`}>
            <div className="filter-bar__icon">
                <FilterIcon size={16} />
            </div>

            <div className="filter-bar__filters">
                {filters.map((filter, idx) => (
                    <div key={idx} className="filter-bar__filter">
                        {filter.type === 'search' && (
                            <div className="filter-bar__search">
                                <Search size={14} className="filter-bar__search-icon" />
                                <input
                                    type="text"
                                    className="filter-bar__search-input"
                                    placeholder={filter.placeholder || 'Search...'}
                                    value={filter.value as string}
                                    onChange={e => filter.onChange(e.target.value)}
                                />
                                {filter.value && (
                                    <button
                                        className="filter-bar__clear-icon"
                                        onClick={() => filter.onChange('')}
                                        type="button"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        )}

                        {filter.type === 'select' && (
                            <select
                                className="filter-bar__select"
                                value={filter.value as string}
                                onChange={e => filter.onChange(e.target.value)}
                            >
                                <option value="">{filter.placeholder || filter.label}</option>
                                {filter.options?.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        )}

                        {filter.type === 'multiselect' && (
                            <div className="filter-bar__multiselect">
                                <span className="filter-bar__multiselect-label">{filter.label}</span>
                                {/* Simplified - expand as needed */}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {hasActiveFilters && onClear && (
                <button
                    className="filter-bar__clear-all"
                    onClick={onClear}
                    type="button"
                >
                    <X size={14} />
                    Clear
                </button>
            )}
        </div>
    );
};

export default FilterBar;
