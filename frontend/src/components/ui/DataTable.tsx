import React from 'react';
import './DataTable.css';

export interface Column<T> {
    key: string;
    header: string;
    width?: string;
    render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
}

function DataTable<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
}: DataTableProps<T>) {
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

    if (data.length === 0) {
        return (
            <div className={`data-table ${className}`}>
                <div className="data-table__empty">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className={`data-table ${className}`}>
            <table className="data-table__table">
                <thead className="data-table__head">
                    <tr>
                        {columns.map((col) => (
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
                    {data.map((item, index) => (
                        <tr
                            key={keyExtractor(item)}
                            className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="data-table__td">
                                    {col.render
                                        ? col.render(item, index)
                                        : (item as Record<string, unknown>)[col.key] as React.ReactNode
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
