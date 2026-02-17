import React, { useState, useMemo } from 'react';

interface Column<T> {
    key: keyof T | string;
    title: string;
    width?: string;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    sortable?: boolean;
}

interface TitanTableProps<T extends { id?: number | string }> {
    data: T[];
    columns: Column<T>[];
    selectable?: boolean;
    onSelectionChange?: (selectedIds: (number | string)[]) => void;
    actions?: (row: T) => React.ReactNode;
    onRowClick?: (row: T) => void;
    loading?: boolean;
    emptyMessage?: string;
    stickyHeader?: boolean;
    compact?: boolean;
}

export function TitanTable<T extends { id?: number | string }>({
    data,
    columns,
    selectable = false,
    onSelectionChange,
    actions,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    stickyHeader = true,
    compact = true
}: TitanTableProps<T>) {
    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const handleSelectAll = () => {
        if (selectedIds.size === data.length) {
            setSelectedIds(new Set());
            onSelectionChange?.([]);
        } else {
            const allIds = data.map(row => row.id).filter(Boolean) as (number | string)[];
            setSelectedIds(new Set(allIds));
            onSelectionChange?.(allIds);
        }
    };

    const handleSelectRow = (id: number | string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        onSelectionChange?.(Array.from(newSelected));
    };

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const aVal = (a as any)[sortKey];
            const bVal = (b as any)[sortKey];
            if (aVal === bVal) return 0;
            const comparison = aVal < bVal ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortKey, sortDirection]);

    const cellPadding = compact ? '8px 12px' : '12px 16px';
    const fontSize = compact ? 13 : 14;

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            overflow: 'hidden'
        }}>
            {/* Batch Action Bar */}
            {selectable && selectedIds.size > 0 && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <span style={{ color: '#F9FAFB', fontSize: 13, fontWeight: 500 }}>
                        {selectedIds.size} selected
                    </span>
                    <button style={{
                        background: 'rgba(220, 38, 38, 0.8)',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer'
                    }}>
                        Bulk Action
                    </button>
                    <button
                        onClick={() => {
                            setSelectedIds(new Set());
                            onSelectionChange?.([]);
                        }}
                        style={{
                            background: 'transparent',
                            color: 'rgba(249, 250, 251, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '4px 12px',
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize
                }}>
                    <thead>
                        <tr style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            position: stickyHeader ? 'sticky' : 'static',
                            top: 0,
                            zIndex: 10
                        }}>
                            {selectable && (
                                <th style={{
                                    padding: cellPadding,
                                    width: 40,
                                    textAlign: 'center'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === data.length && data.length > 0}
                                        onChange={handleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                            )}
                            {columns.map(col => (
                                <th
                                    key={String(col.key)}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                    style={{
                                        padding: cellPadding,
                                        textAlign: 'left',
                                        color: 'rgba(249, 250, 251, 0.7)',
                                        fontWeight: 600,
                                        fontSize: compact ? 11 : 12,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                        cursor: col.sortable ? 'pointer' : 'default',
                                        width: col.width,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {col.title}
                                    {col.sortable && sortKey === col.key && (
                                        <span style={{ marginLeft: 4 }}>
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </th>
                            ))}
                            {actions && (
                                <th style={{
                                    padding: cellPadding,
                                    width: 100,
                                    textAlign: 'right',
                                    color: 'rgba(249, 250, 251, 0.7)',
                                    fontWeight: 600,
                                    fontSize: compact ? 11 : 12,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                                }}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    style={{
                                        padding: 40,
                                        textAlign: 'center',
                                        color: 'rgba(249, 250, 251, 0.5)'
                                    }}
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    style={{
                                        padding: 40,
                                        textAlign: 'center',
                                        color: 'rgba(249, 250, 251, 0.5)'
                                    }}
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, index) => (
                                <tr
                                    key={row.id ?? index}
                                    onMouseEnter={() => setHoveredRow(index)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onClick={() => onRowClick?.(row)}
                                    style={{
                                        background: hoveredRow === index
                                            ? 'rgba(255, 255, 255, 0.04)'
                                            : selectedIds.has(row.id!)
                                                ? 'rgba(220, 38, 38, 0.08)'
                                                : 'transparent',
                                        cursor: onRowClick ? 'pointer' : 'default',
                                        transition: 'background 0.15s ease'
                                    }}
                                >
                                    {selectable && (
                                        <td style={{ padding: cellPadding, textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(row.id!)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectRow(row.id!);
                                                }}
                                                onClick={e => e.stopPropagation()}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                    )}
                                    {columns.map(col => (
                                        <td
                                            key={String(col.key)}
                                            style={{
                                                padding: cellPadding,
                                                color: '#F9FAFB',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: 200
                                            }}
                                        >
                                            {col.render
                                                ? col.render((row as any)[col.key], row, index)
                                                : (row as any)[col.key]
                                            }
                                        </td>
                                    ))}
                                    {actions && (
                                        <td style={{
                                            padding: cellPadding,
                                            textAlign: 'right',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                            opacity: hoveredRow === index ? 1 : 0.3,
                                            transition: 'opacity 0.15s ease'
                                        }}>
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TitanTable;
