import React from 'react';
import { motion } from 'framer-motion';
import type { Equipment } from '../../../types/equipment';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { Wrench, MapPin, Calendar, Clock, Edit3, Trash2 } from 'lucide-react';

interface EquipmentCardProps {
    equipment: Equipment;
    density?: 'compact' | 'comfortable' | 'spacious';
    onEdit: (equipment: Equipment) => void;
    onDelete?: (id: number) => void;
    onMaintenance: (equipment: Equipment) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, density = 'comfortable', onEdit, onDelete, onMaintenance }) => {
    const statusConfig = {
        ACTIVE: { color: 'var(--status-active)', label: 'Active', bg: 'rgba(16, 185, 129, 0.1)' },
        MAINTENANCE: { color: 'var(--status-maintenance)', label: 'In Service', bg: 'rgba(245, 158, 11, 0.1)' },
        OUT_OF_ORDER: { color: 'var(--status-outoforder)', label: 'Out of Order', bg: 'rgba(239, 68, 68, 0.1)' },
        RETIRED: { color: 'var(--text-secondary)', label: 'Retired', bg: 'rgba(136, 150, 171, 0.1)' }
    };

    const conditionConfig: Record<string, { color: string; label: string }> = {
        NEW: { color: '#22c55e', label: 'New' },
        GOOD: { color: '#3b82f6', label: 'Good' },
        FAIR: { color: '#eab308', label: 'Fair' },
        POOR: { color: '#ef4444', label: 'Poor' }
    };

    const isOverdue = equipment.nextMaintenanceDueDate && new Date(equipment.nextMaintenanceDueDate) < new Date();
    const config = statusConfig[equipment.status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const condConfig = conditionConfig[equipment.condition] || conditionConfig.GOOD;

    const iconSize = { compact: 60, comfortable: 80, spacious: 110 };
    const imageHeight = { compact: 'h-24', comfortable: 'h-32', spacious: 'h-40' };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="eq-card-premium group cursor-pointer"
            onClick={() => onEdit(equipment)}
        >
            {/* Image Area */}
            <div className={`eq-card-image-wrapper ${imageHeight[density]} p-4`}>
                <div className="relative z-10 text-[var(--text-primary)]">
                    {getEquipmentIcon(equipment.category, equipment.name, iconSize[density])}
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-20">
                    <div className="status-badge-premium">
                        <div
                            className={`status-indicator-dot ${equipment.status === 'ACTIVE' ? 'active' : ''}`}
                            style={{ backgroundColor: config.color }}
                        />
                        <span style={{ color: config.color }}>{config.label}</span>
                    </div>
                </div>

                {/* Condition + Overdue */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 items-end">
                    {isOverdue && equipment.status !== 'MAINTENANCE' && (
                        <div className="overdue-badge-premium">Overdue</div>
                    )}
                    <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{
                        backgroundColor: `${condConfig.color}15`,
                        color: condConfig.color,
                        border: `1px solid ${condConfig.color}25`
                    }}>
                        {condConfig.label}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="eq-card-content-premium">
                {/* Title & Brand */}
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-[14px] font-bold text-[var(--text-primary)] tracking-tight leading-tight group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                        {equipment.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{equipment.brand}</span>
                        {equipment.model && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                                <span className="text-[10px] font-bold text-[var(--accent-primary)]">{equipment.model}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="card-info-grid">
                    <div className="info-item">
                        <span className="info-label">Location</span>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={10} className="text-[var(--accent-primary)]" />
                            <span className="info-value">{equipment.location || '—'}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Last Check</span>
                        <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-[var(--text-secondary)]" />
                            <span className="info-value">
                                {equipment.lastMaintenanceDate ? new Date(equipment.lastMaintenanceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer-premium">
                    <div className="info-item">
                        <span className="info-label">Next Service</span>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={11} className={isOverdue ? 'text-red-400' : 'text-[var(--text-secondary)]'} />
                            <span className={`text-[12px] font-bold ${isOverdue ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                                {equipment.nextMaintenanceDueDate ? new Date(equipment.nextMaintenanceDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                            </span>
                        </div>
                    </div>

                    <div className="card-actions-row">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMaintenance(equipment);
                            }}
                            className="maintenance-btn-v2"
                            title="Maintenance"
                        >
                            <Wrench size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(equipment);
                            }}
                            className="card-action-btn"
                            title="Edit"
                        >
                            <Edit3 size={13} />
                        </button>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(equipment.id);
                                }}
                                className="card-action-btn delete"
                                title="Delete"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EquipmentCard;
