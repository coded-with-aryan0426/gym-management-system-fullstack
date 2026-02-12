import React, { useState, useMemo } from 'react';
import { Search, Filter, User, IndianRupee, Clock, Shield, Wrench, ClipboardCheck } from 'lucide-react';
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

    const getTypeIcon = (type: MaintenanceType) => {
        const icons: Record<string, React.ReactNode> = {
            PREVENTIVE: <Shield size={12} />,
            REPAIR: <Wrench size={12} />,
            INSPECTION: <ClipboardCheck size={12} />
        };
        return icons[type] || null;
    };

    const getStatusColor = (status: MaintenanceStatus) => {
        const c: Record<string, string> = { COMPLETED: '#22c55e', SCHEDULED: '#3b82f6', OVERDUE: '#ef4444', CANCELLED: '#64748b' };
        return c[status] || 'var(--text-secondary)';
    };

    return (
        <div className="flex flex-col h-full -m-5">
            {/* Filters */}
            <div className="px-5 py-3 border-b border-[var(--border-color)] flex items-center gap-2 bg-[var(--bg-surface)] sticky top-0 z-10">
                <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search records..."
                        className="eq-input"
                        style={{ paddingLeft: '34px', height: '34px', fontSize: '12px' }}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value as any)}
                    className="eq-input"
                    style={{ width: '130px', height: '34px', padding: '0 10px', fontSize: '11px', fontWeight: 600 }}
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
                    style={{ width: '130px', height: '34px', padding: '0 10px', fontSize: '11px', fontWeight: 600 }}
                >
                    <option value="ALL">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            {/* Results count */}
            <div className="px-5 py-2 text-[10px] text-[var(--text-secondary)] font-medium border-b border-[var(--border-color)]">
                {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''} found
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3">
                {filteredHistory.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                        <Filter size={24} className="mb-2 opacity-20" />
                        <p className="text-xs font-semibold">No records found</p>
                        <button onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }} className="mt-2 text-[10px] font-bold text-[var(--accent-primary)] hover:underline">Clear filters</button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredHistory.map((r) => {
                            const typeColor = getTypeColor(r.maintenanceType);
                            const statusColor = getStatusColor(r.status);
                            return (
                                <div
                                    key={r.id}
                                    className="p-3 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-primary)]/30 transition-all bg-[var(--bg-surface)]"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${typeColor}12`, color: typeColor }}>
                                            {getTypeIcon(r.maintenanceType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[12px] font-semibold text-[var(--text-primary)] line-clamp-1">{r.description}</p>
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ backgroundColor: `${typeColor}10`, color: typeColor, borderColor: `${typeColor}20` }}>
                                                            {r.maintenanceType}
                                                        </span>
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ backgroundColor: `${statusColor}10`, color: statusColor, borderColor: `${statusColor}20` }}>
                                                            {r.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 justify-end">
                                                        <Clock size={10} /> {formatDate(r.maintenanceDate)}
                                                    </p>
                                                    <p className="text-[12px] font-bold text-[var(--text-primary)] mt-1">{formatCurrency(r.cost)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[var(--border-color)]">
                                                <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1"><User size={10} /> {r.technicianName}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1"><IndianRupee size={10} /> {formatCurrency(r.cost)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
