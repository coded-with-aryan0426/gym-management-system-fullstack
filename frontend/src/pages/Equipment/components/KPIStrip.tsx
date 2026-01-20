import React from 'react';
import type { EquipmentStats } from '../../../types/equipment';
import { Dumbbell, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

interface KPIStripProps {
    stats: EquipmentStats;
}

const KPIStrip: React.FC<KPIStripProps> = ({ stats }) => {
    const cards = [
        { label: 'Total Equipment', value: stats.total, icon: <Dumbbell />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Active', value: stats.active, icon: <CheckCircle />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Maintenance', value: stats.maintenance, icon: <Wrench />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Out of Order', value: stats.outOfOrder, icon: <AlertTriangle />, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                        {card.icon}
                    </div>
                    <div>
                        <p className="text-[#B8B8B8] text-xs uppercase font-medium">{card.label}</p>
                        <p className="text-white text-2xl font-bold">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPIStrip;
