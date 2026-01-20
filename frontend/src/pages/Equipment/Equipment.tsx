import React, { useState, useEffect } from 'react';
import type { Equipment, EquipmentStats } from '../../types/equipment';
import { equipmentApi } from '../../services/equipmentApi';
import EquipmentGrid from './components/EquipmentGrid';
import KPIStrip from './components/KPIStrip';
import EquipmentModal from './components/EquipmentModal';
import MaintenancePanel from './components/MaintenancePanel';
import { Plus, Search, Filter } from 'lucide-react';
import Button from '../../components/Form/Button';
import './Equipment.css';

const EquipmentPage: React.FC = () => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [stats, setStats] = useState<EquipmentStats>({ total: 0, active: 0, maintenance: 0, outOfOrder: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [data, statsData] = await Promise.all([
                equipmentApi.getAll(),
                equipmentApi.getStats()
            ]);
            setEquipmentList(data);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load equipment data', error);
            setError('Failed to load equipment data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (data: Partial<Equipment>) => {
        try {
            await equipmentApi.create(data);
            loadData();
        } catch (error) {
            console.error('Failed to create equipment', error);
        }
    };

    const handleEdit = async (data: Partial<Equipment>) => {
        if (!editingEquipment) return;
        try {
            await equipmentApi.update(editingEquipment.id, data);
            setEditingEquipment(null);
            loadData();
        } catch (error) {
            console.error('Failed to update equipment', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to retire this equipment?')) {
            try {
                await equipmentApi.delete(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete equipment', error);
            }
        }
    };

    const filteredList = equipmentList.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );



    return (
        <div className="equipment-page">
            {/* Header */}
            <div className="equipment-header">
                <div className="equipment-title">
                    <h1>Equipment Management</h1>
                    <p>Track inventory, schedule maintenance, and monitor usage.</p>
                </div>
                <button
                    className="add-equipment-btn"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={20} /> Add Equipment
                </button>
            </div>

            {/* KPIs */}
            <div className="kpi-section">
                <KPIStrip stats={stats} />
            </div>

            {/* Premium Control Bar */}
            <div className="control-bar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search equipment by name, brand, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button className="filter-btn">
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#B8B8B8]">
                    <div className="w-8 h-8 border-2 border-[#4C8DFF] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading inventory...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-red-500">
                    <p className="mb-4">{error}</p>
                    <Button variant="secondary" onClick={loadData}>
                        Retry
                    </Button>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl border-dashed">
                    <div className="p-4 bg-[#2A2A2A] rounded-full mb-4">
                        <Search size={32} className="text-[#5A5A5A]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No equipment found</h3>
                    <p className="text-[#B8B8B8] max-w-sm text-center mb-6">
                        We couldn't find any equipment matching your search. Try adjusting your filters or add new equipment.
                    </p>
                    <Button variant="secondary" onClick={() => setSearchQuery('')}>
                        Clear Search
                    </Button>
                </div>
            ) : (
                <EquipmentGrid
                    equipmentList={filteredList}
                    onEdit={(eq) => setEditingEquipment(eq)}
                    onDelete={handleDelete}
                    onMaintenance={(eq) => setMaintenanceEquipment(eq)}
                />
            )}

            {/* Modals */}
            <EquipmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAdd}
            />

            <EquipmentModal
                isOpen={!!editingEquipment}
                onClose={() => setEditingEquipment(null)}
                onSubmit={handleEdit}
                initialData={editingEquipment}
            />

            <MaintenancePanel
                isOpen={!!maintenanceEquipment}
                onClose={() => setMaintenanceEquipment(null)}
                equipment={maintenanceEquipment}
            />
        </div>
    );
};

export default EquipmentPage;
