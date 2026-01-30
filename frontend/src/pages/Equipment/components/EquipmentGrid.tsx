import React from 'react';
import type { Equipment } from '../../../types/equipment';
import EquipmentCard from './EquipmentCard';

interface EquipmentGridProps {
    equipmentList: Equipment[];
    density?: 'compact' | 'comfortable' | 'spacious' | 'list';
    onEdit: (equipment: Equipment) => void;
    onDelete: (id: number) => void;
    onMaintenance: (equipment: Equipment) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({ equipmentList, density = 'comfortable', onEdit, onDelete, onMaintenance }) => {
    if (equipmentList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary)]">
                <p>No equipment found.</p>
            </div>
        );
    }

    const gridCols = {
        compact: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        comfortable: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        spacious: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        list: 'grid-cols-1'
    };

    return (
        <div className={`grid ${gridCols[density]} gap-4 transition-all duration-300`}>
            {equipmentList.map(equipment => (
                <EquipmentCard
                    key={equipment.id}
                    equipment={equipment}
                    density={density === 'list' ? 'comfortable' : density}
                    onEdit={onEdit}
                    onMaintenance={onMaintenance}
                />
            ))}
        </div>
    );
};

export default EquipmentGrid;
