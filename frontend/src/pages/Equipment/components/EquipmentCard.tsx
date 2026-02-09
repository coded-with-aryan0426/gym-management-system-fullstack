import React from 'react';
import { motion } from 'framer-motion';
import type { Equipment } from '../../../types/equipment';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { Wrench, MapPin, Calendar, Clock } from 'lucide-react';

interface EquipmentCardProps {
    equipment: Equipment;
    density?: 'compact' | 'comfortable' | 'spacious';
    onEdit: (equipment: Equipment) => void;
    onDelete?: (id: number) => void;
    onMaintenance: (equipment: Equipment) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, density = 'comfortable', onEdit, onMaintenance }) => {
    const statusConfig = {
        ACTIVE: { color: 'var(--status-active)', label: 'Active' },
        MAINTENANCE: { color: 'var(--status-maintenance)', label: 'In Service' },
        OUT_OF_ORDER: { color: 'var(--status-outoforder)', label: 'Out of Order' },
        RETIRED: { color: 'var(--text-secondary)', label: 'Retired' }
    };

    const isOverdue = equipment.nextMaintenanceDueDate && new Date(equipment.nextMaintenanceDueDate) < new Date();
    const config = statusConfig[equipment.status as keyof typeof statusConfig] || statusConfig.ACTIVE;

    const iconSize = { compact: 70, comfortable: 90, spacious: 120 };
    const imageHeight = { compact: 'h-28', comfortable: 'h-36', spacious: 'h-44' };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
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
                <div className="absolute top-4 left-4 z-20">
                    <div className="status-badge-premium">
                        <div
                            className={`status-indicator-dot ${equipment.status === 'ACTIVE' ? 'active' : ''}`}
                            style={{ backgroundColor: config.color }}
                        />
                        <span style={{ color: config.color }}>{config.label}</span>
                    </div>
                </div>

                {isOverdue && equipment.status !== 'MAINTENANCE' && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="overdue-badge-premium">
                            Overdue
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="eq-card-content-premium">
                {/* Title & Brand */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight leading-tight group-hover:text-[var(--accent-primary)] transition-colors">
                        {equipment.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{equipment.brand}</span>
                        {equipment.model && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                                <span className="text-[11px] font-bold text-[var(--accent-primary)]">{equipment.model}</span>
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
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className={isOverdue ? 'text-red-400' : 'text-[var(--text-secondary)]'} />
                            <span className={`text-[13px] font-bold ${isOverdue ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                                {equipment.nextMaintenanceDueDate ? new Date(equipment.nextMaintenanceDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMaintenance(equipment);
                        }}
                        className="maintenance-btn-v2"
                        title="Log Maintenance"
                    >
                        <Wrench size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EquipmentCard;
