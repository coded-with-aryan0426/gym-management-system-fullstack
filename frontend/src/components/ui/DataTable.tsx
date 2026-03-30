import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import './DataTable.css';

export interface Column<T> {
    key: string;
    header: string | React.ReactNode;
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
    compact?: boolean;
    stickyHeader?: boolean;
    showRowNumbers?: boolean;
    skeletonRows?: number;
}

/**
 * Memoized Table Row Component - prevents re-render unless item changes
 * Stage 1 Optimization: Reduces re-renders in large lists
 */
interface TableRowProps<T> {
    item: T;
    index: number;
    rowNumber: number;
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    showRowNumbers: boolean;
}

const TableRowComponent = <T,>({
    item,
    index,
    rowNumber,
    columns,
    onRowClick,
    showRowNumbers,
}: TableRowProps<T>) => {
    const handleClick = useCallback(() => {
        onRowClick?.(item);
    }, [onRowClick, item]);

    return (
        <tr
            className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
            onClick={handleClick}
        >
            {showRowNumbers && (
                <td className="data-table__td data-table__td--number">
                    <span className="row-number">{rowNumber}</span>
                </td>
            )}
            {columns.map((col) => (
                <td key={col.key} className="data-table__td">
                    {col.render
                        ? col.render(item, index)
                        : (item as Record<string, unknown>)[col.key] as React.ReactNode
                    }
                </td>
            ))}
        </tr>
    );
};

// Memoized row - only re-renders if item reference changes
const MemoizedTableRow = memo(TableRowComponent) as typeof TableRowComponent;

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
    stickyHeader = false,
    showRowNumbers = false,
    skeletonRows = 8,
}: DataTableProps<T>) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Memoize visible columns to prevent recalculation
    const visibleColumns = useMemo(() => 
        columns.filter(col => !isMobile || !col.hideOnMobile),
        [columns, isMobile]
    );

    // Memoize table class names
    const tableClassNames = useMemo(() => [
        'data-table',
        className,
        isMobile ? 'data-table--mobile' : '',
        compact ? 'data-table--compact' : '',
        stickyHeader ? 'data-table--sticky' : '',
    ].filter(Boolean).join(' '), [className, isMobile, compact, stickyHeader]);

    // Skeleton Loading State
    if (loading) {
        return (
            <div className={tableClassNames} role="presentation" aria-busy="true" aria-label="Loading data">
                {isMobile && mobileCardRender ? (
                    // Mobile skeleton cards
                    <div className="data-table__mobile-cards">
                        {Array.from({ length: skeletonRows }).map((_, i) => (
                            <div key={i} className="data-table__skeleton-card">
                                <div className="data-table__skeleton-card-top">
                                    <div className="data-table__skeleton-avatar" />
                                    <div className="data-table__skeleton-info">
                                        <div className="data-table__skeleton-line data-table__skeleton-line--lg" />
                                        <div className="data-table__skeleton-line data-table__skeleton-line--sm" />
                                    </div>
                                    <div className="data-table__skeleton-badge" />
                                </div>
                                <div className="data-table__skeleton-card-actions">
                                    <div className="data-table__skeleton-btn" />
                                    <div className="data-table__skeleton-btn" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Desktop skeleton table
                    <table className="data-table__table">
                        <thead>
                            <tr>
                                {showRowNumbers && <th style={{ width: '40px' }}><div className="data-table__skeleton-line" style={{ width: 20 }} /></th>}
                                {columns.map((col, i) => (
                                    <th key={col.key} style={{ width: col.width }}>
                                        <div className="data-table__skeleton-line" style={{ width: `${40 + Math.random() * 30}%` }} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                                <tr key={rowIdx} className="data-table__skeleton-row">
                                    {showRowNumbers && (
                                        <td><div className="data-table__skeleton-line" style={{ width: 20 }} /></td>
                                    )}
                                    {columns.map((col, colIdx) => (
                                        <td key={col.key}>
                                            {colIdx === 0 ? (
                                                // First column: avatar + text (common pattern)
                                                <div className="data-table__skeleton-cell-user">
                                                    <div className="data-table__skeleton-avatar data-table__skeleton-avatar--sm" />
                                                    <div className="data-table__skeleton-user-info">
                                                        <div className="data-table__skeleton-line" style={{ width: '80%' }} />
                                                        <div className="data-table__skeleton-line data-table__skeleton-line--sm" style={{ width: '60%' }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="data-table__skeleton-line" style={{ width: `${50 + Math.random() * 40}%` }} />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
                                    <td colSpan={visibleColumns.length + (showRowNumbers ? 1 : 0)} className="data-table__empty-cell">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => {
                                    const id = keyExtractor(item);
                                    const rowNumber = pagination
                                        ? pagination.currentPage * pagination.pageSize + index + 1
                                        : index + 1;
                                    return (
                                        <MemoizedTableRow
                                            key={id}
                                            item={item}
                                            index={index}
                                            rowNumber={rowNumber}
                                            columns={visibleColumns}
                                            keyExtractor={keyExtractor}
                                            onRowClick={onRowClick}
                                            showRowNumbers={showRowNumbers}
                                        />
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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

// Memoize the entire DataTable component
const MemoizedDataTable = memo(DataTable) as typeof DataTable;

export default MemoizedDataTable;
