import React from 'react';
import type { Equipment } from '../../../types/equipment';
import { getEquipmentIcon } from '../../../utils/iconMapping';
import { MoreVertical, Wrench, AlertTriangle } from 'lucide-react';

interface EquipmentCardProps {
    equipment: Equipment;
    onEdit: (equipment: Equipment) => void;
    onDelete: (id: number) => void;
    onMaintenance: (equipment: Equipment) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onEdit, onDelete, onMaintenance }) => {
    const statusColors = {
        ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
        MAINTENANCE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        OUT_OF_ORDER: 'bg-red-500/10 text-red-500 border-red-500/20',
        RETIRED: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };

    return (
        <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl p-4 hover:border-[#4C8DFF] hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="relative">
                    <div className="w-14 h-14 bg-[#2A2A2A] rounded-xl flex items-center justify-center overflow-hidden border border-[#2E2E2E]">
                        {getEquipmentIcon(equipment.category, equipment.name, 56)}
                    </div>
                </div>
                <div className="relative">
                    <button className="p-1 hover:bg-[#2A2A2A] rounded text-[#D9D9D9]">
                        <MoreVertical size={18} />
                    </button>
                    {/* Dropdown would go here - simplified for now */}
                </div>
            </div>

            <h3 className="text-white font-semibold text-lg mb-1">{equipment.name}</h3>
            <p className="text-[#B8B8B8] text-sm mb-3">{equipment.brand} • {equipment.model}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[equipment.status]}`}>
                    {equipment.status.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-[#2A2A2A] text-[#D9D9D9] border border-[#2E2E2E]">
                    {equipment.location}
                </span>
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-[#2E2E2E]">
                <button
                    onClick={() => onEdit(equipment)}
                    className="flex-1 py-2 bg-[#2A2A2A] text-white text-sm font-medium rounded hover:bg-[#333] transition-colors"
                >
                    Edit
                </button>
                <button
                    onClick={() => onMaintenance(equipment)}
                    className="p-2 bg-[#2A2A2A] text-[#D9D9D9] rounded hover:bg-[#333] transition-colors"
                    title="Maintenance History"
                >
                    <Wrench size={18} />
                </button>
            </div>
        </div>
    );
};

export default EquipmentCard;
