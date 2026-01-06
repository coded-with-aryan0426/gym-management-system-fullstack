import React, { useState, useEffect } from 'react';
import './DataTable.css';

export interface Column<T> {
    key: string;
    header: string;
    width?: string;
    hideOnMobile?: boolean;
    mobileOrder?: number;
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
}: DataTableProps<T>) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (loading) {
        return (
            <div className={`data-table ${className}`}>
                <div className="data-table__loading">
                    <div className="data-table__spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (data.length === 0 && !pagination) {
        return (
            <div className={`data-table ${className}`}>
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
        <div className={`data-table ${className} ${isMobile ? 'data-table--mobile' : ''}`}>
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
                <table className="data-table__table">
                    <thead className="data-table__head">
                        <tr>
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
                                <td colSpan={visibleColumns.length} className="data-table__empty-cell">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {visibleColumns.map((col) => (
                                        <td key={col.key} className="data-table__td">
                                            {col.render
                                                ? col.render(item, index)
                                                : (item as Record<string, unknown>)[col.key] as React.ReactNode
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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

