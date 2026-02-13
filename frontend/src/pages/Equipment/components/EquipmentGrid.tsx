import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Equipment } from '../../../types/equipment';
import EquipmentCard from './EquipmentCard';

interface EquipmentGridProps {
    equipmentList: Equipment[];
    density?: 'compact' | 'comfortable' | 'spacious';
    onEdit: (equipment: Equipment) => void;
    onDelete: (id: number) => void;
    onMaintenance: (equipment: Equipment) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({ equipmentList, density = 'comfortable', onEdit, onDelete, onMaintenance }) => {
    if (equipmentList.length === 0) {
        return null;
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={`eq-grid-adaptive density-${density}`}
        >
            <AnimatePresence mode="popLayout">
                {equipmentList.map(equipment => (
                    <motion.div
                        key={equipment.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                    >
                        <EquipmentCard
                            equipment={equipment}
                            density={density}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onMaintenance={onMaintenance}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default EquipmentGrid;
