import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User, IndianRupee } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import type { EquipmentMaintenance, MaintenanceType, MaintenanceStatus } from '../../../../types/equipmentMaintenance';

interface MaintenanceHistoryProps {
    history: EquipmentMaintenance[];
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ history }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');

    const filteredHistory = useMemo(() => {
        return history.filter(r => {
            const matchSearch = !searchTerm ||
                r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.technicianName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = typeFilter === 'ALL' || r.maintenanceType === typeFilter;
            const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
            return matchSearch && matchType && matchStatus;
        });
    }, [history, searchTerm, typeFilter, statusFilter]);

    const getTypeColor = (type: MaintenanceType) => {
        const c: Record<string, string> = { PREVENTIVE: '#22c55e', REPAIR: '#ef4444', INSPECTION: '#3b82f6' };
        return c[type] || 'var(--text-secondary)';
    };

    const getStatusColor = (status: MaintenanceStatus) => {
        const c: Record<string, string> = { COMPLETED: '#22c55e', SCHEDULED: '#3b82f6', OVERDUE: '#ef4444', CANCELLED: 'var(--text-secondary)' };
        return c[status] || 'var(--text-secondary)';
    };

    return (
        <div className="flex flex-col h-full -m-5">
            {/* Filters */}
            <div className="px-4 py-2 border-b border-[var(--border-color)] flex items-center gap-2 bg-[var(--bg-surface)] sticky top-0 z-10">
                <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="eq-input"
                        style={{ paddingLeft: '32px', height: '32px', fontSize: '12px' }}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value as any)}
                    className="eq-input"
                    style={{ width: '120px', height: '32px', padding: '0 10px', fontSize: '11px' }}
                >
                    <option value="ALL">All Types</option>
                    <option value="PREVENTIVE">Preventive</option>
                    <option value="REPAIR">Repair</option>
                    <option value="INSPECTION">Inspection</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="eq-input"
                    style={{ width: '120px', height: '32px', padding: '0 10px', fontSize: '11px' }}
                >
                    <option value="ALL">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {filteredHistory.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                        <Filter size={24} className="mb-2 opacity-30" />
                        <p className="text-xs">No records found</p>
                        <button onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }} className="mt-1 text-[10px] text-[var(--accent-primary)] hover:underline">Clear filters</button>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {filteredHistory.map((r, index) => (
                            <div
                                key={r.id}
                                className={`p-2.5 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all ${index % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-surface-secondary)]'}`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-[var(--text-secondary)] font-mono bg-[var(--bg-surface-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">{formatDate(r.maintenanceDate)}</span>
                                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${getTypeColor(r.maintenanceType)}15`, color: getTypeColor(r.maintenanceType) }}>
                                            {r.maintenanceType}
                                        </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${getStatusColor(r.status)}15`, color: getStatusColor(r.status) }}>
                                        {r.status}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-primary)] font-medium mb-1">{r.description}</p>
                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1"><User size={10} /> {r.technicianName}</span>
                                    <span className="flex items-center gap-1"><IndianRupee size={10} /> {formatCurrency(r.cost)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
