import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTable.css';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T, index: number) => void;
    pageSize?: number;
    variant?: 'default' | 'compact' | 'minimal';
    loading?: boolean;
    emptyMessage?: string;
    stickyHeader?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    className?: string;
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    onRowClick,
    pageSize = 10,
    variant = 'default',
    loading = false,
    emptyMessage = 'No data available',
    stickyHeader = false,
    striped = true,
    hoverable = true,
    className = ''
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Sorting logic
    const sortedData = useMemo(() => {
        if (!sortConfig) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (!prev || prev.key !== key) {
                return { key, direction: 'asc' };
            }
            if (prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return null;
        });
    };

    const renderSortIcon = (columnKey: string) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <ChevronsUpDown size={14} className="data-table__sort-icon data-table__sort-icon--inactive" />;
        }
        return sortConfig.direction === 'asc' 
            ? <ChevronUp size={14} className="data-table__sort-icon data-table__sort-icon--active" />
            : <ChevronDown size={14} className="data-table__sort-icon data-table__sort-icon--active" />;
    };

    if (loading) {
        return (
            <div className={`data-table-wrapper ${className}`}>
                <div className="data-table__loading">
                    <div className="data-table__spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={`data-table-wrapper ${className}`}>
                <div className="data-table__empty">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className={`data-table-wrapper data-table-wrapper--${variant} ${className}`}>
            <div className={`data-table__container ${stickyHeader ? 'data-table__container--sticky' : ''}`}>
                <table className={`data-table ${striped ? 'data-table--striped' : ''} ${hoverable ? 'data-table--hoverable' : ''}`}>
                    <thead className="data-table__header">
                        <tr>
                            {columns.map(column => (
                                <th
                                    key={column.key}
                                    className={`data-table__th data-table__th--${column.align || 'left'} ${column.sortable ? 'data-table__th--sortable' : ''}`}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="data-table__th-content">
                                        <span>{column.label}</span>
                                        {column.sortable && renderSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="data-table__body">
                        {paginatedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                                onClick={() => onRowClick?.(row, startIndex + rowIndex)}
                            >
                                {columns.map(column => (
                                    <td
                                        key={column.key}
                                        className={`data-table__td data-table__td--${column.align || 'left'}`}
                                    >
                                        {column.render 
                                            ? column.render(row[column.key], row, startIndex + rowIndex)
                                            : row[column.key]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="data-table__pagination">
                    <div className="data-table__pagination-info">
                        Showing {startIndex + 1}-{Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length}
                    </div>
                    <div className="data-table__pagination-controls">
                        <button
                            className="data-table__pagination-btn"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="data-table__pagination-current">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            className="data-table__pagination-btn"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
