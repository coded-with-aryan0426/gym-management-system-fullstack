import React, { useState, useEffect } from 'react';
import './DataTable.css';

export interface Column<T> {
    key: string;
    header: string;
    width?: string;
    hideOnMobile?: boolean;
    mobileOrder?: number;
    sortable?: boolean;
    render?: (item: T, index: number) => React.ReactNode;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    pagination?: PaginationProps;
    mobileCardRender?: (item: T, index: number) => React.ReactNode;
    // Titan mode props
    compact?: boolean;
    selectable?: boolean;
    selectedIds?: Set<string | number>;
    onSelectionChange?: (selectedIds: Set<string | number>) => void;
    stickyHeader?: boolean;
    // New premium features
    showRowNumbers?: boolean;
    hideCheckboxUntilHover?: boolean;
}

function DataTable<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
    pagination,
    mobileCardRender,
    compact = false,
    selectable = false,
    selectedIds: externalSelectedIds,
    onSelectionChange,
    stickyHeader = false,
    showRowNumbers = false,
    hideCheckboxUntilHover = false,
}: DataTableProps<T>) {
    const [isMobile, setIsMobile] = useState(false);
    const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string | number>>(new Set());
    const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    // Use external or internal selection state
    const selectedIds = externalSelectedIds ?? internalSelectedIds;

    const handleSelectAll = () => {
        if (selectedIds.size === data.length) {
            const newSelection = new Set<string | number>();
            setInternalSelectedIds(newSelection);
            onSelectionChange?.(newSelection);
        } else {
            const newSelection = new Set(data.map(item => keyExtractor(item)));
            setInternalSelectedIds(newSelection);
            onSelectionChange?.(newSelection);
        }
    };

    const handleSelectRow = (id: string | number, index: number, e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
        e.stopPropagation();
        const newSelection = new Set(selectedIds);
        
        // Support shift+click for range selection
        if ('shiftKey' in e && e.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            for (let i = start; i <= end; i++) {
                const itemId = keyExtractor(data[i]);
                newSelection.add(itemId);
            }
        } else {
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            setLastSelectedIndex(index);
        }
        
        setInternalSelectedIds(newSelection);
        onSelectionChange?.(newSelection);
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const tableClassNames = [
        'data-table',
        className,
        isMobile ? 'data-table--mobile' : '',
        compact ? 'data-table--compact' : '',
        stickyHeader ? 'data-table--sticky' : '',
        hideCheckboxUntilHover ? 'data-table--hide-checkbox' : '',
        selectedIds.size > 0 ? 'data-table--has-selection' : '',
    ].filter(Boolean).join(' ');

    if (loading) {
        return (
            <div className={tableClassNames}>
                <div className="data-table__loading">
                    <div className="data-table__spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (data.length === 0 && !pagination) {
        return (
            <div className={tableClassNames}>
                <div className="data-table__empty">{emptyMessage}</div>
            </div>
        );
    }

    const visibleColumns = isMobile
        ? columns.filter(col => !col.hideOnMobile)
        : columns;

    // Generate page numbers to display
    const getPageNumbers = () => {
        if (!pagination) return [];
        const { currentPage, totalPages } = pagination;
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            pages.push(0);
            if (currentPage > 2) pages.push('...');

            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages - 2, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 3) pages.push('...');
            pages.push(totalPages - 1);
        }
        return pages;
    };

    const startItem = pagination ? pagination.currentPage * pagination.pageSize + 1 : 1;
    const endItem = pagination ? Math.min(startItem + pagination.pageSize - 1, pagination.totalCount) : data.length;

    return (
        <div className={tableClassNames}>
            {isMobile && mobileCardRender ? (
                <div className="data-table__cards">
                    {data.length === 0 ? (
                        <div className="data-table__empty">{emptyMessage}</div>
                    ) : (
                        data.map((item, index) => (
                            <div
                                key={keyExtractor(item)}
                                className={`data-table__card ${onRowClick ? 'data-table__card--clickable' : ''}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {mobileCardRender(item, index)}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="data-table__scroll-container">
                    <table className="data-table__table">
                        <thead className="data-table__head">
                            <tr>
                                {showRowNumbers && (
                                    <th className="data-table__th data-table__th--number" style={{ width: 48 }}>#</th>
                                )}
                                {selectable && (
                                    <th className="data-table__th data-table__th--checkbox" style={{ width: 40 }}>
                                        <input
                                            type="checkbox"
                                            checked={data.length > 0 && selectedIds.size === data.length}
                                            onChange={handleSelectAll}
                                            className="data-table__checkbox"
                                        />
                                    </th>
                                )}
                                {visibleColumns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="data-table__th"
                                        style={{ width: col.width }}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    <tbody className="data-table__body">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (showRowNumbers ? 1 : 0)} className="data-table__empty-cell">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const id = keyExtractor(item);
                                const isSelected = selectedIds.has(id);
                                const isHovered = hoveredRowId === id;
                                const rowNumber = pagination 
                                    ? pagination.currentPage * pagination.pageSize + index + 1 
                                    : index + 1;
                                return (
                                    <tr
                                        key={id}
                                        className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''} ${isSelected ? 'data-table__row--selected' : ''} ${isHovered ? 'data-table__row--hovered' : ''}`}
                                        onClick={() => onRowClick?.(item)}
                                        onMouseEnter={() => setHoveredRowId(id)}
                                        onMouseLeave={() => setHoveredRowId(null)}
                                    >
                                        {showRowNumbers && (
                                            <td className="data-table__td data-table__td--number">
                                                <span className="row-number">{rowNumber}</span>
                                            </td>
                                        )}
                                        {selectable && (
                                            <td className="data-table__td data-table__td--checkbox" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelectRow(id, index, e)}
                                                    className="data-table__checkbox"
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.map((col) => (
                                            <td key={col.key} className="data-table__td">
                                                {col.render
                                                    ? col.render(item, index)
                                                    : (item as Record<string, unknown>)[col.key] as React.ReactNode
                                                }
                                            </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 0 && (
                <div className="data-table__pagination">
                    <div className="pagination__info">
                        Showing {startItem}–{endItem} of {pagination.totalCount}
                    </div>

                    <div className="pagination__controls">
                        <button
                            className="pagination__btn"
                            onClick={() => pagination.onPageChange(0)}
                            disabled={pagination.currentPage === 0}
                            title="First page"
                        >
                            ««
                        </button>
                        <button
                            className="pagination__btn"
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 0}
                            title="Previous page"
                        >
                            «
                        </button>

                        {getPageNumbers().map((page, idx) => (
                            typeof page === 'number' ? (
                                <button
                                    key={idx}
                                    className={`pagination__btn pagination__page ${page === pagination.currentPage ? 'pagination__page--active' : ''}`}
                                    onClick={() => pagination.onPageChange(page)}
                                >
                                    {page + 1}
                                </button>
                            ) : (
                                <span key={idx} className="pagination__ellipsis">{page}</span>
                            )
                        ))}

                        <button
                            className="pagination__btn"
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                            title="Next page"
                        >
                            »
                        </button>
                        <button
                            className="pagination__btn"
                            onClick={() => pagination.onPageChange(pagination.totalPages - 1)}
                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                            title="Last page"
                        >
                            »»
                        </button>
                    </div>

                    {pagination.onPageSizeChange && (
                        <div className="pagination__size">
                            <label>Rows:</label>
                            <select
                                value={pagination.pageSize}
                                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                            >
                                {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DataTable;
