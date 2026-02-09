import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Equipment, EquipmentStats, EquipmentStatus, EquipmentCategory } from '../../types/equipment';
import { equipmentApi } from '../../services/equipmentApi';
import EquipmentGrid from './components/EquipmentGrid';
import EquipmentModal from './components/EquipmentModal';
import MaintenancePanel from './components/MaintenancePanel';
import { Plus, Search, X, LayoutGrid, Layout, Maximize2, ChevronDown, Activity, Wrench, AlertTriangle } from 'lucide-react';
import Button from '../../components/Form/Button';
import './Equipment.css';

type GridDensity = 'compact' | 'comfortable' | 'spacious';

const EquipmentPage: React.FC = () => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [stats, setStats] = useState<EquipmentStats>({ total: 0, active: 0, maintenance: 0, outOfOrder: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState<EquipmentStatus | 'ALL' | null>('ALL');
    const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'ALL'>('ALL');
    const [selectedLocation, setSelectedLocation] = useState<string | 'ALL'>('ALL');
    const [selectedBrand, setSelectedBrand] = useState<string | 'ALL'>('ALL');
    const [gridDensity, setGridDensity] = useState<GridDensity>('comfortable');

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

    const uniqueLocations = useMemo(() => {
        const locs = new Set(equipmentList.map(item => item.location).filter(Boolean));
        return ['ALL', ...Array.from(locs).sort()];
    }, [equipmentList]);

    const filteredList = useMemo(() => {
        return equipmentList.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = activeStatusFilter === 'ALL' || activeStatusFilter === null || item.status === activeStatusFilter;
            const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
            const matchesLocation = selectedLocation === 'ALL' || item.location === selectedLocation;
            const matchesBrand = selectedBrand === 'ALL' || item.brand === selectedBrand;

            return matchesSearch && matchesStatus && matchesCategory && matchesLocation && matchesBrand;
        });
    }, [equipmentList, searchQuery, activeStatusFilter, selectedCategory, selectedLocation, selectedBrand]);

    const categories: (EquipmentCategory | 'ALL')[] = ['ALL', 'CARDIO', 'STRENGTH', 'FUNCTIONAL', 'YOGA', 'RECOVERY'];

    const statItems = [
        { label: 'Active', value: stats.active, color: 'var(--status-active)', icon: Activity },
        { label: 'Repair', value: stats.maintenance, color: 'var(--status-maintenance)', icon: Wrench },
        { label: 'Offline', value: stats.outOfOrder, color: 'var(--status-outoforder)', icon: AlertTriangle }
    ];

    return (
        <div className="equipment-page">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="page-header"
            >
                <div className="header-left">
                    <h1 className="header-title">Equipment</h1>
                    <p className="header-subtitle">Manage and monitor your fitness equipment fleet</p>
                </div>

                <div className="header-right">
                    <div className="stats-summary-premium">
                        {statItems.map((stat, i) => (
                            <div key={i} className="stat-pill-v2">
                                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15` }}>
                                    <stat.icon size={14} style={{ color: stat.color }} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Controls & Filters Area */}
            <div className="toolbar-section">
                <div className="toolbar-main">
                    <div className="search-box-v2 group">
                        <Search className="search-icon-v2" size={16} />
                        <input
                            type="text"
                            placeholder="Search by equipment, brand, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-v2"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="search-clear-v2">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="toolbar-actions">
                        <div className="select-wrapper-v2">
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="select-v2"
                            >
                                <option value="ALL">All Locations</option>
                                {uniqueLocations.filter(l => l !== 'ALL').map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                            <ChevronDown size={14} className="select-chevron-v2" />
                        </div>

                        <div className="view-toggle-v2">
                            {[
                                { id: 'compact', icon: LayoutGrid, label: 'Compact' },
                                { id: 'comfortable', icon: Layout, label: 'Grid' },
                                { id: 'spacious', icon: Maximize2, label: 'Large' }
                            ].map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setGridDensity(view.id as GridDensity)}
                                    className={`toggle-btn-v2 ${gridDensity === view.id ? 'active' : ''}`}
                                    title={view.label}
                                >
                                    <view.icon size={15} />
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn-primary-premium"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus size={18} />
                            <span>Add Equipment</span>
                        </button>
                    </div>
                </div>

                {/* Categories Navigation */}
                <div className="category-nav-v2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`nav-item-v2 ${selectedCategory === cat ? 'active' : ''}`}
                        >
                            {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                            {selectedCategory === cat && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="nav-indicator-v2"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-24"
                    >
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 border-2 border-[var(--accent-primary)]/20 rounded-full" />
                            <div className="absolute inset-0 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="mt-4 text-xs font-medium text-[var(--text-secondary)]">Loading equipment...</p>
                    </motion.div>
                ) : filteredList.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-[var(--border-color)]"
                    >
                        <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] mb-4">
                            <Search size={28} className="text-[var(--text-secondary)] opacity-40" />
                        </div>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">No equipment found</h3>
                        <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm mb-6">
                            Try adjusting your filters or search query.
                        </p>
                        <Button variant="secondary" onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('ALL');
                            setSelectedLocation('ALL');
                        }}>
                            Clear Filters
                        </Button>
                    </motion.div>
                ) : (
                    <EquipmentGrid
                        equipmentList={filteredList}
                        density={gridDensity}
                        onEdit={(eq) => setEditingEquipment(eq)}
                        onDelete={handleDelete}
                        onMaintenance={(eq) => setMaintenanceEquipment(eq)}
                    />
                )}
            </AnimatePresence>

            <EquipmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAdd} />
            <EquipmentModal isOpen={!!editingEquipment} onClose={() => setEditingEquipment(null)} onSubmit={handleEdit} initialData={editingEquipment} />
            <MaintenancePanel isOpen={!!maintenanceEquipment} onClose={() => setMaintenanceEquipment(null)} equipment={maintenanceEquipment} />
        </div>
    );
};

export default EquipmentPage;
