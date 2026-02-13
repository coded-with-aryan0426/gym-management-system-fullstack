import React, { useState, useMemo } from 'react';
import { Search, Filter, User, IndianRupee, Clock, Shield, Wrench, ClipboardCheck, X, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
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

    const hasFilters = searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL';

    const getTypeConfig = (type: MaintenanceType) => {
        const map: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
            PREVENTIVE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.18)', icon: <Shield size={14} />, label: 'Preventive' },
            REPAIR: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.18)', icon: <Wrench size={14} />, label: 'Repair' },
            INSPECTION: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.18)', icon: <ClipboardCheck size={14} />, label: 'Inspection' }
        };
        return map[type] || { color: 'var(--text-secondary)', bg: 'var(--glass-bg)', border: 'var(--glass-border)', icon: null, label: type };
    };

    const getStatusConfig = (status: MaintenanceStatus) => {
        const map: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
            COMPLETED: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)', icon: <CheckCircle size={10} />, label: 'Completed' },
            SCHEDULED: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', icon: <Calendar size={10} />, label: 'Scheduled' },
            OVERDUE: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', icon: <AlertCircle size={10} />, label: 'Overdue' },
            CANCELLED: { color: '#64748b', bg: 'rgba(100, 116, 139, 0.08)', icon: <X size={10} />, label: 'Cancelled' }
        };
        return map[status] || { color: 'var(--text-secondary)', bg: 'var(--glass-bg)', icon: null, label: status };
    };

    const clearFilters = () => { setSearchTerm(''); setTypeFilter('ALL'); setStatusFilter('ALL'); };

    return (
        <div className="maint-history">
            {/* Filter Bar */}
            <div className="maint-history__filters">
                <div className="maint-history__search">
                    <Search size={14} className="maint-history__search-icon" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by description or technician..."
                        className="maint-history__search-input"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="maint-history__search-clear">
                            <X size={12} />
                        </button>
                    )}
                </div>
                <div className="maint-history__filter-pills">
                    {(['ALL', 'PREVENTIVE', 'REPAIR', 'INSPECTION'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`maint-filter-pill ${typeFilter === t ? 'maint-filter-pill--active' : ''}`}
                        >
                            {t === 'ALL' ? 'All Types' : t === 'PREVENTIVE' ? 'Preventive' : t === 'REPAIR' ? 'Repair' : 'Inspection'}
                        </button>
                    ))}
                    <span className="maint-history__divider" />
                    {(['ALL', 'COMPLETED', 'SCHEDULED', 'OVERDUE'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`maint-filter-pill ${statusFilter === s ? 'maint-filter-pill--active' : ''}`}
                        >
                            {s === 'ALL' ? 'All Status' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results bar */}
            <div className="maint-history__results-bar">
                <span>{filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}</span>
                {hasFilters && (
                    <button onClick={clearFilters} className="maint-history__clear-btn">
                        <X size={11} /> Clear filters
                    </button>
                )}
            </div>

            {/* Records */}
            <div className="maint-history__list custom-scrollbar">
                {filteredHistory.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon"><Filter size={20} /></div>
                        <p className="empty-state__title">No records found</p>
                        <p className="empty-state__desc">Try adjusting your search or filters</p>
                        {hasFilters && (
                            <button onClick={clearFilters} className="maint-link-btn" style={{ marginTop: '12px' }}>
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="maint-history__cards">
                        {filteredHistory.map(r => {
                            const tc = getTypeConfig(r.maintenanceType);
                            const sc = getStatusConfig(r.status);
                            return (
                                <div key={r.id} className="maint-record-card" style={{ '--record-color': tc.color } as React.CSSProperties}>
                                    <div className="maint-record-card__accent" style={{ backgroundColor: tc.color }} />
                                    <div className="maint-record-card__body">
                                        <div className="maint-record-card__header">
                                            <div className="maint-record-card__icon" style={{ color: tc.color, backgroundColor: tc.bg, borderColor: tc.border }}>
                                                {tc.icon}
                                            </div>
                                            <div className="maint-record-card__title-area">
                                                <h4 className="maint-record-card__title">{r.description}</h4>
                                                <div className="maint-record-card__badges">
                                                    <span className="maint-badge" style={{ color: tc.color, backgroundColor: tc.bg, borderColor: tc.border }}>
                                                        {tc.label}
                                                    </span>
                                                    <span className="maint-badge" style={{ color: sc.color, backgroundColor: sc.bg, borderColor: `${sc.color}25` }}>
                                                        {sc.icon} {sc.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="maint-record-card__cost">
                                                {formatCurrency(r.cost)}
                                            </div>
                                        </div>
                                        <div className="maint-record-card__meta">
                                            <span className="maint-record-card__meta-item">
                                                <User size={11} /> {r.technicianName}
                                            </span>
                                            <span className="maint-record-card__meta-item">
                                                <Clock size={11} /> {formatDate(r.maintenanceDate)}
                                            </span>
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
