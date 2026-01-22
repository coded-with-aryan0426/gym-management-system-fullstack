import React from 'react';
import type { Equipment } from '../../../types/equipment';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { Wrench, MapPin, Calendar, Activity, AlertTriangle, Clock } from 'lucide-react';

interface EquipmentCardProps {
    equipment: Equipment;
    density?: 'compact' | 'comfortable' | 'spacious';
    onEdit: (equipment: Equipment) => void;
    onDelete?: (id: number) => void;
    onMaintenance: (equipment: Equipment) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, density = 'comfortable', onEdit, onDelete, onMaintenance }) => {
    const statusColors = {
        ACTIVE: 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/20',
        MAINTENANCE: 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        OUT_OF_ORDER: 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/20',
        RETIRED: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'
    };

    const isOverdue = equipment.nextMaintenanceDueDate && new Date(equipment.nextMaintenanceDueDate) < new Date();
    
    // Density-based styles
    const padding = {
        compact: 'p-3',
        comfortable: 'p-4',
        spacious: 'p-6'
    };
    
    const iconSize = {
        compact: 80,
        comfortable: 120,
        spacious: 140
    };
    
    const imageHeight = {
        compact: 'h-24',
        comfortable: 'h-32',
        spacious: 'h-44'
    };

    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[var(--accent-primary)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group relative flex flex-col h-full hover:-translate-y-1">
            {/* Hero Image Section */}
            <div className={`${imageHeight[density]} bg-[var(--bg-surface-secondary)] relative flex items-center justify-center p-6 transition-colors overflow-hidden`}>
                <div className="transform group-hover:scale-105 transition-transform duration-500 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    {getEquipmentIcon(equipment.category, equipment.name, iconSize[density])}
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(equipment);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border backdrop-blur-sm transition-colors flex items-center gap-1.5 ${statusColors[equipment.status]}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${equipment.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-current'}`} />
                        {equipment.status.replace('_', ' ')}
                    </button>
                </div>

                {/* Overdue Warning */}
                {isOverdue && equipment.status !== 'MAINTENANCE' && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="px-2 py-1 rounded-md bg-red-600 dark:bg-red-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-red-500/20 animate-pulse"> {/* accessibility-ignore */}
                            <AlertTriangle size={12} />
                            <span>DUE</span>
                        </div>
                    </div>
                )}

                {/* Quick Actions Overlay (Hover) */}
                <div className="absolute inset-0 bg-[var(--bg-surface)]/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={() => onMaintenance(equipment)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] hover:text-[var(--accent-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all duration-300 hover:-translate-y-1 shadow-lg"
                    >
                        <Wrench size={20} />
                        <span className="text-[10px] font-medium">Maintain</span>
                    </button>
                    <button
                        onClick={() => onEdit(equipment)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] hover:text-[var(--accent-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all duration-300 hover:-translate-y-1 delay-75 shadow-lg"
                    >
                        <Activity size={20} />
                        <span className="text-[10px] font-medium">Edit</span>
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className={`${padding[density]} flex-1 flex flex-col`}>
                <div className="mb-1">
                    <h3 className="text-[var(--text-primary)] font-bold text-lg leading-tight truncate" title={equipment.name}>
                        {equipment.name}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-xs font-medium truncate mt-0.5 flex items-center gap-2">
                        {equipment.brand} 
                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span> 
                        {equipment.model}
                    </p>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs mb-4">
                    <MapPin size={12} />
                    <span className="truncate">{equipment.location}</span>
                </div>

                <div className="mt-auto space-y-3">
                    {/* Maintenance Info */}
                    <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Clock size={12} />
                            <span>Last: {equipment.lastMaintenanceDate ? new Date(equipment.lastMaintenanceDate).toLocaleDateString() : 'Never'}</span>
                        </div>
                        {equipment.nextMaintenanceDueDate && (
                            <div className={`flex items-center gap-1.5 font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-[var(--accent-primary)]'}`}>
                                <Calendar size={12} />
                                <span>Due: {new Date(equipment.nextMaintenanceDueDate).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    {density !== 'compact' && (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onMaintenance(equipment)}
                                className="px-2 py-1.5 rounded-md bg-transparent hover:bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] font-medium border border-[var(--border-color)] transition-all text-center"
                            >
                                Log Service
                            </button>
                            <button
                                onClick={() => onEdit(equipment)}
                                className="px-2 py-1.5 rounded-md bg-transparent hover:bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] font-medium border border-[var(--border-color)] transition-all text-center"
                            >
                                Details
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentCard;
