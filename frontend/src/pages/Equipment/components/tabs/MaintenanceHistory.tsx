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

    const getTypeStyles = (type: MaintenanceType) => {
        const colors: Record<string, string> = {
            PREVENTIVE: 'var(--modal-success)',
            REPAIR: 'var(--modal-danger)',
            INSPECTION: 'var(--accent-primary)'
        };
        const bgs: Record<string, string> = {
            PREVENTIVE: 'var(--modal-success-bg)',
            REPAIR: 'var(--modal-danger-bg)',
            INSPECTION: 'var(--modal-info-bg)'
        };
        return { color: colors[type] || 'var(--text-secondary)', bg: bgs[type] || 'var(--bg-surface-secondary)' };
    };

    const getStatusStyles = (status: MaintenanceStatus) => {
        const colors: Record<string, string> = {
            COMPLETED: 'var(--modal-success)',
            SCHEDULED: 'var(--accent-primary)',
            OVERDUE: 'var(--modal-danger)',
            CANCELLED: 'var(--text-secondary)'
        };
        const bgs: Record<string, string> = {
            COMPLETED: 'var(--modal-success-bg)',
            SCHEDULED: 'var(--modal-info-bg)',
            OVERDUE: 'var(--modal-danger-bg)',
            CANCELLED: 'var(--bg-surface-secondary)'
        };
        return { color: colors[status] || 'var(--text-secondary)', bg: bgs[status] || 'var(--bg-surface-secondary)' };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
        >
            {/* Filters */}
            <div className="px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center gap-3 sticky top-0 z-10 backdrop-blur-sm bg-opacity-80">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search logs..."
                        className="eq-input transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                        style={{ paddingLeft: '36px', height: '36px', fontSize: '12px' }}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value as any)}
                    className="eq-input cursor-pointer hover:bg-[var(--bg-surface-secondary)] transition-colors"
                    style={{ width: '140px', height: '36px', padding: '0 12px', fontSize: '12px' }}
                >
                    <option value="ALL">All Types</option>
                    <option value="PREVENTIVE">Preventive</option>
                    <option value="REPAIR">Repair</option>
                    <option value="INSPECTION">Inspection</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="eq-input cursor-pointer hover:bg-[var(--bg-surface-secondary)] transition-colors"
                    style={{ width: '140px', height: '36px', padding: '0 12px', fontSize: '12px' }}
                >
                    <option value="ALL">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {filteredHistory.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                        <Filter size={32} className="mb-3 opacity-30" />
                        <p className="text-sm">No records found</p>
                        <button onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); }} className="mt-2 text-xs text-[var(--accent-primary)] hover:underline">Clear filters</button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredHistory.map((r, index) => {
                            const typeStyles = getTypeStyles(r.maintenanceType);
                            const statusStyles = getStatusStyles(r.status);
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={r.id}
                                    className={`eq-list-item p-3 rounded-lg border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all hover:shadow-sm ${index % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-surface-secondary)]'}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[var(--text-secondary)] font-mono bg-[var(--bg-surface-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">{formatDate(r.maintenanceDate)}</span>
                                                <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/5" style={{ backgroundColor: typeStyles.bg, color: typeStyles.color }}>
                                                    {r.maintenanceType}
                                                </div>
                                            </div>
                                            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/5" style={{ backgroundColor: statusStyles.bg, color: statusStyles.color }}>
                                                {r.status}
                                            </div>
                                        </div>
                                        <p className="text-sm text-[var(--text-primary)] font-medium mb-1">{r.description}</p>
                                        <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)]">
                                            <span className="flex items-center gap-1"><User size={12} /> {r.technicianName}</span>
                                            <span className="flex items-center gap-1"><IndianRupee size={12} /> {formatCurrency(r.cost)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
