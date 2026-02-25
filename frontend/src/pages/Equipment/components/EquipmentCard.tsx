import React from 'react';
import { motion } from 'framer-motion';
import type { Equipment } from '../../../types/equipment';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { formatCurrency } from '../../../utils/formatters';
import { Wrench, MapPin, Calendar, Clock, Edit3, Trash2, Shield, ShieldAlert, ShieldX, Timer, Heart } from 'lucide-react';

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
        RETIRED: { color: 'var(--status-retired)', label: 'Retired', bg: 'rgba(136, 150, 171, 0.1)' }
    };

    const conditionConfig: Record<string, { color: string; label: string }> = {
        NEW: { color: '#22c55e', label: 'New' },
        GOOD: { color: '#64748b', label: 'Good' },
        FAIR: { color: '#eab308', label: 'Fair' },
        POOR: { color: '#ef4444', label: 'Poor' }
    };

    const isOverdue = equipment.nextMaintenanceDueDate && new Date(equipment.nextMaintenanceDueDate) < new Date();
    const config = statusConfig[equipment.status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const condConfig = conditionConfig[equipment.condition] || conditionConfig.GOOD;

    // Warranty status
    const getWarrantyStatus = () => {
        if (!equipment.warrantyExpiryDate) return null;
        const expiry = new Date(equipment.warrantyExpiryDate);
        const now = new Date();
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return { status: 'expired', label: 'Warranty Expired', cls: 'warranty-badge--expired' };
        if (daysLeft <= 30) return { status: 'expiring', label: `${daysLeft}d left`, cls: 'warranty-badge--expiring' };
        return { status: 'valid', label: 'Under Warranty', cls: 'warranty-badge--valid' };
    };

    // Equipment age
    const getAge = () => {
        if (!equipment.purchaseDate) return null;
        const purchased = new Date(equipment.purchaseDate);
        const now = new Date();
        const months = Math.floor((now.getTime() - purchased.getTime()) / (1000 * 60 * 60 * 24 * 30));
        if (months < 1) return 'New';
        if (months < 12) return `${months}mo`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
    };

    // Compute health score (0-100) from condition, status, warranty, maintenance
    const getHealthScore = (): number => {
        let score = 100;
        // Condition impact
        const conditionScores: Record<string, number> = { NEW: 0, GOOD: -10, FAIR: -30, POOR: -55 };
        score += conditionScores[equipment.condition] || -20;
        // Status impact
        if (equipment.status === 'MAINTENANCE') score -= 15;
        if (equipment.status === 'OUT_OF_ORDER') score -= 40;
        if (equipment.status === 'RETIRED') score -= 60;
        // Maintenance overdue
        if (equipment.nextMaintenanceDueDate) {
            const days = Math.ceil((new Date(equipment.nextMaintenanceDueDate).getTime() - Date.now()) / 86400000);
            if (days < 0) score -= Math.min(20, Math.abs(days));
            else if (days <= 7) score -= 5;
        }
        // Warranty expired
        if (equipment.warrantyExpiryDate && new Date(equipment.warrantyExpiryDate) < new Date()) score -= 5;
        return Math.max(0, Math.min(100, score));
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#64748b';
        if (score >= 40) return '#eab308';
        return '#ef4444';
    };

    const warranty = getWarrantyStatus();
    const age = getAge();
    const healthScore = getHealthScore();
    const healthColor = getHealthColor(healthScore);

    const iconSize = { compact: 50, comfortable: 70, spacious: 100 };
    const imageHeight = { compact: 'h-20', comfortable: 'h-28', spacious: 'h-36' };
    const isCompact = density === 'compact';

    const WarrantyIcon = warranty?.status === 'expired' ? ShieldX : warranty?.status === 'expiring' ? ShieldAlert : Shield;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="eq-card-premium group cursor-pointer"
            onClick={() => onEdit(equipment)}
        >
            {/* Image Area */}
            <div className={`eq-card-image-wrapper ${imageHeight[density]} p-3`}>
                <div className="relative z-10 text-[var(--text-primary)]">
                    {getEquipmentIcon(equipment.category, equipment.name, iconSize[density])}
                </div>

                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5 z-20">
                    <div className="status-badge-premium">
                        <div
                            className={`status-indicator-dot ${equipment.status === 'ACTIVE' ? 'active' : ''}`}
                            style={{ backgroundColor: config.color, color: config.color }}
                        />
                        <span style={{ color: config.color }}>{config.label}</span>
                    </div>
                </div>

                {/* Health Score - bottom left */}
                <div className="absolute bottom-2 left-2.5 z-20" title={`Health: ${healthScore}%`}>
                    <div style={{ position: 'relative', width: 32, height: 32 }}>
                        <svg width="32" height="32" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border-color)" strokeWidth="3" opacity="0.3" />
                            <circle cx="16" cy="16" r="13" fill="none" stroke={healthColor} strokeWidth="3"
                                strokeDasharray={`${(healthScore / 100) * 81.68} 81.68`}
                                strokeLinecap="round" transform="rotate(-90 16 16)" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart size={10} style={{ color: healthColor, fill: healthColor }} />
                        </div>
                    </div>
                </div>

                {/* Top-right badges stack */}
                <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1 items-end">
                    {isOverdue && equipment.status !== 'MAINTENANCE' && (
                        <div className="overdue-badge-premium">Overdue</div>
                    )}
                    <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{
                        backgroundColor: `${condConfig.color}18`,
                        color: condConfig.color,
                        border: `1px solid ${condConfig.color}30`
                    }}>
                        {condConfig.label}
                    </div>
                    {equipment.quantity && equipment.quantity > 1 && (
                        <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                            x{equipment.quantity}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="eq-card-content-premium">
                {/* Title & Brand */}
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-[13px] font-bold text-[var(--text-primary)] tracking-tight leading-tight group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                        {equipment.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{equipment.brand}</span>
                        {equipment.model && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-[var(--border-hover)]" />
                                <span className="text-[10px] font-bold text-[var(--accent-primary)]">{equipment.model}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Warranty + Age row */}
                {(warranty || age) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {warranty && (
                            <div className={`warranty-badge ${warranty.cls}`}>
                                <WarrantyIcon size={9} />
                                {warranty.label}
                            </div>
                        )}
                        {age && (
                            <div className="age-badge">
                                <Timer size={9} />
                                {age} old
                            </div>
                        )}
                    </div>
                )}

                {/* Info Grid */}
                {!isCompact && (
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
                )}

                {/* Card Footer */}
                <div className="card-footer-premium">
                    <div className="flex items-center gap-2">
                        {equipment.purchaseCost && equipment.purchaseCost > 0 ? (
                            <span className="cost-tag">
                                {formatCurrency(equipment.purchaseCost)}
                            </span>
                        ) : (
                            <div className="info-item">
                                <span className="info-label">Next Service</span>
                                <div className="flex items-center gap-1">
                                    <Calendar size={10} className={isOverdue ? 'text-red-400' : 'text-[var(--text-secondary)]'} />
                                    <span className={`text-[11px] font-bold ${isOverdue ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                                        {equipment.nextMaintenanceDueDate ? new Date(equipment.nextMaintenanceDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-actions-row">
                        <button
                            onClick={(e) => { e.stopPropagation(); onMaintenance(equipment); }}
                            className="maintenance-btn-v2"
                            title="Maintenance"
                        >
                            <Wrench size={13} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(equipment); }}
                            className="card-action-btn"
                            title="Edit"
                        >
                            <Edit3 size={12} />
                        </button>
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(equipment.id); }}
                                className="card-action-btn delete"
                                title="Delete"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EquipmentCard;
