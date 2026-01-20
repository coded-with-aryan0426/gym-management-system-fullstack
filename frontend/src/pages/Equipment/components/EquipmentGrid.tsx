import React from 'react';
import type { Equipment } from '../../../types/equipment';
import EquipmentCard from './EquipmentCard';

interface EquipmentGridProps {
    equipmentList: Equipment[];
    onEdit: (equipment: Equipment) => void;
    onDelete: (id: number) => void;
    onMaintenance: (equipment: Equipment) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({ equipmentList, onEdit, onDelete, onMaintenance }) => {
    if (equipmentList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-[#B8B8B8]">
                <p>No equipment found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {equipmentList.map(equipment => (
                <EquipmentCard 
                    key={equipment.id} 
                    equipment={equipment} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMaintenance={onMaintenance}
                />
            ))}
        </div>
    );
};

export default EquipmentGrid;
